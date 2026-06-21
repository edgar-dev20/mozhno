# Архитектура сервера

Модульная структура **можно.**: диаграмма модулей, технологический стек, поток оценки флагов и JWT-аутентификация.

## Модульная структура

**можно.** разделён на четыре Maven-модуля, образующих строгий граф зависимостей:

```mermaid
graph TD
    SPI[mozhno-spi<br/>Service Provider Interface]
    CORE[mozhno-core<br/>Бизнес-логика]
    WEB[mozhno-web-api<br/>REST API и безопасность]
    APP[mozhno-app<br/>Точка входа]

    SPI --> CORE
    CORE --> WEB
    WEB --> APP
```

| Модуль | Назначение | Ключевые классы |
|--------|------------|-----------------|
| `mozhno-spi` | Интерфейсы расширений (SPI) | `AuthenticationProviderSpi`, `AuthenticationFlowSpi`, `QuotaSpi`, `BillingSpi`, `FeatureGateSpi`, `PluginSlot` |
| `mozhno-core` | Бизнес-логика, движок флагов, хранение | `FlagService`, `SegmentService`, `StrategyEvaluator`, `AuditService`, `FlagRowMapper` |
| `mozhno-web-api` | REST-контроллеры, Spring Security, JWT, OpenAPI | `FlagController`, `AuthController`, `JwtTokenProvider`, `SecurityConfig` |
| `mozhno-app` | Точка входа, статические ресурсы, миграции Flyway | `MozhnoApplication`, `application.properties`, `db/migration/*.sql` |

### Направление зависимостей

Зависимости направлены вниз по стеку:

- `mozhno-spi` не зависит ни от одного модуля — чистые интерфейсы
- `mozhno-core` зависит только от `mozhno-spi` — реализует бизнес-логику через интерфейсы SPI
- `mozhno-web-api` зависит от `mozhno-core` — предоставляет REST API поверх бизнес-логики
- `mozhno-app` зависит от всех модулей — собирает приложение, конфигурирует Spring Boot, внедряет реализации

Это гарантирует, что бизнес-логика не зависит от HTTP-транспорта, а SPI-контракты не привязаны к конкретной реализации.

## Технологический стек

### Бэкенд

| Технология | Версия | Назначение |
|------------|--------|------------|
| **JDK** | 25 | Среда выполнения. Виртуальные потоки (Project Loom), ZGC |
| **Spring Boot** | 4.0 | DI-контейнер, авто-конфигурация, Actuator |
| **Spring Security** | 6.x | Аутентификация, авторизация, JWT-фильтры |
| **JdbcTemplate** | — | Прямые SQL-запросы без ORM. RowMapper для маппинга |
| **Flyway** | 10.x | Версионирование схемы БД, миграции |
| **HikariCP** | 6.x | Пул соединений к PostgreSQL |
| **Caffeine** | 3.x | Ин-мемори кеш (флаги, сегменты, API-ключи) |
| **ZGC** | — | Сборщик мусора с субмиллисекундными паузами |
| **jjwt** | 0.12.x | JWT: создание, подпись HMAC-SHA256, валидация |

### Фронтенд

| Технология | Версия | Назначение |
|------------|--------|------------|
| **React** | 19 | SPA-фреймворк, Server Components |
| **Tailwind CSS** | 4 | Utility-first CSS, JIT-компиляция |
| **Radix UI** | — | Headless UI-компоненты (доступность, клавиатурная навигация) |
| **Node.js** | 24 | Среда сборки фронтенда |

### Инфраструктура

| Технология | Назначение |
|------------|------------|
| **PostgreSQL** | Персистентное хранение всех данных |
| **Docker** | Контейнеризация, трёхэтапная сборка |
| **Kubernetes** | Оркестрация, авто-масштабирование, отказоустойчивость |

### Почему JdbcTemplate, а не JPA/Hibernate

| Критерий | JdbcTemplate | JPA/Hibernate |
|----------|-------------|---------------|
| Контроль SQL | Полный — запросы пишутся вручную | Ограниченный — генерация через JPQL/HQL |
| Производительность | Предсказуемая — нет магии ORM | Может деградировать из-за Lazy Loading, dirty checking |
| Потребление памяти | Низкое — нет persistence context | Выше из-за кеша первого уровня |
| Сложность маппинга | Ручные RowMapper'ы | Автоматический маппинг |
| Кривая обучения | Низкая — обычный SQL | Высокая — знание JPA-спецификации |

Выбор JdbcTemplate обусловлен тем, что система фича-флагов имеет чётко определённые SQL-запросы без сложных объектных графов. Явный SQL даёт полный контроль над планом выполнения и упрощает оптимизацию индексов.

## Встраивание фронтенда

React 19 SPA собирается отдельно (Node.js 24, Webpack/Vite), результат помещается в `static/`. При сборке JAR статические файлы копируются в ресурсы `mozhno-app`:

```
mozhno-app/src/main/resources/static/
├── index.html
├── assets/
│   ├── main-abc123.js
│   └── main-abc123.css
└── favicon.ico
```

Spring Boot обслуживает статику как classpath-ресурсы. Swagger UI и OpenAPI-спецификация также раздаются из ресурсов JAR.

Docker-образ использует трёхэтапную сборку:

```dockerfile
# Этап 1: Сборка фронтенда
FROM node:24-alpine AS web-builder
WORKDIR /app
COPY mozhno-web/ .
RUN npm ci && npm run build

# Этап 2: Сборка Java
FROM eclipse-temurin:25-alpine AS java-builder
WORKDIR /app
COPY . .
COPY --from=web-builder /app/dist ./mozhno-app/src/main/resources/static/
RUN ./mvnw package -DskipTests

# Этап 3: Runtime
FROM ubuntu:noble
RUN apt-get update && apt-get install -y openjdk-25-jre-headless
COPY --from=java-builder /app/mozhno-app/target/*.jar app.jar
USER 1000
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Поток оценки флага

Процесс принятия решения о значении флага при вызове SDK:

```mermaid
flowchart TD
    START([SDK вызывает<br/>isEnabled flagKey, context])
    LOAD[Загрузка конфигурации<br/>флага из кеша]
    CHECK_FLAG{Флаг существует<br/>и активен?}
    DEFAULT[Вернуть<br/>значение по умолчанию]
    IS_MULTI{Флаг<br/>мультивариативный?}
    MULTI_VAL[Вернуть строковое<br/>значение варианта]
    STRATEGIES[Итерация по стратегиям<br/>в порядке приоритета]
    NEXT_STRATEGY{Есть следующая<br/>стратегия?}
    EVALUATE_TYPE{Тип стратегии}
    DEF_STRAT[Default:<br/>вернуть on/off]
    GRAD_STRAT[Gradual:<br/>hash userId % 100<br/>сравнить с процентом]
    SCHED_STRAT[Scheduled:<br/>текущее время в<br/>диапазоне активации?]
    CUSTOM_STRAT[Custom:<br/>вызов FeatureGateSpi]
    MATCH{Стратегия<br/>совпала?}
    RETURN_TRUE[Вернуть true<br/>или значение варианта]
    RETURN_FALSE[Вернуть false]

    START --> LOAD
    LOAD --> CHECK_FLAG
    CHECK_FLAG -->|Нет| DEFAULT
    CHECK_FLAG -->|Да| IS_MULTI
    IS_MULTI -->|Нет| STRATEGIES
    IS_MULTI -->|Да| MULTI_VAL
    STRATEGIES --> NEXT_STRATEGY
    NEXT_STRATEGY -->|Нет| RETURN_FALSE
    NEXT_STRATEGY -->|Да| EVALUATE_TYPE
    EVALUATE_TYPE --> DEF_STRAT
    EVALUATE_TYPE --> GRAD_STRAT
    EVALUATE_TYPE --> SCHED_STRAT
    EVALUATE_TYPE --> CUSTOM_STRAT
    DEF_STRAT --> MATCH
    GRAD_STRAT --> MATCH
    SCHED_STRAT --> MATCH
    CUSTOM_STRAT --> MATCH
    MATCH -->|Да| RETURN_TRUE
    MATCH -->|Нет| NEXT_STRATEGY
```

**Ключевой момент:** оценка флага происходит **локально в SDK** без сетевого запроса к серверу. Правила загружаются фоновым процессом и кешируются. Это даёт латентность < 1 мс.

## Поток JWT-аутентификации

### Аутентификация (логин)

```mermaid
sequenceDiagram
    participant Client as Клиент (браузер)
    participant Server as Сервер можно.
    participant DB as PostgreSQL
    participant JWT as JwtTokenProvider

    Client->>Server: POST /api/auth/login<br/>{email, password}
    Server->>Server: Проверка учётных данных
    Server->>JWT: generateAccessToken(user)
    JWT->>JWT: Подпись HMAC-SHA256
    JWT-->>Server: access_token (15 мин)
    Server->>JWT: generateRefreshToken(user)
    JWT->>JWT: Генерация случайного токена
    JWT->>DB: INSERT INTO refresh_tokens<br/>(user_id, token_hash, family)
    DB-->>Server: OK
    Server-->>Client: { access_token, refresh_token }
```

### Доступ к API

```mermaid
sequenceDiagram
    participant Client
    participant Filter as JwtAuthFilter
    participant Provider as JwtTokenProvider
    participant Controller as REST Controller

    Client->>Filter: GET /api/flags<br/>Authorization: Bearer <access_token>
    Filter->>Provider: validateToken(access_token)
    Provider->>Provider: Проверка подписи HMAC-SHA256
    Provider->>Provider: Проверка срока действия
    Provider-->>Filter: Authentication (валидный)
    Filter->>Filter: SecurityContextHolder.set(auth)
    Filter->>Controller: запрос продолжается
    Controller-->>Client: данные флагов
```

### Обновление токенов (Refresh)

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant DB

    Client->>Server: POST /api/auth/refresh<br/>{ refresh_token }
    Server->>Server: Хеширование refresh_token
    Server->>DB: SELECT * FROM refresh_tokens<br/>WHERE token_hash = ?<br/>FOR UPDATE
    DB-->>Server: токен найден
    Server->>Server: Проверка срока действия
    Server->>DB: DELETE FROM refresh_tokens<br/>WHERE id = ? (инвалидация старого)
    Server->>Server: Генерация нового refresh_token
    Server->>DB: INSERT INTO refresh_tokens<br/>(user_id, token_hash, family)
    Server->>Server: Генерация нового access_token
    Server-->>Client: { access_token, refresh_token }
```

**Семейная ротация:** при каждом обновлении старый refresh-токен инвалидируется, а новый сохраняется в ту же «семью» (family). Если злоумышленник использует старый (уже инвалидированный) токен, вся семья аннулируется — это предотвращает replay-атаки.

`SELECT ... FOR UPDATE` гарантирует, что два конкурентных запроса на обновление (с разных экземпляров сервера) не создадут дублирующих токенов.

## SPI: архитектура расширений

Интерфейсы из `mozhno-spi` позволяют заменять компоненты системы без изменения ядра:

```
mozhno-spi/
├── AuthenticationProviderSpi.java   — аутентификация пользователей
├── AuthenticationFlowSpi.java       — дополнительные шаги аутентификации
├── QuotaSpi.java                    — квоты и лимиты
├── BillingSpi.java                  — биллинг и платёжная информация
├── FeatureGateSpi.java              — управление Enterprise-функциями
└── PluginSlot.java                  — слоты для UI-плагинов
```

Подробнее — на странице [Open Core](/advanced/open-core).

## Диаграмма развёртывания

```mermaid
graph TB
    subgraph "Браузер"
        SPA[React 19 SPA<br/>Tailwind CSS 4<br/>Radix UI]
    end

    subgraph "Kubernetes Cluster"
        INGRESS[Ingress<br/>TLS termination]
        subgraph "Pods (2–8)"
            P1[mozhno-1<br/>Spring Boot 4.0<br/>JdbcTemplate<br/>Caffeine Cache]
            P2[mozhno-2<br/>Spring Boot 4.0<br/>JdbcTemplate<br/>Caffeine Cache]
        end
        SVC[Service<br/>ClusterIP :8080]
    end

    PG[(PostgreSQL 15+<br/>PersistentVolume<br/>WAL-архивация)]

    SDK[Java/Python/Node.js SDK]
    SDK2[Внешнее приложение]

    SPA --> INGRESS
    INGRESS --> SVC
    SVC --> P1
    SVC --> P2
    P1 --> PG
    P2 --> PG
    SDK2 --> INGRESS
```

## Что дальше?

- [Open Core](/advanced/open-core) — Community vs Enterprise, SPI-интерфейсы, плагины
- [Миграция](/advanced/migration) — переход с LaunchDarkly, Unleash, Flagsmith
- [Docker](/self-hosting/docker) — продакшен-деплой
- [Kubernetes](/self-hosting/kubernetes) — оркестрация и масштабирование

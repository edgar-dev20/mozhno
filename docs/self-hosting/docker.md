# Docker-деплой

Развёртывание **можно.** в Docker для продакшен-окружения: полный `docker-compose.yml`, переменные окружения, проверки здоровья, ресурсные ограничения, безопасность и сетевые настройки.

## Образ

Официальный образ публикуется в GitHub Container Registry:

```
ghcr.io/mozhno-dev/mozhno:latest
```

Образ собирается по трёхэтапному Dockerfile:

| Этап | Базовый образ | Назначение |
|------|---------------|------------|
| `web-builder` | `node:24-alpine` | Сборка React 19 SPA фронтенда |
| `java-builder` | `eclipse-temurin:25-alpine` | Компиляция Spring Boot JAR |
| `runtime` | `ubuntu:noble` (JRE) | Финальный образ для запуска |

Финальный образ содержит только JRE, собранный JAR и статические файлы фронтенда — без JDK и Node.js.

## Полный docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: feature_flags
      POSTGRES_USER: flags_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-flags_password}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - mozhno-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flags_user -d feature_flags"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 256M
          cpus: '0.25'

  mozhno:
    image: ghcr.io/mozhno-dev/mozhno:latest
    restart: unless-stopped
    ports:
      - '${SERVER_PORT:-8080}:8080'
    user: '1000:1000'
    read_only: true
    tmpfs:
      - /tmp:size=128M,mode=1777
    environment:
      SERVER_PORT: '8080'
      APP_BASE_URL: ${APP_BASE_URL:-http://localhost:8080}

      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/feature_flags
      SPRING_DATASOURCE_USERNAME: ${DB_USERNAME:-flags_user}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-flags_password}

      SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE: '30'
      SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE: '5'
      SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT: '30000'
      SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT: '600000'
      SPRING_DATASOURCE_HIKARI_MAX_LIFETIME: '1800000'

      JWT_SECRET: ${JWT_SECRET}
      JWT_ACCESS_TOKEN_EXPIRATION: '900000'
      JWT_REFRESH_TOKEN_EXPIRATION: '604800000'
      JWT_REFRESH_TOKEN_ROTATION_ENABLED: 'true'

      JAVA_OPTS: >
        -XX:+UseZGC
        -XX:MaxRAMPercentage=75
        -XX:+ZGenerational
        -XX:ConcGCThreads=4
        -Djava.security.egd=file:/dev/./urandom
    networks:
      - mozhno-net
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health | grep -q UP"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2.0'
        reservations:
          memory: 512M
          cpus: '0.25'

volumes:
  pgdata:
    driver: local

networks:
  mozhno-net:
    driver: bridge
```

Запуск:

```bash
JWT_SECRET=$(openssl rand -base64 32) docker compose up -d
```

## Переменные окружения

### Обязательные

| Переменная | Описание | Пример |
|------------|----------|--------|
| `JWT_SECRET` | Секретный ключ подписи JWT. Минимум 256 бит | `openssl rand -base64 32` |
| `SPRING_DATASOURCE_URL` | JDBC URL подключения к PostgreSQL | `jdbc:postgresql://postgres:5432/feature_flags` |
| `SPRING_DATASOURCE_USERNAME` | Пользователь базы данных | `flags_user` |
| `SPRING_DATASOURCE_PASSWORD` | Пароль базы данных | `secure-password-here` |

### Сервер

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SERVER_PORT` | `8080` | Порт HTTP-сервера |
| `APP_BASE_URL` | `http://localhost:8080` | Публичный URL. Влияет на CORS и генерацию ссылок |

### JWT

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `JWT_ACCESS_TOKEN_EXPIRATION` | `900000` | Время жизни access-токена (мс). По умолчанию 15 минут |
| `JWT_REFRESH_TOKEN_EXPIRATION` | `604800000` | Время жизни refresh-токена (мс). По умолчанию 7 дней |
| `JWT_REFRESH_TOKEN_ROTATION_ENABLED` | `true` | Включение семейной ротации refresh-токенов |

### Пул соединений HikariCP

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE` | `10` | Максимальное число соединений. Для продакшена — 30 |
| `SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE` | `5` | Минимальное число простаивающих соединений |
| `SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT` | `30000` | Таймаут ожидания соединения из пула (мс) |
| `SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT` | `600000` | Таймаут бездействия перед закрытием соединения (мс) |
| `SPRING_DATASOURCE_HIKARI_MAX_LIFETIME` | `1800000` | Максимальное время жизни соединения (мс) |

### Flyway

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SPRING_FLYWAY_ENABLED` | `true` | Автоматический запуск миграций при старте |
| `SPRING_FLYWAY_LOCATIONS` | `classpath:db/migration` | Путь к SQL-файлам миграций |

## Проверки здоровья (Health Checks)

Контейнер **можно.** предоставляет эндпоинт `/actuator/health` для проверки готовности:

```bash
curl http://localhost:8080/actuator/health
# {"status":"UP","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"}}}
```

В `docker-compose.yml` настроен healthcheck с проверкой этого эндпоинта каждые 15 секунд. Контейнер считается готовым, когда:

- Приложение запущено и слушает порт 8080
- Подключение к PostgreSQL установлено и проверено (`db: UP`)
- Flyway-миграции успешно применены
- Статические ресурсы (React SPA) доступны

PostgreSQL проверяется утилитой `pg_isready` каждые 10 секунд.

## Ресурсные ограничения

| Компонент | Параметр | Development | Production |
|-----------|----------|-------------|------------|
| PostgreSQL | CPU limit | 1.0 | 2.0 |
| PostgreSQL | Memory limit | 1G | 2G |
| **можно.** | CPU limit | 2.0 | 4.0 |
| **можно.** | Memory limit | 2G | 4G |
| **можно.** | Memory reservation | 512M | 1G |

Настройки JVM для контейнера:

```
-XX:+UseZGC              — Z Garbage Collector (низкие паузы)
-XX:MaxRAMPercentage=75  — JVM использует не более 75% памяти контейнера
-XX:+ZGenerational       — поколенческий режим ZGC (JDK 25+)
-XX:ConcGCThreads=4      — 4 потока конкуррентной сборки
```

## Сетевая конфигурация

Сервисы объединены в изолированную сеть `mozhno-net` типа `bridge`. Приложение обращается к PostgreSQL по контейнерному имени `postgres`:

```
jdbc:postgresql://postgres:5432/feature_flags
```

Если PostgreSQL развёрнут на отдельном хосте, замените `postgres` на IP-адрес или домен хоста и удалите сервис `postgres` из `docker-compose.yml`.

Для продакшен-окружения с обратным прокси (Nginx, Traefik, Caddy) выставьте порт `8080` только на `127.0.0.1`:

```yaml
ports:
  - '127.0.0.1:8080:8080'
```

## Безопасность

### Не-root пользователь

Контейнер запускается от непривилегированного пользователя `mozhno` (UID 1000):

```yaml
user: '1000:1000'
```

### Файловая система только для чтения

Корневая файловая система монтируется как read-only:

```yaml
read_only: true
```

Для временных файлов выделяется `tmpfs`:

```yaml
tmpfs:
  - /tmp:size=128M,mode=1777
```

### Секреты

Никогда не задавайте `JWT_SECRET` и пароли базы данных напрямую в `docker-compose.yml`. Используйте:

- Переменные окружения хоста (`${JWT_SECRET}`)
- Docker Secrets (в Swarm-режиме)
- Внешний менеджер секретов (HashiCorp Vault, AWS Secrets Manager)

Генерация криптографически стойкого JWT-секрета:

```bash
openssl rand -base64 32
```

### Сканирование уязвимостей

Перед развёртыванием проверьте образ сканером:

```bash
docker scout quickview ghcr.io/mozhno-dev/mozhno:latest
trivy image ghcr.io/mozhno-dev/mozhno:latest
```

## Сборка образа локально

Если требуется собрать образ из исходников:

```bash
make docker-build
```

Или вручную:

```bash
docker build -t ghcr.io/mozhno-dev/mozhno:latest .
```

Dockerfile использует многоэтапную сборку (multi-stage build), поэтому итоговый образ не содержит Node.js, npm-зависимости или JDK — только JRE и артефакты.

## Миграции при старте

Flyway-миграции запускаются автоматически при старте контейнера (`SPRING_FLYWAY_ENABLED=true`). Если база данных недоступна, контейнер завершится с ошибкой и Docker перезапустит его (`restart: unless-stopped`). Миграции идемпотентны — повторный запуск не повредит данных.

## Где брать образ

- **GitHub Container Registry:** `ghcr.io/mozhno-dev/mozhno:latest`
- **Теги версий:** `ghcr.io/mozhno-dev/mozhno:v1.0.0`
- **Digest (для неизменяемости):** `ghcr.io/mozhno-dev/mozhno@sha256:...`

Рекомендуется фиксировать конкретную версию или digest для продакшен-окружения, чтобы избежать неожиданных изменений.

## Что дальше?

- [Kubernetes](/self-hosting/kubernetes) — оркестрация в кластере
- [База данных](/self-hosting/database) — настройка PostgreSQL, бэкапы, пул соединений
- [Масштабирование](/self-hosting/scaling) — горизонтальное масштабирование и кеширование
- [Конфигурация](/guide/configuration) — полный список переменных окружения

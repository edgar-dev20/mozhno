# Docker-деплой

Развёртывание **можно**<span class=brand-dot>.</span> в Docker для продакшен-окружения: полный `docker-compose.yml`, переменные окружения, проверки здоровья, ресурсные ограничения, безопасность и сетевые настройки.

## Образ

Официальный образ публикуется в GitHub Container Registry:

```
ghcr.io/mozhno-dev/mozhno:latest
```

Образ собирается по трёхэтапному Dockerfile:

| Этап | Базовый образ | Назначение |
|------|---------------|------------|
| `web-builder` | `node:24-alpine` | Сборка React 19 SPA фронтенда |
| `java-builder` | `eclipse-temurin:25-jdk-alpine` | Компиляция Spring Boot JAR |
| `runtime` | `eclipse-temurin:25-jre-noble` | Финальный образ: только JRE |

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
      - '${MOZHNO_SERVER_PORT:-8080}:8080'
    user: '1000:1000'
    read_only: true
    tmpfs:
      - /tmp:size=128M,mode=1777
    environment:
      MOZHNO_SERVER_PORT: '8080'
      MOZHNO_BASE_URL: ${MOZHNO_BASE_URL:-http://localhost:8080}

      MOZHNO_DB_URL: jdbc:postgresql://postgres:5432/feature_flags
      MOZHNO_DB_USERNAME: ${DB_USERNAME:-flags_user}
      MOZHNO_DB_PASSWORD: ${DB_PASSWORD:-flags_password}

      MOZHNO_DB_POOL_MAX_SIZE: '30'
      MOZHNO_DB_POOL_MIN_IDLE: '5'
      MOZHNO_DB_POOL_CONNECTION_TIMEOUT: '10000'

      MOZHNO_JWT_SECRET: ${MOZHNO_JWT_SECRET}
      MOZHNO_JWT_ACCESS_TOKEN_TTL_MINUTES: '15'
      MOZHNO_JWT_REFRESH_TOKEN_TTL_DAYS: '30'
      MOZHNO_JWT_ISSUER: 'mozhno'

      JAVA_TOOL_OPTIONS: >
        -XX:+UseZGC
        -XX:MaxRAMPercentage=75.0
        -XX:+ExitOnOutOfMemoryError
        -Djava.security.egd=file:/dev/./urandom
    networks:
      - mozhno-net
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:9090/actuator/health | grep -q UP"]
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
MOZHNO_JWT_SECRET=$(openssl rand -base64 32) docker compose up -d
```

## Переменные окружения

### База данных

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_DB_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | JDBC URL подключения к PostgreSQL |
| `MOZHNO_DB_USERNAME` | `flags_user` | Пользователь базы данных |
| `MOZHNO_DB_PASSWORD` | `flags_password` | Пароль базы данных |
| `MOZHNO_DB_POOL_MAX_SIZE` | `20` | Максимальное число соединений. Для продакшена — 30 |
| `MOZHNO_DB_POOL_MIN_IDLE` | `5` | Минимальное число простаивающих соединений |
| `MOZHNO_DB_POOL_CONNECTION_TIMEOUT` | `10000` | Таймаут ожидания соединения из пула (мс) |

### Сервер

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_SERVER_PORT` | `8080` | Порт HTTP-сервера |
| `MOZHNO_MANAGEMENT_PORT` | `9090` | Порт management-эндпоинтов (actuator: health, metrics, prometheus) |
| `MOZHNO_BASE_URL` | `http://localhost:8080` | Публичный URL. Влияет на CORS и генерацию ссылок |
| `MOZHNO_CACHE_TTL_MINUTES` | `5` | Время жизни кеша правил в минутах |
| `MOZHNO_CLIENT_MAX_METRICS_PER_KEY` | `1000` | Максимум хранимых метрик на API-ключ |
| `MOZHNO_CLIENT_MAX_METRICS_BATCH_SIZE` | `1000` | Максимум записей в одном запросе `/api/client/metrics` |

### JWT

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_JWT_SECRET` | — (обязательно) | Секретный ключ подписи JWT. Минимум 256 бит |
| `MOZHNO_JWT_ACCESS_TOKEN_TTL_MINUTES` | `15` | Время жизни access-токена в минутах |
| `MOZHNO_JWT_REFRESH_TOKEN_TTL_DAYS` | `30` | Время жизни refresh-токена в днях |

### Flyway

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_FLYWAY_ENABLED` | `true` | Автоматический запуск миграций при старте |
| `MOZHNO_FLYWAY_LOCATIONS` | `classpath:db/migration` | Путь к SQL-файлам миграций |

### SMTP (почта)

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_SMTP_HOST` | `localhost` | Хост SMTP-сервера |
| `MOZHNO_SMTP_PORT` | `587` | Порт SMTP-сервера |
| `MOZHNO_SMTP_USERNAME` | — | Имя пользователя SMTP |
| `MOZHNO_SMTP_PASSWORD` | — | Пароль SMTP |
| `MOZHNO_MAIL_FROM` | `noreply@mozhno.dev` | Адрес отправителя писем |

### Прочее

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_CACHE_TYPE` | `caffeine` | Тип кеша |
| `MOZHNO_SECURITY_CORS_ALLOWED_ORIGINS` | `""` | Разрешённые origin для CORS |
| `MOZHNO_JWT_ISSUER` | `mozhno` | Издатель JWT-токенов |
| `MOZHNO_AUDIT_RETENTION_DAYS` | `365` | Срок хранения записей аудита |

## Проверки здоровья (Health Checks)

Контейнер **можно**<span class=brand-dot>.</span> предоставляет эндпоинт `/actuator/health` на **management-порту 9090** для проверки готовности:

```bash
curl http://localhost:9090/actuator/health
# {"status":"UP","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"}}}
```

В `docker-compose.yml` настроен healthcheck с проверкой этого эндпоинта каждые 15 секунд. Контейнер считается готовым, когда:

- Приложение запущено и слушает порт 8080 (SPA + REST API) и порт 9090 (actuator)
- Подключение к PostgreSQL установлено и проверено (`db: UP`)
- Flyway-миграции успешно применены
- Статические ресурсы (React SPA) доступны

PostgreSQL проверяется утилитой `pg_isready` каждые 10 секунд.

## Ресурсные ограничения

| Компонент | Параметр | Development | Production |
|-----------|----------|-------------|------------|
| PostgreSQL | CPU limit | 1.0 | 2.0 |
| PostgreSQL | Memory limit | 1G | 2G |
| **можно**<span class=brand-dot>.</span> | CPU limit | 2.0 | 4.0 |
| **можно**<span class=brand-dot>.</span> | Memory limit | 2G | 4G |
| **можно**<span class=brand-dot>.</span> | Memory reservation | 512M | 1G |

Настройки JVM для контейнера:

```
-XX:+UseZGC                           — Z Garbage Collector (низкие паузы)
-XX:MaxRAMPercentage=75.0             — JVM использует не более 75% памяти контейнера
-Djava.security.egd=file:/dev/./urandom  — ускорение генерации случайных чисел
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

Никогда не задавайте `MOZHNO_JWT_SECRET` и пароли базы данных напрямую в `docker-compose.yml`. Используйте:

- Переменные окружения хоста (`${MOZHNO_JWT_SECRET}`)
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

Flyway-миграции запускаются автоматически при старте контейнера (`MOZHNO_FLYWAY_ENABLED=true`). Если база данных недоступна, контейнер завершится с ошибкой и Docker перезапустит его (`restart: unless-stopped`). Миграции идемпотентны — повторный запуск не повредит данных.

## Где брать образ

- **GitHub Container Registry:** `ghcr.io/mozhno-dev/mozhno:latest`
- **Теги версий:** `ghcr.io/mozhno-dev/mozhno:v1.0.0`
- **Digest (для неизменяемости):** `ghcr.io/mozhno-dev/mozhno@sha256:...`

Рекомендуется фиксировать конкретную версию или digest для продакшен-окружения, чтобы избежать неожиданных изменений.

## Обновление версии

Для обновления на новую версию:

```bash
# 1. Обновить тег образа в docker-compose.yml
#    image: ghcr.io/mozhno-dev/mozhno:v1.1.0

# 2. Загрузить новый образ и перезапустить
docker compose pull mozhno
docker compose up -d mozhno

# 3. Flyway автоматически применит новые миграции при старте
```

Процесс безопасен: старый контейнер работает до готовности нового. Health check гарантирует, что трафик пойдёт только после успешного старта.

### Откат версии

```bash
# Вернуть тег старой версии в docker-compose.yml
docker compose pull mozhno
docker compose up -d mozhno
```

Flyway-миграции не откатываются автоматически. Если новая версия добавила миграции, откат кода безопасен (миграции совместимы вперёд).

## Обратный прокси и TLS

Для продакшена всегда размещайте **можно**<span class=brand-dot>.</span> за обратным прокси с HTTPS.

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name flags.example.com;

    ssl_certificate     /etc/letsencrypt/live/flags.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flags.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

В `docker-compose.yml` закройте порт от внешнего доступа:

```yaml
ports:
  - '127.0.0.1:8080:8080'
```

И установите `MOZHNO_BASE_URL` на ваш домен:

```yaml
MOZHNO_BASE_URL: https://flags.example.com
```

### Forwarded-заголовки и реальный IP клиента

Сервер определяет IP клиента (для rate-limit) через forwarded-заголовки. По умолчанию
`MOZHNO_FORWARD_HEADERS_STRATEGY=native`: `X-Forwarded-For` учитывается **только** если
запрос пришёл от доверенного прокси из приватных диапазонов (Tomcat RemoteIpValve). Так
прямой атакующий не подделает свой IP заголовком.

Если ваш обратный прокси работает на публичном IP, укажите его диапазон явно:

```yaml
SERVER_TOMCAT_REMOTEIP_INTERNAL_PROXIES: '203\.0\.113\.\d{1,3}'
```

Если прокси нет и клиенты ходят напрямую — поставьте `MOZHNO_FORWARD_HEADERS_STRATEGY=none`,
чтобы заголовки `X-Forwarded-*` полностью игнорировались.

### Caddy (автоматический TLS)

```
flags.example.com {
    reverse_proxy localhost:8080
}
```

## Чеклист для продакшена

| # | Действие | Команда / переменная |
|---|----------|---------------------|
| 1 | Сгенерировать JWT-секрет | `openssl rand -base64 32` → `MOZHNO_JWT_SECRET` |
| 2 | Сложный пароль БД | `MOZHNO_DB_PASSWORD` |
| 3 | Указать реальный домен | `MOZHNO_BASE_URL=https://flags.example.com` |
| 4 | Настроить CORS | `MOZHNO_SECURITY_CORS_ALLOWED_ORIGINS=https://app.example.com` |
| 5 | Закрыть порт от внешнего доступа | `ports: ['127.0.0.1:8080:8080']` |
| 6 | Поставить TLS через Nginx/Caddy/Traefik | См. секцию выше |
| 7 | Увеличить пул соединений | `MOZHNO_DB_POOL_MAX_SIZE=30` |
| 8 | Настроить SMTP для писем | `MOZHNO_SMTP_HOST`, `MOZHNO_SMTP_PORT`, `MOZHNO_SMTP_USERNAME`, `MOZHNO_SMTP_PASSWORD` |
| 9 | Фиксировать версию образа | `image: ghcr.io/mozhno-dev/mozhno:v1.0.0` |
| 10 | Настроить бэкап PostgreSQL | `pg_dump` или WAL-архивация, см. [База данных](/self-hosting/database) |
| 11 | Настроить мониторинг | Prometheus, алерты — см. [Мониторинг](/self-hosting/monitoring) |

## Что дальше?

- [Масштабирование](/self-hosting/scaling) — горизонтальное масштабирование и кеширование
- [База данных](/self-hosting/database) — настройка PostgreSQL, бэкапы, пул соединений
- [Конфигурация](/intro/configuration) — полный список переменных окружения

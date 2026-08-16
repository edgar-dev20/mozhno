# Конфигурация

Все настройки **можно**<span class=brand-dot>.</span> задаются через переменные окружения с единым префиксом `MOZHNO_*`. Ниже — полный список с описаниями и значениями по умолчанию.

> **Модель конфигурации:** приложение читает настройки **только** из переменных окружения `MOZHNO_*`. Все имеют безопасные значения по умолчанию — сервер стартует без какой-либо конфигурации. Полный шаблон — в файле [`.env.example`](https://github.com/mozhno-dev/mozhno/blob/main/.env.example) в корне репозитория. Профиль `dev` (через `SPRING_PROFILES_ACTIVE=dev`) предназначен только для локальной разработки из исходников.

## Как задавать переменные

**Docker Compose** — в секции `environment` сервиса:

```yaml
services:
  mozhno:
    image: mozhnodev/mozhno:latest
    environment:
      MOZHNO_JWT_SECRET: ${MOZHNO_JWT_SECRET}   # из .env или окружения хоста
      MOZHNO_DB_URL: jdbc:postgresql://postgres:5432/feature_flags
      MOZHNO_DB_PASSWORD: secret
      MOZHNO_BASE_URL: https://flags.example.com
```

**`docker run`** — через флаги `-e`:

```bash
docker run -p 8080:8080 \
  -e MOZHNO_JWT_SECRET=$(openssl rand -base64 32) \
  -e MOZHNO_DB_URL=jdbc:postgresql://db:5432/feature_flags \
  -e MOZHNO_DB_PASSWORD=secret \
  mozhnodev/mozhno:latest
```

**Файл `.env`** (Docker Compose подхватывает автоматически):

```bash
MOZHNO_JWT_SECRET=your-256-bit-secret
MOZHNO_DB_PASSWORD=secret
MOZHNO_JWT_ACCESS_TOKEN_TTL_MINUTES=30
```

**Запуск JAR напрямую** — через переменные окружения процесса:

```bash
export MOZHNO_JWT_SECRET=$(openssl rand -base64 32)
export MOZHNO_DB_PASSWORD=secret
java -jar mozhno.jar
```

## Основные настройки

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_SERVER_PORT` | `8080` | Порт, на котором слушает HTTP-сервер |
| `MOZHNO_BASE_URL` | `http://localhost:8080` | Публичный URL сервера. Используется для генерации ссылок и CORS |
| `MOZHNO_JWT_SECRET` | — (опционально для dev) | Секретный ключ для подписи JWT-токенов. Минимум 256 бит. Принимается как простой текст (>= 32 символов), так и Base64 (>= 32 байт после декодирования). Если не задан — генерируется случайный ключ на время сессии (при рестарте все токены инвалидируются). Для продакшена задайте явно |
| `MOZHNO_CACHE_TTL_MINUTES` | `5` | TTL кеша Caffeine в минутах. При multi-node уменьшите до `1` или `0`. Подробнее — [Масштабирование](/self-hosting/scaling#нюанс-multi-node) |
| `MOZHNO_CLIENT_MAX_METRICS_PER_KEY` | `1000` | Максимальное количество хранимых метрик на API-ключ |

## Инициализация (первый запуск)

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_INIT_EMAIL` | — (если не задана — администратор не создаётся) | Email администратора, создаваемого при первом запуске (если в БД нет пользователей) |
| `MOZHNO_INIT_PASSWORD` | — | Пароль администратора при первом запуске |

При первом запуске с пустой БД сервер создаёт:
- **Пользователя-администратора** — если заданы обе переменные `MOZHNO_INIT_EMAIL` и `MOZHNO_INIT_PASSWORD`, и в БД ещё нет пользователей
- **Проект** «Default Project» — если в БД ещё нет проектов

Если переменные не заданы, сервер стартует без пользователей — войти будет невозможно.
Задайте их или создайте администратора вручную через прямой INSERT в БД.

При логине заново через переменные окружения администратор **не пересоздаётся** — если пользователи уже есть в БД, бутстрап пропускается.

## База данных

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_DB_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | JDBC URL для подключения к PostgreSQL |
| `MOZHNO_DB_USERNAME` | `flags_user` | Имя пользователя базы данных |
| `MOZHNO_DB_PASSWORD` | `flags_password` | Пароль пользователя базы данных |

### Дополнительные настройки пула соединений

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_DB_POOL_MAX_SIZE` | `20` | Максимальный размер пула соединений HikariCP |
| `MOZHNO_DB_POOL_MIN_IDLE` | `5` | Минимальное количество простаивающих соединений |
| `MOZHNO_DB_POOL_CONNECTION_TIMEOUT` | `10000` | Таймаут получения соединения (мс) |

## Flyway (миграции)

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_FLYWAY_ENABLED` | `true` | Автоматический запуск миграций при старте |
| `MOZHNO_FLYWAY_LOCATIONS` | `classpath:db/migration` | Путь к файлам миграций |

## JWT и безопасность

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_JWT_SECRET` | — (опционально для dev) | Секретный ключ подписи JWT. Если не задан — генерируется случайный ключ (все токены сбрасываются при рестарте) |
| `MOZHNO_JWT_ACCESS_TOKEN_TTL_MINUTES` | `15` | Время жизни access-токена в минутах |
| `MOZHNO_JWT_REFRESH_TOKEN_TTL_DAYS` | `30` | Время жизни refresh-токена в днях |

Refresh-токены используют **семейную ротацию** (family rotation). При каждом обновлении старый refresh-токен инвалидируется, новый сохраняется в ту же «семью». Если украденный токен используется повторно, вся семья аннулируется.

## Swagger / OpenAPI

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_SWAGGER_UI_PATH` | `/swagger-ui.html` | Путь к Swagger UI |
| `MOZHNO_API_DOCS_PATH` | `/v3/api-docs` | Путь к OpenAPI-спецификации |

## Пример `.env`-файла

```bash
# JWT secret (опционально для dev — без него генерируется случайный ключ)
MOZHNO_JWT_SECRET=your-256-bit-secret-change-me-in-production

# База данных
MOZHNO_DB_URL=jdbc:postgresql://localhost:5432/feature_flags
MOZHNO_DB_USERNAME=flags_user
MOZHNO_DB_PASSWORD=flags_password

# Сервер
MOZHNO_SERVER_PORT=8080
MOZHNO_BASE_URL=http://localhost:8080

# JWT
MOZHNO_JWT_ACCESS_TOKEN_TTL_MINUTES=15
MOZHNO_JWT_REFRESH_TOKEN_TTL_DAYS=30

# Пул соединений
MOZHNO_DB_POOL_MAX_SIZE=20
MOZHNO_DB_POOL_MIN_IDLE=5

# Кеш
MOZHNO_CACHE_TTL_MINUTES=5
MOZHNO_CLIENT_MAX_METRICS_PER_KEY=1000

# Бутстрап (первый запуск) — создаёт администратора при пустой БД
MOZHNO_INIT_EMAIL=admin@admin.com
MOZHNO_INIT_PASSWORD=admin
```

## Продакшен-рекомендации

1. **MOZHNO_JWT_SECRET** — используйте криптографически стойкий ключ длиной не менее 256 бит. Сгенерировать (один из вариантов; также подойдёт простая строка >= 32 символов):

   ```bash
   openssl rand -base64 32
   ```

2. **База данных** — всегда задавайте сложный пароль. Не используйте `flags_password` на проде.

3. **MOZHNO_BASE_URL** — укажите реальный домен (`https://flags.example.com`) для корректной работы CORS и генерации ссылок.

4. **Пул соединений** — для продакшена увеличьте `MOZHNO_DB_POOL_MAX_SIZE` до 20–50 в зависимости от нагрузки.

5. **Refresh token rotation** — включена по умолчанию. Ротация предотвращает перехват токенов.

6. **Смените пароль администратора** — после первого входа с бутстрап-учётной записью (`MOZHNO_INIT_EMAIL` / `MOZHNO_INIT_PASSWORD`) сразу смените пароль. На проде не используйте `admin@admin.com` / `admin`.

## Дополнительные настройки безопасности

### Rate Limiting

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_SECURITY_RATE_LIMIT_ENABLED` | `true` | Включение rate limiting |
| `MOZHNO_SECURITY_RATE_LIMIT_LOGIN_CAPACITY` | `5` | Ёмкость корзины для логина |
| `MOZHNO_SECURITY_RATE_LIMIT_LOGIN_REFILL_TOKENS` | `5` | Токенов за интервал для логина |
| `MOZHNO_SECURITY_RATE_LIMIT_LOGIN_REFILL_MINUTES` | `1` | Интервал пополнения для логина (мин) |
| `MOZHNO_SECURITY_RATE_LIMIT_PASSWORD_RESET_CAPACITY` | `3` | Ёмкость для сброса пароля |
| `MOZHNO_SECURITY_RATE_LIMIT_PASSWORD_RESET_REFILL_TOKENS` | `3` | Токенов за интервал для сброса |
| `MOZHNO_SECURITY_RATE_LIMIT_PASSWORD_RESET_REFILL_MINUTES` | `60` | Интервал пополнения для сброса (мин) |
| `MOZHNO_SECURITY_RATE_LIMIT_REFRESH_CAPACITY` | `10` | Ёмкость для обновления токенов |
| `MOZHNO_SECURITY_RATE_LIMIT_REFRESH_REFILL_TOKENS` | `10` | Токенов за интервал для refresh |
| `MOZHNO_SECURITY_RATE_LIMIT_REFRESH_REFILL_MINUTES` | `1` | Интервал пополнения для refresh (мин) |
| `MOZHNO_SECURITY_RATE_LIMIT_CLIENT_CAPACITY` | `1000` | Ёмкость для SDK-клиентов |
| `MOZHNO_SECURITY_RATE_LIMIT_CLIENT_REFILL_TOKENS` | `1000` | Токенов за интервал для SDK |
| `MOZHNO_SECURITY_RATE_LIMIT_CLIENT_REFILL_MINUTES` | `1` | Интервал пополнения для SDK (мин) |
| `MOZHNO_SECURITY_RATE_LIMIT_API_WRITE_CAPACITY` | `100` | Ёмкость для admin write-операций |
| `MOZHNO_SECURITY_RATE_LIMIT_API_WRITE_REFILL_TOKENS` | `100` | Токенов за интервал для write |
| `MOZHNO_SECURITY_RATE_LIMIT_API_WRITE_REFILL_MINUTES` | `1` | Интервал пополнения для write (мин) |

### CORS

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_SECURITY_CORS_ALLOWED_ORIGINS` | `""` | Разрешённые origin для CORS (через запятую) |

### JWT

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_JWT_ISSUER` | `mozhno` | Издатель токенов (iss claim) |

### Аудит

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_AUDIT_RETENTION_DAYS` | `365` | Срок хранения записей аудита в днях |

### Прочее

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_CLIENT_INSTANCE_RETENTION_DAYS` | `30` | Срок хранения неактивных экземпляров SDK |
| `MOZHNO_DB_POOL_LEAK_DETECTION` | `30000` | Порог детекции утечек соединений (мс) |
| `MOZHNO_CACHE_TYPE` | `caffeine` | Spring-тип кеша. `caffeine` — in-memory (Community). Для Redis добавьте `spring-boot-starter-data-redis` и смените на `redis` |

## SMTP (почта)

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_SMTP_HOST` | `localhost` | Хост SMTP-сервера |
| `MOZHNO_SMTP_PORT` | `587` | Порт SMTP-сервера |
| `MOZHNO_SMTP_USERNAME` | — | Имя пользователя SMTP |
| `MOZHNO_SMTP_PASSWORD` | — | Пароль SMTP |
| `MOZHNO_MAIL_FROM` | `noreply@mozhno.dev` | Адрес отправителя писем |

## Новые настройки

Помимо перечисленных, доступны дополнительные группы (значения по умолчанию заданы, менять не обязательно):

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `MOZHNO_SECURITY_BCRYPT_STRENGTH` | `12` | Сложность (cost) BCrypt для хеширования паролей |
| `MOZHNO_SECURITY_MAX_FAILED_LOGIN_ATTEMPTS` | `5` | Неудачных попыток входа до блокировки аккаунта |
| `MOZHNO_SECURITY_LOCKOUT_DURATION_MINUTES` | `15` | Длительность блокировки аккаунта (мин) |
| `MOZHNO_AUTH_PASSWORD_RESET_TOKEN_TTL_HOURS` | `1` | Срок жизни токена сброса пароля (ч) |
| `MOZHNO_AUTH_PASSWORD_RESET_COOLDOWN_MINUTES` | `5` | Минимальный интервал между письмами сброса (мин) |
| `MOZHNO_AUTH_INVITE_TOKEN_TTL_DAYS` | `7` | Срок жизни токена приглашения (дни) |
| `MOZHNO_AUTH_ACTIVITY_WINDOW_MINUTES` | `5` | Как часто обновляется метка активности пользователя (мин) |
| `MOZHNO_WEBHOOK_CONNECT_TIMEOUT_SECONDS` | `10` | Таймаут соединения для вебхуков (с) |
| `MOZHNO_WEBHOOK_REQUEST_TIMEOUT_SECONDS` | `30` | Таймаут запроса для вебхуков (с) |
| `MOZHNO_WEBHOOK_ASYNC_CORE_POOL_SIZE` | `4` | Базовый размер пула потоков вебхуков |
| `MOZHNO_WEBHOOK_ASYNC_MAX_POOL_SIZE` | `16` | Максимальный размер пула потоков вебхуков |
| `MOZHNO_WEBHOOK_ASYNC_QUEUE_CAPACITY` | `100` | Ёмкость очереди задач вебхуков |
| `MOZHNO_FLAGS_MAX_TAGS_PER_FLAG` | `10` | Максимум тегов на флаг |
| `MOZHNO_FLAGS_DEFAULT_PAGE_SIZE` | `50` | Размер страницы по умолчанию |
| `MOZHNO_FLAGS_MAX_PAGE_SIZE` | `200` | Максимальный размер страницы (список флагов) |
| `MOZHNO_FLAGS_ENRICHED_MAX_PAGE_SIZE` | `500` | Максимальный размер страницы (обогащённый список) |
| `MOZHNO_CACHE_MAX_SIZE` | `5000` | Максимум записей в кеше |
| `MOZHNO_MANAGEMENT_PORT` | `9090` | Порт actuator/метрик |
| `MOZHNO_SWAGGER_ENABLED` | `true` | Включение Swagger UI |
| `MOZHNO_LOG_LEVEL_ROOT` | `INFO` | Корневой уровень логирования |
| `MOZHNO_LOG_LEVEL_APP` | `INFO` | Уровень логирования `dev.mozhno` |

Полный перечень с дефолтами — в файле [`.env.example`](https://github.com/mozhno-dev/mozhno/blob/main/.env.example).

## Что дальше?

- [Установка](/intro/installation) — как развернуть сервер
- [Флаги](/concepts/flags) — типы флагов и правила
- [Окружения](/concepts/environments) — dev, staging, production

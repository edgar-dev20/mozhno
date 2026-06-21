# Конфигурация

Все настройки **можно.** задаются через переменные окружения. Ниже — полный список с описаниями и значениями по умолчанию.

## Основные настройки

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SERVER_PORT` | `8080` | Порт, на котором слушает HTTP-сервер |
| `APP_BASE_URL` | `http://localhost:8080` | Публичный URL сервера. Используется для генерации ссылок и CORS |
| `JWT_SECRET` | — | Секретный ключ для подписи JWT-токенов. **Обязателен**. Минимум 256 бит |
| `CACHE_TTL_MINUTES` | `5` | Время жизни ин-мемори кеша правил в минутах |
| `CLIENT_MAX_METRICS_PER_KEY` | `1000` | Максимальное количество хранимых метрик на API-ключ |

## База данных

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | JDBC URL для подключения к PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `flags_user` | Имя пользователя базы данных |
| `SPRING_DATASOURCE_PASSWORD` | `flags_password` | Пароль пользователя базы данных |

### Дополнительные настройки пула соединений

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `HIKARI_MAX_POOL_SIZE` | `20` | Максимальный размер пула соединений HikariCP |
| `HIKARI_MIN_IDLE` | `5` | Минимальное количество простаивающих соединений |
| `HIKARI_CONNECTION_TIMEOUT` | `10000` | Таймаут получения соединения (мс) |

## Flyway (миграции)

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SPRING_FLYWAY_ENABLED` | `true` | Автоматический запуск миграций при старте |
| `SPRING_FLYWAY_LOCATIONS` | `classpath:db/migration` | Путь к файлам миграций |

## JWT и безопасность

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `JWT_SECRET` | — | Секретный ключ подписи JWT. **Обязателен** |
| `JWT_ACCESS_TOKEN_TTL_MINUTES` | `15` | Время жизни access-токена в минутах |
| `JWT_REFRESH_TOKEN_TTL_DAYS` | `30` | Время жизни refresh-токена в днях |

Refresh-токены используют **семейную ротацию** (family rotation). При каждом обновлении старый refresh-токен инвалидируется, новый сохраняется в ту же «семью». Если украденный токен используется повторно, вся семья аннулируется.

## Swagger / OpenAPI

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SPRINGDOC_SWAGGER_UI_PATH` | `/swagger-ui.html` | Путь к Swagger UI |
| `SPRINGDOC_API_DOCS_PATH` | `/v3/api-docs` | Путь к OpenAPI-спецификации |

## Пример `.env`-файла

```bash
# Обязательные
JWT_SECRET=your-256-bit-secret-change-me-in-production

# База данных
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/feature_flags
SPRING_DATASOURCE_USERNAME=flags_user
SPRING_DATASOURCE_PASSWORD=flags_password

# Сервер
SERVER_PORT=8080
APP_BASE_URL=http://localhost:8080

# JWT
JWT_ACCESS_TOKEN_TTL_MINUTES=15
JWT_REFRESH_TOKEN_TTL_DAYS=30

# Пул соединений
HIKARI_MAX_POOL_SIZE=20
HIKARI_MIN_IDLE=5

# Кеш
CACHE_TTL_MINUTES=5
CLIENT_MAX_METRICS_PER_KEY=1000
```

## Продакшен-рекомендации

1. **JWT_SECRET** — используйте криптографически стойкий ключ длиной не менее 256 бит. Сгенерировать:

   ```bash
   openssl rand -base64 32
   ```

2. **База данных** — всегда задавайте сложный пароль. Не используйте `flags_password` на проде.

3. **APP_BASE_URL** — укажите реальный домен (`https://flags.example.com`) для корректной работы CORS и генерации ссылок.

4. **Пул соединений** — для продакшена увеличьте `HIKARI_MAX_POOL_SIZE` до 20–50 в зависимости от нагрузки.

5. **Refresh token rotation** — включена по умолчанию. Ротация предотвращает перехват токенов.

## SMTP (почта)

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SMTP_HOST` | `localhost` | Хост SMTP-сервера |
| `SMTP_PORT` | `587` | Порт SMTP-сервера |
| `SMTP_USERNAME` | — | Имя пользователя SMTP |
| `SMTP_PASSWORD` | — | Пароль SMTP |
| `EMAIL_FROM` | `noreply@mozhno.dev` | Адрес отправителя писем |

## Что дальше?

- [Установка](/guide/installation) — как развернуть сервер
- [Флаги](/concepts/flags) — типы флагов и правила
- [Окружения](/concepts/environments) — dev, staging, production

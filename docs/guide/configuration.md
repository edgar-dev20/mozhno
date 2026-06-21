# Конфигурация

Все настройки **можно.** задаются через переменные окружения. Ниже — полный список с описаниями и значениями по умолчанию.

## Основные настройки

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SERVER_PORT` | `8080` | Порт, на котором слушает HTTP-сервер |
| `APP_BASE_URL` | `http://localhost:8080` | Публичный URL сервера. Используется для генерации ссылок и CORS |
| `JWT_SECRET` | — | Секретный ключ для подписи JWT-токенов. **Обязателен**. Минимум 256 бит |

## База данных

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | JDBC URL для подключения к PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `flags_user` | Имя пользователя базы данных |
| `SPRING_DATASOURCE_PASSWORD` | `flags_password` | Пароль пользователя базы данных |

### Дополнительные настройки пула соединений

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE` | `10` | Максимальный размер пула соединений HikariCP |
| `SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE` | `5` | Минимальное количество простаивающих соединений |
| `SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT` | `30000` | Таймаут получения соединения (мс) |
| `SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT` | `600000` | Таймаут бездействия соединения (мс) |

## Flyway (миграции)

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `SPRING_FLYWAY_ENABLED` | `true` | Автоматический запуск миграций при старте |
| `SPRING_FLYWAY_LOCATIONS` | `classpath:db/migration` | Путь к файлам миграций |

## JWT и безопасность

| Переменная | По умолчанию | Описание |
|------------|-------------|----------|
| `JWT_SECRET` | — | Секретный ключ подписи JWT. **Обязателен** |
| `JWT_ACCESS_TOKEN_EXPIRATION` | `900000` | Время жизни access-токена в миллисекундах (по умолчанию 15 минут) |
| `JWT_REFRESH_TOKEN_EXPIRATION` | `604800000` | Время жизни refresh-токена в миллисекундах (по умолчанию 7 дней) |
| `JWT_REFRESH_TOKEN_ROTATION_ENABLED` | `true` | Ротация refresh-токенов: при обновлении старый токен инвалидируется |

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
JWT_ACCESS_TOKEN_EXPIRATION=900000
JWT_REFRESH_TOKEN_EXPIRATION=604800000
JWT_REFRESH_TOKEN_ROTATION_ENABLED=true

# Пул соединений
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=5
```

## Продакшен-рекомендации

1. **JWT_SECRET** — используйте криптографически стойкий ключ длиной не менее 256 бит. Сгенерировать:

   ```bash
   openssl rand -base64 32
   ```

2. **База данных** — всегда задавайте сложный пароль. Не используйте `flags_password` на проде.

3. **APP_BASE_URL** — укажите реальный домен (`https://flags.example.com`) для корректной работы CORS и генерации ссылок.

4. **Пул соединений** — для продакшена увеличьте `MAXIMUM_POOL_SIZE` до 20–50 в зависимости от нагрузки.

5. **Refresh token rotation** — оставляйте включённым (`true`) для безопасности.

## Что дальше?

- [Установка](/guide/installation) — как развернуть сервер
- [Флаги](/concepts/flags) — типы флагов и правила
- [Окружения](/concepts/environments) — dev, staging, production

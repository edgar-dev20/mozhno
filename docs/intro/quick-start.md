# Быстрый старт

Запустите **можно**<span class=brand-dot>.</span> за 5 минут с помощью Docker Compose.

## Шаг 1: Создайте docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: feature_flags
      POSTGRES_USER: flags_user
      POSTGRES_PASSWORD: flags_password
    volumes:
      - pgdata:/var/lib/postgresql/data

  mozhno:
    image: mozhnodev/mozhno:latest
    ports:
      - '8080:8080'
    environment:
      MOZHNO_DB_URL: jdbc:postgresql://postgres:5432/feature_flags
      MOZHNO_DB_USERNAME: flags_user
      MOZHNO_DB_PASSWORD: flags_password
      MOZHNO_JWT_SECRET: ${MOZHNO_JWT_SECRET:-}
      MOZHNO_INIT_EMAIL: ${MOZHNO_INIT_EMAIL:-admin@admin.com}
      MOZHNO_INIT_PASSWORD: ${MOZHNO_INIT_PASSWORD:-admin}
    depends_on:
      - postgres

volumes:
  pgdata:
```

## Шаг 2: Запустите сервер

```bash
docker compose up -d
```

## Шаг 3: Откройте веб-панель

Перейдите на [`http://localhost:8080`](http://localhost:8080).

## Шаг 4: Войдите в панель

При первом запуске сервер создаёт администратора и проект из переменных окружения `MOZHNO_INIT_EMAIL` и `MOZHNO_INIT_PASSWORD`. По умолчанию заданы `admin@admin.com` / `admin`.

1. Перейдите на [`http://localhost:8080`](http://localhost:8080)
2. Войдите с email и паролем из `MOZHNO_INIT_EMAIL` / `MOZHNO_INIT_PASSWORD`
3. **Сразу смените пароль** — через раздел «Пользователи» → «Редактировать»

После входа вы попадёте в панель управления с готовым проектом «Default Project».

## Шаг 5: Получите API-ключ

1. В веб-панели перейдите в раздел **«API-ключи»**
2. Нажмите **«Создать ключ»**
3. Введите имя (например, `my-app`)
4. Выберите тип **SERVER** и окружение **Production**
5. Скопируйте значение ключа — оно показывается только один раз

## Шаг 6: Добавьте флаг в код

### Java

Добавьте зависимость в `build.gradle`:

```groovy
repositories { mavenCentral() }
dependencies { implementation 'dev.mozhno:mozhno-client-java:1.1.1' }
```

```java
import dev.mozhno.sdk.*;

var config = MozhnoConfig.builder()
    .appName("my-app")
    .instanceId("instance-1")
    .mozhnoUrl("http://localhost:8080")
    .apiKey("your-api-key")  // API-ключ из раздела «API-ключи» в панели
    .build();

var client = new DefaultMozhnoClient(config);
client.start();

var ctx = MozhnoContext.builder().userId("user-123").build();
boolean isEnabled = client.isEnabled("new-checkout", ctx);

if (isEnabled) {
    // новый код
} else {
    // старый код
}
```

### JavaScript / TypeScript

Установите пакет:

```bash
npm install @mozhno/client-js
```


## Что дальше?

- [Установка](/intro/installation) — ручная установка и продакшен-конфигурация
- [Конфигурация](/intro/configuration) — все переменные окружения
- [Флаги](/concepts/flags) — подробнее о типах флагов и правилах
# Быстрый старт

Запустите **можно.** за 5 минут с помощью Docker Compose.

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
    image: ghcr.io/mozhno-dev/mozhno:latest
    ports:
      - '8080:8080'
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/feature_flags
      SPRING_DATASOURCE_USERNAME: flags_user
      SPRING_DATASOURCE_PASSWORD: flags_password
      JWT_SECRET: change-me-to-a-real-256-bit-secret
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

При первом запуске будет предложено создать проект и администратора.

## Шаг 4: Создайте первый флаг

1. В веб-панели нажмите **«Создать флаг»**
2. Введите ключ флага, например `new-checkout`
3. Выберите тип: **RELEASE** (стандартный фиче-флаг)
4. Выберите стратегию: включите флаг для нужного окружения
5. Нажмите **«Сохранить»**

## Шаг 5: Добавьте флаг в код

### Java

```java
var client = MozhnoClient.builder()
    .serverUrl("http://localhost:8080")
    .apiKey("your-api-key")  // API-ключ из раздела «API-ключи» в панели
    .build();

var ctx = new EvaluationContext().set("userId", "user-123");
boolean isEnabled = client.isFlagEnabled("new-checkout", ctx);

if (isEnabled) {
    // новый код
} else {
    // старый код
}
```

### JavaScript / TypeScript

```typescript
import { MozhnoClient } from '@mozhno/client-js';

const client = new MozhnoClient({
  serverUrl: 'http://localhost:8080',
  apiKey: 'your-api-key',
});

const enabled = await client.isEnabled('new-checkout', { userId: 'user-123' });

if (enabled) {
  // новый код
} else {
  // старый код
}
```

## Что дальше?

- [Установка](/guide/installation) — ручная установка и продакшен-конфигурация
- [Конфигурация](/guide/configuration) — все переменные окружения
- [Флаги](/concepts/flags) — подробнее о типах флагов и правилах

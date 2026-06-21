# JavaScript / TypeScript SDK

JavaScript/TypeScript SDK для **можно.** — клиентская библиотека для Node.js и браузерных приложений. Полная поддержка TypeScript, типы включены в пакет.

## Установка

```bash
npm install @mozhno/client-js
```

```bash
yarn add @mozhno/client-js
```

```bash
pnpm add @mozhno/client-js
```

| Пакет | Реестр | Размер |
|-------|--------|--------|
| `@mozhno/client-js` | npm | ~15 KB gzipped |

### Системные требования

| Среда | Минимальная версия |
|-------|-------------------|
| Node.js | 18+ |
| Браузеры | Последние 2 версии Chrome, Firefox, Safari, Edge |
| TypeScript | 5.0+ (опционально, типы включены в пакет) |

## Быстрый старт

```typescript
import { MozhnoClient } from '@mozhno/client-js';

const client = new MozhnoClient({
  url: 'https://flags.example.com',
  apiKey: 'env-abc123',
  appName: 'my-app',
});
await client.start();

const on = client.isEnabled('new-checkout', { userId: '42' });

if (on) {
  // новый код
} else {
  // старый код
}
```

## Конфигурация

Клиент создаётся через конструктор `MozhnoClient`, который принимает объект настроек `MozhnoConfig`:

```typescript
import { MozhnoClient } from '@mozhno/client-js';

const client = new MozhnoClient({
  url: 'https://flags.example.com',
  apiKey: 'env-abc123',
  appName: 'my-app',
  refreshInterval: 15,    // интервал поллинга (сек), по умолчанию 15
  metricsInterval: 60,     // интервал отправки метрик (сек), по умолчанию 60
  disableMetrics: false,
  stickyAnonId: true,      // авто-генерация анонимного ID (по умолчанию true)
  environment: 'production',
  mode: 'server',          // 'server' (серверная оценка) или 'client' (только тоглы)
});
await client.start();
```

| Опция | Тип | Обязательно | По умолчанию | Описание |
|-------|-----|-------------|-------------|----------|
| `url` | `string` | Да | — | URL сервера **можно.** |
| `appName` | `string` | Да | — | Идентификатор приложения |
| `apiKey` | `string` | Нет | — | API-ключ окружения |
| `clientKey` | `string` | Нет | — | Клиентский ключ (для `mode: 'client'`) |
| `instanceId` | `string` | Нет | UUID | Уникальный идентификатор экземпляра |
| `mode` | `'server' \| 'client'` | Нет | `'server'` | Режим работы |
| `refreshInterval` | `number` | Нет | `15` | Интервал поллинга правил (секунды) |
| `metricsInterval` | `number` | Нет | `60` | Интервал отправки метрик (секунды) |
| `disableMetrics` | `boolean` | Нет | `false` | Отключить отправку метрик |
| `stickyAnonId` | `boolean` | Нет | `true` | Авто-ID для анонимных пользователей |
| `bootstrap` | `FeatureFlag[]` | Нет | — | Предзагруженные правила (опционально) |
| `storageProvider` | `StorageProvider` | Нет | — | Кастомное хранилище |
| `environment` | `string` | Нет | `'default'` | Имя окружения |
| `context` | `MozhnoContext` | Нет | — | Глобальный контекст по умолчанию |
| `fetch` | `typeof fetch` | Нет | `globalThis.fetch` | Переопределение HTTP-клиента |

### Жизненный цикл

```typescript
const client = new MozhnoClient({ url: '...', apiKey: '...', appName: 'my-app' });
await client.start();  // запускает поллинг
// ... работа с флагами ...
client.stop();          // останавливает поллинг и освобождает ресурсы
```

Клиент наследует `EventEmitter` и генерирует события: `'ready'`, `'update'`, `'error'`, `'initialized'`, `'sent'`, `'warn'`.

## API Reference

### `isEnabled(flagKey, context?)`

Проверяет, включён ли флаг. Синхронный метод, оценивает флаг по локальному кешу правил.

```typescript
isEnabled(flagKey: string, context?: MozhnoContext): boolean
```

Возвращает `false`, если флаг не найден (fail-closed).

```typescript
const ctx = { userId: 'user-123', country: 'RU' };
if (client.isEnabled('new-checkout', ctx)) {
  renderNew();
} else {
  renderOld();
}
```

### `getVariant(flagKey)`

Возвращает активный вариант флага (для мультивариативных флагов). Работает только в `mode: 'server'`.

```typescript
getVariant(flagKey: string): { name: string; enabled: boolean } | null
```

```typescript
const variant = client.getVariant('checkout-design');
if (variant) {
  switch (variant.name) {
    case 'modern': return renderModern();
    case 'minimal': return renderMinimal();
  }
}
```

### `updateContext(context)`

Обновляет глобальный контекст клиента (например, после логина пользователя).

```typescript
updateContext(context: MozhnoContext): void
```

```typescript
onUserLogin(user => {
  client.updateContext({ userId: user.id, plan: user.plan });
});
```

### `setContextField(key, value)` / `removeContextField(key)`

Точечное изменение отдельных полей глобального контекста.

```typescript
setContextField(key: string, value: string): void
removeContextField(key: string): void
```

```typescript
client.setContextField('country', 'RU');
client.removeContextField('country');
```

## Контекст (MozhnoContext)

`MozhnoContext` — это простой объект с опциональными полями для передачи атрибутов в момент оценки флага:

```typescript
interface MozhnoContext {
  userId?: string;
  sessionId?: string;
  appName?: string;
  environment?: string;
  currentTime?: string; // ISO-строка, устанавливается автоматически
  [key: string]: string | undefined; // произвольные атрибуты
}
```

### Создание и передача

```typescript
const ctx = {
  userId: 'user-123',
  email: 'user@example.com',
  country: 'RU',
  plan: 'premium',
  appVersion: '2.4.1',
};

const enabled = client.isEnabled('new-checkout', ctx);
```

Если не передать `userId` или `sessionId`, SDK автоматически использует `stickyAnonId` для детерминированного процентного роллаута.

### Глобальный контекст

Глобальный контекст задаётся при создании клиента:

```typescript
const client = new MozhnoClient({
  url: '...',
  apiKey: '...',
  appName: 'my-app',
  context: { userId: 'service-account' },
});
```

При каждом вызове `isEnabled` локальный контекст объединяется с глобальным.

## Интеграция с React

SDK не содержит встроенных React-хуков, но легко оборачивается вручную:

```typescript
// mozhnoContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MozhnoClient, type MozhnoContext } from '@mozhno/client-js';

const MozhnoContext = createContext<MozhnoClient | null>(null);

export function MozhnoProvider({
  client,
  children,
}: {
  client: MozhnoClient;
  children: React.ReactNode;
}) {
  useEffect(() => {
    client.start();
    return () => { client.stop(); };
  }, [client]);
  return <MozhnoContext.Provider value={client}>{children}</MozhnoContext.Provider>;
}

export function useFlag(flagKey: string, ctx?: MozhnoContext): boolean {
  const client = useContext(MozhnoContext);
  if (!client) return false;
  // isEnabled синхронный и дёшев — не нужен useState/useEffect
  return client.isEnabled(flagKey, ctx);
}
```

```tsx
// App.tsx
const client = new MozhnoClient({
  url: import.meta.env.VITE_MOZHNO_URL,
  apiKey: import.meta.env.VITE_MOZHNO_API_KEY,
  appName: 'web-app',
});

function App() {
  return (
    <MozhnoProvider client={client}>
      <CheckoutPage />
    </MozhnoProvider>
  );
}

function CheckoutPage() {
  const showNewCheckout = useFlag('new-checkout', { userId: '42' });
  return showNewCheckout ? <NewCheckout /> : <OldCheckout />;
}
```

## Интеграция с Node.js (Express)

```typescript
import express from 'express';
import { MozhnoClient } from '@mozhno/client-js';

const client = new MozhnoClient({
  url: process.env.MOZHNO_URL || 'http://localhost:8080',
  apiKey: process.env.MOZHNO_API_KEY,
  appName: 'api-server',
});

await client.start();

const app = express();

app.get('/checkout', (req, res) => {
  const ctx = {
    userId: req.headers['x-user-id'] as string,
    country: req.headers['x-country'] as string,
  };

  if (client.isEnabled('new-checkout', ctx)) {
    res.json({ flow: 'new' });
  } else {
    res.json({ flow: 'old' });
  }
});
```

## Обработка ошибок

`isEnabled` фаейлится безопасно: если флаг не найден — `false`. Если кеш пуст (до первой загрузки) — `false`. Сетевая проблема — старые закешированные правила продолжают работать.

Для подписки на ошибки используйте события клиента:

```typescript
client.on('error', (err) => {
  console.error('Mozhno SDK error:', err);
});

client.on('warn', (msg) => {
  console.warn('Mozhno SDK warning:', msg);
});
```

## Производительность

| Сценарий | Типичная задержка |
|----------|-------------------|
| `isEnabled` (локальная оценка) | < 0.1 мс |
| Первичная загрузка (100 флагов, LAN) | ~50 мс |
| Фоновый поллинг (без изменений) | ~5 мс (304 Not Modified) |

SDK хранит правила в `Map` и оценивает флаги синхронно без выделения памяти.

## Что дальше?

- [Java SDK](/sdk/java) — нативная JVM-библиотека
- [Обзор SDK](/sdk/overview) — архитектура и общие концепции
- [Таргетинг](/guide/targeting) — настройка правил и сегментов
- [Быстрый старт](/guide/quick-start) — запуск за 5 минут

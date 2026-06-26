# JavaScript / TypeScript SDK

JavaScript/TypeScript SDK для **можно**<span class=brand-dot>.</span> — клиентская библиотека для Node.js и браузерных приложений. Полная поддержка TypeScript, типы включены в пакет.

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
  refreshInterval: 15,
  metricsInterval: 60,
  disableMetrics: false,
  stickyAnonId: true,
  environment: 'production',
});
await client.start();
```

| Опция | Тип | Обязательно | По умолчанию | Описание |
|-------|-----|-------------|-------------|----------|
| `url` | `string` | Да | — | URL сервера **можно**<span class=brand-dot>.</span> |
| `appName` | `string` | Да | — | Идентификатор приложения |
| `apiKey` | `string` | Нет | — | API-ключ окружения |
| `clientKey` | `string` | Нет | — | Клиентский ключ (для `mode: 'client'`) |
| `instanceId` | `string` | Нет | UUID | Уникальный идентификатор экземпляра |
| `mode` | `'server' \| 'client'` | Нет | `'server'` | Режим работы |
| `refreshInterval` | `number` | Нет | `15 сек` | Интервал поллинга правил |
| `metricsInterval` | `number` | Нет | `60 сек` | Интервал отправки метрик |
| `disableMetrics` | `boolean` | Нет | `false` | Отключить отправку метрик |
| `stickyAnonId` | `boolean` | Нет | `true` | Авто-ID для анонимных пользователей |
| `bootstrap` | `FeatureFlag[]` | Нет | — | Предзагруженные правила |
| `storageProvider` | `StorageProvider` | Нет | — | Кастомное хранилище |
| `fetch` | `typeof fetch` | Нет | `globalThis.fetch` | Переопределение HTTP-клиента |
| `environment` | `string` | Нет | `'default'` | Имя окружения |
| `context` | `MozhnoContext` | Нет | — | Глобальный контекст по умолчанию |

### Жизненный цикл

```typescript
const client = new MozhnoClient({ url: '...', apiKey: '...', appName: 'my-app' });
await client.start();  // запускает поллинг
// ... работа с флагами ...
client.stop();          // останавливает поллинг и освобождает ресурсы
```

Клиент наследует `EventEmitter` и генерирует события: `'ready'`, `'update'`, `'error'`, `'initialized'`, `'sent'`, `'warn'`.

## Контекст (MozhnoContext)

`MozhnoContext` — это простой объект с опциональными полями для передачи атрибутов в момент оценки флага:

```typescript
interface MozhnoContext {
  userId?: string;
  sessionId?: string;
  [key: string]: string | undefined;
}
```

### Создание и передача

```typescript
const ctx = {
  userId: 'user-123',
  country: 'RU',
  plan: 'premium',
  appVersion: '2.4.1',
};

const enabled = client.isEnabled('new-checkout', ctx);
```

Если не передан `userId` или `sessionId`, SDK автоматически использует `stickyAnonId` (по умолчанию `true`) для детерминированного процентного роллаута.

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

const MozhnoCtx = createContext<MozhnoClient | null>(null);

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
  return <MozhnoCtx.Provider value={client}>{children}</MozhnoCtx.Provider>;
}

export function useFlag(flagKey: string, ctx?: MozhnoContext): boolean {
  const client = useContext(MozhnoCtx);
  if (!client) return false;
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

## Что дальше?

- [Java SDK](/sdk/java) — нативная JVM-библиотека
- [Обзор SDK](/sdk/overview) — архитектура и общие концепции
- [Таргетинг](/guide/targeting) — настройка правил и сегментов
- [Быстрый старт](/intro/quick-start) — запуск за 5 минут

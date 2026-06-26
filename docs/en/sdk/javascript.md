# JavaScript / TypeScript SDK

The **можно**<span class=brand-dot>.</span> JavaScript/TypeScript SDK provides local evaluation of feature flags in Node.js and browser applications. Full TypeScript support with types included in the package.

## Installation

```bash
npm install @mozhno/client-js
```

```bash
yarn add @mozhno/client-js
```

```bash
pnpm add @mozhno/client-js
```

### Requirements

| Environment | Minimum Version |
|-------------|-----------------|
| Node.js | 18+ |
| Browsers | Latest 2 versions of Chrome, Firefox, Safari, Edge |
| TypeScript | 5.0+ (optional, types included) |

## Quick Start

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
  // new code
} else {
  // old code
}
```

## Configuration

The client is created via the `MozhnoClient` constructor, which accepts a `MozhnoConfig` object:

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

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `url` | `string` | Yes | — | URL of your **можно**<span class=brand-dot>.</span> instance |
| `appName` | `string` | Yes | — | Application identifier |
| `apiKey` | `string` | No | — | API key for the target environment |
| `clientKey` | `string` | No | — | Client-side key (for `mode: 'client'`) |
| `instanceId` | `string` | No | UUID | Unique instance identifier |
| `mode` | `'server' \| 'client'` | No | `'server'` | Evaluation mode |
| `refreshInterval` | `number` | No | `15 sec` | Polling interval |
| `metricsInterval` | `number` | No | `60 sec` | Metrics reporting interval |
| `disableMetrics` | `boolean` | No | `false` | Disable metrics reporting |
| `stickyAnonId` | `boolean` | No | `true` | Auto-generate anonymous ID for bucketing |
| `bootstrap` | `FeatureFlag[]` | No | — | Pre-loaded rules |
| `storageProvider` | `StorageProvider` | No | — | Custom storage provider |
| `fetch` | `typeof fetch` | No | `globalThis.fetch` | Custom HTTP client |
| `environment` | `string` | No | `'default'` | Environment name |
| `context` | `MozhnoContext` | No | — | Global default context |

### Lifecycle

```typescript
const client = new MozhnoClient({ url: '...', apiKey: '...', appName: 'my-app' });
await client.start();  // begins polling
// ... evaluate flags ...
client.stop();          // stops polling and releases resources
```

The client extends `EventEmitter` and emits events: `'ready'`, `'update'`, `'error'`, `'initialized'`, `'sent'`, `'warn'`.

## Context (MozhnoContext)

`MozhnoContext` is a plain object with optional fields:

```typescript
interface MozhnoContext {
  userId?: string;
  sessionId?: string;
  [key: string]: string | undefined;
}
```

```typescript
const ctx = {
  userId: 'user-123',
  country: 'DE',
  plan: 'enterprise',
  appVersion: '2.4.1',
};

const enabled = client.isEnabled('new-checkout', ctx);
```

If neither `userId` nor `sessionId` is provided, the SDK auto-generates a persistent anonymous ID (controlled by `stickyAnonId`, default `true`) for deterministic percentage rollout.

## React Integration

The SDK does not ship built-in React hooks, but wrapping is straightforward:

```tsx
// MozhnoContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
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

## Express Integration

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

## Next Steps

- [Java SDK](/en/sdk/java) — native JVM library
- [SDK Overview](/en/sdk/overview) — architecture and shared concepts
- [Targeting](/en/guide/targeting) — configuring rules and segments
- [Quick Start](/en/intro/quick-start) — create your first flag

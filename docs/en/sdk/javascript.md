# JavaScript / TypeScript SDK

The можно JavaScript SDK provides local evaluation of feature flags in Node.js and browser environments. Distributed as the npm package `@mozhno/client-js` with full TypeScript definitions.

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

| Package | Registry | Size |
|---------|----------|------|
| `@mozhno/client-js` | npm | ~15 KB gzipped |

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
  refreshInterval: 15,    // polling interval in seconds
  metricsInterval: 60,     // metrics reporting interval in seconds
  disableMetrics: false,
  stickyAnonId: true,      // auto-generate anonymous ID for sticky bucketing
  environment: 'production',
  mode: 'server',          // 'server' (full evaluation) or 'client' (toggles only)
});
await client.start();
```

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `url` | `string` | Yes | — | Base URL of your можно instance |
| `appName` | `string` | Yes | — | Application identifier |
| `apiKey` | `string` | No | — | API key for the target environment |
| `clientKey` | `string` | No | — | Client-side key (for `mode: 'client'`) |
| `instanceId` | `string` | No | UUID | Unique instance identifier |
| `mode` | `'server' \| 'client'` | No | `'server'` | Evaluation mode |
| `refreshInterval` | `number` | No | `15` | Polling interval in seconds |
| `metricsInterval` | `number` | No | `60` | Metrics reporting interval in seconds |
| `disableMetrics` | `boolean` | No | `false` | Disable metrics reporting |
| `stickyAnonId` | `boolean` | No | `true` | Auto-generate anonymous ID for consistent bucketing |
| `bootstrap` | `FeatureFlag[]` | No | — | Pre-loaded rules (optional) |
| `storageProvider` | `StorageProvider` | No | — | Custom storage provider |
| `environment` | `string` | No | `'default'` | Environment name |
| `context` | `MozhnoContext` | No | — | Global default context |
| `fetch` | `typeof fetch` | No | `globalThis.fetch` | Custom HTTP client |

### Lifecycle

```typescript
const client = new MozhnoClient({ url: '...', apiKey: '...', appName: 'my-app' });
await client.start();  // begins polling
// ... evaluate flags ...
client.stop();          // stops polling and releases resources
```

The client extends `EventEmitter` and emits events: `'ready'`, `'update'`, `'error'`, `'initialized'`, `'sent'`, `'warn'`.

## API Reference

### `isEnabled(flagKey, context?)`

Evaluates a flag synchronously against the local rules cache. Returns `false` if the flag is not found (fail-closed).

```typescript
isEnabled(flagKey: string, context?: MozhnoContext): boolean
```

```typescript
const ctx = { userId: 'user-123', country: 'DE' };
if (client.isEnabled('new-checkout', ctx)) {
  renderNew();
} else {
  renderOld();
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `flagKey` | `string` | The flag key to evaluate |
| `context` | `MozhnoContext` (optional) | Context with user/request attributes |

### `getVariant(flagKey)`

Returns the active variant of a flag. Only works in `mode: 'server'`.

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

Updates the global context (e.g. after user login).

```typescript
updateContext(context: MozhnoContext): void
```

### `setContextField(key, value)` / `removeContextField(key)`

Set or remove individual context fields.

```typescript
setContextField(key: string, value: string): void
removeContextField(key: string): void
```

## Context (MozhnoContext)

`MozhnoContext` is a plain object with optional fields:

```typescript
interface MozhnoContext {
  userId?: string;
  sessionId?: string;
  appName?: string;
  environment?: string;
  currentTime?: string;   // ISO string, set automatically
  [key: string]: string | undefined;
}
```

```typescript
const ctx = {
  userId: 'user-123',
  email: 'alice@example.com',
  country: 'DE',
  plan: 'enterprise',
  appVersion: '2.4.1',
};

const enabled = client.isEnabled('dark_mode_v2', ctx);
```

If neither `userId` nor `sessionId` is provided, the SDK auto-generates a persistent anonymous ID (controlled by `stickyAnonId`) for deterministic percentage rollout.

## React Integration

The SDK does not ship built-in React hooks, but wrapping is straightforward:

```tsx
// MozhnoContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { MozhnoClient, type MozhnoContext } from '@mozhno/client-js';

const MozhnoReactContext = createContext<MozhnoClient | null>(null);

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
  return <MozhnoReactContext.Provider value={client}>{children}</MozhnoReactContext.Provider>;
}

export function useFlag(flagKey: string, ctx?: MozhnoContext): boolean {
  const client = useContext(MozhnoReactContext);
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

## Express Middleware

```js
import express from 'express';
import { MozhnoClient } from '@mozhno/client-js';

const app = express();
const client = new MozhnoClient({
  url: process.env.MOZHNO_URL || 'http://localhost:8080',
  apiKey: process.env.MOZHNO_API_KEY,
  appName: 'api-server',
});

await client.start();

app.get('/checkout', (req, res) => {
  const ctx = {
    userId: req.headers['x-user-id'],
    country: req.headers['x-country'],
  };

  if (client.isEnabled('new-checkout', ctx)) {
    res.json({ flow: 'new' });
  } else {
    res.json({ flow: 'old' });
  }
});

app.listen(3000);
```

## Error Handling

`isEnabled` fails safely: unknown flag → `false`, empty cache → `false`, network issues → last cached rules continue to work.

Subscribe to events for error monitoring:

```typescript
client.on('error', (err) => {
  console.error('Mozhno SDK error:', err);
});

client.on('warn', (msg) => {
  console.warn('Mozhno SDK warning:', msg);
});
```

## Performance

| Scenario | Typical Latency |
|----------|-----------------|
| `isEnabled` (local eval) | < 0.1 ms |
| Initial fetch (100 flags, LAN) | ~50 ms |
| Background poll (no changes) | ~5 ms (304 Not Modified) |

The SDK stores rules in a `Map` and evaluates flags synchronously with no memory allocation after cache warm-up.

## Next Steps

- [SDK Overview](./overview.md) — Architecture and local evaluation model
- [Java SDK](./java.md) — For JVM-based applications
- [REST API](../api/rest.md) — Manage flags programmatically

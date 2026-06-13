// Node.js example for @mozhno/client-js (server-side mode)
import { MozhnoClient } from '../dist/mozhno-client.mjs';

const mozhno = new MozhnoClient({
  url: 'https://flags.example.com',
  apiKey: process.env.MOZHNO_API_KEY,
  appName: 'nodejs-example',
  instanceId: 'instance-1',
  mode: 'server',
  refreshInterval: 15,
});

await mozhno.start();

const ctx = { userId: 'user-123', plan: 'premium' };
if (mozhno.isEnabled('my-feature', ctx)) {
  console.log('Feature is ON');
} else {
  console.log('Feature is OFF');
}

mozhno.stop();

import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

import baseConfig from "./vitest.config";

export default defineConfig({
  ...baseConfig,
  plugins: [
    ...(Array.isArray(baseConfig.plugins) ? baseConfig.plugins : []),
    storybookTest({
      configDir: path.join(dirname, ".storybook"),
      storybookScript: "npm run storybook -- --no-open --ci",
    }),
  ],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      provider: playwright({}),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
    setupFiles: ["./.storybook/vitest.setup.ts"],
  },
  server: {
    host: "127.0.0.1",
  },
});

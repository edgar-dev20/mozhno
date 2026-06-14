import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MozhnoClient',
      fileName: (format) => `mozhno-client.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
  },
});

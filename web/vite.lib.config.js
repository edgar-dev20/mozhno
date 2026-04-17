import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MozhnoCoreUi',
      formats: ['es', 'cjs'],
      fileName: (format) => `mozhno-core-ui.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-router',
        'next-themes',
        /^@radix-ui\//,
        /^@mui\//,
        /^@emotion\//,
        /^lucide-react/,
        'recharts',
        'sonner',
        'motion',
        'react-hook-form',
        'react-dnd',
        'react-dnd-html5-backend',
        'react-popper',
        'react-resizable-panels',
        'date-fns',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        'cmdk',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})

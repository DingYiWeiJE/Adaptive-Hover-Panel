import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@adaptive-hover/react/styles.css',
        replacement: r('../packages/react/src/styles.css'),
      },
      {
        find: '@adaptive-hover/react',
        replacement: r('../packages/react/src/index.ts'),
      },
      {
        find: '@adaptive-hover/core',
        replacement: r('../packages/core/src/index.ts'),
      },
    ],
  },
})

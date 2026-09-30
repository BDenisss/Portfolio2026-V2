import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
  test: {
    // next-intl importe `next/navigation` sans extension : Vite doit le résoudre (Node natif ne le peut pas).
    server: { deps: { inline: ['next-intl'] } },
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    css: false,
  },
})

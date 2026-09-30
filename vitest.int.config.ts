import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// .env local si présent (la CI fournit ses variables) ; les variables déjà définies ne sont pas écrasées.
if (existsSync('.env')) process.loadEnvFile('.env')

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/integration/**/*.int.test.ts'],
    environment: 'node',
    // Le schéma testé est toujours celui des migrations (pas de push automatique).
    env: { PAYLOAD_DB_PUSH: 'false' },
    pool: 'forks',
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
})

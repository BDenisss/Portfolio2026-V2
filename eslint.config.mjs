import { defineConfig, globalIgnores } from 'eslint/config'
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/** Règle de dépendance : ce que chaque couche n'a PAS le droit d'importer (voir « Architecture » dans le plan). */
const FORBIDDEN_IMPORTS = {
  domain: ['@/application/**', '@/infrastructure/**', '@/composition/**', '@/presentation/**', '@/app/**'],
  application: ['@/infrastructure/**', '@/composition/**', '@/presentation/**', '@/app/**'],
  infrastructure: ['@/composition/**', '@/presentation/**', '@/app/**'],
  composition: ['@/presentation/**', '@/app/**'],
  presentation: ['@/infrastructure/**', '@/composition/**', '@/app/**'],
  app: ['@/infrastructure/**'],
}

const layerBoundary = (layer) => ({
  files: [`src/${layer}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: FORBIDDEN_IMPORTS[layer], message: `La couche « ${layer} » ne doit pas importer cette couche (règle de dépendance).` }] }],
  },
})

const cleanCode = {
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    complexity: ['error', 10],
    'max-depth': ['error', 3],
    'max-params': ['error', 4],
    'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    'no-else-return': 'error',
    'no-nested-ternary': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
  },
}

export default defineConfig([
  ...coreWebVitals,
  ...typescript,
  globalIgnores(['.next/**', 'node_modules/**', 'src/infrastructure/cms/payload/payload-types.ts', 'src/infrastructure/cms/payload/migrations/**', 'src/app/(payload)/**', 'public/**', 'playwright-report/**']),
  cleanCode,
  { files: ['src/presentation/**/*.tsx', 'src/app/**/*.tsx'], rules: { 'max-lines-per-function': ['error', { max: 90, skipBlankLines: true, skipComments: true }] } }, // JSX
  { files: ['src/domain/**/*.ts', 'src/application/**/*.ts', 'src/infrastructure/**/*.ts'], rules: { '@typescript-eslint/explicit-module-boundary-types': 'error' } },
  { files: ['src/infrastructure/cms/payload/collections/**', 'src/infrastructure/cms/payload/globals/**', 'src/infrastructure/seed/**'], rules: { 'max-lines': 'off', 'max-lines-per-function': 'off' } }, // configuration déclarative / données
  { files: ['src/infrastructure/seed/**', 'scripts/**', 'tests/**'], rules: { 'no-console': 'off', '@typescript-eslint/no-non-null-assertion': 'off', 'max-params': 'off' } },
  ...['domain', 'application', 'infrastructure', 'composition', 'presentation', 'app'].map(layerBoundary),
])

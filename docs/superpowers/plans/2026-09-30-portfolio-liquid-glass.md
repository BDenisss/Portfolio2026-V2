# Portfolio Denis Bucspun — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** Livrer le portfolio full-stack Liquid Glass (hero cinématique avec avatar Memoji 3D, CMS Payload pour projets/stacks, FR/EN, responsive) dans le repo `BDenisss/Portfolio2026-V2`.

**Architecture :** Une seule app Next.js 16.3 (App Router) avec Payload CMS 3.90 embarqué (`/admin`, `/api`), Postgres partout, contenu localisé FR/EN. Le code suit une **Clean Architecture adaptée** (domain / application / infrastructure / composition / presentation / app — voir la section « Architecture ») : le site lit le contenu via un port `PortfolioRepository` dont Payload (API locale) n'est qu'un adaptateur (Server Components, ISR + revalidation à la publication). La couche cinématique (GSAP/Lenis/R3F) est **strictement optionnelle** : chaque slot média a un repli, le contenu est visible sans JS.

**Tech Stack :** Next.js 16.3.7 · React 19.3 · Payload 3.90.2 (+ db-postgres, richtext-lexical, storage-vercel-blob) · Tailwind CSS 4.3 · next-intl 4 · GSAP 3.15 + Lenis · three 0.186 + @react-three/fiber 9 + drei 10 · simple-icons · lucide-react · resend · Vitest 5 · Playwright + axe · pnpm 10 · TypeScript 5.x.

**Spec :** [`docs/superpowers/specs/2026-09-30-portfolio-liquid-glass-design.md`](../specs/2026-09-30-portfolio-liquid-glass-design.md) · **Design system :** [`design-system/portfolio-denis-bucspun/MASTER.md`](../../../design-system/portfolio-denis-bucspun/MASTER.md) — les exécutants lisent les **deux** avant leur tâche.

## Global Constraints

Chaque tâche les inclut implicitement.

- **Versions :** `next` `>=16.3.3 <17` (pin `16.3.7`) ; **tous** les paquets `payload` / `@payloadcms/*` à la **même** version `3.90.2` ; React 19 ; Node `engines >=20.9`, `.nvmrc` = `22` ; **TypeScript `^5.9.3`** (pas 7) ; pnpm 10 (`packageManager` renseigné) ; Tailwind v4.
- **Langues :** `fr` (défaut) et `en` ; `fallback: true` (repli sur `fr`) ; routes `/fr` `/en` (`localePrefix: 'always'`).
- **Git :** auteur **`BDenisss <bucspun.d@gmail.com>`** (déjà configuré globalement, ne pas le changer) ; Conventional Commits ; **aucune** ligne `Co-Authored-By`, **aucune** mention « Generated with Claude Code » dans les commits ni PR ; **les exécutants ne committent pas** : l'orchestrateur committe par tâche (chemins listés) après revue.
- **Dépendances gelées après T1 :** seule T1 modifie `package.json`/`pnpm-lock.yaml`. Une tâche qui a besoin d'un paquet manquant le **signale** (ne l'installe pas).
- **Fichiers disjoints :** une tâche ne modifie que les fichiers de sa section `Files`. Toute autre modification = signaler.
- **Design :** aucun hex brut dans les composants (tokens `var(--…)` / classes Tailwind mappées) ; aucun emoji comme icône ; **aucun texte directement sur vidéo/3D** (toujours sur verre ≥ 62 % blanc ou sous scrim) ; texte < 24px uniquement en `--ink`, `--ink-2`, `--ink-muted`, `--accent-text` ; `--accent` (#8B5CF6) = décoratif/grands titres.
- **Mouvement :** tout passe par `gsap.matchMedia('(prefers-reduced-motion: reduce)')` → état final immédiat ; **≤ 1 section pinnée** (le hero, desktop ≥ 768px seulement) ; parallax sur le décor uniquement ; animer `transform`/`opacity` uniquement ; contenu visible sans JS (états initiaux masqués posés seulement sous `html.js`).
- **Contenu :** uniquement des faits issus des CV FR/IA ; **pas de témoignages, pas de logos clients inventés** ; téléphone **jamais** commité (`showPhone: false` par défaut, valeur seed via `SEED_PHONE` seulement) ; `img/` jamais commité.
- **Médias :** GLB compressé en **meshopt** (pas Draco : drei charge Draco depuis un CDN, meshopt est embarqué) ; budgets : poster ≤ 150 Ko, vidéo desktop ≤ 4 Mo, mobile ≤ 2 Mo, GLB ≤ 3 Mo ; pas de fetch réseau tiers au runtime (pas de preset `Environment` drei distant).
- **Accès Payload :** l'API locale **ignore** l'access control par défaut → toute lecture côté site passe `overrideAccess: false` **et** `draft: false`.
- **Architecture & clean code :** la section « Architecture » ci-dessous est **contraignante** (couches, règle de dépendance, nommage du domaine, règles de clean code) et **prime sur tout chemin ou nom contraire**. Une violation de la règle de dépendance ou un dépassement des seuils ESLint est un défaut **Important** en revue.
- **Qualité :** TDD pour toute logique pure ; `pnpm typecheck && pnpm lint && pnpm test` verts avant de rendre la main (`pnpm lint` applique les règles de couches et de clean code, `tests/unit/architecture.test.ts` applique la règle de dépendance) ; a11y/contrastes/breakpoints selon la checklist de `MASTER.md`.

## Architecture — Clean Architecture adaptée (CONTRAIGNANTE)

Denis exige une **Clean Architecture adaptée** et du **clean code**. Adaptation retenue : ports & adaptateurs (hexagonale) sur 5 couches, **sans sur-ingénierie** — les entités sont des types immuables + fonctions pures ; les cas d'usage sont de petites classes qui reçoivent leurs ports par constructeur ; Payload, Next.js, Resend, simple-icons, GSAP, three sont des **détails** d'infrastructure ou de présentation.

```
src/
├─ domain/          # règles métier PURES. Aucun import (ni framework, ni npm, ni node:)
│  ├─ index.ts      # barrel du vocabulaire métier
│  ├─ locale.ts  media.ts  shared/{result,slug}.ts
│  ├─ stack/  project/  service/  experience/  career/  site/  contact/
├─ application/     # cas d'usage + ports. Dépend du domaine seulement
│  ├─ ports/        # interfaces : PortfolioRepository, ContactMessageRepository, ContactNotifier, IpHasher, Clock
│  ├─ portfolio/    # GetSiteProfile, GetHomePage, GetProjectPage, ListProjectRefs (+ DTO HomePage, ProjectPage)
│  ├─ contact/      # SubmitContactMessage
│  └─ revalidation/ # pathsToRevalidate (pur)
├─ infrastructure/  # adaptateurs qui IMPLÉMENTENT les ports ; frameworks autorisés ici
│  ├─ cms/payload/  # payload.config.ts, access.ts, collections/, globals/, hooks/, mappers/, migrations/, payload-types.ts,
│  │                # payload-portfolio-repository.ts, payload-contact-message-repository.ts
│  ├─ contact/  icons/  system/  seed/
├─ composition/     # RACINE DE COMPOSITION : seul endroit qui relie ports ↔ adaptateurs (server-only)
├─ presentation/    # UI : components/{glass,ui,sections,cinematic,project,seo}, design/, cinematic/, lib/, i18n/(+messages), styles/
└─ app/             # livraison Next.js : routes MINCES + actions serveur + admin/API Payload ; src/proxy.ts
```

**Règle de dépendance** (les flèches ne pointent que vers l'intérieur) :

| Couche | Peut importer | Interdit |
|---|---|---|
| `domain` | `domain` uniquement (aucun paquet npm, aucun `node:`) | tout le reste |
| `application` | `domain`, `application` (aucun paquet npm) | `infrastructure`, `composition`, `presentation`, `app`, frameworks |
| `infrastructure` | `domain`, `application`, `infrastructure`, paquets npm | `presentation`, `app`, `composition` |
| `composition` | `domain`, `application`, `infrastructure`, `composition` | `presentation`, `app` |
| `presentation` | `domain`, `application` (types/DTO), `presentation`, paquets npm UI | `infrastructure`, `composition`, `app` |
| `app` | `domain`, `application`, `presentation`, `composition`, `app` | `infrastructure` — **sauf** `src/app/(payload)/**` (admin/API Payload, importe `@payload-config`) |

Conséquences pratiques : une page ou une action serveur (`app`) appelle **un cas d'usage** via `@/composition` puis passe des données (types du domaine/DTO) aux composants ; un composant ne connaît ni Payload ni la base ; une action serveur est **injectée en prop** dans les composants clients (`submitAction`) ; les collections/hooks Payload ne contiennent **aucune logique métier** (ils appellent des fonctions pures du domaine/de l'application) ; les mappers Payload → domaine vivent dans `infrastructure/cms/payload/mappers/` (types Payload importés avec le suffixe `Doc` : `Project as ProjectDoc`).

**Nommage du domaine (contrat)** : `MediaAsset`, `Stack`, `StackCategory`, `StackIcon`, `Project`, `ProjectSummary`, `ProjectRef`, `Service`, `ServiceIconName`, `Experience`, `SiteProfile`, `LabeledValue`, `CinematicMedia`, `VideoPair`, `CareerStats`, `Locale`, `Result`. DTO d'application : `HomePage`, `ProjectPage`. Ports : `PortfolioRepository`, `ContactMessageRepository`, `ContactNotifier`, `IpHasher`, `Clock`. Cas d'usage : `GetSiteProfile`, `GetHomePage`, `GetProjectPage`, `ListProjectRefs`, `SubmitContactMessage` (méthode unique `execute`).

### Clean code (règles contraignantes — vérifiées en revue ET par ESLint)

1. **Noms** qui disent l'intention (fonctions = verbes, types = noms, booléens `is/has/can`) ; pas d'abréviations opaques ; un fichier = un concept ; composants React PascalCase (un par fichier), le reste en kebab-case.
2. **Petites fonctions** à un seul niveau d'abstraction : ≤ ~25 lignes (ESLint : 50 ; composants `.tsx` : 90), ≤ 4 paramètres (au-delà : un objet nommé), complexité ≤ 10, profondeur ≤ 3, retours anticipés, pas de `else` après `return`, pas de ternaires imbriqués. Fichiers ≤ 250 lignes.
3. **Aucun nombre ni chaîne magique** : constantes nommées (`MIN_FILL_MS`, `RATE_MAX`), vocabulaires en `as const`.
4. **Immutabilité** : types `readonly`, pas de mutation d'arguments, `const` par défaut ; fonctions **pures** dans `domain` et `application`.
5. **Erreurs attendues = valeurs** (`Result<T, E>` du domaine, statuts discriminés) ; exceptions réservées à l'inattendu ; **aucun `catch` vide** sans commentaire expliquant *pourquoi* l'erreur est ignorée.
6. **Commentaires = pourquoi**, jamais quoi ; pas de code commenté ; pas de `TODO`.
7. **Types stricts** : pas de `any`, pas de `!` (non-null) hors tests, types de retour explicites sur les fonctions exportées de `domain`/`application`/`infrastructure`.
8. **SOLID / DIP** : les cas d'usage reçoivent leurs dépendances (ports) par **constructeur** ; aucun singleton global hors `composition/` ; les adaptateurs dépendent des ports, jamais l'inverse.
9. **Tests propres** : Arrange-Act-Assert, un comportement par test, nom = comportement, **fakes en mémoire** pour les ports (`tests/support/`) plutôt que des mocks partout, aucune logique conditionnelle dans un test. Miroir des couches : `tests/unit/{domain,application,infrastructure,presentation,app}/…`.

**Garde-fous automatiques (créés en T1, exécutés par `pnpm lint` et `pnpm test`) :** (a) ESLint — `no-restricted-imports` par couche + `complexity`, `max-depth`, `max-params`, `max-lines`, `max-lines-per-function`, `no-else-return`, `no-nested-ternary`, `@typescript-eslint/no-non-null-assertion` ; (b) `tests/unit/architecture.test.ts` — analyse tous les imports de `src/**` et applique la table ci-dessus en **liste blanche** (échoue avec `fichier:ligne — importe X, interdit pour la couche Y`).

## Contrats partagés (noms exacts — ne pas dévier)

**Routes & ancres :** `/[locale]` (home), `/[locale]/projects/[slug]`. Sections : `#hero` `#about` `#services` `#stack` `#projects` `#journey` `#process` `#contact`. Nav desktop : about, services, stack, projects, journey, contact. Dock mobile (5) : hero, about, services, projects, contact.
**i18n UI :** `next-intl`, un fichier par namespace : `src/presentation/i18n/messages/{fr,en}/<namespace>.json` ; namespaces : `common` `nav` `hero` `about` `services` `stack` `projects` `journey` `process` `contact` `footer` `errors`. Chaque tâche crée **ses** namespaces (fr + en) — jamais ceux des autres.
**Scripts `package.json` (fixés en T1) :** `dev` `build` `build:prod` `start` `typecheck` `lint` `format` `test` `test:watch` `test:int` `e2e` `e2e:install` `db:up` `db:down` `payload` `generate:types` `generate:importmap` `migrate` `migrate:create` `seed` `media:optimize:glb` `media:optimize:video` `media:fixture`.
**Alias TS :** `@/*` → `src/*` ; `@payload-config` → `src/infrastructure/cms/payload/payload.config.ts`.
**Data-testid :** `nav`, `dock`, `lang-switch`, `hero-frame`, `hero-chip`, `stat-card`, `service-card`, `stack-tile`, `project-card`, `project-filter`, `timeline-item`, `process-step`, `contact-form`, `contact-status`. **Attributs de test du hero :** `data-hero-mode` (`avatar3d|video|poster|orb`) et `data-hero-ready` (`true|false`) sur `[data-testid="hero-frame"]`.

## Vagues d'exécution

| Vague | Tâches (parallèles entre elles) | Porte de sortie |
|---|---|---|
| 0 | **T1** scaffold + garde-fous d'architecture (ESLint + test d'architecture) | `pnpm install && pnpm typecheck && pnpm test` |
| 1 | **T2** fondations design ∥ **T3** collections A, **puis T4** collections B + hooks (T4 importe l'access, `slugify`, `service-icon` et le barrel `@/domain` de T3) | typecheck + test |
| 2 | **T5** globals + config + migration · **T6** i18n + layout | typecheck + test + `pnpm build` |
| 3 | **T7** domaine + cas d'usage + adaptateur Payload + racine de composition · **T8** seed | typecheck + test + `pnpm seed` |
| 4a | **T9** primitives UI + nav + page shell | build + capture 4 viewports |
| 4b | **T10** moteur cinématique → **T11** section Hero · **T12** About+Services · **T13** Stack+Projets · **T14** Parcours+Méthode · **T15** scripts média + pack Higgsfield (utilise la fixture de T10) · **T16** Contact | typecheck + test + e2e de section |
| 5 | **T17** e2e/a11y/responsive · **T18** Docker/CI/docs | tout vert |
| 6 | **T19** revue adversariale + correctifs · **T20** vérification finale + push | preuves collées |

---

## Task 1 : Scaffold, outillage, base Postgres

**Files :**
- Create : `package.json`, `pnpm-workspace.yaml` (uniquement si nécessaire), `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tests/stubs/server-only.ts`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.gitattributes`, `.nvmrc`, `.env.example`, `docker-compose.yml`, `vitest.config.ts`, `vitest.int.config.ts`, `playwright.config.ts`, `tests/setup.ts`, `tests/unit/presentation/cn.test.ts`, `src/presentation/lib/cn.ts`, `src/domain/index.ts`, `src/domain/locale.ts`, `src/domain/shared/result.ts`, `tests/support/architecture.ts`, `tests/unit/architecture.test.ts`, `tests/unit/domain/locale.test.ts`, `tests/unit/domain/result.test.ts`, `src/app/(payload)/**` (copié du gabarit officiel), `src/infrastructure/cms/payload/payload.config.ts` (minimal, remplacé en T5), `.github/workflows/ci.yml`
- Test : `tests/unit/presentation/cn.test.ts`, `tests/unit/architecture.test.ts`, `tests/unit/domain/{locale,result}.test.ts`

**Interfaces :**
- Produces : `LOCALES`, `type Locale`, `DEFAULT_LOCALE`, `isLocale(value: unknown): value is Locale`, `type Result<T, E>`, `ok(value)`, `err(error)` dans `@/domain` ; `tests/support/architecture.ts` (`findViolations`, `violationsInSource`, `importsOf`, `SRC`) ; règles ESLint de couches et de clean code ; alias `@/*`, `@payload-config` ; scripts listés ci-dessus ; `cn(...inputs: ClassValue[]): string` dans `src/presentation/lib/cn.ts` ; groupes de routes `(payload)` (Payload) et `(site)` (créé en T6).

- [ ] **Step 1 : Générer un gabarit de référence Payload dans le scratchpad**

Ne pas deviner les fichiers de la route `(payload)` : les copier d'un gabarit officiel de **la même version**.

```bash
cd "$SCRATCH" && pnpm dlx create-payload-app@3.90.2 payload-ref --help
# puis, avec les flags proposés par --help : template "blank", base "postgres", sans git, sans installer
```
Relever dans `payload-ref/src/app/(payload)/` : `layout.tsx`, `custom.scss`, `admin/[[...segments]]/{page,not-found}.tsx`, `admin/importMap.js`, `api/[...slug]/route.ts`, `api/graphql/route.ts`, `api/graphql-playground/route.ts`. Copier ce dossier **tel quel** dans `src/app/(payload)/`.

- [ ] **Step 2 : `package.json`**

```json
{
  "name": "portfolio-denis-bucspun",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.13.1",
  "engines": { "node": ">=20.9.0" },
  "scripts": {
    "dev": "cross-env NODE_OPTIONS=--no-deprecation next dev",
    "build": "cross-env NODE_OPTIONS=--no-deprecation next build",
    "build:prod": "cross-env NODE_OPTIONS=--no-deprecation payload migrate && next build",
    "start": "cross-env NODE_OPTIONS=--no-deprecation next start",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:int": "vitest run --config vitest.int.config.ts",
    "e2e": "playwright test",
    "e2e:install": "playwright install --with-deps chromium",
    "db:up": "docker compose up -d --wait postgres",
    "db:down": "docker compose down",
    "payload": "cross-env NODE_OPTIONS=--no-deprecation payload",
    "generate:types": "cross-env NODE_OPTIONS=--no-deprecation payload generate:types",
    "generate:importmap": "cross-env NODE_OPTIONS=--no-deprecation payload generate:importmap",
    "migrate": "cross-env NODE_OPTIONS=--no-deprecation payload migrate",
    "migrate:create": "cross-env NODE_OPTIONS=--no-deprecation payload migrate:create",
    "seed": "cross-env NODE_OPTIONS=--no-deprecation payload run src/infrastructure/seed/run.ts",
    "media:optimize:glb": "node scripts/media/optimize-glb.mjs",
    "media:optimize:video": "node scripts/media/optimize-video.mjs",
    "media:fixture": "node scripts/media/make-fixture-glb.mjs"
  },
  "pnpm": { "onlyBuiltDependencies": ["sharp", "esbuild", "@swc/core", "ffmpeg-static", "unrs-resolver"] }
}
```

Puis installer (versions à consigner dans le lockfile ; si une plage échoue au résolveur/peer, prendre la plus proche compatible et le noter dans le message de commit) :

```bash
pnpm add next@16.3.7 react@^19.3.0 react-dom@^19.3.0 graphql@^16.8.1 sharp \
  payload@3.90.2 @payloadcms/next@3.90.2 @payloadcms/db-postgres@3.90.2 @payloadcms/richtext-lexical@3.90.2 \
  @payloadcms/storage-vercel-blob@3.90.2 @payloadcms/translations@3.90.2 @payloadcms/ui@3.90.2 \
  next-intl gsap @gsap/react lenis three @react-three/fiber @react-three/drei \
  lucide-react simple-icons resend clsx server-only
pnpm add -D typescript@^5.9.3 @types/node @types/react @types/react-dom @types/three \
  tailwindcss @tailwindcss/postcss postcss eslint@^9 eslint-config-next@16.3.7 prettier prettier-plugin-tailwindcss \
  vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom \
  @playwright/test @axe-core/playwright tsx cross-env \
  @gltf-transform/cli @gltf-transform/core @gltf-transform/functions meshoptimizer ffmpeg-static
```

- [ ] **Step 3 : Fichiers de configuration**

`tsconfig.json` :
```json
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["dom", "dom.iterable", "esnext"], "allowJs": true, "skipLibCheck": true,
    "strict": true, "noEmit": true, "esModuleInterop": true, "module": "esnext", "moduleResolution": "bundler",
    "resolveJsonModule": true, "isolatedModules": true, "jsx": "react-jsx", "incremental": true,
    "noUncheckedIndexedAccess": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"], "@payload-config": ["./src/infrastructure/cms/payload/payload.config.ts"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "tests/e2e/**/*.d.ts"]
}
```

`next.config.ts` :
```ts
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/presentation/i18n/request.ts')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
```
> `src/presentation/i18n/request.ts` est créé en T6 ; d'ici là `next build` n'est pas requis. Si `withNextIntl` casse T1, le retirer temporairement et le remettre en T6 (le noter).

`eslint.config.mjs` (flat, sans `next lint` qui n'existe plus en Next 16) — **règles de couches + clean code** :
```js
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
```
> Vérifier les noms d'export réels d'`eslint-config-next@16.3.7` (`node -e "console.log(Object.keys(require('eslint-config-next/package.json').exports))"`) et adapter les imports ; ne garder **aucun** import inutilisé. Les seuils ci-dessus sont **contraignants** : on ne les relève pas pour faire passer du code, on découpe le code.

`postcss.config.mjs` (Tailwind v4 sous Next — sans lui, aucune classe n'est générée) :
```js
export default { plugins: { '@tailwindcss/postcss': {} } }
```
`tests/stubs/server-only.ts` : `export {}` (le vrai paquet `server-only` lève une erreur hors bundle serveur Next ; les tests unitaires/d'intégration importent des modules qui le déclarent).

`.prettierrc.json` : `{ "semi": false, "singleQuote": true, "trailingComma": "all", "printWidth": 100, "plugins": ["prettier-plugin-tailwindcss"] }` · `.prettierignore` : `.next`, `node_modules`, `pnpm-lock.yaml`, `src/infrastructure/cms/payload/payload-types.ts`, `src/infrastructure/cms/payload/migrations`, `design-system`, `docs`.
`.gitattributes` : `* text=auto eol=lf` + `*.glb binary` `*.mp4 binary` `*.webm binary` `*.webp binary` `*.png binary` `*.jpg binary` `*.pdf binary`.
`.nvmrc` : `22`.

`.env.example` :
```
DATABASE_URI=postgres://portfolio:portfolio@localhost:5432/portfolio
PAYLOAD_SECRET=replace-with-32+-random-characters
PAYLOAD_DB_PUSH=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
IP_HASH_SALT=replace-with-random-salt
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
CONTACT_FROM=Portfolio <onboarding@resend.dev>
CONTACT_TO=you@example.com
SEED_PHONE=
# Build de test uniquement : active `?__fixture=avatar` (avatar 3D de fixture) pour les E2E. Jamais en production.
NEXT_PUBLIC_E2E=
```

`docker-compose.yml` :
```yaml
services:
  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: portfolio
      POSTGRES_DB: portfolio
    ports: ['5432:5432']
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U portfolio -d portfolio']
      interval: 5s
      timeout: 5s
      retries: 10
volumes:
  pgdata:
```

`vitest.config.ts` :
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: { alias: { 'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)) } },
  test: { include: ['tests/unit/**/*.test.{ts,tsx}'], environment: 'node', setupFiles: ['tests/setup.ts'], css: false },
})
```
`vitest.int.config.ts` : idem (**même alias `server-only`**) avec `include: ['tests/integration/**/*.int.test.ts']`, `pool: 'forks'`, `testTimeout: 60_000`, `hookTimeout: 60_000`, `fileParallelism: false`, `environment: 'node'`, sans `setupFiles`.
`tests/setup.ts` : `import '@testing-library/jest-dom/vitest'`
`playwright.config.ts` :
```ts
import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}/fr`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'laptop', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } } },
  ],
})
```
`src/presentation/lib/cn.ts` :
```ts
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
```
`src/infrastructure/cms/payload/payload.config.ts` (minimal, remplacé en T5) : `buildConfig` avec `collections: []`, `secret`, `db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } })`, `sharp`, `editor: lexicalEditor()`.
`.github/workflows/ci.yml` : voir T18 (créé là ; en T1 seulement un fichier minimal `on: push` qui échoue proprement n'est **pas** requis — ne pas le créer en T1).

- [ ] **Step 4 : Test de fumée qui échoue puis passe**

`tests/unit/presentation/cn.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { cn } from '@/presentation/lib/cn'

describe('cn', () => {
  it('joint les classes et ignore les valeurs falsy', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })
})
```
Run : `pnpm test` → d'abord **FAIL** (alias/`cn` absent si Step 3 pas fait), puis **PASS** une fois `src/presentation/lib/cn.ts` et `vitest.config.ts` en place.

- [ ] **Step 5 : Squelette du domaine et garde-fous d'architecture (TDD)**

Le domaine démarre avec deux briques **sans aucun import** ; le test d'architecture verrouille la règle de dépendance dès maintenant, avant que du code métier existe.

`tests/unit/domain/locale.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, isLocale, LOCALES } from '@/domain'

describe('locale', () => {
  it('le français est la locale par défaut et fait partie des locales supportées', () => {
    expect(DEFAULT_LOCALE).toBe('fr')
    expect(LOCALES).toContain(DEFAULT_LOCALE)
  })

  it('isLocale accepte fr et en, rejette le reste', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('de')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })
})
```
`tests/unit/domain/result.test.ts` : `ok(1)` = `{ ok: true, value: 1 }` ; `err('x')` = `{ ok: false, error: 'x' }` ; un `Result` se discrimine sur `ok` (le test lit `.value` seulement après `if (result.ok)`).
Run → **FAIL**. Implémenter :
`src/domain/locale.ts` :
```ts
export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}
```
`src/domain/shared/result.ts` :
```ts
export type Result<T, E> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })
```
`src/domain/index.ts` (barrel du vocabulaire métier ; les tâches suivantes y ajoutent leurs exports) : `export * from './locale'` et `export * from './shared/result'`.

`tests/support/architecture.ts` — **l'analyseur d'imports et la règle de dépendance** :
```ts
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

export type Layer = 'domain' | 'application' | 'infrastructure' | 'composition' | 'presentation' | 'app'

export const SRC = resolve('src')
const LAYERS: readonly Layer[] = ['domain', 'application', 'infrastructure', 'composition', 'presentation', 'app']

/** Règle de dépendance : pour chaque couche, les couches qu'elle a le droit d'importer. */
export const ALLOWED_LAYERS: Readonly<Record<Layer, readonly Layer[]>> = {
  domain: ['domain'],
  application: ['domain', 'application'],
  infrastructure: ['domain', 'application', 'infrastructure'],
  composition: ['domain', 'application', 'infrastructure', 'composition'],
  presentation: ['domain', 'application', 'presentation'],
  app: ['domain', 'application', 'presentation', 'composition', 'app'],
}

/** Couches qui n'importent AUCUN paquet npm ni module `node:`. */
const PURE_LAYERS: readonly Layer[] = ['domain', 'application']

/** Admin et API Payload : code de livraison copié du gabarit officiel, hors règle. */
const IGNORED_DIRECTORY = '(payload)'

const IMPORT_PATTERN =
  /(?:^|\n)[ \t]*(?:import|export)\s+(?:type\s+)?(?:[\w*${}\s,]+?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

export type SourceImport = { readonly specifier: string; readonly line: number }

export function importsOf(source: string): SourceImport[] {
  return [...source.matchAll(IMPORT_PATTERN)].flatMap((match) => {
    const specifier = match[1] ?? match[2]
    if (!specifier) return []
    const offset = (match.index ?? 0) + match[0].lastIndexOf(specifier)
    return [{ specifier, line: source.slice(0, offset).split('\n').length }]
  })
}

export function layerOf(absolutePath: string): Layer | null {
  const [top] = relative(SRC, absolutePath).split(sep)
  if (top === 'proxy.ts') return 'app'
  return LAYERS.find((layer) => layer === top) ?? null
}

type Target = { readonly kind: 'layer'; readonly layer: Layer | null } | { readonly kind: 'external'; readonly name: string }

function packageName(specifier: string): string {
  if (specifier.startsWith('node:')) return specifier
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? specifier)
}

export function resolveSpecifier(fromFile: string, specifier: string): Target {
  if (specifier.startsWith('@payload-config')) return { kind: 'layer', layer: 'infrastructure' }
  if (specifier.startsWith('@/')) return { kind: 'layer', layer: layerOf(join(SRC, specifier.slice(2))) }
  if (specifier.startsWith('.')) return { kind: 'layer', layer: layerOf(resolve(dirname(fromFile), specifier)) }
  return { kind: 'external', name: packageName(specifier) }
}

function forbiddenReason(from: Layer, target: Target, specifier: string): string | null {
  if (target.kind === 'external') {
    return PURE_LAYERS.includes(from) ? `la couche « ${from} » ne doit importer aucun paquet (importe « ${specifier} »)` : null
  }
  if (target.layer === null || ALLOWED_LAYERS[from].includes(target.layer)) return null
  return `la couche « ${from} » ne doit pas dépendre de « ${target.layer} » (importe « ${specifier} »)`
}

export function violationsInSource(file: string, source: string): string[] {
  const from = layerOf(file)
  const where = relative(process.cwd(), file).split(sep).join('/')
  if (from === null) return [`${where}: dossier hors des couches connues (${LAYERS.join(', ')})`]
  return importsOf(source).flatMap(({ specifier, line }) => {
    const reason = forbiddenReason(from, resolveSpecifier(file, specifier), specifier)
    return reason ? [`${where}:${line} — ${reason}`] : []
  })
}

export function sourceFiles(directory: string = SRC): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    if (statSync(path).isDirectory()) return name === IGNORED_DIRECTORY ? [] : sourceFiles(path)
    return /\.tsx?$/.test(name) && !name.endsWith('.d.ts') ? [path] : []
  })
}

export function findViolations(files: readonly string[] = sourceFiles()): string[] {
  return files.flatMap((file) => violationsInSource(file, readFileSync(file, 'utf8')))
}
```
`tests/unit/architecture.test.ts` :
```ts
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findViolations, importsOf, SRC, violationsInSource } from '../support/architecture'

const inLayer = (layer: string, source: string): string[] => violationsInSource(join(SRC, layer, 'file.ts'), source)

describe('règle de dépendance (Clean Architecture)', () => {
  it('aucune couche de src/ n’importe ce qui lui est interdit', () => {
    expect(findViolations()).toEqual([])
  })
})

describe('analyse des imports', () => {
  it('lit import, import type, export … from, import dynamique et import à effet de bord', () => {
    const source = [
      "import { a } from '@/domain'",
      "import type { B } from './b'",
      "export * from '../c'",
      "export { d } from 'pkg'",
      "const e = await import('lazy')",
      "import 'side-effect'",
    ].join('\n')
    expect(importsOf(source).map((i) => i.specifier)).toEqual(['@/domain', './b', '../c', 'pkg', 'lazy', 'side-effect'])
  })

  it('lit un import multi-lignes et donne le bon numéro de ligne', () => {
    const source = "const x = 1\nimport {\n  a,\n  b,\n} from '@/domain'\n"
    expect(importsOf(source)).toEqual([{ specifier: '@/domain', line: 5 }])
  })

  it('ignore ce qui ressemble à un import sans en être un', () => {
    expect(importsOf("export const name = 'from'\nconst message = \"import x from 'y'\"")).toEqual([])
  })
})

describe('détection des violations', () => {
  it('interdit au domaine d’importer l’application (alias comme chemin relatif)', () => {
    expect(inLayer('domain', "import { x } from '@/application/y'")).toHaveLength(1)
    expect(inLayer('domain', "import { x } from '../application/y'")).toHaveLength(1)
  })

  it('interdit au domaine et à l’application d’importer un paquet npm ou node:', () => {
    expect(inLayer('domain', "import { z } from 'zod'")).toHaveLength(1)
    expect(inLayer('application', "import { createHash } from 'node:crypto'")).toHaveLength(1)
  })

  it('interdit à la présentation d’importer l’infrastructure', () => {
    expect(inLayer('presentation', "import { repo } from '@/infrastructure/cms/payload/repo'")).toHaveLength(1)
  })

  it('autorise l’infrastructure à importer l’application, le domaine et des paquets', () => {
    const source = "import type { Port } from '@/application/ports/port'\nimport { Locale } from '@/domain'\nimport { getPayload } from 'payload'"
    expect(inLayer('infrastructure', source)).toEqual([])
  })

  it('autorise la composition à importer l’infrastructure mais pas la présentation', () => {
    expect(inLayer('composition', "import { a } from '@/infrastructure/a'")).toEqual([])
    expect(inLayer('composition', "import { b } from '@/presentation/b'")).toHaveLength(1)
  })

  it('traite @payload-config comme de l’infrastructure', () => {
    expect(inLayer('presentation', "import config from '@payload-config'")).toHaveLength(1)
    expect(inLayer('composition', "import config from '@payload-config'")).toEqual([])
  })

  it('signale un dossier hors des couches connues', () => {
    expect(violationsInSource(join(SRC, 'misc', 'file.ts'), '')).toHaveLength(1)
  })
})
```
Run : `pnpm test tests/unit/architecture.test.ts tests/unit/domain` → **PASS**.
**Vérification par mutation (obligatoire)** : créer temporairement `src/domain/__violation.ts` contenant `import { x } from '@/infrastructure/y'`, puis constater que **`pnpm lint` échoue** (règle `no-restricted-imports`) **et** que `pnpm test tests/unit/architecture.test.ts` échoue avec `fichier:ligne — la couche « domain » ne doit pas dépendre de « infrastructure »` ; supprimer ensuite le fichier et confirmer que tout repasse au vert.

- [ ] **Step 6 : Vérifier l'outillage**

Run : `pnpm typecheck && pnpm lint && pnpm test` → tout vert.
Run : `pnpm db:up` → Postgres `healthy` ; `docker compose ps` le montre.
Run : `cp .env.example .env` (ignoré par git) puis `node -e "require('fs').existsSync('.env')"`.
Expected : aucune erreur. Si `pnpm typecheck` échoue sur `next-env.d.ts` manquant : `pnpm exec next typegen` ou lancer `pnpm dev` une fois.

- [ ] **Step 7 : Commit** (par l'orchestrateur)

```bash
git add -A . ':!img' ':!.env'
git commit -m "chore: scaffold Next 16 + Payload 3 with tooling, Postgres compose and test harness"
```

---

## Task 2 : Fondations design — tokens, contraste, `<Glass>`

**Files :**
- Create : `src/presentation/styles/tokens.css`, `src/presentation/styles/glass.css`, `src/presentation/styles/globals.css`, `src/presentation/design/contrast.ts`, `src/presentation/design/tokens.ts`, `src/presentation/components/glass/Glass.tsx`, `src/presentation/components/glass/GlassFilters.tsx`, `src/presentation/components/glass/RefractionFlag.tsx`
- Test : `tests/unit/presentation/design/contrast.test.ts`, `tests/unit/presentation/design/tokens.contrast.test.ts`, `tests/unit/presentation/components/glass.test.tsx`

**Interfaces :**
- Produces :
  - `hexToRgb(hex: string): [number, number, number]`, `relativeLuminance(hex: string): number`, `contrastRatio(a: string, b: string): number`, `composite(fg: string, alpha: number, bg: string): string` (`#RRGGBB` majuscules) dans `src/presentation/design/contrast.ts`
  - `parseTokens(css: string): Record<string, string>` (clé sans `--`, ex. `ink`) dans `src/presentation/design/tokens.ts`
  - `<Glass as? variant? interactive? refract? className? …rest />` avec `GlassVariant = 'surface' | 'card' | 'pill' | 'dock'` ; rend `data-glass`, `data-refract`, `data-interactive`
  - `<GlassFilters />` (défs SVG `#lg-refract`, `aria-hidden`), `<RefractionFlag />` (script inline qui pose `data-refract="on"` sur `<html>` sur Chromium)
  - Classes CSS : `.glass`, `.glass--surface|card|pill|dock`, `.glass-scrim`, `.reveal`, `.container-x`, `.section-y`

- [ ] **Step 1 : Écrire les tests de contraste qui échouent**

`tests/unit/presentation/design/contrast.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { composite, contrastRatio, hexToRgb, relativeLuminance } from '@/presentation/design/contrast'

describe('contrast', () => {
  it('parse le hex', () => {
    expect(hexToRgb('#0B0B14')).toEqual([11, 11, 20])
    expect(hexToRgb('fff')).toEqual([255, 255, 255])
  })
  it('luminance noir/blanc', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5)
  })
  it('ratio noir/blanc = 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  })
  it('ratio symétrique', () => {
    expect(contrastRatio('#6D3FE0', '#EEEDF7')).toBeCloseTo(contrastRatio('#EEEDF7', '#6D3FE0'), 5)
  })
  it('composite blanc 62 % sur #EEEDF7 = #F9F8FC', () => {
    expect(composite('#FFFFFF', 0.62, '#EEEDF7')).toBe('#F9F8FC')
  })
})
```
`tests/unit/presentation/design/tokens.contrast.test.ts` :
```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { composite, contrastRatio } from '@/presentation/design/contrast'
import { parseTokens } from '@/presentation/design/tokens'

const css = readFileSync('src/presentation/styles/tokens.css', 'utf8')
const t = parseTokens(css)
const glass = composite('#FFFFFF', 0.62, t.bg!)
const glassSubtle = composite('#FFFFFF', 0.4, t.bg!)

const TEXT: Array<[string, string, string]> = [
  ['ink', 'bg', t.bg!], ['ink', 'glass', glass],
  ['ink-2', 'bg', t.bg!], ['ink-2', 'glass', glass],
  ['ink-muted', 'bg', t.bg!], ['ink-muted', 'glass', glass], ['ink-muted', 'glass-subtle', glassSubtle],
  ['accent-text', 'bg', t.bg!], ['accent-text', 'glass', glass], ['accent-text', 'glass-subtle', glassSubtle],
  ['danger', 'glass', glass], ['success', 'glass', glass],
]

describe('tokens.css — contrastes texte ≥ 4.5', () => {
  it.each(TEXT)('%s sur %s', (name, _on, bg) => {
    expect(contrastRatio(t[name]!, bg)).toBeGreaterThanOrEqual(4.5)
  })
  it('blanc sur bouton ink ≥ 7', () => {
    expect(contrastRatio('#FFFFFF', t.ink!)).toBeGreaterThanOrEqual(7)
  })
  it('blanc sur accent-strong ≥ 4.5', () => {
    expect(contrastRatio('#FFFFFF', t['accent-strong']!)).toBeGreaterThanOrEqual(4.5)
  })
  it('--accent (décoratif) ≥ 3 sur bg mais documenté < 4.5', () => {
    const r = contrastRatio(t.accent!, t.bg!)
    expect(r).toBeGreaterThanOrEqual(3)
    expect(r).toBeLessThan(4.5)
  })
})
```
Run : `pnpm test tests/unit/presentation/design/contrast.test.ts tests/unit/presentation/design/tokens.contrast.test.ts` → **FAIL** (modules/fichier absents).

- [ ] **Step 2 : Implémenter `contrast.ts` et `tokens.ts`**

`src/presentation/design/contrast.ts` :
```ts
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = Number.parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const lin = (c: number) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

export function composite(fg: string, alpha: number, bg: string): string {
  const f = hexToRgb(fg)
  const b = hexToRgb(bg)
  const out = f.map((c, i) => Math.round(c * alpha + b[i]! * (1 - alpha)))
  return `#${out.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`
}
```
`src/presentation/design/tokens.ts` :
```ts
/** Extrait les custom properties `--nom: #hex;` d'un fichier CSS (clé sans `--`). */
export function parseTokens(css: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    out[m[1]!] = m[2]!.toUpperCase()
  }
  return out
}
```

- [ ] **Step 3 : `src/presentation/styles/tokens.css`** (source de vérité — valeurs de `MASTER.md`)

```css
:root {
  --bg: #EEEDF7;
  --ink: #0B0B14;
  --ink-2: #2E2E42;
  --ink-muted: #55556B;
  --accent: #8B5CF6;
  --accent-text: #6D3FE0;
  --accent-strong: #5B34D6;
  --accent-soft: #C9B8FB;
  --tint-amber: #F5C76B;
  --tint-violet: #B9A2F8;
  --tint-blue: #7B9BF5;
  --tint-teal: #6FD3CF;
  --danger: #C0263A;
  --success: #0F7B5F;
  --opaque-glass: #F9F8FC;

  --glass-fill: rgb(255 255 255 / 0.62);
  --glass-fill-strong: rgb(255 255 255 / 0.78);
  --glass-fill-subtle: rgb(255 255 255 / 0.4);
  --glass-border: rgb(255 255 255 / 0.7);
  --glass-hairline: rgb(120 110 170 / 0.18);
  --shadow-glass: 0 8px 32px rgb(70 50 140 / 0.1), 0 1px 2px rgb(70 50 140 / 0.06);

  --space-xs: 0.25rem; --space-sm: 0.5rem; --space-base: 1rem; --space-md: 1.5rem;
  --space-lg: 2rem; --space-xl: 3rem; --space-2xl: 4rem; --space-3xl: 6rem;
  --radius-card: 1.75rem; --radius-chip: 1rem; --radius-frame: 3rem; --radius-pill: 999px;
  --ease-glass: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```
> `parseTokens` ne lit que les valeurs hex ; les `rgb(... / a)` ne sont pas testés par regex (le test recalcule via `composite`).

- [ ] **Step 4 : `src/presentation/styles/glass.css`** — trois niveaux + repli opaque

```css
.glass {
  position: relative; isolation: isolate;
  background: var(--glass-fill);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-glass), inset 0 1px 0 rgb(255 255 255 / 0.9), inset 0 -1px 0 rgb(255 255 255 / 0.35);
  border-radius: var(--radius-card);
  transition: transform 220ms var(--ease-glass), box-shadow 220ms var(--ease-glass), background-color 220ms var(--ease-glass);
}
.glass::before { /* reflet spéculaire */
  content: ''; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: linear-gradient(135deg, rgb(255 255 255 / 0.55) 0%, transparent 40%);
}
.glass::after { /* liseré extérieur */
  content: ''; position: absolute; inset: -1px; z-index: -1; border-radius: inherit; pointer-events: none;
  box-shadow: 0 0 0 1px var(--glass-hairline);
}
.glass--surface { border-radius: var(--radius-frame); }
.glass--card { border-radius: var(--radius-card); }
.glass--pill, .glass--dock { border-radius: var(--radius-pill); background: var(--glass-fill-strong); }
.glass[data-interactive] { cursor: pointer; }
.glass[data-interactive]:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgb(70 50 140 / 0.14), inset 0 1px 0 rgb(255 255 255 / 0.95); }
.glass[data-interactive]:active { transform: scale(0.985); }

@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass { -webkit-backdrop-filter: blur(24px) saturate(160%); backdrop-filter: blur(24px) saturate(160%); }
}
/* Réfraction SVG : Chromium uniquement, jamais requise (drapeau posé par <RefractionFlag/>) */
html[data-refract='on'] .glass[data-refract] {
  -webkit-backdrop-filter: url(#lg-refract) blur(18px) saturate(170%);
  backdrop-filter: url(#lg-refract) blur(18px) saturate(170%);
}
/* Repli opaque */
@media (prefers-reduced-transparency: reduce) {
  .glass, .glass--pill, .glass--dock { background: var(--opaque-glass); -webkit-backdrop-filter: none; backdrop-filter: none; }
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: var(--opaque-glass); }
}
/* Scrim pour tout texte posé sur média */
.glass-scrim { background: linear-gradient(to top, rgb(11 11 20 / 0.62), rgb(11 11 20 / 0)); }
```

- [ ] **Step 5 : `src/presentation/styles/globals.css`** — Tailwind v4 + thème + utilitaires

```css
@import 'tailwindcss';
@import './tokens.css';
@import './glass.css';

@theme inline {
  --color-bg: var(--bg); --color-ink: var(--ink); --color-ink-2: var(--ink-2); --color-ink-muted: var(--ink-muted);
  --color-accent: var(--accent); --color-accent-text: var(--accent-text); --color-accent-strong: var(--accent-strong);
  --color-accent-soft: var(--accent-soft); --color-danger: var(--danger); --color-success: var(--success);
  --font-display: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-work-sans), ui-sans-serif, system-ui, sans-serif;
  --breakpoint-xs: 375px;
}

html { scroll-behavior: auto; color-scheme: light; }
body {
  background: var(--bg); color: var(--ink-2); font-family: var(--font-sans); font-size: 1rem; line-height: 1.6;
  background-image:
    radial-gradient(60rem 40rem at 12% -10%, rgb(201 184 251 / 0.55), transparent 60%),
    radial-gradient(50rem 36rem at 95% 8%, rgb(123 155 245 / 0.28), transparent 60%),
    radial-gradient(48rem 40rem at 60% 100%, rgb(111 211 207 / 0.22), transparent 60%);
  background-attachment: fixed;
}
h1, h2, h3 { font-family: var(--font-display); color: var(--ink); letter-spacing: -0.03em; }
:focus-visible { outline: 2px solid var(--accent-strong); outline-offset: 3px; border-radius: 0.5rem; }
.container-x { width: 100%; max-width: 75rem; margin-inline: auto; padding-inline: 1rem; }
@media (min-width: 768px) { .container-x { padding-inline: 1.5rem; } }
@media (min-width: 1024px) { .container-x { padding-inline: 2rem; } }
.section-y { padding-block: var(--space-2xl); }
@media (min-width: 1024px) { .section-y { padding-block: var(--space-3xl); } }
.sr-only-focusable:not(:focus):not(:focus-within) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

/* Révélations : masquées UNIQUEMENT quand JS est actif (contenu visible sans JS) */
.js .reveal { opacity: 0; transform: translateY(16px); }
@media (prefers-reduced-motion: reduce) { .js .reveal { opacity: 1; transform: none; } }
```

- [ ] **Step 6 : Test du composant `<Glass>` (échoue puis passe)**

`tests/unit/presentation/components/glass.test.tsx` :
```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Glass } from '@/presentation/components/glass/Glass'

describe('<Glass>', () => {
  it('rend un div .glass avec la variante par défaut card', () => {
    render(<Glass data-testid="g">x</Glass>)
    const el = screen.getByTestId('g')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveClass('glass', 'glass--card')
    expect(el).toHaveAttribute('data-glass', 'card')
  })
  it('respecte as, variant, interactive et refract', () => {
    render(<Glass as="a" href="#x" variant="pill" interactive refract data-testid="g">go</Glass>)
    const el = screen.getByTestId('g')
    expect(el.tagName).toBe('A')
    expect(el).toHaveClass('glass--pill')
    expect(el).toHaveAttribute('data-interactive', 'true')
    expect(el).toHaveAttribute('data-refract', 'true')
    expect(el).toHaveAttribute('href', '#x')
  })
  it("n'ajoute pas data-refract/data-interactive par défaut", () => {
    render(<Glass data-testid="g" />)
    expect(screen.getByTestId('g')).not.toHaveAttribute('data-refract')
    expect(screen.getByTestId('g')).not.toHaveAttribute('data-interactive')
  })
})
```
Run → **FAIL**. Implémenter :

`src/presentation/components/glass/Glass.tsx` :
```tsx
import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from '@/presentation/lib/cn'

export type GlassVariant = 'surface' | 'card' | 'pill' | 'dock'

type GlassProps<T extends ElementType> = {
  as?: T
  variant?: GlassVariant
  interactive?: boolean
  refract?: boolean
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'variant'>

export function Glass<T extends ElementType = 'div'>({
  as, variant = 'card', interactive = false, refract = false, className, ...rest
}: GlassProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return (
    <Tag
      data-glass={variant}
      data-refract={refract || undefined}
      data-interactive={interactive || undefined}
      className={cn('glass', `glass--${variant}`, className)}
      {...rest}
    />
  )
}
```
`src/presentation/components/glass/GlassFilters.tsx` :
```tsx
export function GlassFilters() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="lg-refract" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="12" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
```
`src/presentation/components/glass/RefractionFlag.tsx` :
```tsx
const script = `(function(){try{var d=document.documentElement;d.classList.add('js');var ua=navigator.userAgent;if(/Chrome\\//.test(ua)&&!/CriOS|FxiOS/.test(ua)&&window.CSS&&CSS.supports('backdrop-filter','url(#lg-refract) blur(1px)')){d.setAttribute('data-refract','on')}}catch(e){}})()`

export function RefractionFlag() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
```
> Ce script pose aussi la classe `js` (état initial des `.reveal`). Il est inséré dans `<head>` par `[locale]/layout.tsx` (T6).

Run : `pnpm test` → **PASS** (contrast, tokens.contrast, glass).

- [ ] **Step 7 : Vérification visuelle rapide (navigateur intégré)** — page jetable non commitée : un `<div>` avec `Glass` variantes sur fond `body` → capture ; vérifier reflet, bordure, flou, et que `prefers-reduced-transparency` (émulation) donne un fond opaque. Supprimer la page jetable.

- [ ] **Step 8 : Commit**

```bash
git add src/presentation/styles src/presentation/design src/presentation/components/glass tests/unit/presentation/design/contrast.test.ts tests/unit/presentation/design/tokens.contrast.test.ts tests/unit/presentation/components/glass.test.tsx
git commit -m "feat(design): add liquid glass tokens, contrast guard tests and Glass component"
```

---

## Task 3 : Collections A — accès, icônes, Users, Media, Stacks

**Files :**
- Create : `src/infrastructure/cms/payload/access.ts`, `src/domain/shared/slug.ts`, `src/domain/stack/stack.ts`, `src/infrastructure/icons/simple-icons-resolver.ts`, `src/domain/service/service-icon.ts`, `src/infrastructure/cms/payload/collections/Users.ts`, `src/infrastructure/cms/payload/collections/Media.ts`, `src/infrastructure/cms/payload/collections/Stacks.ts`
- Modify : `src/domain/index.ts` (exporte `slug`, `service-icon`, `stack`)
- Test : `tests/unit/infrastructure/cms/access.test.ts`, `tests/unit/domain/slug.test.ts`, `tests/unit/infrastructure/icons.test.ts`, `tests/unit/infrastructure/cms/media-alt.test.ts`

**Interfaces :**
- Produces :
  - `anyone`, `isAdmin`, `publishedOrAdmin`: `Access` (Payload) dans `src/infrastructure/cms/payload/access.ts`
  - `slugify(input: string): string` dans `src/domain/shared/slug.ts`
  - `StackIcon`, `Stack`, `StackCategory`, `STACK_CATEGORIES` (types métier du **domaine**, `src/domain/stack/stack.ts`) ; `resolveStackIcon(input: { name: string; simpleIconSlug?: string | null; upload?: { url?: string | null; alt?: string | null } | null }): StackIcon` ; `hasSimpleIcon(slug: string): boolean` dans `src/infrastructure/icons/simple-icons-resolver.ts` (**serveur uniquement** : importe tout `simple-icons`)
  - `SERVICE_ICON_NAMES = ['layers','blocks','bot','cloud','shield-check','code','database','rocket','cpu','workflow','globe','smartphone'] as const` + `type ServiceIconName` dans `src/domain/service/service-icon.ts`
  - `validateAlt(value: unknown, mimeType: unknown): true | string` exporté de `src/infrastructure/cms/payload/collections/Media.ts`
  - Collections `Users`, `Media`, `Stacks` (`CollectionConfig`) — `Stacks.ts` n'ajoute que les **libellés FR** des catégories (`CATEGORY_LABELS`) : les valeurs viennent du domaine

- [ ] **Step 1 : Tests d'accès qui échouent**

`tests/unit/infrastructure/cms/access.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { anyone, isAdmin, publishedOrAdmin } from '@/infrastructure/cms/payload/access'

const asUser = { req: { user: { id: 1 } } } as never
const asGuest = { req: { user: null } } as never

describe('access', () => {
  it('anyone autorise tout le monde', () => {
    expect(anyone(asGuest)).toBe(true)
  })
  it('isAdmin exige un utilisateur connecté', () => {
    expect(isAdmin(asUser)).toBe(true)
    expect(isAdmin(asGuest)).toBe(false)
  })
  it('publishedOrAdmin : admin voit tout, visiteur uniquement les publiés', () => {
    expect(publishedOrAdmin(asUser)).toBe(true)
    expect(publishedOrAdmin(asGuest)).toEqual({ _status: { equals: 'published' } })
  })
})
```
Run → **FAIL**. Implémenter `src/infrastructure/cms/payload/access.ts` :
```ts
import type { Access } from 'payload'

export const anyone: Access = () => true
export const isAdmin: Access = ({ req }) => Boolean(req.user)
export const publishedOrAdmin: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
```
Run → **PASS**.

- [ ] **Step 2 : `slugify` (TDD)**

`tests/unit/domain/slug.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { slugify } from '@/domain'

describe('slugify', () => {
  it('retire accents et ponctuation', () => {
    expect(slugify("Dywiki's — Base de données de films")).toBe('dywikis-base-de-donnees-de-films')
  })
  it('compacte les séparateurs et trim', () => {
    expect(slugify('  Hello   --  World  ')).toBe('hello-world')
  })
  it('retourne une chaîne vide pour une entrée vide', () => {
    expect(slugify('')).toBe('')
  })
})
```
Implémentation `src/domain/shared/slug.ts` :
```ts
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 3 : Résolveur d'icônes (TDD)**

`tests/unit/infrastructure/icons.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { hasSimpleIcon, resolveStackIcon } from '@/infrastructure/icons/simple-icons-resolver'

describe('resolveStackIcon', () => {
  it('résout un slug Simple Icons valide', () => {
    const icon = resolveStackIcon({ name: 'Docker', simpleIconSlug: 'docker' })
    expect(icon.kind).toBe('simple')
    if (icon.kind === 'simple') {
      expect(icon.slug).toBe('docker')
      expect(icon.path.length).toBeGreaterThan(20)
      expect(icon.hex).toMatch(/^[0-9A-Fa-f]{6}$/)
    }
  })
  it('un upload prime sur le slug', () => {
    const icon = resolveStackIcon({ name: 'X', simpleIconSlug: 'docker', upload: { url: '/media/x.svg', alt: 'X' } })
    expect(icon).toEqual({ kind: 'upload', url: '/media/x.svg', alt: 'X' })
  })
  it('slug inconnu → monogramme', () => {
    expect(resolveStackIcon({ name: 'Clean Architecture', simpleIconSlug: 'does-not-exist-xyz' })).toEqual({ kind: 'monogram', letters: 'CA' })
  })
  it('sans slug → monogramme (1 mot = 2 premières lettres, 2+ mots = initiales)', () => {
    expect(resolveStackIcon({ name: 'xUnit' })).toEqual({ kind: 'monogram', letters: 'XU' })
    expect(resolveStackIcon({ name: 'Entity Framework Core' })).toEqual({ kind: 'monogram', letters: 'EF' })
  })
  it('hasSimpleIcon', () => {
    expect(hasSimpleIcon('react')).toBe(true)
    expect(hasSimpleIcon('nope-nope')).toBe(false)
  })
})
```
Implémentation `src/infrastructure/icons/simple-icons-resolver.ts` :
```ts
import * as simpleIcons from 'simple-icons'
import type { StackIcon } from '@/domain'

type SimpleIconData = { slug: string; title: string; hex: string; path: string }

const BY_SLUG: Map<string, SimpleIconData> = new Map(
  (Object.values(simpleIcons) as unknown[])
    .filter((v): v is SimpleIconData => typeof v === 'object' && v !== null && 'slug' in v && 'path' in v)
    .map((v) => [v.slug, v]),
)

export function hasSimpleIcon(slug: string): boolean {
  return BY_SLUG.has(slug)
}

function monogram(name: string): string {
  const words = name.trim().split(/[\s./-]+/).filter(Boolean)
  const letters = words.length >= 2 ? words.slice(0, 2).map((w) => w.charAt(0)).join('') : (words[0] ?? '?').slice(0, 2)
  return letters.toUpperCase()
}

export function resolveStackIcon(input: {
  name: string
  simpleIconSlug?: string | null
  upload?: { url?: string | null; alt?: string | null } | null
}): StackIcon {
  if (input.upload?.url) return { kind: 'upload', url: input.upload.url, alt: input.upload.alt ?? input.name }
  const found = input.simpleIconSlug ? BY_SLUG.get(input.simpleIconSlug) : undefined
  if (found) return { kind: 'simple', slug: found.slug, title: found.title, hex: found.hex, path: found.path }
  return { kind: 'monogram', letters: monogram(input.name) }
}
```
> Vérifier que `simple-icons@16` exporte bien des objets `{ slug, title, hex, path }` (`si*`). Sinon adapter `BY_SLUG` et garder l'interface publique **inchangée**.

`src/domain/service/service-icon.ts` :
```ts
export const SERVICE_ICON_NAMES = [
  'layers', 'blocks', 'bot', 'cloud', 'shield-check', 'code',
  'database', 'rocket', 'cpu', 'workflow', 'globe', 'smartphone',
] as const
export type ServiceIconName = (typeof SERVICE_ICON_NAMES)[number]
```

`src/domain/stack/stack.ts` (types métier — **aucun import**) :
```ts
export const STACK_CATEGORIES = ['language', 'frontend', 'backend', 'architecture', 'testing', 'devops', 'security', 'ai'] as const
export type StackCategory = (typeof STACK_CATEGORIES)[number]

export type StackIcon =
  | { readonly kind: 'simple'; readonly slug: string; readonly title: string; readonly hex: string; readonly path: string }
  | { readonly kind: 'upload'; readonly url: string; readonly alt: string }
  | { readonly kind: 'monogram'; readonly letters: string }

export type Stack = {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly category: StackCategory
  readonly featured: boolean
  readonly icon: StackIcon
}
```
`src/domain/index.ts` (barrel créé en T1) : ajouter `export * from './shared/slug'`, `export * from './service/service-icon'`, `export * from './stack/stack'`.

- [ ] **Step 4 : `validateAlt` (TDD) + collections**

`tests/unit/infrastructure/cms/media-alt.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { validateAlt } from '@/infrastructure/cms/payload/collections/Media'

describe('validateAlt', () => {
  it('exige un alt pour une image', () => {
    expect(validateAlt('', 'image/webp')).toBe('Texte alternatif requis pour les images.')
    expect(validateAlt(undefined, 'image/png')).toBe('Texte alternatif requis pour les images.')
  })
  it('accepte un alt renseigné', () => {
    expect(validateAlt('Portrait', 'image/webp')).toBe(true)
  })
  it("n'exige rien pour PDF / vidéo / glb", () => {
    expect(validateAlt('', 'application/pdf')).toBe(true)
    expect(validateAlt('', 'video/mp4')).toBe(true)
    expect(validateAlt('', 'model/gltf-binary')).toBe(true)
    expect(validateAlt('', undefined)).toBe(true)
  })
})
```
`src/infrastructure/cms/payload/collections/Users.ts` :
```ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/infrastructure/cms/payload/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  // Inscription publique fermée : le premier compte se crée via l'écran « premier utilisateur » de l'admin.
  access: { create: isAdmin, read: isAdmin, update: isAdmin, delete: isAdmin, admin: ({ req }) => Boolean(req.user) },
  fields: [],
}
```
`src/infrastructure/cms/payload/collections/Media.ts` :
```ts
import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'

export function validateAlt(value: unknown, mimeType: unknown): true | string {
  const isImage = typeof mimeType === 'string' && mimeType.startsWith('image/')
  if (isImage && (typeof value !== 'string' || value.trim() === '')) {
    return 'Texte alternatif requis pour les images.'
  }
  return true
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: { useAsTitle: 'filename', group: 'Médias' },
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'video/mp4', 'video/webm', 'model/gltf-binary', 'application/octet-stream'],
    imageSizes: [
      { name: 'thumb', width: 400 },
      { name: 'card', width: 960 },
      { name: 'hero', width: 1920 },
    ],
    adminThumbnail: 'thumb',
    focalPoint: true,
    staticDir: path.resolve(process.cwd(), 'media'), // <racine>/media, ignoré par git
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      admin: { description: 'Décrit l’image pour les lecteurs d’écran (obligatoire pour les images).' },
      validate: (value: unknown, { data }: { data?: { mimeType?: unknown } }) => validateAlt(value, data?.mimeType),
    },
  ],
}
```
`src/infrastructure/cms/payload/collections/Stacks.ts` :
```ts
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { slugify, STACK_CATEGORIES, type StackCategory } from '@/domain'

const CATEGORY_LABELS: Record<StackCategory, string> = {
  language: 'Langages',
  frontend: 'Frontend',
  backend: 'Backend',
  architecture: 'Architecture',
  testing: 'Tests',
  devops: 'DevOps & Cloud',
  security: 'Sécurité',
  ai: 'IA',
}

export const Stacks: CollectionConfig = {
  slug: 'stacks',
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'category', 'featured', 'order'], group: 'Contenu' },
  hooks: {
    beforeValidate: [({ data }) => (data && !data.slug && data.name ? { ...data, slug: slugify(String(data.name)) } : data)],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true, admin: { description: 'Généré depuis le nom si vide.' } },
    { name: 'category', type: 'select', required: true, options: STACK_CATEGORIES.map((value) => ({ label: CATEGORY_LABELS[value], value })) },
    {
      name: 'icon',
      type: 'group',
      admin: { description: 'Tape un slug Simple Icons (ex. docker, react — voir simpleicons.org) ou uploade un SVG. Sans icône, un monogramme est affiché.' },
      fields: [
        { name: 'simpleIconSlug', type: 'text', validate: (v: unknown) => (!v || /^[a-z0-9]+$/.test(String(v)) ? true : 'Slug en minuscules, sans espaces.') },
        { name: 'upload', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'order', type: 'number', defaultValue: 100 },
  ],
}
```
Run : `pnpm test` → tout **PASS** ; `pnpm typecheck` vert.

- [ ] **Step 5 : Commit**

```bash
git add src/infrastructure/cms/payload/access.ts src/domain/shared/slug.ts src/infrastructure/icons/simple-icons-resolver.ts src/domain/service/service-icon.ts src/domain/stack/stack.ts src/domain/index.ts src/infrastructure/cms/payload/collections/Users.ts src/infrastructure/cms/payload/collections/Media.ts src/infrastructure/cms/payload/collections/Stacks.ts tests/unit/infrastructure/cms/access.test.ts tests/unit/domain/slug.test.ts tests/unit/infrastructure/icons.test.ts tests/unit/infrastructure/cms/media-alt.test.ts
git commit -m "feat(cms): add access rules, stack icon resolver and Users/Media/Stacks collections"
```

---

## Task 4 : Collections B — Projects, Services, Experiences, Messages + hooks de revalidation

**Files :**
- Create (domaine/application) : `src/domain/contact/contact-topic.ts`, `src/application/revalidation/paths-to-revalidate.ts` ; Modify : `src/domain/index.ts` (exporte `contact-topic`) ; Test : `tests/unit/application/paths-to-revalidate.test.ts`
- Create : `src/infrastructure/cms/payload/collections/Projects.ts`, `src/infrastructure/cms/payload/collections/Services.ts`, `src/infrastructure/cms/payload/collections/Experiences.ts`, `src/infrastructure/cms/payload/collections/Messages.ts`, `src/infrastructure/cms/payload/hooks/revalidate.ts`
- Test : `tests/unit/infrastructure/cms/revalidate.test.ts`, `tests/unit/infrastructure/cms/collections-shape.test.ts`

**Interfaces :**
- Consumes : `anyone`, `isAdmin`, `publishedOrAdmin` (T3) ; `slugify`, `SERVICE_ICON_NAMES`, `LOCALES` (domaine, T1/T3)
- Produces :
  - **application** : `type RevalidationKind = 'home' | 'project'`, `pathsToRevalidate(kind: RevalidationKind, slug?: string | null): string[]` dans `src/application/revalidation/paths-to-revalidate.ts` (**pur**, testé)
  - **infrastructure** : `type RevalidateFn = (path: string) => void`, `createRevalidateHook(kind, revalidate?): CollectionAfterChangeHook`, `createRevalidateDeleteHook(kind, revalidate?): CollectionAfterDeleteHook`, `createRevalidateGlobalHook(revalidate?): GlobalAfterChangeHook` dans `src/infrastructure/cms/payload/hooks/revalidate.ts` (adaptateur Next : appelle `revalidatePath`, **aucune règle métier**)
  - **domaine** : `CONTACT_TOPICS`, `type ContactTopic` dans `src/domain/contact/contact-topic.ts`
  - Collections `Projects` (slug `projects`, **drafts activés**), `Services` (`services`), `Experiences` (`experiences`), `Messages` (`messages`)
  - Champs (noms exacts, consommés par T7/T8) — **Projects** : `title`(L) `slug` `tagline`(L) `summary`(L) `caseStudy`(L, richText) `cover`(upload) `gallery`(upload hasMany) `stacks`(rel hasMany) `links{live,repo,caseStudyUrl}` `year` `client` `featured` `order` ; **Services** : `title`(L) `description`(L) `icon`(select) `tint`(select) `order` ; **Experiences** : `kind` `role`(L) `organization` `location` `start`(date) `end`(date) `summary`(L) `highlights[{text}(L)]` `stacks`(rel hasMany) `order` ; **Messages** : `name` `email` `topic` `message` `ipHash` `locale` `status`

- [ ] **Step 0 : Chemins à revalider (application, pur) et sujets de contact (domaine) — TDD**

Quelles pages invalider quand un contenu change est une **règle** : elle vit dans l'application, pure et testée ; le hook Payload n'est qu'un adaptateur qui appelle Next.
`tests/unit/application/paths-to-revalidate.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { pathsToRevalidate } from '@/application/revalidation/paths-to-revalidate'

describe('pathsToRevalidate', () => {
  it('home → la page d’accueil de chaque langue', () => {
    expect(pathsToRevalidate('home')).toEqual(['/fr', '/en'])
  })

  it('project → accueil + page détail de chaque langue', () => {
    expect(pathsToRevalidate('project', 'ma-app')).toEqual(['/fr', '/en', '/fr/projects/ma-app', '/en/projects/ma-app'])
  })

  it('project sans slug → accueil seulement', () => {
    expect(pathsToRevalidate('project')).toEqual(['/fr', '/en'])
    expect(pathsToRevalidate('project', null)).toEqual(['/fr', '/en'])
  })
})
```
Run → **FAIL**. `src/application/revalidation/paths-to-revalidate.ts` :
```ts
import { LOCALES } from '@/domain'

export type RevalidationKind = 'home' | 'project'

export function pathsToRevalidate(kind: RevalidationKind, slug?: string | null): string[] {
  const home = LOCALES.map((locale) => `/${locale}`)
  if (kind !== 'project' || !slug) return home
  return [...home, ...LOCALES.map((locale) => `/${locale}/projects/${slug}`)]
}
```
`src/domain/contact/contact-topic.ts` (aucun import) :
```ts
export const CONTACT_TOPICS = ['project', 'ai', 'job', 'other'] as const
export type ContactTopic = (typeof CONTACT_TOPICS)[number]
```
puis ajouter `export * from './contact/contact-topic'` à `src/domain/index.ts`. Run → **PASS**.

- [ ] **Step 1 : Tests des hooks qui échouent**

`tests/unit/infrastructure/cms/revalidate.test.ts` :
```ts
import { describe, expect, it, vi } from 'vitest'
import { createRevalidateDeleteHook, createRevalidateGlobalHook, createRevalidateHook } from '@/infrastructure/cms/payload/hooks/revalidate'

describe('createRevalidateHook', () => {
  it('revalide les chemins du document', () => {
    const revalidate = vi.fn()
    const doc = { slug: 'ma-app' }
    const out = createRevalidateHook('project', revalidate)({ doc, previousDoc: {}, req: { context: {} } } as never)
    expect(out).toBe(doc)
    expect(revalidate.mock.calls.map((c) => c[0])).toEqual(['/fr', '/en', '/fr/projects/ma-app', '/en/projects/ma-app'])
  })
  it("revalide aussi l'ancien slug", () => {
    const revalidate = vi.fn()
    createRevalidateHook('project', revalidate)({ doc: { slug: 'nouveau' }, previousDoc: { slug: 'ancien' }, req: { context: {} } } as never)
    expect(revalidate.mock.calls.map((c) => c[0])).toEqual([
      '/fr', '/en', '/fr/projects/nouveau', '/en/projects/nouveau', '/fr/projects/ancien', '/en/projects/ancien',
    ])
  })
  it('ne fait rien avec context.disableRevalidate', () => {
    const revalidate = vi.fn()
    createRevalidateHook('home', revalidate)({ doc: {}, previousDoc: {}, req: { context: { disableRevalidate: true } } } as never)
    expect(revalidate).not.toHaveBeenCalled()
  })
  it('avale les erreurs hors contexte de requête (seed, scripts)', () => {
    const revalidate = vi.fn(() => { throw new Error('Invariant: static generation store missing') })
    expect(() => createRevalidateHook('home', revalidate)({ doc: {}, previousDoc: {}, req: { context: {} } } as never)).not.toThrow()
  })
})

describe('hooks delete / global', () => {
  it('delete revalide le slug supprimé', () => {
    const revalidate = vi.fn()
    createRevalidateDeleteHook('project', revalidate)({ doc: { slug: 'x' }, req: { context: {} } } as never)
    expect(revalidate).toHaveBeenCalledWith('/fr/projects/x')
  })
  it('global revalide la home', () => {
    const revalidate = vi.fn()
    createRevalidateGlobalHook(revalidate)({ doc: {}, req: { context: {} } } as never)
    expect(revalidate.mock.calls.map((c) => c[0])).toEqual(['/fr', '/en'])
  })
})
```
Run : `pnpm test tests/unit/infrastructure/cms/revalidate.test.ts` → **FAIL**.

- [ ] **Step 2 : Implémenter `src/infrastructure/cms/payload/hooks/revalidate.ts`**

```ts
import { revalidatePath as nextRevalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { pathsToRevalidate, type RevalidationKind } from '@/application/revalidation/paths-to-revalidate'

export type RevalidateFn = (path: string) => void

const defaultRevalidate: RevalidateFn = (path) => nextRevalidatePath(path)

function revalidateAll(paths: string[], revalidate: RevalidateFn): void {
  for (const path of new Set(paths)) {
    try {
      revalidate(path)
    } catch {
      // Hors contexte de requête Next (seed, scripts, tests) : il n'y a aucun cache à invalider.
    }
  }
}

const slugOf = (doc: unknown): string | null =>
  doc && typeof doc === 'object' ? ((doc as { slug?: string }).slug ?? null) : null

export function createRevalidateHook(kind: RevalidationKind, revalidate: RevalidateFn = defaultRevalidate): CollectionAfterChangeHook {
  return ({ doc, previousDoc, req }) => {
    if (req.context?.disableRevalidate) return doc
    revalidateAll([...pathsToRevalidate(kind, slugOf(doc)), ...pathsToRevalidate(kind, slugOf(previousDoc))], revalidate)
    return doc
  }
}

export function createRevalidateDeleteHook(kind: RevalidationKind, revalidate: RevalidateFn = defaultRevalidate): CollectionAfterDeleteHook {
  return ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc
    revalidateAll(pathsToRevalidate(kind, slugOf(doc)), revalidate)
    return doc
  }
}

export function createRevalidateGlobalHook(revalidate: RevalidateFn = defaultRevalidate): GlobalAfterChangeHook {
  return ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc
    revalidateAll(pathsToRevalidate('home'), revalidate)
    return doc
  }
}
```
Run → **PASS**.

- [ ] **Step 3 : Test de forme des collections (échoue)**

`tests/unit/infrastructure/cms/collections-shape.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import type { CollectionConfig, Field } from 'payload'
import { Experiences } from '@/infrastructure/cms/payload/collections/Experiences'
import { Messages } from '@/infrastructure/cms/payload/collections/Messages'
import { Projects } from '@/infrastructure/cms/payload/collections/Projects'
import { Services } from '@/infrastructure/cms/payload/collections/Services'

const field = (c: CollectionConfig, name: string): Field | undefined =>
  c.fields.find((f) => 'name' in f && f.name === name)
const isLocalized = (f?: Field) => Boolean(f && 'localized' in f && f.localized)

describe('Projects', () => {
  it('active les brouillons et un slug unique', () => {
    expect(Projects.slug).toBe('projects')
    expect(Projects.versions).toMatchObject({ drafts: expect.anything() })
    expect(field(Projects, 'slug')).toMatchObject({ unique: true })
  })
  it('localise titre, accroche, résumé et étude de cas', () => {
    for (const n of ['title', 'tagline', 'summary', 'caseStudy']) expect(isLocalized(field(Projects, n))).toBe(true)
  })
  it('lecture publique limitée aux publiés', () => {
    const read = Projects.access!.read!
    expect(read({ req: { user: null } } as never)).toEqual({ _status: { equals: 'published' } })
    expect(read({ req: { user: { id: 1 } } } as never)).toBe(true)
  })
  it("écriture réservée aux admins", () => {
    for (const k of ['create', 'update', 'delete'] as const) {
      expect(Projects.access![k]!({ req: { user: null } } as never)).toBe(false)
    }
  })
})

describe('Services & Experiences', () => {
  it('Services : icône restreinte à la liste blanche', () => {
    const icon = field(Services, 'icon') as { options: Array<{ value: string }> }
    const values = icon.options.map((o) => o.value)
    expect(values).toContain('bot')
    expect(values).not.toContain('nope')
  })
  it('Experiences : highlights localisés dans un tableau', () => {
    const h = field(Experiences, 'highlights') as { fields: Field[] }
    expect(isLocalized(h.fields.find((f) => 'name' in f && f.name === 'text'))).toBe(true)
  })
})

describe('Messages', () => {
  it("la création publique est refusée (seule la server action crée, overrideAccess)", () => {
    expect(Messages.access!.create!({ req: { user: null } } as never)).toBe(false)
    expect(Messages.access!.create!({ req: { user: { id: 1 } } } as never)).toBe(false)
  })
  it('lecture/mise à jour/suppression : admin uniquement', () => {
    for (const k of ['read', 'update', 'delete'] as const) {
      expect(Messages.access![k]!({ req: { user: null } } as never)).toBe(false)
      expect(Messages.access![k]!({ req: { user: { id: 1 } } } as never)).toBe(true)
    }
  })
})
```
Run → **FAIL**.

- [ ] **Step 4 : Implémenter les collections**

`src/infrastructure/cms/payload/collections/Projects.ts` :
```ts
import type { CollectionConfig } from 'payload'
import { isAdmin, publishedOrAdmin } from '@/infrastructure/cms/payload/access'
import { createRevalidateDeleteHook, createRevalidateHook } from '@/infrastructure/cms/payload/hooks/revalidate'
import { slugify } from '@/domain'

const httpUrl = (v: unknown) => (!v || /^https?:\/\//.test(String(v)) ? true : 'URL en http(s) attendue.')

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: { read: publishedOrAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'client', 'year', 'featured', '_status'], group: 'Contenu' },
  versions: { drafts: true, maxPerDoc: 10 },
  hooks: {
    beforeValidate: [({ data }) => (data && !data.slug && data.title ? { ...data, slug: slugify(String(data.title)) } : data)],
    afterChange: [createRevalidateHook('project')],
    afterDelete: [createRevalidateDeleteHook('project')],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'slug', type: 'text', unique: true, index: true, admin: { position: 'sidebar', description: 'Généré depuis le titre si vide. Change-le avec précaution : il sert d’URL.' } },
    { name: 'tagline', type: 'text', localized: true, admin: { description: 'Une phrase — affichée sur la carte.' } },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'caseStudy', type: 'richText', localized: true },
    { name: 'cover', type: 'upload', relationTo: 'media', filterOptions: { mimeType: { contains: 'image' } } },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true, filterOptions: { mimeType: { contains: 'image' } } },
    { name: 'stacks', type: 'relationship', relationTo: 'stacks', hasMany: true },
    {
      name: 'links', type: 'group',
      fields: [
        { name: 'live', type: 'text', validate: httpUrl },
        { name: 'repo', type: 'text', validate: httpUrl },
        { name: 'caseStudyUrl', type: 'text', validate: httpUrl },
      ],
    },
    { name: 'year', type: 'number', min: 2000, max: 2100 },
    { name: 'client', type: 'text' },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
}
```
`src/infrastructure/cms/payload/collections/Services.ts` :
```ts
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { createRevalidateDeleteHook, createRevalidateHook } from '@/infrastructure/cms/payload/hooks/revalidate'
import { SERVICE_ICON_NAMES } from '@/domain'

export const Services: CollectionConfig = {
  slug: 'services',
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'icon', 'order'], group: 'Contenu' },
  hooks: { afterChange: [createRevalidateHook('home')], afterDelete: [createRevalidateDeleteHook('home')] },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'description', type: 'textarea', localized: true, required: true },
    { name: 'icon', type: 'select', required: true, defaultValue: 'layers', options: SERVICE_ICON_NAMES.map((v) => ({ label: v, value: v })) },
    { name: 'tint', type: 'select', required: true, defaultValue: 'violet', options: ['amber', 'violet', 'blue', 'teal'].map((v) => ({ label: v, value: v })) },
    { name: 'order', type: 'number', defaultValue: 100 },
  ],
}
```
`src/infrastructure/cms/payload/collections/Experiences.ts` :
```ts
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { createRevalidateDeleteHook, createRevalidateHook } from '@/infrastructure/cms/payload/hooks/revalidate'

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: { useAsTitle: 'organization', defaultColumns: ['organization', 'role', 'kind', 'start', 'end'], group: 'Contenu' },
  hooks: { afterChange: [createRevalidateHook('home')], afterDelete: [createRevalidateDeleteHook('home')] },
  fields: [
    { name: 'kind', type: 'select', required: true, defaultValue: 'work', options: [{ label: 'Expérience', value: 'work' }, { label: 'Formation', value: 'education' }] },
    { name: 'role', type: 'text', localized: true, required: true },
    { name: 'organization', type: 'text', required: true },
    { name: 'location', type: 'text' },
    { name: 'start', type: 'date', required: true, admin: { date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } } },
    { name: 'end', type: 'date', admin: { description: 'Vide = en cours.', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } } },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'highlights', type: 'array', fields: [{ name: 'text', type: 'text', localized: true, required: true }] },
    { name: 'stacks', type: 'relationship', relationTo: 'stacks', hasMany: true },
    { name: 'order', type: 'number', defaultValue: 100, admin: { description: 'Plus petit = plus haut dans la timeline.' } },
  ],
}
```
`src/infrastructure/cms/payload/collections/Messages.ts` :
```ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/infrastructure/cms/payload/access'
import { CONTACT_TOPICS, LOCALES } from '@/domain'

export const Messages: CollectionConfig = {
  slug: 'messages',
  // Création uniquement via la server action `submitContact` (API locale, overrideAccess) — jamais via REST/GraphQL.
  access: { create: () => false, read: isAdmin, update: isAdmin, delete: isAdmin },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'topic', 'status', 'createdAt'], group: 'Boîte de réception' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'topic', type: 'select', required: true, options: CONTACT_TOPICS.map((v) => ({ label: v, value: v })) },
    { name: 'message', type: 'textarea', required: true },
    { name: 'ipHash', type: 'text', index: true, admin: { readOnly: true } },
    { name: 'locale', type: 'select', options: LOCALES.map((v) => ({ label: v, value: v })) },
    { name: 'status', type: 'select', defaultValue: 'new', options: ['new', 'read', 'archived'].map((v) => ({ label: v, value: v })), admin: { position: 'sidebar' } },
  ],
}
```
Run : `pnpm test` → **PASS** ; `pnpm typecheck` vert.

- [ ] **Step 5 : Commit**

```bash
git add src/infrastructure/cms/payload/collections/Projects.ts src/infrastructure/cms/payload/collections/Services.ts src/infrastructure/cms/payload/collections/Experiences.ts src/infrastructure/cms/payload/collections/Messages.ts src/infrastructure/cms/payload/hooks src/application/revalidation src/domain/contact src/domain/index.ts tests/unit/application/paths-to-revalidate.test.ts tests/unit/infrastructure/cms/revalidate.test.ts tests/unit/infrastructure/cms/collections-shape.test.ts
git commit -m "feat(cms): add Projects (drafts), Services, Experiences, Messages and revalidation hooks"
```

---

## Task 5 : Globals, config Payload complète, migration initiale, types, test d'intégration

**Files :**
- Create : `src/infrastructure/cms/payload/globals/Site.ts`, `src/infrastructure/cms/payload/globals/Cinematic.ts`, `tests/unit/infrastructure/cms/globals-shape.test.ts`, `tests/integration/payload.int.test.ts`, `src/infrastructure/cms/payload/migrations/*` (générés)
- Modify : `src/infrastructure/cms/payload/payload.config.ts` (remplace le minimal de T1), `src/infrastructure/cms/payload/payload-types.ts` (généré), `src/app/(payload)/admin/importMap.js` (régénéré)

**Interfaces :**
- Consumes : toutes les collections (T3, T4), `createRevalidateGlobalHook` (T4), `anyone`/`isAdmin` (T3)
- Produces : globals `site` et `cinematic` ; **noms de champs exacts** :
  - `site` → onglets nommés (donc **groupes**) : `identity{name,jobTitle(L),tagline(L),location}` · `hero{eyebrow(L),rotatingTitles[{text(L)}],ctaPrimary(L),ctaSecondary(L),chips[{value,label(L)}],trustedByTitle(L),trustedBy[{name,url}]}` · `about{headline(L),bio(L),autoStats,stats[{value,label(L)}]}` · `process{headline(L),steps[{title(L),text(L)}]}` · `contact{email,phone,showPhone,linkedin,github,contactTo}` · `cv{cvFullstack(upload),cvAi(upload)}` · `seo{title(L),description(L),ogImage(upload)}`
  - `cinematic` → `avatarModel` `avatarPortrait` `heroPoster` (uploads) · `heroVideoDesktop{mp4,webm}` · `heroVideoMobile{mp4,webm}` · `scrubVideo`
  - `import config from '@payload-config'` ; types générés `Project, Stack, Service, Experience, Media, Message, Site, Cinematic` dans `@/infrastructure/cms/payload/payload-types`

- [ ] **Step 1 : Test de forme des globals (échoue)**

`tests/unit/infrastructure/cms/globals-shape.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import type { Field, GlobalConfig } from 'payload'
import { Cinematic } from '@/infrastructure/cms/payload/globals/Cinematic'
import { Site } from '@/infrastructure/cms/payload/globals/Site'

const tabs = (g: GlobalConfig) => (g.fields[0] as { tabs: Array<{ name?: string; fields: Field[] }> }).tabs
const tab = (name: string) => tabs(Site).find((t) => t.name === name)
const has = (fields: Field[] | undefined, name: string) => Boolean(fields?.some((f) => 'name' in f && f.name === name))

describe('Site', () => {
  it('expose les 7 onglets nommés du contrat', () => {
    expect(tabs(Site).map((t) => t.name)).toEqual(['identity', 'hero', 'about', 'process', 'contact', 'cv', 'seo'])
  })
  it('le téléphone est masqué par défaut', () => {
    const showPhone = tab('contact')!.fields.find((f) => 'name' in f && f.name === 'showPhone') as { defaultValue: boolean }
    expect(showPhone.defaultValue).toBe(false)
  })
  it('lecture publique, écriture admin', () => {
    expect(Site.access!.read!({ req: { user: null } } as never)).toBe(true)
    expect(Site.access!.update!({ req: { user: null } } as never)).toBe(false)
  })
  it('hero et process ont les champs attendus', () => {
    for (const n of ['eyebrow', 'rotatingTitles', 'ctaPrimary', 'ctaSecondary', 'chips', 'trustedByTitle', 'trustedBy']) expect(has(tab('hero')!.fields, n)).toBe(true)
    for (const n of ['headline', 'steps']) expect(has(tab('process')!.fields, n)).toBe(true)
  })
})

describe('Cinematic', () => {
  it('expose tous les slots médias', () => {
    for (const n of ['avatarModel', 'avatarPortrait', 'heroPoster', 'heroVideoDesktop', 'heroVideoMobile', 'scrubVideo']) expect(has(Cinematic.fields, n)).toBe(true)
  })
})
```
Run → **FAIL**.

- [ ] **Step 2 : Implémenter les globals**

`src/infrastructure/cms/payload/globals/Site.ts` (structure complète — chaque champ listé dans **Interfaces** ; `L` = `localized: true`) :
```ts
import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { createRevalidateGlobalHook } from '@/infrastructure/cms/payload/hooks/revalidate'

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site',
  admin: { group: 'Réglages' },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [createRevalidateGlobalHook()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'identity', label: 'Identité',
          fields: [
            { name: 'name', type: 'text', required: true, defaultValue: 'Denis Bucspun' },
            { name: 'jobTitle', type: 'text', localized: true, required: true },
            { name: 'tagline', type: 'textarea', localized: true },
            { name: 'location', type: 'text' },
          ],
        },
        {
          name: 'hero', label: 'Hero',
          fields: [
            { name: 'eyebrow', type: 'text', localized: true },
            { name: 'rotatingTitles', type: 'array', minRows: 1, fields: [{ name: 'text', type: 'text', localized: true, required: true }] },
            { name: 'ctaPrimary', type: 'text', localized: true },
            { name: 'ctaSecondary', type: 'text', localized: true },
            { name: 'chips', type: 'array', maxRows: 3, fields: [{ name: 'value', type: 'text', required: true }, { name: 'label', type: 'text', localized: true, required: true }] },
            { name: 'trustedByTitle', type: 'text', localized: true },
            { name: 'trustedBy', type: 'array', fields: [{ name: 'name', type: 'text', required: true }, { name: 'url', type: 'text' }] },
          ],
        },
        {
          name: 'about', label: 'À propos',
          fields: [
            { name: 'headline', type: 'text', localized: true },
            { name: 'bio', type: 'textarea', localized: true },
            { name: 'autoStats', type: 'checkbox', defaultValue: true, admin: { description: 'Calcule automatiquement années d’expérience, technologies et projets. Décoche pour saisir tes propres chiffres.' } },
            { name: 'stats', type: 'array', admin: { condition: (_, s) => !s?.autoStats }, fields: [{ name: 'value', type: 'text', required: true }, { name: 'label', type: 'text', localized: true, required: true }] },
          ],
        },
        {
          name: 'process', label: 'Méthode',
          fields: [
            { name: 'headline', type: 'text', localized: true },
            { name: 'steps', type: 'array', fields: [{ name: 'title', type: 'text', localized: true, required: true }, { name: 'text', type: 'textarea', localized: true, required: true }] },
          ],
        },
        {
          name: 'contact', label: 'Contact',
          fields: [
            { name: 'email', type: 'email' },
            { name: 'phone', type: 'text' },
            { name: 'showPhone', type: 'checkbox', defaultValue: false, admin: { description: 'Affiche le téléphone publiquement. Désactivé par défaut (spam).' } },
            { name: 'linkedin', type: 'text' },
            { name: 'github', type: 'text' },
            { name: 'contactTo', type: 'email', admin: { description: 'Destinataire des notifications du formulaire (jamais affiché publiquement).' } },
          ],
        },
        {
          name: 'cv', label: 'CV',
          fields: [
            { name: 'cvFullstack', type: 'upload', relationTo: 'media', filterOptions: { mimeType: { equals: 'application/pdf' } } },
            { name: 'cvAi', type: 'upload', relationTo: 'media', filterOptions: { mimeType: { equals: 'application/pdf' } } },
          ],
        },
        {
          name: 'seo', label: 'SEO',
          fields: [
            { name: 'title', type: 'text', localized: true },
            { name: 'description', type: 'textarea', localized: true },
            { name: 'ogImage', type: 'upload', relationTo: 'media', filterOptions: { mimeType: { contains: 'image' } } },
          ],
        },
      ],
    },
  ],
}
```
`src/infrastructure/cms/payload/globals/Cinematic.ts` :
```ts
import type { Field, GlobalConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { createRevalidateGlobalHook } from '@/infrastructure/cms/payload/hooks/revalidate'

const image = { mimeType: { contains: 'image' } }
const video = (ext: 'mp4' | 'webm') => ({ mimeType: { contains: ext } })
const slot = (name: string, description: string, filterOptions: object): Field => ({ name, type: 'upload', relationTo: 'media', filterOptions, admin: { description } })
const videoPair = (name: string, description: string): Field => ({
  name, type: 'group', admin: { description },
  fields: [slot('mp4', 'Fichier .mp4 (H.264).', video('mp4')), slot('webm', 'Fichier .webm (VP9) — optionnel.', video('webm'))],
})

export const Cinematic: GlobalConfig = {
  slug: 'cinematic',
  label: 'Médias cinématiques',
  admin: { group: 'Réglages', description: 'Avatar 3D et vidéos du hero. Tous les slots sont optionnels : le site a un repli pour chacun.' },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [createRevalidateGlobalHook()] },
  fields: [
    slot('avatarModel', 'Avatar 3D (.glb compressé meshopt, ≤ 3 Mo).', { filename: { like: '.glb' } }),
    slot('avatarPortrait', 'Portrait de l’avatar (PNG/WebP transparent, ≤ 150 Ko) — repli si pas de 3D.', image),
    slot('heroPoster', 'Poster du hero (WebP/AVIF ≤ 150 Ko) — première image affichée (LCP).', image),
    videoPair('heroVideoDesktop', 'Vidéo d’intro 16:9 (≤ 4 Mo).'),
    videoPair('heroVideoMobile', 'Vidéo d’intro 9:16 (≤ 2 Mo).'),
    slot('scrubVideo', 'Vidéo de transition « all-intra » scrubée au scroll (≤ 6 Mo).', video('mp4')),
  ],
}
```
Run : `pnpm test tests/unit/infrastructure/cms/globals-shape.test.ts` → **PASS**.

- [ ] **Step 3 : `src/infrastructure/cms/payload/payload.config.ts` complète**

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Experiences } from '@/infrastructure/cms/payload/collections/Experiences'
import { Media } from '@/infrastructure/cms/payload/collections/Media'
import { Messages } from '@/infrastructure/cms/payload/collections/Messages'
import { Projects } from '@/infrastructure/cms/payload/collections/Projects'
import { Services } from '@/infrastructure/cms/payload/collections/Services'
import { Stacks } from '@/infrastructure/cms/payload/collections/Stacks'
import { Users } from '@/infrastructure/cms/payload/collections/Users'
import { Cinematic } from '@/infrastructure/cms/payload/globals/Cinematic'
import { Site } from '@/infrastructure/cms/payload/globals/Site'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
const blobToken = process.env.BLOB_READ_WRITE_TOKEN

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname, '../../..') }, // = src/
    meta: { titleSuffix: ' — Portfolio CMS' },
  },
  collections: [Users, Media, Stacks, Projects, Services, Experiences, Messages],
  globals: [Site, Cinematic],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? '',
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Dev : push auto du schéma. CI/prod : migrations uniquement (`pnpm migrate`).
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
  localization: {
    locales: [{ label: 'Français', code: 'fr' }, { label: 'English', code: 'en' }],
    defaultLocale: 'fr',
    fallback: true,
  },
  i18n: { fallbackLanguage: 'fr', supportedLanguages: { fr, en } },
  sharp,
  cors: siteUrl ? [siteUrl] : [],
  csrf: siteUrl ? [siteUrl] : [],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      collections: { media: true },
      token: blobToken ?? '',
      // Contourne la limite de corps (4,5 Mo) des fonctions Vercel : vidéos et GLB partent directement vers Blob.
      clientUploads: true,
    }),
  ],
})
```

- [ ] **Step 4 : Générer types, import map, migration**

```bash
pnpm db:up
pnpm generate:types
pnpm generate:importmap
pnpm migrate:create initial      # crée src/infrastructure/cms/payload/migrations/<horodatage>_initial.ts + index.ts
pnpm migrate                     # applique sur la base locale
```
Expected : `src/infrastructure/cms/payload/payload-types.ts` contient `interface Project`, `Site`, `Cinematic` ; `pnpm typecheck` vert. Si `migrate:create` demande de confirmer un `push` existant, répondre non et repartir d'une base vide : `pnpm db:down && docker volume rm <projet>_pgdata && pnpm db:up`.

- [ ] **Step 5 : Test d'intégration (base réelle)**

`tests/integration/payload.int.test.ts` :
```ts
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const ctx = { disableRevalidate: true }
const slug = `int-test-${Date.now()}`
let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})
afterAll(async () => {
  await payload.delete({ collection: 'projects', where: { slug: { equals: slug } }, overrideAccess: true, context: ctx })
})

describe('visibilité des projets', () => {
  it('un brouillon est invisible au public ; publié, il devient visible', async () => {
    const created = await payload.create({ collection: 'projects', data: { title: 'Projet test', slug, _status: 'draft' }, draft: true, overrideAccess: true, context: ctx })
    const q = { collection: 'projects' as const, where: { slug: { equals: slug } }, overrideAccess: false, draft: false }
    expect((await payload.find(q)).totalDocs).toBe(0)
    await payload.update({ collection: 'projects', id: created.id, data: { _status: 'published' }, overrideAccess: true, context: ctx })
    expect((await payload.find(q)).totalDocs).toBe(1)
  })
})

describe('messages', () => {
  it('création publique refusée', async () => {
    await expect(
      payload.create({ collection: 'messages', data: { name: 'A', email: 'a@b.co', topic: 'other', message: 'Bonjour, ceci est un test.' }, overrideAccess: false }),
    ).rejects.toThrow()
  })
  it('lecture publique refusée', async () => {
    await expect(payload.find({ collection: 'messages', overrideAccess: false })).rejects.toThrow()
  })
})

describe('users', () => {
  it('inscription publique refusée', async () => {
    await expect(payload.create({ collection: 'users', data: { email: 'x@y.co', password: 'Passw0rd!Passw0rd!' }, overrideAccess: false })).rejects.toThrow()
  })
})
```
Run : `pnpm test:int` → **PASS** (nécessite la base up + migrée + `.env`).

- [ ] **Step 6 : Vérifier l'admin**

`pnpm dev` → ouvrir `http://localhost:3000/admin` (navigateur intégré) : écran « créer le premier utilisateur » s'affiche, l'admin est en **français**, le groupe « Contenu » liste Projets/Stacks/Services/Expériences. **Ne pas créer d'utilisateur** (Denis le fera). Arrêter le serveur.

- [ ] **Step 7 : Commit**

```bash
git add src/infrastructure/cms/payload/globals src/infrastructure/cms/payload/payload.config.ts src/infrastructure/cms/payload/payload-types.ts src/infrastructure/cms/payload/migrations "src/app/(payload)" tests/unit/infrastructure/cms/globals-shape.test.ts tests/integration
git commit -m "feat(cms): add Site and Cinematic globals, full Payload config, initial migration and integration tests"
```

---

## Task 6 : i18n (next-intl), layout racine, polices, 404

**Files :**
- Create : `src/presentation/i18n/namespaces.ts`, `src/presentation/i18n/routing.ts`, `src/presentation/i18n/request.ts`, `src/presentation/i18n/navigation.ts`, `src/proxy.ts`, `src/app/(site)/[locale]/layout.tsx`, `src/app/(site)/[locale]/not-found.tsx`, `src/app/(site)/[locale]/[...rest]/page.tsx`, `src/presentation/i18n/messages/{fr,en}/{common,nav,hero,about,services,stack,projects,journey,process,contact,footer,errors}.json` (24 fichiers ; `common` et `errors` remplis ici, **les 10 autres = `{}`** que leur tâche propriétaire remplace), `tests/unit/presentation/i18n/i18n-parity.test.ts`, `tests/unit/presentation/i18n/routing.test.ts`
- Modify : `next.config.ts` (remettre `withNextIntl` si retiré en T1)

**Interfaces :**
- Produces : `NAMESPACES` (les 12 noms du contrat) ; `routing` (`locales ['fr','en']`, défaut `fr`, `localePrefix 'always'`) ; `type AppLocale` ; `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` depuis `@/presentation/i18n/navigation` ; layout qui pose `<html lang>`, polices `--font-outfit`/`--font-work-sans`, `<RefractionFlag/>`, `<GlassFilters/>`, `NextIntlClientProvider`, lien d'évitement ; `generateStaticParams` sur les locales
- Clés `common` : `skipToContent`, `siteName`, `metaTitle`, `metaDescription`, `language.fr`, `language.en`, `language.switch` ; clés `errors` : `notFoundTitle`, `notFoundText`, `backHome`, `generic`, `required`, `emailInvalid`, `tooShort`, `tooLong`

- [ ] **Step 1 : Tests (échouent)**

`tests/unit/presentation/i18n/routing.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { routing } from '@/presentation/i18n/routing'
import { NAMESPACES } from '@/presentation/i18n/namespaces'

describe('routing', () => {
  it('fr par défaut, en disponible, préfixe toujours', () => {
    expect(routing.locales).toEqual(['fr', 'en'])
    expect(routing.defaultLocale).toBe('fr')
    expect(routing.localePrefix).toBe('always')
  })
  it('12 namespaces du contrat', () => {
    expect([...NAMESPACES]).toEqual(['common','nav','hero','about','services','stack','projects','journey','process','contact','footer','errors'])
  })
})
```
`tests/unit/presentation/i18n/i18n-parity.test.ts` :
```ts
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { NAMESPACES } from '@/presentation/i18n/namespaces'

const read = (l: string, ns: string) => JSON.parse(readFileSync(`src/presentation/i18n/messages/${l}/${ns}.json`, 'utf8')) as Record<string, unknown>
const flatten = (o: Record<string, unknown>, p = ''): Array<[string, unknown]> =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flatten(v as Record<string, unknown>, `${p}${k}.`) : [[`${p}${k}`, v] as [string, unknown]]))

describe('parité des messages FR/EN', () => {
  it('mêmes fichiers dans fr/ et en/, exactement les namespaces du contrat', () => {
    const expected = [...NAMESPACES].map((n) => `${n}.json`).sort()
    expect(readdirSync('src/presentation/i18n/messages/fr').sort()).toEqual(expected)
    expect(readdirSync('src/presentation/i18n/messages/en').sort()).toEqual(expected)
  })
  it.each([...NAMESPACES])('%s : mêmes clés, aucune chaîne vide', (ns) => {
    const fr = flatten(read('fr', ns))
    const en = flatten(read('en', ns))
    expect(en.map(([k]) => k).sort()).toEqual(fr.map(([k]) => k).sort())
    for (const [k, v] of [...fr, ...en]) expect(typeof v === 'string' && v.trim().length > 0, `${ns}.${k}`).toBe(true)
  })
})
```
Run → **FAIL**.

- [ ] **Step 2 : Implémenter i18n**

`src/presentation/i18n/namespaces.ts` :
```ts
export const NAMESPACES = ['common', 'nav', 'hero', 'about', 'services', 'stack', 'projects', 'journey', 'process', 'contact', 'footer', 'errors'] as const
export type Namespace = (typeof NAMESPACES)[number]
```
`src/presentation/i18n/routing.ts` :
```ts
import { defineRouting } from 'next-intl/routing'
import { DEFAULT_LOCALE, LOCALES } from '@/domain'

export const routing = defineRouting({ locales: [...LOCALES], defaultLocale: DEFAULT_LOCALE, localePrefix: 'always' })
export type AppLocale = (typeof routing.locales)[number]
```
`src/presentation/i18n/request.ts` :
```ts
import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { NAMESPACES } from './namespaces'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => [ns, (await import(`./messages/${locale}/${ns}.json`)).default] as const),
  )
  return { locale, messages: Object.fromEntries(entries) }
})
```
`src/presentation/i18n/navigation.ts` :
```ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
```
`src/proxy.ts` (Next 16 : `middleware` → `proxy`) :
```ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './presentation/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!admin|api|_next|_vercel|fixtures|.*\\..*).*)'],
}
```
> **À vérifier dans la doc de la version installée** (`node_modules/next/dist/docs` si présent, sinon nextjs.org/docs) : convention `proxy.ts` (export nommé `proxy` vs `default`) et compatibilité `next-intl@4`. Adapter l'export ; garder le `matcher`. Test e2e de redirection `/` → `/fr` en T17.

Fichiers `messages` : `common.json` FR :
```json
{
  "skipToContent": "Aller au contenu",
  "siteName": "Denis Bucspun",
  "metaTitle": "Denis Bucspun — Développeur Full Stack & Ingénieur IA",
  "metaDescription": "Portfolio de Denis Bucspun : développement full stack (React, .NET), architecture logicielle et IA générative.",
  "language": { "fr": "Français", "en": "English", "switch": "Changer de langue" }
}
```
EN : `"Skip to content"`, `"Denis Bucspun — Full Stack Developer & AI Engineer"`, `"Portfolio of Denis Bucspun: full-stack development (React, .NET), software architecture and generative AI."`, `"French"`/`"English"`, `"Switch language"`. `errors.json` FR :
```json
{
  "notFoundTitle": "Page introuvable",
  "notFoundText": "Cette page n’existe pas ou a été déplacée.",
  "backHome": "Retour à l’accueil",
  "generic": "Une erreur est survenue. Réessaie dans un instant.",
  "required": "Ce champ est obligatoire.",
  "emailInvalid": "Adresse e-mail invalide.",
  "tooShort": "Trop court.",
  "tooLong": "Trop long."
}
```
+ traduction EN équivalente. Les 10 autres namespaces : `{}` dans `fr/` **et** `en/`.

- [ ] **Step 3 : Layout, 404, catch-all**

`src/app/(site)/[locale]/layout.tsx` :
```tsx
import type { Metadata } from 'next'
import { Outfit, Work_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { GlassFilters } from '@/presentation/components/glass/GlassFilters'
import { RefractionFlag } from '@/presentation/components/glass/RefractionFlag'
import { routing } from '@/presentation/i18n/routing'
import '@/presentation/styles/globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work-sans', display: 'swap' })

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return {
    metadataBase: new URL(base),
    title: { default: t('metaTitle'), template: `%s — ${t('siteName')}` },
    description: t('metaDescription'),
    alternates: { canonical: `/${locale}`, languages: { fr: '/fr', en: '/en' } },
    openGraph: { type: 'website', siteName: t('siteName'), locale },
  }
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const [messages, t] = await Promise.all([getMessages(), getTranslations('common')])
  return (
    <html lang={locale} className={`${outfit.variable} ${workSans.variable}`} suppressHydrationWarning>
      <head>
        <RefractionFlag />
      </head>
      <body>
        <a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-full bg-[var(--ink)] px-4 py-2 text-white">
          {t('skipToContent')}
        </a>
        <GlassFilters />
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
```
`src/app/(site)/[locale]/[...rest]/page.tsx` : `import { notFound } from 'next/navigation'` ; `export default function CatchAll() { notFound() }`.
`src/app/(site)/[locale]/not-found.tsx` : composant serveur, titre `errors.notFoundTitle`, texte, lien `backHome` vers `/` (via `Link` de `@/presentation/i18n/navigation`), rendu dans une carte `<Glass>` centrée (`min-h-dvh`), `<main id="main">`.

- [ ] **Step 4 : Vérifier**

Run : `pnpm test` → **PASS** ; `pnpm typecheck && pnpm lint` verts ; `pnpm build` réussit (pas encore de page d'accueil : `/fr` = 404 attendu, à ce stade).

- [ ] **Step 5 : Commit**

```bash
git add src/presentation/i18n src/proxy.ts "src/app/(site)" src/presentation/i18n/messages next.config.ts tests/unit/presentation/i18n/i18n-parity.test.ts tests/unit/presentation/i18n/routing.test.ts
git commit -m "feat(i18n): add next-intl routing, per-namespace messages, root layout with fonts and 404"
```

---

## Task 7 : Domaine, cas d'usage et adaptateur Payload — lecture du contenu

**Files :**
- Create (domain) : `src/domain/media.ts`, `src/domain/project/project.ts`, `src/domain/service/service.ts`, `src/domain/experience/experience.ts`, `src/domain/site/site-profile.ts`, `src/domain/site/cinematic-media.ts`, `src/domain/career/career-stats.ts`, `src/domain/stack/group-stacks.ts`
- Modify : `src/domain/index.ts` (barrel : exporte les modules ci-dessus)
- Create (application) : `src/application/ports/portfolio-repository.ts`, `src/application/ports/clock.ts`, `src/application/portfolio/{home-page,get-site-profile,get-home-page,get-project-page,list-project-refs}.ts`
- Create (infrastructure) : `src/infrastructure/cms/payload/mappers/{media,stack,project,service,experience,site,cinematic,index}.ts`, `src/infrastructure/cms/payload/payload-portfolio-repository.ts`, `src/infrastructure/system/system-clock.ts`
- Create (composition) : `src/composition/portfolio.ts`, `src/composition/index.ts`
- Create (presentation) : `src/presentation/lib/format-date.ts`
- Create (tests) : `tests/support/{builders,in-memory-portfolio-repository,fixed-clock}.ts`, `tests/unit/domain/{group-stacks,career-stats}.test.ts`, `tests/unit/application/{get-home-page,get-project-page,get-site-profile,list-project-refs}.test.ts`, `tests/unit/infrastructure/cms/mappers.test.ts`, `tests/unit/presentation/format-date.test.ts`, `tests/integration/portfolio.int.test.ts`

**Interfaces :**
- Consumes : `Locale`, `Result` (T1) ; `slugify`, `SERVICE_ICON_NAMES`/`ServiceIconName`, `Stack`/`StackCategory`/`StackIcon`/`STACK_CATEGORIES` (T3) ; `resolveStackIcon` (infra, T3) ; types générés `@/infrastructure/cms/payload/payload-types` (T5)
- Produces — **domaine** (types `readonly`, exportés via `@/domain`) :
```ts
// media.ts
export type MediaAsset = { readonly url: string; readonly alt: string; readonly width: number | null; readonly height: number | null; readonly mimeType: string | null }

// project/project.ts
export type RichTextDocument = { readonly root: Readonly<Record<string, unknown>> } // opaque : seule la présentation sait le rendre
export type ProjectLinks = { readonly live: string | null; readonly repo: string | null; readonly caseStudyUrl: string | null }
export type ProjectSummary = {
  readonly id: string; readonly slug: string; readonly title: string; readonly tagline: string; readonly cover: MediaAsset | null
  readonly year: number | null; readonly client: string | null; readonly featured: boolean
  readonly stacks: readonly Stack[]; readonly stackSlugs: readonly string[]
}
export type Project = ProjectSummary & { readonly summary: string; readonly caseStudy: RichTextDocument | null; readonly gallery: readonly MediaAsset[]; readonly links: ProjectLinks }
export type ProjectRef = { readonly slug: string; readonly updatedAt: string }

// service/service.ts
export type ServiceTint = 'amber' | 'violet' | 'blue' | 'teal'
export type Service = { readonly id: string; readonly title: string; readonly description: string; readonly icon: ServiceIconName; readonly tint: ServiceTint }

// experience/experience.ts
export type ExperienceKind = 'work' | 'education'
export type Experience = {
  readonly id: string; readonly kind: ExperienceKind; readonly role: string; readonly organization: string; readonly location: string | null
  readonly start: string; readonly end: string | null; readonly summary: string; readonly highlights: readonly string[]; readonly stacks: readonly Stack[]
}

// site/site-profile.ts
export type LabeledValue = { readonly value: string; readonly label: string }
export type SiteProfile = {
  readonly name: string; readonly jobTitle: string; readonly tagline: string; readonly location: string
  readonly hero: { readonly eyebrow: string; readonly rotatingTitles: readonly string[]; readonly ctaPrimary: string; readonly ctaSecondary: string; readonly chips: readonly LabeledValue[]; readonly trustedByTitle: string; readonly trustedBy: readonly { readonly name: string; readonly url: string | null }[] }
  readonly about: { readonly headline: string; readonly bio: string; readonly autoStats: boolean; readonly stats: readonly LabeledValue[] }
  readonly process: { readonly headline: string; readonly steps: readonly { readonly title: string; readonly text: string }[] }
  readonly contact: { readonly email: string | null; readonly phone: string | null; readonly showPhone: boolean; readonly linkedin: string | null; readonly github: string | null }
  readonly cv: { readonly fullstack: MediaAsset | null; readonly ai: MediaAsset | null }
  readonly seo: { readonly title: string; readonly description: string; readonly ogImage: MediaAsset | null }
}

// site/cinematic-media.ts
export type VideoPair = { readonly mp4: MediaAsset | null; readonly webm: MediaAsset | null }
export type CinematicMedia = {
  readonly avatarModel: MediaAsset | null; readonly avatarPortrait: MediaAsset | null; readonly heroPoster: MediaAsset | null
  readonly heroVideoDesktop: VideoPair; readonly heroVideoMobile: VideoPair; readonly scrubVideo: MediaAsset | null
}

// career/career-stats.ts
export type CareerStats = { readonly years: number; readonly experiences: number; readonly technologies: number; readonly projects: number }
export function computeCareerStats(input: { experiences: readonly Pick<Experience, 'kind' | 'start'>[]; projectsCount: number; stacksCount: number; now: Date }): CareerStats

// stack/group-stacks.ts
export type StackGroup = { readonly category: StackCategory; readonly stacks: readonly Stack[] }
export function groupStacksByCategory(stacks: readonly Stack[]): StackGroup[]   // ordre = STACK_CATEGORIES ; catégories vides omises ; ordre d'entrée conservé
```
- Produces — **application** :
```ts
// ports/clock.ts
export interface Clock { now(): number } // millisecondes epoch

// ports/portfolio-repository.ts
export interface PortfolioRepository {
  getSite(locale: Locale): Promise<SiteProfile>
  getCinematic(): Promise<CinematicMedia>
  getServices(locale: Locale): Promise<Service[]>
  getStacks(locale: Locale): Promise<Stack[]>
  getProjectSummaries(locale: Locale): Promise<ProjectSummary[]>
  getProjectBySlug(locale: Locale, slug: string): Promise<Project | null>
  getProjectRefs(): Promise<ProjectRef[]>
  getExperiences(locale: Locale): Promise<Experience[]>
}

// portfolio/home-page.ts
export type HomePage = { readonly site: SiteProfile; readonly cinematic: CinematicMedia; readonly services: readonly Service[]; readonly stacks: readonly Stack[]; readonly projects: readonly ProjectSummary[]; readonly experiences: readonly Experience[]; readonly stats: CareerStats }

// cas d'usage — chacun : constructor(portfolio[, clock]) + execute(...)
GetSiteProfile.execute(locale: Locale): Promise<SiteProfile>
GetHomePage.execute(locale: Locale): Promise<HomePage>                 // constructor(portfolio, clock)
GetProjectPage.execute(input: { locale: Locale; slug: string }): Promise<ProjectPage | null>
//   ProjectPage = { project: Project; previous: ProjectSummary | null; next: ProjectSummary | null }  (portfolio/get-project-page.ts)
ListProjectRefs.execute(): Promise<ProjectRef[]>
```
- Produces — **infrastructure** : `class PayloadPortfolioRepository implements PortfolioRepository { constructor(client: () => Promise<Payload>) }` ; `class SystemClock implements Clock` ; mappers `mapMedia(m: unknown): MediaAsset | null`, `mapStack(s: unknown): Stack | null`, `mapProjectSummary(p: ProjectDoc): ProjectSummary`, `mapProject(p: ProjectDoc): Project`, `mapService(s: ServiceDoc): Service`, `mapExperience(e: ExperienceDoc): Experience`, `mapSite(g: SiteDoc): SiteProfile` (**n'expose jamais `contactTo`**), `mapCinematic(g: CinematicDoc): CinematicMedia`.
- Produces — **composition** : `getPortfolioUseCases(): { getSiteProfile: GetSiteProfile; getHomePage: GetHomePage; getProjectPage: GetProjectPage; listProjectRefs: ListProjectRefs }` (mémoïsé, `import 'server-only'`) dans `src/composition/portfolio.ts`, ré-exporté par `src/composition/index.ts`.
- Produces — **présentation** : `formatMonth(iso: string, locale: Locale): string`, `formatRange(start: string, end: string | null, locale: Locale, nowLabel: string): string` dans `src/presentation/lib/format-date.ts`.

- [ ] **Step 1 : Tests du domaine (échouent)**

`tests/unit/domain/career-stats.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { computeCareerStats } from '@/domain'

const NOW = new Date('2026-09-30T00:00:00Z')

describe('computeCareerStats', () => {
  it("compte les années depuis la plus ancienne expérience 'work'", () => {
    const stats = computeCareerStats({
      experiences: [{ kind: 'work', start: '2024-10-01' }, { kind: 'work', start: '2023-02-01' }, { kind: 'education', start: '2019-09-01' }],
      projectsCount: 5, stacksCount: 34, now: NOW,
    })
    expect(stats).toEqual({ years: 3, experiences: 2, technologies: 34, projects: 5 })
  })

  it("renvoie 0 année sans expérience 'work'", () => {
    expect(computeCareerStats({ experiences: [], projectsCount: 0, stacksCount: 0, now: NOW }).years).toBe(0)
  })
})
```
`tests/unit/domain/group-stacks.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { groupStacksByCategory, type Stack } from '@/domain'

const aStack = (slug: string, category: Stack['category']): Stack => ({
  id: slug, name: slug, slug, category, featured: false, icon: { kind: 'monogram', letters: 'X' },
})

describe('groupStacksByCategory', () => {
  it("respecte l'ordre des catégories, omet les vides et garde l'ordre d'entrée", () => {
    const groups = groupStacksByCategory([aStack('a', 'devops'), aStack('b', 'language'), aStack('c', 'language')])
    expect(groups.map((g) => g.category)).toEqual(['language', 'devops'])
    expect(groups[0]!.stacks.map((s) => s.slug)).toEqual(['b', 'c'])
  })

  it('renvoie une liste vide sans stack', () => {
    expect(groupStacksByCategory([])).toEqual([])
  })
})
```
Run → **FAIL**. Implémenter :
`src/domain/career/career-stats.ts` :
```ts
import type { Experience } from '../experience/experience'

export type CareerStats = { readonly years: number; readonly experiences: number; readonly technologies: number; readonly projects: number }

const MONTHS_PER_YEAR = 12

const monthsBetween = (from: Date, to: Date): number =>
  Math.max(0, (to.getFullYear() - from.getUTCFullYear()) * MONTHS_PER_YEAR + (to.getMonth() - from.getUTCMonth()))

export function computeCareerStats(input: {
  experiences: readonly Pick<Experience, 'kind' | 'start'>[]
  projectsCount: number
  stacksCount: number
  now: Date
}): CareerStats {
  const work = input.experiences.filter((e) => e.kind === 'work')
  const starts = work.map((e) => new Date(e.start).getTime())
  const years = starts.length === 0 ? 0 : Math.floor(monthsBetween(new Date(Math.min(...starts)), input.now) / MONTHS_PER_YEAR)
  return { years, experiences: work.length, technologies: input.stacksCount, projects: input.projectsCount }
}
```
`src/domain/stack/group-stacks.ts` :
```ts
import { STACK_CATEGORIES, type Stack, type StackCategory } from './stack'

export type StackGroup = { readonly category: StackCategory; readonly stacks: readonly Stack[] }

export function groupStacksByCategory(stacks: readonly Stack[]): StackGroup[] {
  return STACK_CATEGORIES.map((category) => ({ category, stacks: stacks.filter((s) => s.category === category) })).filter((g) => g.stacks.length > 0)
}
```
Créer les autres fichiers du domaine (types ci-dessus, **aucun import hors `domain`**) et compléter `src/domain/index.ts`. Run : `pnpm test tests/unit/domain` → **PASS**.

- [ ] **Step 2 : Fakes de test et tests des cas d'usage (échouent)**

`tests/support/builders.ts` — fabriques minimales et lisibles : `aStack(over?)`, `aProjectSummary(over?)`, `aProject(over?)`, `aService(over?)`, `anExperience(over?)`, `aSiteProfile(over?)`, `aCinematicMedia(over?)` (chaque fabrique renvoie un objet **valide complet** du type domaine, `over` = `Partial<T>` fusionné).
`tests/support/fixed-clock.ts` : `export const fixedClock = (iso: string): Clock => ({ now: () => new Date(iso).getTime() })`.
`tests/support/in-memory-portfolio-repository.ts` :
```ts
import type { PortfolioRepository } from '@/application/ports/portfolio-repository'
import type { CinematicMedia, Experience, Locale, Project, ProjectRef, ProjectSummary, Service, SiteProfile, Stack } from '@/domain'
import { aCinematicMedia, aSiteProfile } from './builders'

export class InMemoryPortfolioRepository implements PortfolioRepository {
  constructor(private readonly data: {
    site?: SiteProfile; cinematic?: CinematicMedia; services?: Service[]; stacks?: Stack[]
    projects?: Project[]; experiences?: Experience[]
  } = {}) {}

  async getSite(_locale: Locale) { return this.data.site ?? aSiteProfile() }
  async getCinematic() { return this.data.cinematic ?? aCinematicMedia() }
  async getServices(_locale: Locale) { return this.data.services ?? [] }
  async getStacks(_locale: Locale) { return this.data.stacks ?? [] }
  async getProjectSummaries(_locale: Locale): Promise<ProjectSummary[]> { return this.data.projects ?? [] }
  async getProjectBySlug(_locale: Locale, slug: string) { return (this.data.projects ?? []).find((p) => p.slug === slug) ?? null }
  async getProjectRefs(): Promise<ProjectRef[]> { return (this.data.projects ?? []).map((p) => ({ slug: p.slug, updatedAt: '2026-01-01T00:00:00.000Z' })) }
  async getExperiences(_locale: Locale) { return this.data.experiences ?? [] }
}
```
`tests/unit/application/get-home-page.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { GetHomePage } from '@/application/portfolio/get-home-page'
import { aProject, aService, aStack, anExperience } from '../../support/builders'
import { fixedClock } from '../../support/fixed-clock'
import { InMemoryPortfolioRepository } from '../../support/in-memory-portfolio-repository'

describe('GetHomePage', () => {
  it('assemble toutes les sections et calcule les statistiques de carrière', async () => {
    const repo = new InMemoryPortfolioRepository({
      services: [aService(), aService({ id: '2' })],
      stacks: [aStack({ id: '1' }), aStack({ id: '2', slug: 'b' }), aStack({ id: '3', slug: 'c' })],
      projects: [aProject({ id: '1', slug: 'a' }), aProject({ id: '2', slug: 'b' })],
      experiences: [anExperience({ kind: 'work', start: '2023-02-01' })],
    })

    const home = await new GetHomePage(repo, fixedClock('2026-09-30T00:00:00Z')).execute('fr')

    expect(home.services).toHaveLength(2)
    expect(home.stats).toEqual({ years: 3, experiences: 1, technologies: 3, projects: 2 })
  })
})
```
`tests/unit/application/get-project-page.test.ts` : (1) slug inconnu → `null` ; (2) projet au milieu → `previous` et `next` corrects (ordre = `getProjectSummaries`) ; (3) premier projet → `previous: null` ; (4) dernier → `next: null` ; (5) projet seul → les deux `null`.
`tests/unit/application/get-site-profile.test.ts` et `list-project-refs.test.ts` : chaque cas d'usage délègue au port et renvoie sa valeur (un test chacun).
Run → **FAIL**. Implémenter :
`src/application/portfolio/get-home-page.ts` :
```ts
import { computeCareerStats, type Locale } from '@/domain'
import type { Clock } from '../ports/clock'
import type { PortfolioRepository } from '../ports/portfolio-repository'
import type { HomePage } from './home-page'

export class GetHomePage {
  constructor(private readonly portfolio: PortfolioRepository, private readonly clock: Clock) {}

  async execute(locale: Locale): Promise<HomePage> {
    const [site, cinematic, services, stacks, projects, experiences] = await Promise.all([
      this.portfolio.getSite(locale),
      this.portfolio.getCinematic(),
      this.portfolio.getServices(locale),
      this.portfolio.getStacks(locale),
      this.portfolio.getProjectSummaries(locale),
      this.portfolio.getExperiences(locale),
    ])
    const stats = computeCareerStats({ experiences, projectsCount: projects.length, stacksCount: stacks.length, now: new Date(this.clock.now()) })
    return { site, cinematic, services, stacks, projects, experiences, stats }
  }
}
```
`src/application/portfolio/get-project-page.ts` :
```ts
import type { Locale, Project, ProjectSummary } from '@/domain'
import type { PortfolioRepository } from '../ports/portfolio-repository'

export type ProjectPage = { readonly project: Project; readonly previous: ProjectSummary | null; readonly next: ProjectSummary | null }

export class GetProjectPage {
  constructor(private readonly portfolio: PortfolioRepository) {}

  async execute(input: { locale: Locale; slug: string }): Promise<ProjectPage | null> {
    const project = await this.portfolio.getProjectBySlug(input.locale, input.slug)
    if (!project) return null
    const summaries = await this.portfolio.getProjectSummaries(input.locale)
    const index = summaries.findIndex((p) => p.slug === project.slug)
    if (index === -1) return { project, previous: null, next: null }
    return { project, previous: summaries[index - 1] ?? null, next: summaries[index + 1] ?? null }
  }
}
```
`GetSiteProfile` et `ListProjectRefs` : classes d'une méthode qui délèguent au port. `HomePage` : type ci-dessus. Run : `pnpm test tests/unit/application` → **PASS**.

- [ ] **Step 3 : Mappers Payload → domaine (tests d'abord)**

`tests/unit/infrastructure/cms/mappers.test.ts` — écrire (et voir échouer) au minimum : `mapMedia` renvoie `null` pour un id non peuplé, un objet sans `url` ou `null`, et mappe un média peuplé ; `mapStack` convertit l'id en `string`, résout l'icône Simple Icons (`docker`), renvoie `null` pour un id non peuplé ; `mapService` copie les champs ; `mapProject` : `caseStudy` `null` si absent, `links` avec `null` par défaut, `stackSlugs` = slugs des stacks peuplés, stacks non peuplés ignorés ; `mapSite` : **n'expose pas `contactTo`** (`expect(site.contact).not.toHaveProperty('contactTo')`), chaînes absentes → `''`, CV non peuplés → `null` ; `mapCinematic` : slots non peuplés → `null`.
Implémenter les mappers (un fichier par agrégat, fonctions courtes, **aucune logique métier**) en important les types Payload avec le suffixe `Doc` :
```ts
import type { Project as ProjectDoc } from '../payload-types'
import type { Project, ProjectSummary } from '@/domain'
```
`mapMedia` accepte `unknown` (un champ `upload` est soit un id, soit un objet peuplé) ; toute relation non peuplée (`number`) est ignorée ; `id` → `String(id)`. Run → **PASS**.

- [ ] **Step 4 : Adaptateur `PayloadPortfolioRepository`, horloge, composition**

`src/infrastructure/cms/payload/payload-portfolio-repository.ts` — squelette imposé :
```ts
import type { Payload } from 'payload'
import type { PortfolioRepository } from '@/application/ports/portfolio-repository'
import type { Locale } from '@/domain'
import { mapCinematic, mapExperience, mapProject, mapProjectSummary, mapService, mapSite, mapStack } from './mappers'

/** L'API locale ignore l'access control par défaut : on force la lecture « visiteur » (publiés uniquement). */
const PUBLIC_READ = { overrideAccess: false, draft: false } as const
const LIST = { depth: 2, limit: 200, pagination: false, sort: 'order' } as const

export class PayloadPortfolioRepository implements PortfolioRepository {
  constructor(private readonly client: () => Promise<Payload>) {}
  // getSite / getCinematic : findGlobal({ slug, locale, depth, ...PUBLIC_READ }) puis mapSite / mapCinematic
  // getServices / getStacks / getExperiences / getProjectSummaries : find({ collection, locale, ...LIST, ...PUBLIC_READ }) puis map
  // getProjectBySlug : find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1, ... }) → null si absent
  // getProjectRefs : find({ collection: 'projects', depth: 0, select: { slug: true, updatedAt: true }, ...PUBLIC_READ })
}
```
`src/infrastructure/system/system-clock.ts` : `export class SystemClock implements Clock { now(): number { return Date.now() } }`.
`src/composition/portfolio.ts` :
```ts
import 'server-only'
import config from '@payload-config'
import { getPayload } from 'payload'
import { GetHomePage } from '@/application/portfolio/get-home-page'
import { GetProjectPage } from '@/application/portfolio/get-project-page'
import { GetSiteProfile } from '@/application/portfolio/get-site-profile'
import { ListProjectRefs } from '@/application/portfolio/list-project-refs'
import { PayloadPortfolioRepository } from '@/infrastructure/cms/payload/payload-portfolio-repository'
import { SystemClock } from '@/infrastructure/system/system-clock'

export type PortfolioUseCases = {
  readonly getSiteProfile: GetSiteProfile
  readonly getHomePage: GetHomePage
  readonly getProjectPage: GetProjectPage
  readonly listProjectRefs: ListProjectRefs
}

let instance: PortfolioUseCases | undefined

export function getPortfolioUseCases(): PortfolioUseCases {
  instance ??= buildPortfolioUseCases()
  return instance
}

function buildPortfolioUseCases(): PortfolioUseCases {
  const portfolio = new PayloadPortfolioRepository(() => getPayload({ config }))
  return {
    getSiteProfile: new GetSiteProfile(portfolio),
    getHomePage: new GetHomePage(portfolio, new SystemClock()),
    getProjectPage: new GetProjectPage(portfolio),
    listProjectRefs: new ListProjectRefs(portfolio),
  }
}
```
`src/composition/index.ts` : `export * from './portfolio'`.

- [ ] **Step 5 : Format de date (présentation) — tests d'abord**

`tests/unit/presentation/format-date.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { formatMonth, formatRange } from '@/presentation/lib/format-date'

describe('format-date', () => {
  it('formate un mois court localisé', () => {
    expect(formatMonth('2024-10-01', 'fr')).toMatch(/oct\.? 2024/i)
    expect(formatMonth('2024-10-01', 'en')).toMatch(/oct(ober)? 2024/i)
  })
  it('formate une plage terminée', () => {
    expect(formatRange('2023-10-01', '2024-09-01', 'fr', 'Aujourd’hui')).toMatch(/oct\.? 2023.+sept\.? 2024/i)
  })
  it('utilise le libellé fourni pour une plage en cours', () => {
    expect(formatRange('2024-10-01', null, 'fr', 'Aujourd’hui')).toMatch(/Aujourd’hui$/)
  })
})
```
`src/presentation/lib/format-date.ts` :
```ts
import type { Locale } from '@/domain'

export function formatMonth(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso))
}

export function formatRange(start: string, end: string | null, locale: Locale, nowLabel: string): string {
  return `${formatMonth(start, locale)} — ${end ? formatMonth(end, locale) : nowLabel}`
}
```

- [ ] **Step 6 : Test d'intégration (base réelle, à lancer APRÈS la Task 8)**

`tests/integration/portfolio.int.test.ts` (`describe.skipIf(!process.env.DATABASE_URI)`) : avec `new PayloadPortfolioRepository(() => getPayload({ config }))` — `getProjectSummaries('fr')` ne contient **aucun brouillon** ; `getProjectBySlug('fr', 'slug-inexistant')` = `null` ; `new GetHomePage(repo, new SystemClock()).execute('fr')` → ≥ 4 services, ≥ 20 stacks, `stats.years` ≥ 3 ; `mapSite` du repo n'expose pas `contactTo`.

- [ ] **Step 7 : Vérifier** — `pnpm test` **PASS** (dont `architecture.test.ts` : `domain` et `application` n'importent aucun paquet), `pnpm typecheck && pnpm lint` verts.

- [ ] **Step 8 : Commit**

```bash
git add src/domain src/application src/infrastructure/cms/payload/mappers src/infrastructure/cms/payload/payload-portfolio-repository.ts src/infrastructure/system src/composition src/presentation/lib/format-date.ts tests/support tests/unit/domain tests/unit/application tests/unit/infrastructure/cms/mappers.test.ts tests/unit/presentation/format-date.test.ts tests/integration/portfolio.int.test.ts
git commit -m "feat(core): add domain entities, portfolio use cases, Payload repository adapter and composition root"
```

## Task 8 : Seed — contenu issu des CV (FR + EN), idempotent

**Files :**
- Create : `src/infrastructure/seed/run.ts`, `src/infrastructure/seed/upsert.ts`, `src/infrastructure/seed/lexical.ts`, `src/infrastructure/seed/data/site.ts`, `src/infrastructure/seed/data/services.ts`, `src/infrastructure/seed/data/stacks.ts`, `src/infrastructure/seed/data/experiences.ts`, `src/infrastructure/seed/data/projects.ts`, `src/infrastructure/seed/data/types.ts`
- Test : `tests/unit/infrastructure/seed/seed-data.test.ts`, `tests/unit/infrastructure/seed/seed-lexical.test.ts`, `tests/integration/seed.int.test.ts`

**Interfaces :**
- Consumes : collections/globals (T3–T5), `hasSimpleIcon` (T3), `STACK_CATEGORIES` (T3), `SERVICE_ICON_NAMES` (T3), `slugify` (T3)
- Produces : `lexicalFromParagraphs(paragraphs: string[]): SerializedEditorState` ; `upsertBySlug(payload, collection, slug, { common, fr, en }): Promise<number | string>` ; données typées `SeedStack`, `SeedService`, `SeedExperience`, `SeedProject` ; `pnpm seed` idempotent (2 exécutions = même base)

**Règle de contenu :** uniquement des faits des CV (`img/CV_Denis_Bucspun_2026_FR.pdf`, `..._IA.pdf`). Le FR ci-dessous fait foi ; l'EN est une **traduction fidèle** (aucun fait ajouté). Aucun numéro de téléphone dans les fichiers de données.

- [ ] **Step 1 : Types de données** — `src/infrastructure/seed/data/types.ts`

```ts
export type Loc<T> = { fr: T; en: T }
export type SeedStack = { name: string; slug?: string /* défaut slugify(name) ; explicite pour C# → csharp, .NET → dotnet, ASP.NET Core → aspnet-core */; category: 'language'|'frontend'|'backend'|'architecture'|'testing'|'devops'|'security'|'ai'; simpleIconSlug?: string; featured?: boolean; order: number }
export type SeedService = { key: string; icon: string; tint: 'amber'|'violet'|'blue'|'teal'; order: number; title: Loc<string>; description: Loc<string> }
export type SeedExperience = { key: string; kind: 'work'|'education'; organization: string; location?: string; start: string; end: string | null; order: number; stacks: string[]; role: Loc<string>; summary: Loc<string>; highlights: Loc<string[]> }
export type SeedProject = { slug: string; year: number; client: string; featured: boolean; order: number; stacks: string[]; repo?: string; title: Loc<string>; tagline: Loc<string>; summary: Loc<string>; caseStudy: Loc<string[]> }
```
`stacks` (dans expériences/projets) = **slugs de stacks** = `slugify(name)`.

- [ ] **Step 2 : Tests de données qui échouent**

`tests/unit/infrastructure/seed/seed-data.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { SERVICE_ICON_NAMES, slugify, STACK_CATEGORIES } from '@/domain'
import { hasSimpleIcon } from '@/infrastructure/icons/simple-icons-resolver'
import { experiences } from '@/infrastructure/seed/data/experiences'
import { projects } from '@/infrastructure/seed/data/projects'
import { services } from '@/infrastructure/seed/data/services'
import { site } from '@/infrastructure/seed/data/site'
import { stacks } from '@/infrastructure/seed/data/stacks'

const stackSlugs = new Set(stacks.map((s) => s.slug ?? slugify(s.name)))
const strings = (o: unknown): string[] =>
  typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strings) : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : []

describe('seed — stacks', () => {
  it('slugs uniques', () => expect(stackSlugs.size).toBe(stacks.length))
  it('catégories valides', () => {
    const valid = new Set<string>(STACK_CATEGORIES)
    for (const s of stacks) expect(valid.has(s.category), s.name).toBe(true)
  })
  it('tout simpleIconSlug déclaré existe dans simple-icons (sinon retirer → monogramme)', () => {
    for (const s of stacks) if (s.simpleIconSlug) expect(hasSimpleIcon(s.simpleIconSlug), `${s.name}:${s.simpleIconSlug}`).toBe(true)
  })
  it('≥ 28 technologies', () => expect(stacks.length).toBeGreaterThanOrEqual(28))
})
describe('seed — références', () => {
  it('projets et expériences ne citent que des stacks existants', () => {
    for (const e of [...projects, ...experiences]) for (const slug of e.stacks) expect(stackSlugs.has(slug), slug).toBe(true)
  })
  it('icônes de service dans la liste blanche', () => {
    for (const s of services) expect(SERVICE_ICON_NAMES).toContain(s.icon)
  })
  it('4 services, 5 projets (≥ 3 mis en avant), slugs de projets uniques', () => {
    expect(services).toHaveLength(4)
    expect(projects).toHaveLength(5)
    expect(projects.filter((p) => p.featured).length).toBeGreaterThanOrEqual(3)
    expect(new Set(projects.map((p) => p.slug)).size).toBe(5)
  })
})
describe('seed — contenu', () => {
  const all = strings([site, services, experiences, projects])
  it('aucune chaîne vide, FR et EN présents partout', () => {
    for (const s of all) expect(s.trim().length).toBeGreaterThan(0)
  })
  it('aucun numéro de téléphone dans les données commitées', () => {
    // Formats FR : « +33 6 46 82 48 26 » et « 06 46 82 48 26 » (les dates ISO 2024-10-01 ne doivent pas matcher).
    const PHONE = /(\+\d{1,3}[\s.-]?\d[\d\s.-]{7,}|\b0\d(?:[\s.-]?\d{2}){4}\b)/
    for (const s of all) expect(PHONE.test(s), s).toBe(false)
  })
  it('aucun témoignage inventé', () => {
    expect(JSON.stringify(site).toLowerCase()).not.toMatch(/témoignage|testimonial/)
  })
})
```
`tests/unit/infrastructure/seed/seed-lexical.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { lexicalFromParagraphs } from '@/infrastructure/seed/lexical'

describe('lexicalFromParagraphs', () => {
  it('construit un état Lexical valide avec un paragraphe par texte', () => {
    const s = lexicalFromParagraphs(['Un', 'Deux'])
    expect(s.root.type).toBe('root')
    expect(s.root.children).toHaveLength(2)
    expect((s.root.children[1] as { children: Array<{ text: string }> }).children[0]!.text).toBe('Deux')
  })
})
```
Run → **FAIL**.

- [ ] **Step 3 : `src/infrastructure/seed/lexical.ts`**

```ts
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function lexicalFromParagraphs(paragraphs: string[]): SerializedEditorState {
  return {
    root: {
      type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, textStyle: '',
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      })),
    },
  } as unknown as SerializedEditorState
}
```

- [ ] **Step 4 : Données — `src/infrastructure/seed/data/*.ts`** (FR ci-dessous = source ; EN = traduction fidèle)

**`site.ts`** — export `site` :
- `identity` : `name: 'Denis Bucspun'`, `location: 'Nanterre, France'`, `jobTitle` FR `Développeur Full Stack` / EN `Full Stack Developer`, `tagline` FR « Je conçois des applications web et mobiles solides, de l’idée au déploiement, avec une vraie exigence d’architecture, de tests et de qualité logicielle. »
- `hero` : `eyebrow` « Bonjour, je suis » ; `rotatingTitles` « Développeur Full Stack », « Ingénieur IA / GenAI » ; `ctaPrimary` « Voir mes projets » ; `ctaSecondary` « Télécharger mon CV » ; `chips` `[{value:'3 ans', label:'d’alternance'}, {value:'.NET · React', label:'& IA générative'}]` ; `trustedByTitle` « Ils m’ont fait confiance » ; `trustedBy` Bouygues Telecom Business Solutions, Axima Concept, Ville de Clamart (**sans URL**).
- `about` : `headline` « Concevoir avec rigueur, livrer avec pragmatisme » ; `bio` : « Développeur Full Stack avec une expérience concrète en conception et développement d’applications web et mobiles. Habitué aux backends .NET et ASP.NET Core, aux frontends React, React Native et TypeScript et à l’intégration d’API externes. Je pratique la Clean Architecture, le Domain-Driven Design, les tests automatisés et les déploiements cloud sur Azure. Côté IA, je conçois des solutions d’IA générative (LLM, agents, systèmes multi-agents, MCP, RAG, tool calling) et j’utilise Claude Code et Codex pour itérer vite sans sacrifier la qualité. À l’aise pour arbitrer entre dette technique, qualité logicielle et vitesse de livraison. » ; `autoStats: true`.
- `process` : `headline` « De l’idée à la production » ; `steps` : ① **Comprendre le besoin** — « Partir du besoin métier et des utilisateurs : échanges réguliers, cadrage et priorisation. » ② **Modéliser** — « Modélisation métier, conception d’API et choix d’architecture (Clean Architecture, DDD, hexagonale). » ③ **Construire** — « Développement full stack itératif, accéléré par des workflows assistés par IA (Claude Code, Codex). » ④ **Tester** — « Tests unitaires et applicatifs (xUnit, NSubstitute), suivi de la couverture et de la qualité. » ⑤ **Déployer & faire évoluer** — « Conteneurisation, CI/CD (GitHub Actions, Azure DevOps), déploiement sur Azure, puis run et évolution. »
- `contact` : `email: 'bucspun.d@gmail.com'`, `linkedin: 'https://www.linkedin.com/in/denis-bucspun-13198a23b/'`, `github: 'https://github.com/BDenisss'`, `showPhone: false`, `phone` : **lu depuis `process.env.SEED_PHONE` dans `run.ts`**, jamais dans le fichier.
- `seo` : `title` « Denis Bucspun — Développeur Full Stack & Ingénieur IA » ; `description` « Portfolio : développement full stack (React, .NET), architecture logicielle, IA générative et DevOps. »

**`services.ts`** — 4 entrées : `full-stack` (`layers`, `amber`, ordre 1) « Développement Full Stack » — « Applications web et mobiles de bout en bout : React, Next.js et React Native / Expo côté front, ASP.NET Core et API REST côté back. » · `architecture` (`blocks`, `violet`, 2) « Architecture & qualité » — « Clean Architecture, DDD et architecture hexagonale pour isoler la logique métier ; tests xUnit / NSubstitute et stratégie de couverture. » · `ia` (`bot`, `blue`, 3) « IA générative & agents » — « LLM, agents et systèmes multi-agents, MCP, RAG et tool calling pour connecter les modèles à vos données, outils et services. » · `cloud` (`cloud`, `teal`, 4) « Cloud, DevOps & sécurité » — « Docker, Azure, CI/CD (GitHub Actions, Azure DevOps) ; authentification OAuth 2.0 / PKCE et Microsoft Entra ID (SSO). »

**`stacks.ts`** — ≥ 28 entrées `{ name, category, simpleIconSlug?, featured?, order }`. Liste imposée (le slug Simple Icons n'est **pas** garanti : pour chaque `?`, vérifier avec `hasSimpleIcon` ; s'il n'existe pas, **retirer** `simpleIconSlug` → monogramme) :
- `language` : TypeScript (`typescript`), JavaScript (`javascript`), C# (— ; `slug: 'csharp'`), SQL (—), Python (`python`), PHP (`php`), Java (`?openjdk`)
- `frontend` : React (`react`), React Native (`react`), Expo (`expo`), Next.js (`nextdotjs`), Angular (`angular`), Tailwind CSS (`tailwindcss`), Figma (`figma`), PrimeNG (—), Twig (`?twig`)
- `backend` : .NET (`dotnet` ; `slug: 'dotnet'`), ASP.NET Core (`dotnet` ; `slug: 'aspnet-core'`), Entity Framework Core (—), Symfony (`symfony`), MySQL (`mysql`), PostgreSQL (`postgresql`)
- `architecture` : Clean Architecture (—), DDD (—), Architecture hexagonale (—), SOLID (—)
- `testing` : xUnit (—), NUnit (—), NSubstitute (—)
- `devops` : Docker (`docker`), GitHub Actions (`githubactions`), Azure DevOps (`?azuredevops`), Microsoft Azure (`?microsoftazure`), Git (`git`)
- `security` : OAuth 2.0 (`?oauth`), Microsoft Entra ID (`?microsoftentra`), JWT (`jsonwebtokens`)
- `ai` : Claude (`?claude`), OpenAI Codex (`openai`), MCP (`?modelcontextprotocol`), RAG (—), Agents LLM (—)
- + pour le projet portfolio : Payload CMS (`?payloadcms`), GSAP (`?greensock`), Three.js (`threedotjs`) en `frontend`/`backend` selon le cas.
`featured: true` pour TypeScript, React, .NET, Docker, Claude, Azure.

**`experiences.ts`** — `bouygues` : `work`, « Bouygues Telecom Business Solutions », lieu « Île-de-France », `2024-10-01` → `2026-10-01`, ordre 1, rôle « Développeur Full Stack & DevOps (alternance) », résumé « Conception et développement de solutions internes dans un contexte Logiciel & IA, de l’idée/prototype jusqu’au déploiement et au run. », highlights (6, du CV) : produit pré-pilote avec API externes (Google Places, OpenStreetMap Overpass, Microsoft Graph) · backend .NET en cinq couches (DDD, hexagonale) · tests xUnit/NSubstitute et écarts de couverture documentés · frontend React Native/Expo/TypeScript (iOS, Android, web) sur API REST OAuth 2.0 PKCE + Entra ID SSO · Docker, Azure App Service / Static Web Apps, CI/CD GitHub Actions + Azure DevOps · solutions IA générative (LLM, agents, MCP, RAG, tool calling) avec Claude Code et Codex ; mémoire sur l’industrialisation logicielle. — `axima` : `work`, « Axima Concept », `2023-10-01` → `2024-09-01`, ordre 2, « Développeur Full Stack (alternance) », supervision Angular 12 / PrimeNG / Java en agile, maquettes Figma, échanges avec les utilisateurs. — `clamart` : `work`, « Ville de Clamart », `2023-02-01` → `2023-06-01`, ordre 3, « Développeur Full Stack », quiz Symfony/MySQL/JS/Tailwind/Twig, algorithmes de scoring, optimisation SQL, explications automatiques. — `iim` : `education`, « IIM Digital School — Pôle Léonard de Vinci », lieu « Paris », `2025-09-01` → `2026-09-01`, ordre 4, rôle « Master — Ingénierie Web & Innovation Digitale », résumé « Mémoire : De l’innovation interne à l’industrialisation logicielle — cadres qualité, dette technique et transition du prototype vers un logiciel maintenable. ».

**`projects.ts`** — 5 projets (slug, année, client, stacks, `featured`) : `plateforme-interne-bouygues` (2024, « Bouygues Telecom Business Solutions », **featured**, stacks : react-native, expo, typescript, aspnet-core, entity-framework-core, csharp, docker, microsoft-azure, oauth-2-0, microsoft-entra-id, github-actions, azure-devops) « Plateforme interne web & mobile » ; `dywikis` (2022, « Projet personnel », **featured**, php, mysql, javascript) « Dywiki’s » ; `supervision-axima` (2023, « Axima Concept », **featured**, angular, primeng, java, figma) « Application de supervision » ; `quiz-ville-de-clamart` (2023, « Ville de Clamart », symfony, mysql, javascript, tailwind-css, twig) « Application de quiz » ; `ce-portfolio` (2026, « Projet personnel », **featured**, `repo: 'https://github.com/BDenisss/Portfolio2026-V2'`, next-js, react, typescript, payload-cms, tailwind-css, gsap, three-js, postgresql, docker) « Ce portfolio ». `tagline`/`summary`/`caseStudy` FR = reformulation **stricte** des puces du CV (voir Task 8 cadrage : Bouygues → 4 paragraphes backend / tests / frontend / delivery ; Dywiki’s → schéma BDD, PHP 8.1/MySQL/JS, API TMDB, indexation ; Axima → Angular 12/PrimeNG/Java, agile, maquettes Figma, échanges utilisateurs ; Clamart → Symfony, scoring frontend, SQL sous charge, explications auto ; portfolio → Next.js 16 + Payload, design Liquid Glass, hero cinématique GSAP/Lenis/react-three-fiber avec avatar Memoji 3D généré avec Higgsfield, contenu FR/EN administrable). Aucun chiffre ni résultat inventé.
> Les slugs `stacks` = `s.slug ?? slugify(name)` (ex. `slugify('OAuth 2.0')` = `oauth-2-0`, `slugify('Next.js')` = `next-js` ; `slugify('C#')` donnerait `c` → d'où le `slug` explicite `csharp`). Le test `seed-data` détecte toute référence orpheline. `run.ts` et les tests utilisent la **même** fonction `stackSlug(s) = s.slug ?? slugify(s.name)` (à exporter de `src/infrastructure/seed/data/stacks.ts`).

- [ ] **Step 5 : `upsert.ts` et `run.ts`**

`src/infrastructure/seed/upsert.ts` :
```ts
import type { CollectionSlug, Payload } from 'payload'

const context = { disableRevalidate: true }

/** Crée ou met à jour par `slug`. `common` = champs non localisés ; `fr`/`en` = champs localisés. */
export async function upsertBySlug(
  payload: Payload, collection: CollectionSlug, slug: string,
  data: { common: Record<string, unknown>; fr: Record<string, unknown>; en: Record<string, unknown> },
): Promise<number | string> {
  const found = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, pagination: false, overrideAccess: true, locale: 'fr' })
  const base = { collection, overrideAccess: true, context } as const
  let id: number | string
  if (found.docs[0]) {
    id = found.docs[0].id
    await payload.update({ ...base, id, data: { slug, ...data.common, ...data.fr }, locale: 'fr' } as never)
  } else {
    id = (await payload.create({ ...base, data: { slug, ...data.common, ...data.fr }, locale: 'fr' } as never)).id
  }
  await payload.update({ ...base, id, data: data.en, locale: 'en' } as never)
  return id
}
```
`src/infrastructure/seed/run.ts` — orchestrateur `async function main()` : `getPayload({ config })` → (1) médias CV : si `img/CV_Denis_Bucspun_2026_FR.pdf` et `..._IA.pdf` existent, `payload.create({ collection:'media', filePath, data:{ alt:'CV …' } })` **si pas déjà présents** (recherche par `filename`) ; (2) stacks (upsert par `slug = slugify(name)`) ; (3) services (clé = `key` stockée dans `slug`? → **non** : `services` n'a pas de slug ; faire `find` par `title` FR, sinon créer) ; idem experiences par `organization + start` ; (4) projets via `upsertBySlug` avec `_status: 'published'`, `stacks` = ids résolus, `caseStudy: lexicalFromParagraphs(...)` par locale ; (5) `payload.updateGlobal({ slug:'site', data, locale:'fr' })` puis `en` ; `contact.phone = process.env.SEED_PHONE || undefined` ; `cv.cvFullstack/cvAi` = ids des médias s'ils existent ; (6) `console.log` d'un récap ; `process.exit(0)`. Contexte `{ disableRevalidate: true }` partout.

- [ ] **Step 6 : Test d'idempotence (base réelle)**

`tests/integration/seed.int.test.ts` : exécuter `main()` (exporté) **deux fois** puis vérifier `stacks.totalDocs`, `projects.totalDocs` (=5), `services.totalDocs` (=4), `experiences.totalDocs` (=4) identiques après la 2ᵉ exécution, et que `find` FR/EN d'un projet renvoie des `title` différents.

- [ ] **Step 7 : Vérifier**

Run : `pnpm test` (données) **PASS** → `pnpm seed` (2 fois) → `pnpm test:int` **PASS** → ouvrir `/admin` : collections remplies, projets **publiés**, global « Site » rempli en FR **et** EN.

- [ ] **Step 8 : Commit**

```bash
git add src/infrastructure/seed tests/unit/infrastructure/seed/seed-data.test.ts tests/unit/infrastructure/seed/seed-lexical.test.ts tests/integration/seed.int.test.ts
git commit -m "feat(seed): add idempotent FR/EN seed built from the CVs"
```

---

## Task 9 : Primitives UI, navigation, dock, footer, scroll, page shell

**Files :**
- Create : `src/presentation/lib/gsap.ts`, `src/presentation/components/ui/{Button,Magnetic,Chip,Eyebrow,SectionHeading,Section,Reveal,RevealController,Icon,LangSwitch,Nav,Dock,Footer,SmoothScroll,nav-items}.ts(x)`, `src/presentation/components/ui/use-active-section.ts`, `src/app/(site)/[locale]/(shell)/layout.tsx`, `src/app/(site)/[locale]/(shell)/page.tsx`, `src/presentation/i18n/messages/{fr,en}/{nav,footer}.json`
- Create (**stubs remplacés par leur tâche propriétaire**) : `src/presentation/components/sections/{Hero,About,Services,TechStack,Projects,Journey,Process,Contact}.tsx`, `src/presentation/components/cinematic/Interlude.tsx`, `src/app/(site)/[locale]/(shell)/_actions/submit-contact.ts` (stub d'action, remplacé en T16)
- Test : `tests/unit/presentation/nav-items.test.ts`, `tests/unit/presentation/button.test.tsx`

**Interfaces :**
- Consumes : `Glass`, `cn` (T1/T2) ; `getPortfolioUseCases()` (`@/composition`), cas d'usage `GetSiteProfile` / `GetHomePage` et types du domaine `@/domain` (T7) ; `Link`, `usePathname` (`@/presentation/i18n/navigation`, T6)
- Produces :
  - `src/presentation/lib/gsap.ts` : `export { gsap, ScrollTrigger, useGSAP }` (plugins enregistrés une seule fois, garde `typeof window`)
  - `type SectionId = 'hero'|'about'|'services'|'stack'|'projects'|'journey'|'process'|'contact'` ; `NAV_ITEMS: readonly { id: SectionId }[]` (about, services, stack, projects, journey, contact) ; `DOCK_ITEMS: readonly { id: SectionId; icon: 'home'|'user'|'layers'|'folder-kanban'|'mail' }[]` (hero, about, services, projects, contact) — `nav-items.ts`
  - `<Button variant?='primary'|'secondary' href? onClick? icon?='arrow-up-right'|'download'|'send' size?='md'|'lg' magnetic? className? …button/a props>` — `<a>` si `href`, sinon `<button type="button">` ; `min-height: 2.75rem` (44px)
  - **Convention d'accessibilité des sections :** `<SectionHeading id="<sectionId>-title" …>` et `<Section id="<sectionId>" labelledBy="<sectionId>-title">` (ex. `about-title`) ; le hero utilise `hero-title` (posé sur le `h1`)
  - `<Chip tone?='glass'|'accent'>` · `<Eyebrow>` · `<SectionHeading eyebrow title id align?>` · `<Section id labelledBy? className?>` (rend `<section id data-section aria-labelledby class="section-y scroll-mt-28"><div class="container-x">…`) · `<Reveal as? className? delay?>` (serveur : ajoute la classe `reveal`) · `<RevealController/>` (client)
  - `ServiceIcon({ name: ServiceIconName; className? })`, `UiIcon({ name; className? })` — tables d'icônes **statiques** (jamais `icons` en bloc de lucide)
  - Signatures **figées** des sections (utilisées par `page.tsx`) :
    `Hero({ site, cinematic })` · `About({ site, stats })` (`stats: {years,experiences,technologies,projects}`) · `Services({ services })` · `TechStack({ stacks })` · `Projects({ projects, stacks })` · `Journey({ experiences })` · `Process({ headline, steps })` · `Contact({ site, submitAction })` · `Interlude({ cinematic })`
- Clés `nav` : `label`, `cta`, `items.hero|about|services|stack|projects|journey|contact`, `dockLabel` ; clés `footer` : `rights`, `builtWith`, `backToTop`, `linkedin`, `github`, `email`

- [ ] **Step 1 : Tests qui échouent**

`tests/unit/presentation/nav-items.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { DOCK_ITEMS, NAV_ITEMS } from '@/presentation/components/ui/nav-items'

const SECTION_IDS = ['hero', 'about', 'services', 'stack', 'projects', 'journey', 'process', 'contact']

describe('nav-items', () => {
  it('le dock mobile a 5 items maximum', () => {
    expect(DOCK_ITEMS.length).toBeLessThanOrEqual(5)
  })
  it('tous les ids existent dans le contrat des sections', () => {
    for (const i of [...NAV_ITEMS, ...DOCK_ITEMS]) expect(SECTION_IDS).toContain(i.id)
  })
  it('la nav desktop suit l’ordre de la page', () => {
    expect(NAV_ITEMS.map((i) => i.id)).toEqual(['about', 'services', 'stack', 'projects', 'journey', 'contact'])
  })
})
```
`tests/unit/presentation/button.test.tsx` :
```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/presentation/components/ui/Button'

describe('<Button>', () => {
  it('rend un <a> avec href', () => {
    render(<Button href="#x">Go</Button>)
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '#x')
  })
  it('rend un <button type=button> sans href', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'button')
  })
  it('garantit une cible tactile ≥ 44px (min-h-11)', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button').className).toMatch(/min-h-11/)
  })
})
```
Run → **FAIL**.

- [ ] **Step 2 : Implémenter les primitives**

`src/presentation/lib/gsap.ts` :
```ts
'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }
```
`src/presentation/components/ui/nav-items.ts` :
```ts
export type SectionId = 'hero' | 'about' | 'services' | 'stack' | 'projects' | 'journey' | 'process' | 'contact'
export const NAV_ITEMS = [{ id: 'about' }, { id: 'services' }, { id: 'stack' }, { id: 'projects' }, { id: 'journey' }, { id: 'contact' }] as const satisfies readonly { id: SectionId }[]
export const DOCK_ITEMS = [
  { id: 'hero', icon: 'home' }, { id: 'about', icon: 'user' }, { id: 'services', icon: 'layers' },
  { id: 'projects', icon: 'folder-kanban' }, { id: 'contact', icon: 'mail' },
] as const satisfies readonly { id: SectionId; icon: string }[]
```
`Button.tsx` — pilule ; **primary** : `bg-[var(--ink)] text-white` ; **secondary** : `<Glass variant="pill" interactive>` ; classes communes `inline-flex min-h-11 items-center justify-center gap-2 px-5 font-medium transition-[transform,box-shadow] duration-200 hover:-translate-y-px focus-visible:…` ; `size='lg'` → `min-h-12 px-7 text-base` ; `icon` → `<UiIcon aria-hidden>` ; si `magnetic` → enveloppe `<Magnetic>`.
`Magnetic.tsx` (client) — un seul élément focal : `pointermove` avec `gsap.quickTo` (facteur 0,3, plafonné à ±10px), **désactivé** sous `prefers-reduced-motion` et sur pointeurs grossiers (`(pointer: coarse)`), handler nommé + `removeEventListener` au cleanup.
`Reveal.tsx` (serveur) : `export function Reveal({ as: Tag = 'div', className, delay, ...rest })` → `<Tag className={cn('reveal', className)} style={delay ? { transitionDelay: … }: undefined}>` (le `delay` est indicatif ; le stagger est géré par le batch).
`RevealController.tsx` (client) :
```tsx
'use client'
import { usePathname } from '@/presentation/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/presentation/lib/gsap'

export function RevealController() {
  const pathname = usePathname()
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('.reveal')
        try {
          ScrollTrigger.batch(items, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, overwrite: true }),
          })
        } catch {
          gsap.set(items, { clearProps: 'all' }) // échec GSAP : le contenu doit rester visible
        }
      })
      return () => mm.revert()
    },
    { dependencies: [pathname] },
  )
  return null
}
```
`SmoothScroll.tsx` (client) : Lenis piloté par le ticker GSAP —
```tsx
'use client'
import Lenis from 'lenis'
import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/presentation/lib/gsap'

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: true })
    const tick = (t: number) => lenis.raf(t * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
  return null
}
```
`Icon.tsx` : `ServiceIcon` (table `Record<ServiceIconName, LucideIcon>` sur les 12 noms de `SERVICE_ICON_NAMES`) et `UiIcon` (table : `arrow-up-right`, `download`, `send`, `home`, `user`, `layers`, `folder-kanban`, `mail`, `chevron-down`, `external-link`, `calendar`, `briefcase`, `code`, `sparkles`). **Pas d'icônes de marque** (Lucide 1.x les a retirées) : liens sociaux en texte. Vérifier les noms exacts exportés par `lucide-react@1.49` (`Home` peut s'appeler `House`).
`use-active-section.ts` : `useActiveSection(ids: readonly string[]): string | null` — `IntersectionObserver` avec `rootMargin: '-40% 0px -50% 0px'`.
`LangSwitch.tsx` (client, `data-testid="lang-switch"`) : deux `Link` `FR` / `EN` (`locale` du `Link` de `@/presentation/i18n/navigation`, chemin courant conservé), dans une pilule verre ; `aria-current="true"` sur la langue active, `hrefLang`, `aria-label={t('common.language.switch')}`, cibles ≥ 44px.
`Nav.tsx` (client, `data-testid="nav"`) : props `{ name: string; jobTitle: string }` ; `<Glass as="nav" variant="pill" refract aria-label={t('nav.label')}>` fixe `top-3 inset-x-3 md:top-4 md:inset-x-6 z-50` ; gauche : logo (monogramme « DB » dans une pastille verre + `name` + `jobTitle` en `--ink-muted`, `jobTitle` masqué < md) ; centre (≥ md) : `NAV_ITEMS` avec `aria-current` + pastille blanche sur la section active (`useActiveSection`) ; droite : `LangSwitch` + `Button` « Discutons » (≥ lg) → `#contact`. **Sur la home** `href="#id"` ; **ailleurs** (`usePathname() !== '/'`) `href="/#id"`. Sous md : uniquement logo + `LangSwitch` (la navigation passe par le dock).
`Dock.tsx` (client, `data-testid="dock"`) : `md:hidden fixed bottom-3 inset-x-3 z-50`, `<Glass as="nav" variant="dock" aria-label={t('nav.dockLabel')}>`, 5 `DOCK_ITEMS` (icône 20px + libellé `text-[0.75rem]`, cible `min-h-11 min-w-11`, `gap` ≥ 8px), actif = pastille blanche + `aria-current`, `padding-bottom: env(safe-area-inset-bottom)`.
`Footer.tsx` (serveur) : `{ site: SiteProfile }` — nom, `© {année} {name}`, liens texte LinkedIn / GitHub / e-mail (si présents) + `builtWith`, bouton « Retour en haut ».
`Section.tsx`, `SectionHeading.tsx`, `Eyebrow.tsx`, `Chip.tsx` selon les contrats ci-dessus et `MASTER.md` (eyebrow : `text-[0.8125rem] uppercase tracking-[0.14em] text-[var(--accent-text)]`).

- [ ] **Step 3 : Shell + page + stubs**

`(shell)/layout.tsx` (serveur) :
```tsx
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { Dock } from '@/presentation/components/ui/Dock'
import { Footer } from '@/presentation/components/ui/Footer'
import { Nav } from '@/presentation/components/ui/Nav'
import { RevealController } from '@/presentation/components/ui/RevealController'
import { SmoothScroll } from '@/presentation/components/ui/SmoothScroll'
import { getPortfolioUseCases } from '@/composition'
import { isLocale } from '@/domain'

export default async function ShellLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const site = await getPortfolioUseCases().getSiteProfile.execute(locale)
  return (
    <>
      <SmoothScroll />
      <RevealController />
      <Nav name={site.name} jobTitle={site.jobTitle} />
      <main id="main" tabIndex={-1} className="pb-28 md:pb-0">{children}</main>
      <Footer site={site} />
      <Dock />
    </>
  )
}
```
`(shell)/page.tsx` (**mince** : elle appelle **un** cas d'usage et passe des données aux sections ; imports : `getPortfolioUseCases` de `@/composition`, `isLocale` de `@/domain`, `submitContact` de `./_actions/submit-contact`) : `export const revalidate = 3600` ; `generateMetadata` (titre/description de `site.seo`, repli sur `common.meta*`, `openGraph.images` = `site.seo.ogImage`) ; composition exacte :
```tsx
export default async function HomeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const home = await getPortfolioUseCases().getHomePage.execute(locale)
  return (
    <>
      <Hero site={home.site} cinematic={home.cinematic} />
      <Interlude cinematic={home.cinematic} />
      <About site={home.site} stats={home.stats} />
      <Services services={home.services} />
      <TechStack stacks={home.stacks} />
      <Projects projects={home.projects} stacks={home.stacks} />
      <Journey experiences={home.experiences} />
      <Process headline={home.site.process.headline} steps={home.site.process.steps} />
      <Contact site={home.site} submitAction={submitContact} />
    </>
  )
}
```
**Stubs** (un fichier par section, **signature exacte**, remplacés ensuite) :
```tsx
import { Section } from '@/presentation/components/ui/Section'
export function Services(_props: { services: Service[] }) {
  return <Section id="services"><h2 className="sr-only">Services</h2></Section>
}
```
(idem pour les 8 sections ; `Interlude` : `return null`). `Hero` stub : `<Section id="hero"><h1>{site.name}</h1></Section>`. `Contact` stub : `Contact(_props: { site: SiteProfile; submitAction: unknown })`. **Stub d'action** `_actions/submit-contact.ts` (remplacé en T16) :
```ts
'use server'

type ContactFormState = { status: 'idle' } | { status: 'error' }

export async function submitContact(_previous: ContactFormState, _formData: FormData): Promise<ContactFormState> {
  return { status: 'error' }
}
```
`nav.json` FR : `label` « Navigation principale », `cta` « Discutons », `dockLabel` « Navigation rapide », `items` : Accueil, À propos, Services, Stack, Projets, Parcours, Contact. `footer.json` FR : `rights` « Tous droits réservés. », `builtWith` « Conçu avec Next.js, Payload et une bonne dose de verre liquide. », `backToTop` « Retour en haut », `linkedin` « LinkedIn », `github` « GitHub », `email` « E-mail ». + EN.

- [ ] **Step 4 : Vérifier**

Run : `pnpm test` **PASS** · `pnpm typecheck && pnpm lint` verts · `pnpm db:up && pnpm seed && pnpm build` réussit · `pnpm start` puis, dans le **navigateur intégré**, captures de `/fr` à **375, 768, 1024, 1440** : nav flottante en verre, dock visible < 768px uniquement, **aucun scroll horizontal** (`document.documentElement.scrollWidth <= innerWidth`), lien d'évitement visible au focus, bascule FR/EN fonctionnelle. Vérifier `MASTER.md` (contrastes, focus, cibles 44px).

- [ ] **Step 5 : Commit**

```bash
git add src/presentation/lib/gsap.ts src/presentation/components/ui src/presentation/components/sections src/presentation/components/cinematic/Interlude.tsx "src/app/(site)/[locale]/(shell)" src/presentation/i18n/messages/fr/nav.json src/presentation/i18n/messages/en/nav.json src/presentation/i18n/messages/fr/footer.json src/presentation/i18n/messages/en/footer.json tests/unit/presentation/nav-items.test.ts tests/unit/presentation/button.test.tsx
git commit -m "feat(ui): add primitives, floating nav, mobile dock, footer, smooth scroll and page shell with section stubs"
```

---

## Task 10 : Moteur cinématique — capacités, avatar 3D, hero motion, scrub

**Files :**
- Create : `src/presentation/cinematic/hero-mode.ts`, `src/presentation/cinematic/capabilities.ts`, `src/presentation/components/cinematic/{GlassOrb.tsx,GlassOrb.module.css,AvatarCanvas.tsx,HeroStage.tsx,HeroMotion.tsx,ScrubVideo.tsx}`, `scripts/media/make-fixture-glb.mjs`, `public/fixtures/avatar-fixture.glb` (généré)
- Modify : `src/presentation/components/cinematic/Interlude.tsx` (remplace le stub)
- Test : `tests/unit/presentation/cinematic/hero-mode.test.ts`, `tests/unit/presentation/cinematic/capabilities.test.ts`

**Interfaces :**
- Consumes : `CinematicMedia`, `MediaAsset` (T7) ; `Glass` (T2) ; `gsap`, `ScrollTrigger`, `useGSAP` (T9)
- Produces :
  - `type Capabilities = { reducedMotion: boolean; saveData: boolean; deviceMemory?: number; hardwareConcurrency?: number; webgl: boolean; mobile: boolean }` ; `type HeroMedia = { hasModel: boolean; hasVideo: boolean; hasPortrait: boolean; hasPoster: boolean }` ; `type HeroMode = 'avatar3d'|'video'|'poster'|'orb'` ; `isLowPower(c): boolean` ; `decideHeroMode(c, m): { mode: HeroMode; animate: boolean }` ; `detectCapabilities(win?: Window): Capabilities`
  - `<GlassOrb size? tint?='violet'|'blue'|'teal' className?>` (CSS pur, `aria-hidden`, dérive lente, coupée sous reduced-motion)
  - `<HeroStage cinematic avatarAlt>` (client) : cadre média (poster → vidéo → 3D avec replis) ; pose `data-hero-mode` et `data-hero-ready` sur son élément racine `[data-testid="hero-frame"]`
  - `<HeroMotion className? children>` (client) : rend `<section id="hero">` ; timeline scroll (pin **desktop ≥ 768px** uniquement) sur `[data-hero-frame]`, `[data-hero-chip]` ; parallax décor sur mobile ; tout sous `gsap.matchMedia`
  - `<ScrubVideo src className?>` (client) ; `<Interlude cinematic>` (serveur : `null` si pas de `scrubVideo`)

- [ ] **Step 1 : Tests de la logique pure (échouent)**

`tests/unit/presentation/cinematic/hero-mode.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { decideHeroMode, isLowPower, type Capabilities, type HeroMedia } from '@/presentation/cinematic/hero-mode'

const base: Capabilities = { reducedMotion: false, saveData: false, webgl: true, mobile: false, deviceMemory: 8, hardwareConcurrency: 8 }
const all: HeroMedia = { hasModel: true, hasVideo: true, hasPortrait: true, hasPoster: true }
const none: HeroMedia = { hasModel: false, hasVideo: false, hasPortrait: false, hasPoster: false }

describe('isLowPower', () => {
  it('saveData, ≤ 4 Go ou ≤ 4 cœurs', () => {
    expect(isLowPower({ ...base, saveData: true })).toBe(true)
    expect(isLowPower({ ...base, deviceMemory: 4 })).toBe(true)
    expect(isLowPower({ ...base, hardwareConcurrency: 4 })).toBe(true)
    expect(isLowPower(base)).toBe(false)
  })
  it('valeurs inconnues → pas de basse conso', () => {
    expect(isLowPower({ ...base, deviceMemory: undefined, hardwareConcurrency: undefined })).toBe(false)
  })
})

describe('decideHeroMode', () => {
  it('tout dispo + machine correcte → avatar3d animé', () => {
    expect(decideHeroMode(base, all)).toEqual({ mode: 'avatar3d', animate: true })
  })
  it('reduced-motion → poster statique', () => {
    expect(decideHeroMode({ ...base, reducedMotion: true }, all)).toEqual({ mode: 'poster', animate: false })
  })
  it('reduced-motion sans image → orbe statique', () => {
    expect(decideHeroMode({ ...base, reducedMotion: true }, none)).toEqual({ mode: 'orb', animate: false })
  })
  it('pas de WebGL → vidéo', () => {
    expect(decideHeroMode({ ...base, webgl: false }, all)).toEqual({ mode: 'video', animate: true })
  })
  it('appareil faible → vidéo (pas de GLB)', () => {
    expect(decideHeroMode({ ...base, deviceMemory: 2 }, all).mode).toBe('video')
  })
  it('saveData → poster (ni GLB ni vidéo)', () => {
    expect(decideHeroMode({ ...base, saveData: true }, all).mode).toBe('poster')
  })
  it('modèle seul, pas de vidéo → avatar3d', () => {
    expect(decideHeroMode(base, { ...none, hasModel: true }).mode).toBe('avatar3d')
  })
  it('aucun média → orbe', () => {
    expect(decideHeroMode(base, none)).toEqual({ mode: 'orb', animate: true })
  })
})
```
`tests/unit/presentation/cinematic/capabilities.test.ts` (jsdom) : fournit un faux `window` (`matchMedia` stub renvoyant `matches` selon la requête, `navigator: { hardwareConcurrency: 8, deviceMemory: 8, connection: { saveData: true } }`, `document.createElement('canvas').getContext` stub) et vérifie `reducedMotion`, `saveData`, `webgl` (true/false selon le stub), `mobile` (`(max-width: 767px)`).
Run → **FAIL**.

- [ ] **Step 2 : Implémenter la logique pure**

`src/presentation/cinematic/hero-mode.ts` :
```ts
export type Capabilities = { reducedMotion: boolean; saveData: boolean; deviceMemory?: number; hardwareConcurrency?: number; webgl: boolean; mobile: boolean }
export type HeroMedia = { hasModel: boolean; hasVideo: boolean; hasPortrait: boolean; hasPoster: boolean }
export type HeroMode = 'avatar3d' | 'video' | 'poster' | 'orb'

export function isLowPower(c: Capabilities): boolean {
  return c.saveData || (c.deviceMemory !== undefined && c.deviceMemory <= 4) || (c.hardwareConcurrency !== undefined && c.hardwareConcurrency <= 4)
}

export function decideHeroMode(c: Capabilities, m: HeroMedia): { mode: HeroMode; animate: boolean } {
  const still = m.hasPoster || m.hasPortrait
  if (c.reducedMotion) return { mode: still ? 'poster' : 'orb', animate: false }
  if (m.hasModel && c.webgl && !isLowPower(c)) return { mode: 'avatar3d', animate: true }
  if (m.hasVideo && !c.saveData) return { mode: 'video', animate: true }
  if (still) return { mode: 'poster', animate: !c.saveData }
  return { mode: 'orb', animate: true }
}
```
> Note : `poster` avec `saveData` → `animate: false`. Le test « saveData → poster » vérifie seulement `mode`.
`src/presentation/cinematic/capabilities.ts` : `export { type Capabilities } from './hero-mode'` + `detectCapabilities(win = window)` (lecture de `matchMedia`, `navigator.connection?.saveData`, `deviceMemory`, `hardwareConcurrency`, sonde WebGL `webgl2`/`webgl` dans un `try/catch`, `mobile = matchMedia('(max-width: 767px)').matches`).
Run : `pnpm test` → **PASS**.

- [ ] **Step 3 : Fixture GLB de test**

`scripts/media/make-fixture-glb.mjs` — génère une sphère jaune « émoji » (24×16 segments) avec `@gltf-transform/core` :
```js
import { mkdirSync } from 'node:fs'
import { Document, NodeIO } from '@gltf-transform/core'

const doc = new Document()
const buffer = doc.createBuffer()
const seg = 24, rings = 16
const pos = [], nor = [], idx = []
for (let y = 0; y <= rings; y++) {
  const phi = (y / rings) * Math.PI
  for (let x = 0; x <= seg; x++) {
    const th = (x / seg) * 2 * Math.PI
    const nx = Math.sin(phi) * Math.cos(th), ny = Math.cos(phi), nz = Math.sin(phi) * Math.sin(th)
    pos.push(nx * 0.5, ny * 0.5, nz * 0.5)
    nor.push(nx, ny, nz)
  }
}
for (let y = 0; y < rings; y++) for (let x = 0; x < seg; x++) {
  const a = y * (seg + 1) + x, b = a + seg + 1
  idx.push(a, b, a + 1, b, b + 1, a + 1)
}
const P = doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer)
const N = doc.createAccessor().setType('VEC3').setArray(new Float32Array(nor)).setBuffer(buffer)
const I = doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(idx)).setBuffer(buffer)
const mat = doc.createMaterial('emoji').setBaseColorFactor([0.98, 0.82, 0.3, 1]).setRoughnessFactor(0.35).setMetallicFactor(0)
const prim = doc.createPrimitive().setAttribute('POSITION', P).setAttribute('NORMAL', N).setIndices(I).setMaterial(mat)
const mesh = doc.createMesh('head').addPrimitive(prim)
const node = doc.createNode('head').setMesh(mesh)
doc.createScene('fixture').addChild(node)

mkdirSync('public/fixtures', { recursive: true })
await new NodeIO().write('public/fixtures/avatar-fixture.glb', doc)
console.log('public/fixtures/avatar-fixture.glb écrit')
```
Run : `pnpm media:fixture` → fichier créé (< 20 Ko). **Ce fichier est commité** (fixture de test, sans donnée personnelle).

- [ ] **Step 4 : Composants**

`GlassOrb.tsx` (+ `.module.css`) : sphère CSS — `radial-gradient(circle at 30% 25%, rgb(255 255 255 / .9), transparent 35%)` + dégradé teinté `var(--accent-soft)`/`var(--tint-blue)`/`var(--tint-teal)` + `box-shadow` intérieur + bord `var(--glass-border)`, `aspect-ratio: 1`, `animation: drift 9s ease-in-out infinite alternate` (transform seulement), `@media (prefers-reduced-motion: reduce) { animation: none }`. Aucun hex brut.
`AvatarCanvas.tsx` (`'use client'`, **export default**, chargé via `dynamic(..., { ssr: false })`) :
```tsx
'use client'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Box3, MathUtils, Vector3, type Group } from 'three'

type Props = { url: string; active: boolean; mobile: boolean; onReady: () => void }

function Avatar({ url, onReady }: Pick<Props, 'url' | 'onReady'>) {
  // useGLTF(url, useDraco=false, useMeshopt=true) : aucun décodeur chargé depuis un CDN.
  const { scene } = useGLTF(url, false, true)
  const group = useRef<Group>(null)

  // Recadre n'importe quel GLB : centre + hauteur normalisée à 1,7.
  useLayoutEffect(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const s = 1.7 / Math.max(size.y, 0.0001)
    scene.scale.setScalar(s)
    scene.position.set(-center.x * s, -center.y * s, -center.z * s)
  }, [scene])

  useEffect(() => { onReady() }, [onReady])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    g.rotation.y = MathUtils.damp(g.rotation.y, state.pointer.x * 0.35, 4, dt)
    g.rotation.x = MathUtils.damp(g.rotation.x, -state.pointer.y * 0.15, 4, dt)
    g.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.02 // respiration
  })

  return <group ref={group}><primitive object={scene} /></group>
}

export default function AvatarCanvas({ url, active, mobile, onReady }: Props) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 3.4], fov: 30 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 3, 4]} intensity={1.6} />
      {/* Environnement procédural : aucun HDR distant. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 3, -2]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-4, 1, 2]} scale={[2, 4, 1]} />
      </Environment>
      <Suspense fallback={null}><Avatar url={url} onReady={onReady} /></Suspense>
    </Canvas>
  )
}
```
`HeroStage.tsx` (client) — machine d'état :
1. **SSR / premier rendu** : `mode` initial = `'poster'` si `heroPoster` ou `avatarPortrait`, sinon `'orb'` ; couche de base = `<Image priority fill sizes="(min-width:1024px) 40vw, 90vw" alt={avatarAlt}>` (poster, sinon portrait) ou `<GlassOrb/>` ; ratio `aspect-[4/5]` réservé (**CLS = 0**).
2. **Après montage** : `detectCapabilities()` → `decideHeroMode(caps, media)` ; si `process.env.NEXT_PUBLIC_E2E === '1'` **et** `?__fixture=avatar`, `media.hasModel = true` avec l'URL `/fixtures/avatar-fixture.glb`.
3. `video` : `<video muted playsInline autoPlay loop preload="metadata" poster=…>` avec `<source>` webm puis mp4 (paire **mobile** si `caps.mobile` et disponible, sinon desktop) ; en mode `avatar3d` + vidéo présente, la vidéo joue **une fois** (`onEnded`) puis fondu vers la 3D.
4. `avatar3d` : `dynamic(() => import('./AvatarCanvas'), { ssr: false })` monté après `requestIdleCallback` (repli `setTimeout(…, 1)`) ; `onReady` → `ready = true` → fondu de la couche de base (opacity 500 ms) ; pas de `ready` après 8 s → on **reste** sur la couche de base.
5. `IntersectionObserver` → `active` (Canvas `frameloop="never"` hors écran ; vidéo `pause()`), `visibilitychange` idem.
6. Racine : `<div data-testid="hero-frame" data-hero-frame data-hero-mode={mode} data-hero-ready={ready} role="img" aria-label={avatarAlt} class="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-frame)]">` + liseré verre (`<Glass variant="surface" aria-hidden class="pointer-events-none absolute inset-0 bg-transparent" />`). **Aucun texte** dans le cadre.
`HeroMotion.tsx` (client) :
```tsx
'use client'
import { useRef } from 'react'
import { gsap, useGSAP } from '@/presentation/lib/gsap'

export function HeroMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=120%', scrub: 1, pin: true, anticipatePin: 1 } })
          .to('[data-hero-frame]', { scale: 0.9, ease: 'none' }, 0)
          .to('[data-hero-chip]', { yPercent: -30, stagger: 0.05, ease: 'none' }, 0)
          .to('[data-hero-copy]', { yPercent: -6, ease: 'none' }, 0)
      })
      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.to('[data-hero-chip]', { yPercent: -20, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } })
      })
      return () => mm.revert()
    },
    { scope: root },
  )
  return <section id="hero" ref={root} data-section aria-labelledby="hero-title" className={className}>{children}</section>
}
```
`ScrubVideo.tsx` (client) : `<video muted playsInline preload="auto" aria-hidden>` ; sur `loadedmetadata` → `ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: (self) => { target = self.progress * duration } })` + boucle `requestAnimationFrame` qui rapproche `currentTime` de `target` (`+= (target - current) * 0.15` si écart > 0,01) ; reduced-motion → affiche la première image sans scrub ; nettoyage complet (`kill`, `cancelAnimationFrame`).
`Interlude.tsx` (serveur) : `null` si `!cinematic.scrubVideo`, sinon `<section aria-hidden className="container-x section-y"><Glass variant="surface" className="overflow-hidden p-2"><ScrubVideo src={cinematic.scrubVideo.url} className="aspect-video w-full rounded-[calc(var(--radius-frame)-0.5rem)] object-cover" /></Glass></section>` (aucun texte).

- [ ] **Step 5 : Vérification navigateur (obligatoire — c'est du visuel)**

`pnpm build && NEXT_PUBLIC_E2E=1 …` : reconstruire avec `NEXT_PUBLIC_E2E=1`, `pnpm start`, ouvrir `/fr?__fixture=avatar` dans le navigateur intégré : la **sphère jaune** s'affiche dans le cadre, tourne vers le curseur, respire ; `data-hero-mode="avatar3d"` puis `data-hero-ready="true"` ; console **sans erreur** ; onglet réseau : **aucune requête** vers un domaine tiers (pas de gstatic/github). Puis `/fr` sans param : mode `orb` ou `poster` selon le seed. Émuler `prefers-reduced-motion: reduce` : pas d'animation, mode statique. Vérifier le pin desktop (scroll) et l'absence de pin < 768px.

- [ ] **Step 6 : Commit**

```bash
git add src/presentation/cinematic src/presentation/components/cinematic scripts/media/make-fixture-glb.mjs public/fixtures tests/unit/presentation/cinematic/hero-mode.test.ts tests/unit/presentation/cinematic/capabilities.test.ts
git commit -m "feat(cinematic): add capability-aware hero engine, 3D avatar canvas, hero scroll motion and scrub video"
```

---

## Task 11 : Section Hero

**Files :**
- Modify : `src/presentation/components/sections/Hero.tsx` (remplace le stub)
- Create : `src/presentation/components/sections/hero/{RotatingTitle,CvMenu,TrustedBy}.tsx`, `src/presentation/i18n/messages/{fr,en}/hero.json`, `tests/e2e/sections/hero.spec.ts`

**Interfaces :**
- Consumes : `HeroMotion`, `HeroStage`, `GlassOrb` (T10) ; `Button`, `Chip`, `Eyebrow`, `Glass`, `Reveal` (T2/T9) ; `SiteProfile`, `CinematicMedia` (T7)
- Produces : `Hero({ site, cinematic })` ; clés `hero` : `avatarAlt`, `cvMenuLabel`, `cvFullstack`, `cvAi`, `scrollHint`, `titlesLabel`

- [ ] **Step 1 : Mise en page** (contrat visuel — référence `img/exemple-portfolio.jpg` + `MASTER.md`)

Structure (`<HeroMotion className="…">`) :
- **Grille** `container-x grid min-h-[100svh] items-center gap-10 pt-28 lg:grid-cols-12 lg:pt-24`.
- **Copie** (`lg:col-span-7`, `data-hero-copy`, éléments animés = classe `reveal`) : `<Eyebrow>{hero.eyebrow}</Eyebrow>` · `<h1 id="hero-title" class="font-display text-[clamp(2.75rem,1rem+6vw,5.5rem)] leading-[0.95]">{site.name}</h1>` · `<RotatingTitle titles={hero.rotatingTitles} label={t('titlesLabel')} />` (dégradé `--accent-strong → --accent`, **grand texte uniquement**) · `<p class="max-w-prose text-lg text-[var(--ink-2)]">{site.tagline}</p>` · rangée CTA : `<Button size="lg" magnetic href="#projects" icon="arrow-up-right">{hero.ctaPrimary}</Button>` + `<CvMenu …/>` · `<TrustedBy title=… items=… />`.
- **Cadre** (`lg:col-span-5`, `data-hero-frame` porté par `HeroStage`) : `<HeroStage cinematic avatarAlt={t('avatarAlt')} />` + **2 chips** absolues en verre (`data-testid="hero-chip" data-hero-chip`), une en haut-droite (`chips[0]`, ex. « 3 ans / d'alternance »), une en bas-gauche (`chips[1]`) ; 1 `GlassOrb` décor derrière (`aria-hidden`, `-z-10`, `-right-8 -top-8`).
- **Mobile (< 1024px)** : copie d'abord (le `h1` est le LCP texte), puis cadre `max-h-[70svh]` ; les chips restent dans le cadre, sans déborder de la fenêtre ; pas de scroll horizontal.
`RotatingTitle` (client) : rend le 1er titre en SSR ; alterne toutes les 3,2 s en fondu (`opacity`, 250 ms) ; **pause** au survol/focus et sous reduced-motion (affiche le 1er) ; `<span class="sr-only">` contient **tous** les titres séparés par « / » ; le texte animé est `aria-hidden`.
`CvMenu` (client) : selon `site.cv` — 0 CV → rien ; 1 CV → `Button variant="secondary" icon="download" href={url} download` ; 2 CV → bouton **disclosure** (`aria-expanded`, `aria-controls`) qui ouvre un petit `<Glass variant="card">` avec 2 liens `download` (`cvFullstack` / `cvAi`) ; `Escape` et clic extérieur ferment, le focus revient au bouton.
`TrustedBy` : `<p>` titre en `--ink-muted` + `<ul>` de noms en texte (`font-display font-semibold text-[var(--ink-muted)]`), séparés par des points ; lien seulement si `url`. **Aucun logo.**
`hero.json` FR : `avatarAlt` « Avatar Memoji 3D de Denis Bucspun, en veste sherpa crème, bras croisés », `cvMenuLabel` « Télécharger mon CV », `cvFullstack` « CV Full Stack (PDF) », `cvAi` « CV IA / GenAI (PDF) », `scrollHint` « Faire défiler », `titlesLabel` « Mes métiers : » + EN.

- [ ] **Step 2 : Test E2E**

`tests/e2e/sections/hero.spec.ts` :
```ts
import { expect, test } from '@playwright/test'

test.describe('hero', () => {
  test('affiche le nom, le titre et le cadre média', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.locator('#hero h1')).toHaveText('Denis Bucspun')
    const frame = page.getByTestId('hero-frame')
    await expect(frame).toBeVisible()
    await expect(frame).toHaveAttribute('data-hero-mode', /^(poster|orb|video|avatar3d)$/)
  })

  test('sans média : repli poster/orbe, pas de 3D', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.getByTestId('hero-frame')).toHaveAttribute('data-hero-mode', /^(poster|orb)$/)
  })

  test('chemin 3D avec la fixture (build NEXT_PUBLIC_E2E)', async ({ page }) => {
    test.skip(process.env.NEXT_PUBLIC_E2E !== '1', 'nécessite un build avec NEXT_PUBLIC_E2E=1')
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    const external: string[] = []
    page.on('request', (r) => { if (!r.url().startsWith('http://localhost')) external.push(r.url()) })
    await page.goto('/fr?__fixture=avatar')
    const frame = page.getByTestId('hero-frame')
    await expect(frame).toHaveAttribute('data-hero-mode', 'avatar3d')
    await expect(frame).toHaveAttribute('data-hero-ready', 'true', { timeout: 15_000 })
    await expect(frame.locator('canvas')).toBeVisible()
    expect(errors).toEqual([])
    expect(external.filter((u) => /gstatic|githubusercontent|raw\.github/.test(u))).toEqual([])
  })

  test('reduced-motion : contenu visible, mode statique', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.goto('/fr?__fixture=avatar')
    await expect(page.locator('#hero h1')).toBeVisible()
    await expect(page.getByTestId('hero-frame')).toHaveAttribute('data-hero-mode', /^(poster|orb)$/)
    await ctx.close()
  })

  test('aucun scroll horizontal', async ({ page }) => {
    await page.goto('/fr')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
```
Run : `pnpm build && pnpm e2e tests/e2e/sections/hero.spec.ts` → **PASS** aux 4 projets (desktop/laptop/tablet/mobile).

- [ ] **Step 3 : Revue visuelle** — captures 375/768/1024/1440 avec le navigateur intégré ; contrôles `MASTER.md` : contraste du `h1`/`p`, dégradé du titre ≥ 3:1 (grand texte), focus visibles, **aucun texte sur le média**, chips lisibles (verre ≥ 62 %).

- [ ] **Step 4 : Commit**

```bash
git add src/presentation/components/sections/Hero.tsx src/presentation/components/sections/hero src/presentation/i18n/messages/fr/hero.json src/presentation/i18n/messages/en/hero.json tests/e2e/sections/hero.spec.ts
git commit -m "feat(hero): add cinematic hero section with rotating title, CV menu and trusted-by strip"
```

---

## Task 12 : Sections À propos et Services

**Files :**
- Modify : `src/presentation/components/sections/About.tsx`, `src/presentation/components/sections/Services.tsx` (remplacent les stubs)
- Create : `src/presentation/components/sections/about/StatCard.tsx`, `src/presentation/components/sections/services/ServiceCard.tsx`, `src/presentation/i18n/messages/{fr,en}/{about,services}.json`, `tests/e2e/sections/about-services.spec.ts`

**Interfaces :**
- Consumes : `Section`, `SectionHeading`, `Reveal`, `Glass`, `Button`, `ServiceIcon`, `UiIcon` (T9) ; `SiteProfile`, `Service` (T7)
- Produces : `About({ site, stats })`, `Services({ services })` ; clés `about` : `eyebrow`, `stats.years|experiences|technologies|projects`, `cta` ; clés `services` : `eyebrow`, `title`, `cta`

- [ ] **Step 1 : About** — carte verre large (2 colonnes ≥ lg) : gauche `SectionHeading` (`eyebrow` = `about.eyebrow`, titre = `site.about.headline`) + grille de **`StatCard`** (`data-testid="stat-card"`) ; droite : `site.about.bio` (`max-w-prose`, `text-[var(--ink-2)]`) + `Button variant="secondary" href="#journey" icon="arrow-up-right">{t('cta')}`. **Stats** : si `site.about.autoStats` → 4 cartes depuis `stats` (`years` affiché `${n}+`, `experiences`, `technologies`, `projects`) avec libellés `about.stats.*` ; sinon `site.about.stats` (valeur/libellé du CMS). `StatCard` : `<Glass variant="card">` + icône Lucide décorative (`calendar`, `briefcase`, `code`, `sparkles`), valeur en `font-display text-3xl`, libellé `--ink-muted`. Grille `grid-cols-2` (mobile) → `lg:grid-cols-4`, `gap-3`.
`about.json` FR : `eyebrow` « À propos », `stats` : `years` « ans d’expérience », `experiences` « expériences », `technologies` « technologies », `projects` « projets » ; `cta` « Voir mon parcours » + EN.

- [ ] **Step 2 : Services** — `SectionHeading` (`services.eyebrow` « Ce que je propose », `services.title` « Services ») + grille `md:grid-cols-2 xl:grid-cols-4 gap-4`. `ServiceCard` :
```tsx
import { Glass } from '@/presentation/components/glass/Glass'
import { ServiceIcon, UiIcon } from '@/presentation/components/ui/Icon'
import type { Service } from '@/domain'

const TINT: Record<Service['tint'], string> = {
  amber: 'bg-[color-mix(in_srgb,var(--tint-amber)_40%,white)]',
  violet: 'bg-[color-mix(in_srgb,var(--tint-violet)_40%,white)]',
  blue: 'bg-[color-mix(in_srgb,var(--tint-blue)_40%,white)]',
  teal: 'bg-[color-mix(in_srgb,var(--tint-teal)_40%,white)]',
}

export function ServiceCard({ service, cta }: { service: Service; cta: string }) {
  return (
    <Glass as="a" href="#contact" interactive data-testid="service-card" aria-label={`${service.title} — ${cta}`} className="group flex min-h-56 flex-col gap-4 p-6">
      <span className={`grid size-12 place-items-center rounded-2xl text-[var(--ink)] ${TINT[service.tint]}`} aria-hidden="true">
        <ServiceIcon name={service.icon} className="size-6" />
      </span>
      <h3 className="font-display text-xl">{service.title}</h3>
      <p className="text-[var(--ink-2)]">{service.description}</p>
      <UiIcon name="arrow-up-right" className="mt-auto size-5 self-end text-[var(--ink-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Glass>
  )
}
```
Chaque carte est enveloppée dans `<Reveal>` (stagger par le batch). `services.json` FR : `eyebrow` « Ce que je propose », `title` « Services », `cta` « Discutons de votre besoin » + EN. Sous reduced-motion/no-JS : cartes visibles.

- [ ] **Step 3 : Test E2E**

`tests/e2e/sections/about-services.spec.ts` :
```ts
import { expect, test } from '@playwright/test'

test('À propos : bio et statistiques', async ({ page }) => {
  await page.goto('/fr#about')
  await expect(page.locator('#about')).toContainText('Développeur Full Stack')
  const stats = page.getByTestId('stat-card')
  await expect(stats).toHaveCount(4)
  await expect(stats.first()).toContainText(/\d+\+/) // années calculées : ne jamais figer la valeur
})

test('Services : 4 cartes cliquables ≥ 44px', async ({ page }) => {
  await page.goto('/fr')
  const cards = page.getByTestId('service-card')
  await expect(cards).toHaveCount(4)
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded()
    const box = await card.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    await expect(card.getByRole('heading', { level: 3 })).toBeVisible()
  }
})

test('EN : services traduits', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('#services h2')).toHaveText('Services')
  await expect(page.locator('#services')).toContainText('Full Stack Development')
})
```
Run : `pnpm build && pnpm e2e tests/e2e/sections/about-services.spec.ts` → **PASS**. Revue visuelle 4 viewports (tuiles teintées, verre, lisibilité).

- [ ] **Step 4 : Commit**

```bash
git add src/presentation/components/sections/About.tsx src/presentation/components/sections/Services.tsx src/presentation/components/sections/about src/presentation/components/sections/services src/presentation/i18n/messages/fr/about.json src/presentation/i18n/messages/en/about.json src/presentation/i18n/messages/fr/services.json src/presentation/i18n/messages/en/services.json tests/e2e/sections/about-services.spec.ts
git commit -m "feat(sections): add About with computed stats and Services cards"
```

---

## Task 13 : Sections Stack et Projets + page détail de projet

**Files :**
- Modify : `src/presentation/components/sections/TechStack.tsx`, `src/presentation/components/sections/Projects.tsx` (remplacent les stubs)
- Create : `src/presentation/components/sections/stack/StackTile.tsx`, `src/presentation/components/sections/projects/{ProjectCard,ProjectsGrid}.tsx`, `src/presentation/components/project/{ProjectHeader,ProjectBody,ProjectBody.module.css,ProjectGallery}.tsx`, `src/presentation/lib/stack-icon-color.ts`, `src/presentation/lib/project-cover.ts`, `src/app/(site)/[locale]/(shell)/projects/[slug]/page.tsx`, `src/presentation/i18n/messages/{fr,en}/{stack,projects}.json`, `tests/unit/presentation/stack-icon-color.test.ts`, `tests/unit/presentation/project-cover.test.ts`, `tests/e2e/sections/stack-projects.spec.ts`

**Interfaces :**
- Consumes : `groupStacksByCategory` (domaine), `getPortfolioUseCases().getProjectPage` / `.listProjectRefs` (`@/composition`, T7) ; `Glass`, `Section*`, `Reveal`, `Button`, `Chip`, `UiIcon` (T2/T9) ; `contrastRatio` (T2) ; `Link` (T6)
- Produces : `TechStack({ stacks })` (le composant s'appelle `TechStack` pour ne pas entrer en collision avec le type du domaine `Stack`), `Projects({ projects, stacks })` ; `iconColor(hex: string, surface?: string): string` (retourne `#hex` si contraste ≥ 3 sur la surface, sinon `var(--ink)`) ; `coverGradient(slug: string): { from: string; to: string; angle: number }` (déterministe, `from/to` = `var(--tint-…)`) ; page `/[locale]/projects/[slug]` ; clés `stack` : `eyebrow`, `title`, `categories.language|frontend|backend|architecture|testing|devops|security|ai` ; clés `projects` : `eyebrow`, `title`, `filterLabel`, `filterAll`, `empty`, `more`, `open`, `back`, `client`, `year`, `live`, `repo`, `stacks`, `gallery`, `caseStudy`, `previous`, `next`

- [ ] **Step 1 : Tests unitaires (échouent)**

`tests/unit/presentation/stack-icon-color.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { iconColor } from '@/presentation/lib/stack-icon-color'

describe('iconColor', () => {
  it('garde la couleur de marque si elle contraste (≥ 3:1) avec le verre', () => {
    expect(iconColor('2496ED')).toBe('#2496ED') // bleu Docker
  })
  it('bascule sur --ink pour une couleur trop claire', () => {
    expect(iconColor('F7DF1E')).toBe('var(--ink)') // jaune JavaScript, ~1.3:1
  })
  it('accepte le # et la casse', () => {
    expect(iconColor('#2496ed')).toBe('#2496ED')
  })
})
```
`tests/unit/presentation/project-cover.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { coverGradient } from '@/presentation/lib/project-cover'

describe('coverGradient', () => {
  it('est déterministe', () => {
    expect(coverGradient('ce-portfolio')).toEqual(coverGradient('ce-portfolio'))
  })
  it('utilise uniquement des tokens', () => {
    const g = coverGradient('dywikis')
    expect(g.from).toMatch(/^var\(--tint-/)
    expect(g.to).toMatch(/^var\(--tint-/)
    expect(g.from).not.toBe(g.to)
  })
  it('varie selon le slug', () => {
    const set = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((s) => JSON.stringify(coverGradient(s))))
    expect(set.size).toBeGreaterThan(1)
  })
})
```
Run → **FAIL**. Implémenter :
`src/presentation/lib/stack-icon-color.ts` :
```ts
import { contrastRatio } from '@/presentation/design/contrast'

const GLASS_SURFACE = '#F9F8FC' // verre 62 % sur --bg (voir MASTER.md)

export function iconColor(hex: string, surface: string = GLASS_SURFACE): string {
  const h = `#${hex.replace('#', '').toUpperCase()}`
  return contrastRatio(h, surface) >= 3 ? h : 'var(--ink)'
}
```
`src/presentation/lib/project-cover.ts` :
```ts
const TINTS = ['amber', 'violet', 'blue', 'teal'] as const

export function coverGradient(slug: string): { from: string; to: string; angle: number } {
  let h = 0
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const a = TINTS[h % 4]!
  const b = TINTS[(h + 1 + ((h >> 3) % 3)) % 4]!
  return { from: `var(--tint-${a})`, to: `var(--tint-${b === a ? TINTS[(h + 2) % 4] : b})`, angle: 120 + (h % 5) * 15 }
}
```
> Vérifier `from !== to` sur les slugs du seed (le test le fait pour `dywikis`) ; ajuster la formule si collision.
Run → **PASS**.

- [ ] **Step 2 : Stack** — `SectionHeading` + un grand `<Glass variant="surface" class="p-4 md:p-8">` contenant, pour chaque groupe de `groupStacksByCategory(stacks)`, un `<section aria-labelledby>` : `<h3>` = `stack.categories.<cat>` puis grille `grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3`. `StackTile` (`data-testid="stack-tile"`, `<Glass variant="card">` `min-h-24` centré) : icône selon `stack.icon.kind` — `simple` → `<svg viewBox="0 0 24 24" aria-hidden class="size-8"><path d={path} style={{ fill: iconColor(hex) }} /></svg>` ; `upload` → `next/image` 32×32 `alt=""` ; `monogram` → pastille ronde `--accent-soft` avec `letters` en `--ink` — puis le nom (`text-[0.8125rem] text-[var(--ink-2)]`). Chaque groupe dans `<Reveal>`.

- [ ] **Step 3 : Projets** — `Projects` (serveur) : `SectionHeading` + `<ProjectsGrid projects stacks />`.
`ProjectsGrid` (client) : filtre par stack — n'affiche comme puces que les stacks **utilisées par au moins un projet**, triées par `order` ; `<div role="group" aria-label={t('filterLabel')} data-testid="project-filter">` avec un bouton « Tout » (`aria-pressed`) + une puce par stack ; état `active: string | null` ; grille `md:grid-cols-2 xl:grid-cols-3 gap-4` ; **6 cartes max** puis bouton « Voir plus » (`aria-expanded`) ; message `projects.empty` (`role="status"`) si aucun résultat ; les projets `featured` d'abord (tri stable).
`ProjectCard` (`data-testid="project-card"`) : `<Glass as="article" interactive class="group relative overflow-hidden">` ; **cover** `next/image` (`cover.url`, `alt={cover.alt}`, `sizes`, ratio `aspect-[16/10]`) **ou** dégradé `coverGradient(slug)` + monogramme géant décoratif ; **barre de légende en verre** sous l'image (pas de texte sur l'image) : `<h3>` titre, `tagline` (2 lignes max), jusqu'à 4 `Chip` de stacks + « +n » ; **lien étiré** : `<Link href={`/projects/${slug}`} className="after:absolute after:inset-0 after:content-['']" aria-label={`${title} — ${t('open')}`}>` ; hover : image `scale-[1.04]` (≤ 8 %, `overflow-hidden`), `UiIcon arrow-up-right`.
- [ ] **Step 4 : Page détail** `(shell)/projects/[slug]/page.tsx` (serveur) :
```tsx
type ProjectRouteProps = { params: Promise<{ locale: string; slug: string }> }

export const revalidate = 3600

export async function generateStaticParams() {
  const refs = await getPortfolioUseCases().listProjectRefs.execute()
  return routing.locales.flatMap((locale) => refs.map(({ slug }) => ({ locale, slug })))
}

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const page = await getPortfolioUseCases().getProjectPage.execute({ locale, slug })
  if (!page) return {}
  const { project } = page
  return { title: project.title, description: project.tagline || project.summary, openGraph: { images: project.cover ? [project.cover.url] : undefined } }
}

export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const page = await getPortfolioUseCases().getProjectPage.execute({ locale, slug })
  if (!page) notFound()
  // <ProjectHeader project={page.project}/> (retour, titre h1, tagline, méta client/année, boutons Live/Repo) + cover en <Glass> (aucun texte sur l'image)
  // <ProjectBody/> : <RichText data={project.caseStudy as unknown as SerializedEditorState}/> de '@payloadcms/richtext-lexical/react'.
  //   Le champ `caseStudy` du domaine est opaque : ProjectBody est le SEUL endroit qui le convertit. Typographie via ProjectBody.module.css (tokens uniquement)
  // stacks groupés par catégorie (groupStacksByCategory + Chip), <ProjectGallery/> (next/image, alt du média), navigation précédent/suivant depuis page.previous / page.next
}
```
`dynamicParams` reste `true` (un projet publié après le build est rendu à la demande puis mis en cache). `projects.json` FR : `eyebrow` « Réalisations », `title` « Projets sélectionnés », `filterLabel` « Filtrer par technologie », `filterAll` « Tout », `empty` « Aucun projet pour cette technologie. », `more` « Voir plus de projets », `open` « Voir le projet », `back` « Tous les projets », `client` « Client », `year` « Année », `live` « Voir le site », `repo` « Voir le code », `stacks` « Technologies », `gallery` « Galerie », `caseStudy` « Étude de cas », `previous` « Projet précédent », `next` « Projet suivant » + EN. `stack.json` FR : `eyebrow` « Outils & compétences », `title` « Technologies », `categories` : Langages, Frontend, Backend, Architecture, Tests, DevOps & Cloud, Sécurité, IA + EN.

- [ ] **Step 5 : Test E2E**

`tests/e2e/sections/stack-projects.spec.ts` :
```ts
import { expect, test } from '@playwright/test'

test('Stack : tuiles groupées par catégorie', async ({ page }) => {
  await page.goto('/fr')
  expect(await page.getByTestId('stack-tile').count()).toBeGreaterThanOrEqual(20)
  await expect(page.locator('#stack h3').first()).toBeVisible()
})

test('Projets : filtre par technologie', async ({ page }) => {
  await page.goto('/fr')
  const cards = page.getByTestId('project-card')
  const total = await cards.count()
  expect(total).toBeGreaterThanOrEqual(3)
  await page.getByTestId('project-filter').getByRole('button', { name: 'PHP' }).click()
  await expect(cards).toHaveCount(1)
  await page.getByTestId('project-filter').getByRole('button', { name: 'Tout' }).click()
  await expect(cards).toHaveCount(total)
})

test('Projets : la carte mène à la page détail, localisée', async ({ page }) => {
  await page.goto('/fr')
  await page.getByTestId('project-card').first().getByRole('link').click()
  await expect(page).toHaveURL(/\/fr\/projects\/[a-z0-9-]+$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: /Tous les projets/ })).toBeVisible()
})

test('Projet inconnu → 404', async ({ page }) => {
  const res = await page.goto('/fr/projects/n-existe-pas')
  expect(res?.status()).toBe(404)
})
```
Run : `pnpm build && pnpm e2e tests/e2e/sections/stack-projects.spec.ts` → **PASS**. Revue visuelle 4 viewports : tuiles lisibles, icônes de marque claires sur verre, cartes sans texte sur image, `overflow` maîtrisé.

- [ ] **Step 6 : Commit**

```bash
git add src/presentation/components/sections/TechStack.tsx src/presentation/components/sections/Projects.tsx src/presentation/components/sections/stack src/presentation/components/sections/projects src/presentation/components/project src/presentation/lib/stack-icon-color.ts src/presentation/lib/project-cover.ts "src/app/(site)/[locale]/(shell)/projects" src/presentation/i18n/messages/fr/stack.json src/presentation/i18n/messages/en/stack.json src/presentation/i18n/messages/fr/projects.json src/presentation/i18n/messages/en/projects.json tests/unit/presentation/stack-icon-color.test.ts tests/unit/presentation/project-cover.test.ts tests/e2e/sections/stack-projects.spec.ts
git commit -m "feat(sections): add Stack tiles, filterable Projects grid and project detail page"
```

---

## Task 14 : Sections Parcours et Méthode

**Files :**
- Modify : `src/presentation/components/sections/Journey.tsx`, `src/presentation/components/sections/Process.tsx` (remplacent les stubs)
- Create : `src/presentation/components/sections/journey/TimelineItem.tsx`, `src/presentation/components/sections/process/ProcessStep.tsx`, `src/presentation/i18n/messages/{fr,en}/{journey,process}.json`, `tests/e2e/sections/journey-process.spec.ts`

**Interfaces :**
- Consumes : `formatRange` (T7) ; `Section*`, `Reveal`, `Glass`, `Chip` (T2/T9) ; `getLocale` (`next-intl/server`) ; `Experience` (T7)
- Produces : `Journey({ experiences })` (composant serveur **async**), `Process({ headline, steps })` ; clés `journey` : `eyebrow`, `title`, `present`, `work`, `education`, `details`, `stacks` ; clés `process` : `eyebrow`

- [ ] **Step 1 : Journey** — `SectionHeading` (`journey.eyebrow` « Parcours », `journey.title` « Expériences & formation ») + liste verticale (`<ol>`) avec **rail** (ligne `--glass-hairline` + pastille par item, `--accent-strong` pour la plus récente). `TimelineItem` (`<li><Glass as="article" data-testid="timeline-item">`) : badge de type (`work`/`education` via `Chip`), `role` (h3), `organization · location`, plage `formatRange(start, end, locale, t('present'))`, `summary`, puis **`highlights`** : les 3 premiers visibles, le reste dans un `<details><summary>{t('details')}</summary>` natif (accessible, sans JS) ; chips de stacks (max 6). Ordre = `order` (déjà trié). Mobile : rail à gauche, carte pleine largeur ; ≥ lg : carte à droite du rail, dates en colonne de gauche.
- [ ] **Step 2 : Process** — `SectionHeading` (`process.eyebrow` « Ma méthode », titre = `headline`) + `<ol>` de `ProcessStep` (`data-testid="process-step"`) : numéro `01…05` en `font-display` (`--accent-text` ≥ 24px OK ou `--ink-muted`), titre h3, texte ; connecteurs (flèches décoratives `aria-hidden`) entre étapes ≥ xl. Grille : 1 col mobile (ligne verticale), `md:grid-cols-2`, `xl:grid-cols-5`. `<Glass variant="card">` par étape, survol = léger relief.
- [ ] **Step 3 : Test E2E**

`tests/e2e/sections/journey-process.spec.ts` :
```ts
import { expect, test } from '@playwright/test'

test('Parcours : timeline avec Bouygues en premier', async ({ page }) => {
  await page.goto('/fr')
  const items = page.getByTestId('timeline-item')
  expect(await items.count()).toBeGreaterThanOrEqual(4)
  await expect(items.first()).toContainText('Bouygues Telecom Business Solutions')
  await expect(items.first()).toContainText(/oct\.? 2024/i)
})

test('Parcours : détails repliables au clavier', async ({ page }) => {
  await page.goto('/fr')
  const first = page.getByTestId('timeline-item').first()
  const summary = first.locator('summary')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(first.locator('details')).toHaveAttribute('open', '')
})

test('Méthode : 5 étapes numérotées', async ({ page }) => {
  await page.goto('/fr')
  const steps = page.getByTestId('process-step')
  await expect(steps).toHaveCount(5)
  await expect(steps.first()).toContainText('01')
  await expect(steps.last()).toContainText('05')
})
```
Run → **PASS** ; revue visuelle 4 viewports.

- [ ] **Step 4 : Commit**

```bash
git add src/presentation/components/sections/Journey.tsx src/presentation/components/sections/Process.tsx src/presentation/components/sections/journey src/presentation/components/sections/process src/presentation/i18n/messages/fr/journey.json src/presentation/i18n/messages/en/journey.json src/presentation/i18n/messages/fr/process.json src/presentation/i18n/messages/en/process.json tests/e2e/sections/journey-process.spec.ts
git commit -m "feat(sections): add Journey timeline and Process steps"
```

---

## Task 15 : Scripts d'optimisation média + pack de prompts Higgsfield

**Files :**
- Create : `scripts/media/lib.mjs`, `scripts/media/optimize-glb.mjs`, `scripts/media/optimize-video.mjs`, `docs/higgsfield/{README,01-personnage-memoji,02-avatar-3d,03-video-hero,04-transitions,05-optimiser-et-deposer}.md`, `tests/unit/scripts/media-lib.test.ts`
- Modify : `.gitignore` (ajouter `/media-out/`)

**Interfaces :**
- Produces (dans `scripts/media/lib.mjs`) : `BUDGETS = { poster: 150_000, glb: 3_000_000, 'hero-desktop': 4_000_000, 'hero-mobile': 2_000_000, scrub: 6_000_000 }` ; `checkBudget(kind: keyof typeof BUDGETS, bytes: number): { ok: boolean; budget: number; bytes: number }` ; `buildFfmpegArgs(preset: 'hero-desktop'|'hero-mobile'|'scrub', input: string, output: string, codec: 'h264'|'vp9'): string[]`
- Commandes : `pnpm media:optimize:glb -- <in.glb> [--out media-out/avatar.glb]` · `pnpm media:optimize:video -- <in.mp4> --preset hero-desktop|hero-mobile|scrub [--outdir media-out]`

- [ ] **Step 1 : Tests (échouent)**

`tests/unit/scripts/media-lib.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
// @ts-expect-error module .mjs sans types
import { BUDGETS, buildFfmpegArgs, checkBudget } from '../../../scripts/media/lib.mjs'

describe('checkBudget', () => {
  it('ok sous le budget, ko au-dessus', () => {
    expect(checkBudget('glb', 2_900_000).ok).toBe(true)
    expect(checkBudget('glb', 3_100_000).ok).toBe(false)
    expect(BUDGETS['hero-mobile']).toBe(2_000_000)
  })
})

describe('buildFfmpegArgs', () => {
  it('h264 : faststart, sans audio, yuv420p', () => {
    const a: string[] = buildFfmpegArgs('hero-desktop', 'in.mp4', 'out.mp4', 'h264')
    expect(a).toEqual(expect.arrayContaining(['-c:v', 'libx264', '-an', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']))
    expect(a.join(' ')).toMatch(/scale=-2:1080/)
  })
  it('mobile : 9:16 720 de large', () => {
    expect(buildFfmpegArgs('hero-mobile', 'in.mp4', 'out.mp4', 'h264').join(' ')).toMatch(/scale=720:-2/)
  })
  it('scrub : all-intra (-g 1)', () => {
    const a: string[] = buildFfmpegArgs('scrub', 'in.mp4', 'out.mp4', 'h264')
    expect(a[a.indexOf('-g') + 1]).toBe('1')
  })
  it('vp9 : libvpx-vp9', () => {
    expect(buildFfmpegArgs('hero-desktop', 'in.mp4', 'out.webm', 'vp9')).toEqual(expect.arrayContaining(['-c:v', 'libvpx-vp9', '-b:v', '0']))
  })
  it('input et output sont en place', () => {
    const a: string[] = buildFfmpegArgs('hero-desktop', 'in.mp4', 'out.mp4', 'h264')
    expect(a[a.indexOf('-i') + 1]).toBe('in.mp4')
    expect(a[a.length - 1]).toBe('out.mp4')
  })
})
```
Ajouter à `vitest.config.ts` **uniquement si besoin** l'inclusion `.mjs` (import direct, normalement OK). Run → **FAIL**.

- [ ] **Step 2 : `scripts/media/lib.mjs`**

```js
export const BUDGETS = { poster: 150_000, glb: 3_000_000, 'hero-desktop': 4_000_000, 'hero-mobile': 2_000_000, scrub: 6_000_000 }

export function checkBudget(kind, bytes) {
  const budget = BUDGETS[kind]
  return { ok: bytes <= budget, budget, bytes }
}

const SCALE = { 'hero-desktop': 'scale=-2:1080', 'hero-mobile': 'scale=720:-2', scrub: 'scale=1280:-2' }

export function buildFfmpegArgs(preset, input, output, codec) {
  const common = ['-y', '-i', input, '-vf', SCALE[preset], '-an']
  if (codec === 'vp9') {
    return [...common, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-pix_fmt', 'yuv420p', output]
  }
  const gop = preset === 'scrub' ? ['-g', '1'] : ['-g', '48']
  return [...common, '-c:v', 'libx264', '-crf', preset === 'scrub' ? '26' : '24', '-preset', 'slow', ...gop, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output]
}
```
Run → **PASS**.

- [ ] **Step 3 : `optimize-glb.mjs` et `optimize-video.mjs`**

`optimize-glb.mjs` : parse `<in>` et `--out` (défaut `media-out/avatar.glb`), `mkdirSync('media-out')`, exécute `pnpm exec gltf-transform optimize <in> <out> --compress meshopt --texture-compress webp --texture-size 1024` via `spawnSync(..., { stdio: 'inherit', shell: true })`, puis affiche la taille et `checkBudget('glb', size)` (✅/⚠ avec conseil : baisser `--texture-size`, décimer avec `gltf-transform simplify`). **Meshopt uniquement** (pas Draco).
`optimize-video.mjs` : `import ffmpegPath from 'ffmpeg-static'` ; requiert `--preset` ; produit `<outdir>/<preset>.mp4` (h264) et, sauf `scrub`, `<outdir>/<preset>.webm` (vp9) ; affiche chaque taille vs `checkBudget(preset, size)` ; codes de sortie ≠ 0 si ffmpeg échoue.
> Test manuel : `pnpm media:fixture` produit `public/fixtures/avatar-fixture.glb` ; `pnpm media:optimize:glb -- public/fixtures/avatar-fixture.glb --out media-out/fixture.glb` doit réussir et afficher ✅.

- [ ] **Step 4 : Pack Higgsfield** — 6 fichiers Markdown en français (les **prompts en anglais**, les modèles comprennent mieux ; explications en français). Contenu imposé :

`README.md` : le pipeline `Moi.jpg → (1) image Memoji → (2) GLB 3D → (3) vidéo hero 16:9 + 9:16 → (4) transitions → (5) optimisation → dépôt /admin → Globals › Médias cinématiques` ; ce qu'il faut (Higgsfield + `img/Moi.jpg`) ; règle d'or « tu vérifies la ressemblance à chaque étape » ; **si le connecteur Higgsfield complet est reconnecté à Claude, les mêmes prompts servent tels quels** ; budgets ; dépannage.

`01-personnage-memoji.md` — **prompt principal** :
> *A 3D Apple Memoji-style emoji character, bust from head to navel, front view, of a young man with short dark-brown curly hair (voluminous curls on top, shorter tapered sides), light blue-grey eyes, light stubble, a thin moustache and a small chin beard, a subtle closed-mouth smile with a slight smirk, arms crossed over his chest. He wears a cream off-white teddy/sherpa fleece overshirt with a pointed collar, two chest flap pockets and a black snap button at the collar, over a plain white crew-neck t-shirt. Glossy soft 3D render, Apple Memoji and emoji aesthetic, smooth rounded shapes, slightly oversized head, simplified friendly features, soft studio lighting with a subtle rim light, plain pastel lavender background, no text, no logo.*

Négatif : *photorealistic, uncanny, distorted hands, extra fingers, text, watermark, harsh shadows, busy background.* Utilisation : image de référence = `Moi.jpg` (référence de personnage / image-to-image) ; variantes : vue de face **et** ¾ ; **checklist de fidélité** (forme des boucles et volume, barbe/moustache, yeux clairs, col pointu + poches à rabat + bouton noir, t-shirt blanc, bras croisés, cadrage tête → nombril) ; itérer jusqu'à validation ; exporter en PNG **fond uni** (pour la 3D) et en **PNG transparent** (`avatarPortrait`).

`02-avatar-3d.md` : image de face validée → outil **image vers 3D** de Higgsfield (sortie `.glb`) ; contrôles (échelle, orientation +Z de face, textures présentes, pas de trous aux bras croisés) ; `pnpm media:optimize:glb -- avatar.glb` → `media-out/avatar.glb` ≤ 3 Mo (meshopt) ; test local : dépose-le dans `/admin`, ouvre le site ; si le visage regarde ailleurs, refaire l'export avec la face vers +Z.

`03-video-hero.md` — prompts image-to-video (image de départ = personnage validé) : **Intro 16:9, 6 s** — *Slow cinematic dolly-in on the 3D emoji character, bust framing. He blinks, tilts his head slightly and his smile widens; arms stay crossed. Pastel lavender liquid-glass studio, floating translucent glass orbs, soft caustics, shallow depth of field, smooth motion, no camera shake, no text.* · **Boucle** (première image = dernière image, *seamless loop*) · **Mobile 9:16** (même prompt, cadrage vertical). Contraintes : muet, ≤ 8 s ; `pnpm media:optimize:video -- in.mp4 --preset hero-desktop` puis `--preset hero-mobile` → `.mp4` + `.webm` ≤ 4 Mo / 2 Mo.

`04-transitions.md` — optionnel : *Macro shot of a liquid glass sphere slowly refracting soft lavender and blue light, gentle morph, clean pastel background, no text, no faces.* 5 s ; `--preset scrub` (all-intra, ≤ 6 Mo) → slot `scrubVideo` ; rappeler qu'aucun texte n'est posé dessus.

`05-optimiser-et-deposer.md` : commandes, tableau des slots ↔ fichiers (`avatarModel` = `avatar.glb`, `avatarPortrait` = PNG/WebP transparent ≤ 150 Ko, `heroPoster` = WebP ≤ 150 Ko, `heroVideoDesktop.mp4/.webm`, `heroVideoMobile.mp4/.webm`, `scrubVideo`), chemin exact dans l'admin (**Réglages › Médias cinématiques**), vérification (mode hero affiché : `data-hero-mode`), et retour arrière (vider un slot = repli automatique).

- [ ] **Step 5 : Vérifier** — `pnpm test` **PASS** ; relire les 6 docs (aucun placeholder) ; ajouter `/media-out/` à `.gitignore`.

- [ ] **Step 6 : Commit**

```bash
git add scripts/media/lib.mjs scripts/media/optimize-glb.mjs scripts/media/optimize-video.mjs docs/higgsfield tests/unit/scripts/media-lib.test.ts .gitignore
git commit -m "feat(media): add GLB/video optimization scripts and Higgsfield prompt pack"
```

---

## Task 16 : Contact — règles du domaine, cas d'usage, adaptateurs, action serveur, formulaire

**Files :**
- Create (domain) : `src/domain/contact/contact-policy.ts`, `src/domain/contact/contact-draft.ts` ; Modify : `src/domain/index.ts` (exports contact)
- Create (application) : `src/application/ports/{contact-message-repository,contact-notifier,ip-hasher}.ts`, `src/application/contact/submit-contact-message.ts`
- Create (infrastructure) : `src/infrastructure/cms/payload/payload-contact-message-repository.ts`, `src/infrastructure/contact/{resend-contact-notifier,sha256-ip-hasher}.ts`
- Create (composition) : `src/composition/contact.ts` ; Modify : `src/composition/index.ts`
- Create (app) : `src/app/(site)/[locale]/(shell)/_actions/client-ip.ts` ; Modify : `src/app/(site)/[locale]/(shell)/_actions/submit-contact.ts` (remplace le stub de T9)
- Create (presentation) : `src/presentation/components/sections/contact/ContactForm.tsx`, `src/presentation/i18n/messages/{fr,en}/contact.json` ; Modify : `src/presentation/components/sections/Contact.tsx` (remplace le stub)
- Create (tests) : `tests/support/{in-memory-contact-message-repository,fake-ip-hasher}.ts`, `tests/unit/domain/{contact-draft,contact-policy}.test.ts`, `tests/unit/application/submit-contact-message.test.ts`, `tests/unit/infrastructure/sha256-ip-hasher.test.ts`, `tests/unit/app/client-ip.test.ts`, `tests/integration/contact.int.test.ts`, `tests/e2e/sections/contact.spec.ts`

**Interfaces :**
- Consumes : `Locale`, `LOCALES`, `Result`, `ok`, `err` (domaine) ; `Clock` (T7) ; collection `messages` (T4) ; `SiteProfile.contact` (T7) ; `Glass`, `Button`, `SectionHeading`, `Reveal` (T2/T9) ; clés `errors.*` (T6)
- Produces — **domaine** :
```ts
// contact-policy.ts
export const MIN_FILL_MS = 3000
export const RATE_WINDOW_MS = 10 * 60 * 1000
export const RATE_MAX = 3
// CONTACT_TOPICS et ContactTopic : src/domain/contact/contact-topic.ts (créés en T4)
export function isSubmittedTooFast(startedAt: number | undefined, now: number): boolean // undefined (JS désactivé) → false
export function isRateLimited(recentCount: number): boolean                             // recentCount >= RATE_MAX

// contact-draft.ts
export type RawContactInput = Readonly<Record<string, unknown>>
export type ContactDraft = { readonly name: string; readonly email: string; readonly topic: ContactTopic; readonly message: string; readonly locale: Locale }
export type ContactFieldError = 'required' | 'emailInvalid' | 'tooShort' | 'tooLong'
export type ContactFieldErrors = Partial<Record<'name' | 'email' | 'topic' | 'message', ContactFieldError>>
export function validateContactDraft(raw: RawContactInput): Result<ContactDraft, ContactFieldErrors>
export function isHoneypotFilled(raw: RawContactInput): boolean   // champ `website` non vide
export function readStartedAt(raw: RawContactInput): number | undefined
```
- Produces — **application** :
```ts
// ports
export type NewContactMessage = ContactDraft & { readonly ipHash: string }
export interface ContactMessageRepository { save(message: NewContactMessage): Promise<void>; countSince(ipHash: string, sinceEpochMs: number): Promise<number> }
export interface ContactNotifier { notify(message: NewContactMessage): Promise<void> }
export interface IpHasher { hash(ip: string): string }

// submit-contact-message.ts
export type SubmitContactResult = { status: 'ok' } | { status: 'invalid'; fieldErrors: ContactFieldErrors } | { status: 'rate_limited' } | { status: 'error' }
export class SubmitContactMessage {
  constructor(deps: { messages: ContactMessageRepository; hasher: IpHasher; clock: Clock; notifier?: ContactNotifier })
  execute(input: { raw: RawContactInput; ip: string }): Promise<SubmitContactResult>
}
```
- Produces — **infrastructure** : `PayloadContactMessageRepository(client: () => Promise<Payload>)`, `ResendContactNotifier(deps: { apiKey: string; from: string; fallbackTo: string; resolveRecipient: () => Promise<string | null> })`, `Sha256IpHasher(salt: string)`.
- Produces — **composition** : `getContactUseCases(): { submitContactMessage: SubmitContactMessage }`.
- Produces — **app** : `submitContact(previous: ContactFormState, formData: FormData): Promise<ContactFormState>` (`'use server'`) ; `clientIp(headers: Headers): string`.
- Produces — **présentation** : `type ContactFormState = { status: 'idle' } | SubmitContactResult` ; `type ContactFormAction = (previous: ContactFormState, formData: FormData) => Promise<ContactFormState>` ; `Contact({ site, submitAction })` ; `ContactForm({ locale, action })` ; clés `contact` : `eyebrow`, `title`, `intro`, `fields.name|email|topic|message`, `topics.project|ai|job|other`, `submit`, `sending`, `success`, `error`, `rateLimited`, `details.title|email|linkedin|github|location|phone`, `honeypot`

- [ ] **Step 1 : Tests du domaine (échouent)**

`tests/unit/domain/contact-draft.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { isHoneypotFilled, readStartedAt, validateContactDraft } from '@/domain'

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', topic: 'project', message: 'Bonjour, je voudrais discuter d’un projet.', locale: 'fr' }

describe('validateContactDraft', () => {
  it('accepte une saisie valide et nettoie les espaces', () => {
    const result = validateContactDraft({ ...valid, name: '  Ada Lovelace  ' })
    expect(result).toEqual({ ok: true, value: { ...valid } })
  })

  it('remonte un code d’erreur par champ invalide', () => {
    const result = validateContactDraft({ ...valid, name: 'A', email: 'nope', message: 'court' })
    expect(result).toEqual({ ok: false, error: { name: 'tooShort', email: 'emailInvalid', message: 'tooShort' } })
  })

  it('signale un champ manquant comme required', () => {
    const result = validateContactDraft({ ...valid, name: undefined })
    expect(result.ok === false && result.error.name).toBe('required')
  })

  it('signale un message trop long', () => {
    const result = validateContactDraft({ ...valid, message: 'x'.repeat(2001) })
    expect(result.ok === false && result.error.message).toBe('tooLong')
  })

  it('rejette un sujet hors liste', () => {
    const result = validateContactDraft({ ...valid, topic: 'spam' })
    expect(result.ok === false && result.error.topic).toBe('required')
  })

  it('retombe sur la langue par défaut si la locale est inconnue', () => {
    const result = validateContactDraft({ ...valid, locale: 'de' })
    expect(result.ok && result.value.locale).toBe('fr')
  })
})

describe('anti-spam helpers', () => {
  it('détecte le honeypot rempli', () => {
    expect(isHoneypotFilled({ website: 'http://spam' })).toBe(true)
    expect(isHoneypotFilled({ website: '  ' })).toBe(false)
    expect(isHoneypotFilled({})).toBe(false)
  })
  it('lit startedAt seulement s’il est numérique', () => {
    expect(readStartedAt({ startedAt: '1700000000000' })).toBe(1_700_000_000_000)
    expect(readStartedAt({ startedAt: 'abc' })).toBeUndefined()
    expect(readStartedAt({})).toBeUndefined()
  })
})
```
`tests/unit/domain/contact-policy.test.ts` : `isSubmittedTooFast(now - 1000, now)` → `true` ; `isSubmittedTooFast(now - MIN_FILL_MS - 1, now)` → `false` ; `isSubmittedTooFast(undefined, now)` → `false` ; `isRateLimited(RATE_MAX - 1)` → `false` ; `isRateLimited(RATE_MAX)` → `true`.
Run → **FAIL**. Implémenter `contact-policy.ts` (constantes + 2 fonctions d'une ligne) et `contact-draft.ts` :
```ts
import { DEFAULT_LOCALE, isLocale, type Locale } from '../locale'
import { err, ok, type Result } from '../shared/result'
import { CONTACT_TOPICS, type ContactTopic } from './contact-topic'

export type RawContactInput = Readonly<Record<string, unknown>>
export type ContactDraft = { readonly name: string; readonly email: string; readonly topic: ContactTopic; readonly message: string; readonly locale: Locale }
export type ContactFieldError = 'required' | 'emailInvalid' | 'tooShort' | 'tooLong'
export type ContactFieldErrors = Partial<Record<'name' | 'email' | 'topic' | 'message', ContactFieldError>>

const LIMITS = { name: { min: 2, max: 80 }, email: { max: 160 }, message: { min: 10, max: 2000 } } as const
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const text = (raw: RawContactInput, key: string): string => (typeof raw[key] === 'string' ? (raw[key] as string).trim() : '')

function checkLength(value: string, min: number, max: number): ContactFieldError | null {
  if (value === '') return 'required'
  if (value.length < min) return 'tooShort'
  return value.length > max ? 'tooLong' : null
}

function checkEmail(value: string): ContactFieldError | null {
  const length = checkLength(value, 1, LIMITS.email.max)
  if (length) return length
  return EMAIL_PATTERN.test(value) ? null : 'emailInvalid'
}

const fieldError = (field: keyof ContactFieldErrors, error: ContactFieldError | null): ContactFieldErrors => (error ? { [field]: error } : {})

export function validateContactDraft(raw: RawContactInput): Result<ContactDraft, ContactFieldErrors> {
  const [name, email, topic, message] = [text(raw, 'name'), text(raw, 'email'), text(raw, 'topic'), text(raw, 'message')]
  const errors: ContactFieldErrors = {
    ...fieldError('name', checkLength(name, LIMITS.name.min, LIMITS.name.max)),
    ...fieldError('email', checkEmail(email)),
    ...fieldError('topic', (CONTACT_TOPICS as readonly string[]).includes(topic) ? null : 'required'),
    ...fieldError('message', checkLength(message, LIMITS.message.min, LIMITS.message.max)),
  }
  if (Object.keys(errors).length > 0) return err(errors)
  const locale = isLocale(raw.locale) ? raw.locale : DEFAULT_LOCALE
  return ok({ name, email, topic: topic as ContactTopic, message, locale })
}

export const isHoneypotFilled = (raw: RawContactInput): boolean => text(raw, 'website') !== ''

export function readStartedAt(raw: RawContactInput): number | undefined {
  const value = Number(raw.startedAt)
  return raw.startedAt !== undefined && raw.startedAt !== '' && Number.isFinite(value) ? value : undefined
}
```
Run : `pnpm test tests/unit/domain` → **PASS** (ajuster l'implémentation, jamais les codes attendus).

- [ ] **Step 2 : Cas d'usage `SubmitContactMessage` avec fakes (échouent)**

`tests/support/in-memory-contact-message-repository.ts` : `class InMemoryContactMessageRepository implements ContactMessageRepository` (tableau `saved`, `recentCount` réglable, option `failOnSave`). `tests/support/fake-ip-hasher.ts` : `{ hash: (ip) => 'h(' + ip + ')' }`.
`tests/unit/application/submit-contact-message.test.ts` :
```ts
import { describe, expect, it } from 'vitest'
import { SubmitContactMessage } from '@/application/contact/submit-contact-message'
import { MIN_FILL_MS, RATE_MAX } from '@/domain'
import { fakeIpHasher } from '../../support/fake-ip-hasher'
import { fixedClock } from '../../support/fixed-clock'
import { InMemoryContactMessageRepository } from '../../support/in-memory-contact-message-repository'

const NOW = '2026-09-30T12:00:00Z'
const nowMs = new Date(NOW).getTime()
const validRaw = { name: 'Ada Lovelace', email: 'ada@example.com', topic: 'project', message: 'Bonjour, je voudrais discuter d’un projet.', locale: 'fr', website: '', startedAt: String(nowMs - MIN_FILL_MS - 2000) }

function setup(over: { recentCount?: number; failOnSave?: boolean; notify?: () => Promise<void> } = {}) {
  const messages = new InMemoryContactMessageRepository({ recentCount: over.recentCount ?? 0, failOnSave: over.failOnSave ?? false })
  const notified: unknown[] = []
  const notifier = { notify: over.notify ?? (async (m: unknown) => { notified.push(m) }) }
  const useCase = new SubmitContactMessage({ messages, hasher: fakeIpHasher, clock: fixedClock(NOW), notifier })
  return { useCase, messages, notified }
}

describe('SubmitContactMessage', () => {
  it('enregistre puis notifie une saisie valide', async () => {
    const { useCase, messages, notified } = setup()
    expect(await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })).toEqual({ status: 'ok' })
    expect(messages.saved).toHaveLength(1)
    expect(messages.saved[0]).toMatchObject({ name: 'Ada Lovelace', ipHash: 'h(1.1.1.1)', locale: 'fr' })
    expect(notified).toHaveLength(1)
  })

  it('renvoie les erreurs par champ sans rien enregistrer', async () => {
    const { useCase, messages } = setup()
    const result = await useCase.execute({ raw: { ...validRaw, message: 'court' }, ip: '1.1.1.1' })
    expect(result).toEqual({ status: 'invalid', fieldErrors: { message: 'tooShort' } })
    expect(messages.saved).toHaveLength(0)
  })

  it('répond ok en silence au honeypot rempli, sans rien enregistrer', async () => {
    const { useCase, messages } = setup()
    expect(await useCase.execute({ raw: { ...validRaw, website: 'http://spam' }, ip: '1.1.1.1' })).toEqual({ status: 'ok' })
    expect(messages.saved).toHaveLength(0)
  })

  it('répond ok en silence à une soumission trop rapide', async () => {
    const { useCase, messages } = setup()
    expect(await useCase.execute({ raw: { ...validRaw, startedAt: String(nowMs - 1000) }, ip: '1.1.1.1' })).toEqual({ status: 'ok' })
    expect(messages.saved).toHaveLength(0)
  })

  it("n'applique pas le time-trap sans startedAt (JS désactivé)", async () => {
    const { useCase, messages } = setup()
    const { startedAt: _omitted, ...withoutTimestamp } = validRaw
    expect(await useCase.execute({ raw: withoutTimestamp, ip: '1.1.1.1' })).toEqual({ status: 'ok' })
    expect(messages.saved).toHaveLength(1)
  })

  it('refuse au-delà de la limite de débit', async () => {
    const { useCase, messages } = setup({ recentCount: RATE_MAX })
    expect(await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })).toEqual({ status: 'rate_limited' })
    expect(messages.saved).toHaveLength(0)
  })

  it("renvoie error si l'enregistrement échoue, sans notifier", async () => {
    const { useCase, notified } = setup({ failOnSave: true })
    expect(await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })).toEqual({ status: 'error' })
    expect(notified).toHaveLength(0)
  })

  it('reste ok si la notification échoue (le message est déjà enregistré)', async () => {
    const { useCase } = setup({ notify: async () => { throw new Error('smtp') } })
    expect(await useCase.execute({ raw: validRaw, ip: '1.1.1.1' })).toEqual({ status: 'ok' })
  })
})
```
Run → **FAIL**. Implémenter `src/application/contact/submit-contact-message.ts` — méthodes courtes, une responsabilité chacune :
```ts
import { isHoneypotFilled, isRateLimited, isSubmittedTooFast, readStartedAt, RATE_WINDOW_MS, validateContactDraft, type ContactFieldErrors, type RawContactInput } from '@/domain'
import type { Clock } from '../ports/clock'
import type { ContactMessageRepository, NewContactMessage } from '../ports/contact-message-repository'
import type { ContactNotifier } from '../ports/contact-notifier'
import type { IpHasher } from '../ports/ip-hasher'

export type SubmitContactResult =
  | { status: 'ok' }
  | { status: 'invalid'; fieldErrors: ContactFieldErrors }
  | { status: 'rate_limited' }
  | { status: 'error' }

type Dependencies = { messages: ContactMessageRepository; hasher: IpHasher; clock: Clock; notifier?: ContactNotifier }

export class SubmitContactMessage {
  constructor(private readonly deps: Dependencies) {}

  async execute(input: { raw: RawContactInput; ip: string }): Promise<SubmitContactResult> {
    const draft = validateContactDraft(input.raw)
    if (!draft.ok) return { status: 'invalid', fieldErrors: draft.error }
    if (this.looksLikeABot(input.raw)) return { status: 'ok' } // succès silencieux : aucun indice pour le bot

    const ipHash = this.deps.hasher.hash(input.ip)
    if (await this.isOverRateLimit(ipHash)) return { status: 'rate_limited' }

    return this.store({ ...draft.value, ipHash })
  }

  private looksLikeABot(raw: RawContactInput): boolean {
    return isHoneypotFilled(raw) || isSubmittedTooFast(readStartedAt(raw), this.deps.clock.now())
  }

  private async isOverRateLimit(ipHash: string): Promise<boolean> {
    return isRateLimited(await this.deps.messages.countSince(ipHash, this.deps.clock.now() - RATE_WINDOW_MS))
  }

  private async store(message: NewContactMessage): Promise<SubmitContactResult> {
    try {
      await this.deps.messages.save(message)
    } catch {
      return { status: 'error' }
    }
    await this.notifyBestEffort(message)
    return { status: 'ok' }
  }

  private async notifyBestEffort(message: NewContactMessage): Promise<void> {
    try {
      await this.deps.notifier?.notify(message)
    } catch {
      // Best-effort : le message est déjà en base, la notification ne doit pas faire échouer l'envoi.
    }
  }
}
```
Créer les 3 ports (interfaces ci-dessus). Run : `pnpm test tests/unit/application` → **PASS**.

- [ ] **Step 3 : Adaptateurs infrastructure**

`tests/unit/infrastructure/sha256-ip-hasher.test.ts` : `hash` est déterministe, fait 32 caractères hexadécimaux, change avec le sel **et** avec l'IP. `src/infrastructure/contact/sha256-ip-hasher.ts` :
```ts
import { createHash } from 'node:crypto'
import type { IpHasher } from '@/application/ports/ip-hasher'

const HASH_LENGTH = 32

export class Sha256IpHasher implements IpHasher {
  constructor(private readonly salt: string) {}

  hash(ip: string): string {
    return createHash('sha256').update(`${this.salt}:${ip}`).digest('hex').slice(0, HASH_LENGTH)
  }
}
```
`payload-contact-message-repository.ts` : `save` = `payload.create({ collection: 'messages', data: message, overrideAccess: true, context: { disableRevalidate: true } })` ; `countSince` = `payload.count({ collection: 'messages', where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: new Date(sinceEpochMs).toISOString() } }] }, overrideAccess: true })` → `totalDocs`.
`resend-contact-notifier.ts` : n'envoie que du **texte brut** (aucune injection HTML) via `new Resend(apiKey).emails.send({ from, to, replyTo: message.email, subject: '[Portfolio] <topic> — <name>', text })` ; le destinataire = `await resolveRecipient()` (le composition root lui passe une fonction qui lit `contactTo` du global `site` avec `overrideAccess: true`) sinon `fallbackTo` (`CONTACT_TO`).

- [ ] **Step 4 : Composition, action serveur, IP client**

`src/composition/contact.ts` (`import 'server-only'`) :
```ts
export function getContactUseCases(): { submitContactMessage: SubmitContactMessage } // mémoïsé
// notifier construit UNIQUEMENT si process.env.RESEND_API_KEY est défini ; sel = process.env.IP_HASH_SALT ?? ''
```
`src/composition/index.ts` : ajouter `export * from './contact'`.
`tests/unit/app/client-ip.test.ts` : `clientIp(new Headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' }))` = `'9.9.9.9'` ; `x-real-ip` en repli ; `'0.0.0.0'` par défaut. `client-ip.ts` :
```ts
const UNKNOWN_IP = '0.0.0.0'

export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim() || UNKNOWN_IP
}
```
`_actions/submit-contact.ts` :
```ts
'use server'
import { headers } from 'next/headers'
import { getContactUseCases } from '@/composition'
import type { ContactFormState } from '@/presentation/components/sections/contact/ContactForm'
import { clientIp } from './client-ip'

export async function submitContact(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const { submitContactMessage } = getContactUseCases()
  return submitContactMessage.execute({ raw: Object.fromEntries(formData), ip: clientIp(await headers()) })
}
```
> `app` peut importer le **type** `ContactFormState` de la présentation ; **la présentation n'importe jamais `app`**.

- [ ] **Step 5 : Test d'intégration (base réelle)**

`tests/integration/contact.int.test.ts` : avec `getPayload` réel, `new PayloadContactMessageRepository(() => getPayload({ config }))`, `Sha256IpHasher('test')` et `SubmitContactMessage` sans notifier, IP `203.0.113.7` : (1) 3 soumissions valides (`startedAt = Date.now() - 5000`) → `ok` et **3 documents** `messages` de même `ipHash` ; (2) la 4ᵉ → `rate_limited` ; (3) `afterAll` supprime les messages de cet `ipHash` (`overrideAccess: true`, `context: { disableRevalidate: true }`).

- [ ] **Step 6 : UI (présentation)**

`Contact.tsx` (serveur, **signature `Contact({ site, submitAction })`**) : `Section id="contact"` ; grille `lg:grid-cols-12` : gauche (`col-span-5`) `SectionHeading` (`contact.eyebrow`, `contact.title`), `contact.intro`, carte verre `details` (e-mail `mailto:`, LinkedIn, GitHub, localisation, **téléphone seulement si `showPhone && phone`**, liens texte `↗`) ; droite (`col-span-7`) `<Glass variant="surface" class="p-6 md:p-8"><ContactForm locale={locale} action={submitAction} /></Glass>`.
`ContactForm.tsx` (client) : **reçoit l'action en prop** (`action: ContactFormAction`), exporte `ContactFormState` et `ContactFormAction` ; `useActionState(action, { status: 'idle' })` ; `<form data-testid="contact-form" action={formAction} noValidate>` ; champs **avec labels visibles** au-dessus (`name` `autoComplete="name"`, `email` `type="email" autoComplete="email"`, `topic` `<select>` (options `CONTACT_TOPICS`), `message` `<textarea rows={6}>`), champs cachés `locale` et `startedAt` (posé dans un `useEffect` → **pas de mismatch d'hydratation**), **honeypot** (`name="website"`, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`, hors écran) ; erreurs **sous chaque champ** (élément d'erreur `id="${uid}-${champ}-error"` avec `uid = useId()` ; `aria-describedby` pointe dessus ; `aria-invalid`, texte `errors.<code>`) ; bouton `useFormStatus` (`contact.sending` + `disabled` pendant l'envoi) ; région statut `<div role="status" aria-live="polite" data-testid="contact-status">` : `success` (vert `--success`, puis reset du formulaire par `key`), `rateLimited`, `error` ; le focus va au premier champ en erreur après soumission invalide. Cibles ≥ 44px, `text-base` (16px) pour éviter le zoom iOS. Extraire un petit composant `FormField` (label + contrôle + erreur) pour rester sous la limite de taille de fonction.
`contact.json` FR : `eyebrow` « Contact », `title` « Discutons de votre projet », `intro` « Un projet, une question, une opportunité ? Écris-moi, je réponds rapidement. », `fields` (Nom, E-mail, Sujet, Message), `topics` (Un projet, IA générative, Opportunité pro, Autre), `submit` « Envoyer le message », `sending` « Envoi… », `success` « Merci ! Ton message est bien parti. », `error` « Le message n’a pas pu être envoyé. Réessaie ou écris-moi directement par e-mail. », `rateLimited` « Trop de messages en peu de temps. Réessaie dans quelques minutes. », `details` (Coordonnées, E-mail, LinkedIn, GitHub, Localisation, Téléphone), `honeypot` « Ne pas remplir » + EN.

- [ ] **Step 7 : Test E2E**

`tests/e2e/sections/contact.spec.ts` :
```ts
import { expect, test } from '@playwright/test'

test('erreurs de validation sous chaque champ, accessibles', async ({ page }) => {
  await page.goto('/fr#contact')
  const form = page.getByTestId('contact-form')
  await form.getByRole('button', { name: 'Envoyer le message' }).click()
  const name = form.getByLabel('Nom')
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(form.locator('[id$="-name-error"]')).toBeVisible()
  await expect(name).toBeFocused()
})

test('e-mail invalide signalé', async ({ page }) => {
  await page.goto('/fr#contact')
  const form = page.getByTestId('contact-form')
  await form.getByLabel('Nom').fill('Ada Lovelace')
  await form.getByLabel('E-mail').fill('pas-un-email')
  await form.getByLabel('Message').fill('Bonjour, je voudrais discuter d’un projet.')
  await form.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(form.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')
})

test('envoi valide : message de succès annoncé (statut aria-live)', async ({ page }) => {
  await page.goto('/fr#contact')
  const form = page.getByTestId('contact-form')
  await form.getByLabel('Nom').fill('Ada Lovelace')
  await form.getByLabel('E-mail').fill('ada@example.com')
  await form.getByLabel('Message').fill('Bonjour, je voudrais discuter d’un projet.')
  await form.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(page.getByTestId('contact-status')).toContainText('Merci')
})

test('le téléphone n’apparaît pas par défaut', async ({ page }) => {
  await page.goto('/fr#contact')
  await expect(page.locator('#contact')).not.toContainText(/\+33|0[67] ?\d\d/)
})
```
> Le test « envoi valide » soumet vite (< 3 s) → succès **silencieux** côté cas d'usage (rien en base) : voulu, cela ne pollue pas la base de CI. L'enregistrement réel est couvert par le test d'intégration.

- [ ] **Step 8 : Vérifier** — `pnpm test` **PASS** (dont `architecture.test.ts`), `pnpm test:int` **PASS**, `pnpm typecheck && pnpm lint` verts ; l'e2e du contact est exécuté par la porte de vague (`pnpm build && pnpm e2e tests/e2e/sections/contact.spec.ts`).

- [ ] **Step 9 : Commit**

```bash
git add src/domain src/application src/infrastructure/cms/payload/payload-contact-message-repository.ts src/infrastructure/contact src/composition "src/app/(site)/[locale]/(shell)/_actions" src/presentation/components/sections/Contact.tsx src/presentation/components/sections/contact src/presentation/i18n/messages/fr/contact.json src/presentation/i18n/messages/en/contact.json tests/support tests/unit/domain/contact-draft.test.ts tests/unit/domain/contact-policy.test.ts tests/unit/application/submit-contact-message.test.ts tests/unit/infrastructure/sha256-ip-hasher.test.ts tests/unit/app/client-ip.test.ts tests/integration/contact.int.test.ts tests/e2e/sections/contact.spec.ts
git commit -m "feat(contact): add layered contact flow (domain rules, use case, adapters, server action) with anti-spam"
```

## Task 17 : Suites E2E transverses — structure, responsive, a11y, i18n, mouvement, CMS, budget

**Files :**
- Create : `tests/e2e/{home,responsive,a11y,i18n,motion,cms,perf-budget}.spec.ts`, `docs/quality-report.md`
- Modify : (corrections **minimales** dans les composants fautifs si un test révèle un vrai défaut — chaque correction est listée dans le rapport)

**Interfaces :**
- Consumes : tout le site (T1–T16) ; projets Playwright `desktop` (1440), `laptop` (1024), `tablet` (768), `mobile` (375)
- Produces : filet de non-régression exécuté en CI ; `docs/quality-report.md` (scores Lighthouse réels + défauts trouvés/corrigés)

- [ ] **Step 1 : `home.spec.ts` — structure de la page**

```ts
import { expect, test } from '@playwright/test'

const IDS = ['hero', 'about', 'services', 'stack', 'projects', 'journey', 'process', 'contact']

test('les 8 sections sont présentes, dans l’ordre du contrat', async ({ page }) => {
  await page.goto('/fr')
  const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((e) => e.id))
  expect(ids).toEqual(IDS)
})

test('chaque section porte un titre accessible (aria-labelledby résolu)', async ({ page }) => {
  await page.goto('/fr')
  for (const id of IDS) {
    const labelledBy = await page.locator(`#${id}`).getAttribute('aria-labelledby')
    if (id === 'hero' || labelledBy) {
      const target = await page.locator(`#${labelledBy ?? 'hero-title'}`).count()
      expect(target, `titre de #${id}`).toBe(1)
    }
  }
})

test('un seul h1, titres hiérarchisés', async ({ page }) => {
  await page.goto('/fr')
  await expect(page.locator('h1')).toHaveCount(1)
})

test('le lien d’évitement mène au contenu principal', async ({ page }) => {
  await page.goto('/fr')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Aller au contenu' })
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
})

test('métadonnées : title, description, canonical, hreflang', async ({ page }) => {
  await page.goto('/fr')
  await expect(page).toHaveTitle(/Denis Bucspun/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/)
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
})
```

- [ ] **Step 2 : `responsive.spec.ts`**

```ts
import { expect, test } from '@playwright/test'

const PAGES = ['/fr', '/en']

for (const path of PAGES) {
  test(`${path} : aucun scroll horizontal`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('page détail : aucun scroll horizontal', async ({ page }) => {
  await page.goto('/fr')
  const href = await page.getByTestId('project-card').first().getByRole('link').getAttribute('href')
  await page.goto(href!)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('nav desktop ≥ 768px / dock mobile < 768px', async ({ page, viewport }) => {
  await page.goto('/fr')
  const wide = viewport!.width >= 768
  await expect(page.getByTestId('dock')).toBeVisible({ visible: !wide })
  await expect(page.getByTestId('nav').getByRole('link', { name: 'Services' })).toBeVisible({ visible: wide })
})

test('cibles tactiles principales ≥ 44px (dock, boutons, bascule de langue)', async ({ page, viewport }) => {
  test.skip(viewport!.width >= 768, 'contrôle mobile')
  await page.goto('/fr')
  const targets = page.locator('[data-testid="dock"] a, [data-testid="lang-switch"] a, main button')
  for (const el of await targets.all()) {
    if (!(await el.isVisible())) continue
    const box = await el.boundingBox()
    expect(box!.height, await el.innerText()).toBeGreaterThanOrEqual(44)
  }
})

test('le dock ne masque aucun contenu en bas de page (padding réservé)', async ({ page, viewport }) => {
  test.skip(viewport!.width >= 768, 'contrôle mobile')
  await page.goto('/fr')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  const footer = page.locator('footer')
  const dock = page.getByTestId('dock')
  const fb = await footer.boundingBox()
  const db = await dock.boundingBox()
  expect(fb!.y + fb!.height).toBeLessThanOrEqual(db!.y + 1) // le pied de page reste au-dessus du dock
})
```

- [ ] **Step 3 : `a11y.spec.ts`** (axe)

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze()
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
}

for (const path of ['/fr', '/en']) {
  test(`axe : 0 violation serious/critical sur ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)) // déclenche les .reveal
    await page.waitForTimeout(800)
    const bad = await scan(page)
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
  })
}

test('axe : page détail projet', async ({ page }) => {
  await page.goto('/fr')
  const href = await page.getByTestId('project-card').first().getByRole('link').getAttribute('href')
  await page.goto(href!)
  expect(await scan(page)).toEqual([])
})

test('navigation clavier : tous les contrôles ont un focus visible', async ({ page }) => {
  await page.goto('/fr')
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return 'none'
      const s = getComputedStyle(el)
      return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? 'ok' : 'none'
    })
    expect(outline).toBe('ok')
  }
})
```
> Si axe signale `color-contrast` sur du verre : **ne pas** désactiver la règle. Mesurer le vrai contraste (fond composité), corriger le token ou le fill, et relancer `tokens.contrast.test.ts`.

- [ ] **Step 4 : `i18n.spec.ts`**

```ts
import { expect, test } from '@playwright/test'

test('/ redirige vers /fr pour un navigateur français', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'fr-FR' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page).toHaveURL(/\/fr\/?$/)
  await ctx.close()
})

test('/ redirige vers /en pour un navigateur anglais', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'en-US' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page).toHaveURL(/\/en\/?$/)
  await ctx.close()
})

test('la bascule de langue conserve la page et met à jour <html lang>', async ({ page }) => {
  await page.goto('/fr')
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await page.getByTestId('lang-switch').getByRole('link', { name: 'EN' }).click()
  await expect(page).toHaveURL(/\/en/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('#services h2')).toHaveText('Services')
})

test('EN : contenu CMS traduit (pas de repli FR sur le titre du hero)', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('#hero')).toContainText('Full Stack Developer')
})

test('URL inconnue → 404 localisée', async ({ page }) => {
  const res = await page.goto('/fr/nimporte-quoi')
  expect(res?.status()).toBe(404)
})
```

- [ ] **Step 5 : `motion.spec.ts`**

```ts
import { expect, test } from '@playwright/test'

test('reduced-motion : tout le contenu est visible sans scroller', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto('/fr')
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity !== '1').length)
  expect(hidden).toBe(0)
  await ctx.close()
})

test('sans JavaScript : le contenu essentiel est présent et visible', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/fr')
  await expect(page.locator('h1')).toHaveText('Denis Bucspun')
  await expect(page.getByTestId('service-card').first()).toBeVisible()
  await expect(page.getByTestId('project-card').first()).toBeVisible()
  await ctx.close()
})

test('reduced-transparency : le verre devient opaque', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/fr')
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector('[data-glass="pill"]')!).backgroundColor)
  expect(bg).toMatch(/rgb/)
})
```

- [ ] **Step 6 : `cms.spec.ts`**

```ts
import { expect, test } from '@playwright/test'

test('/admin répond (connexion ou création du premier utilisateur)', async ({ page }) => {
  const res = await page.goto('/admin')
  expect(res?.status()).toBeLessThan(400)
  await expect(page.locator('body')).toContainText(/(Connexion|Se connecter|Créer|Login|Create)/i)
})

test('API publique : seulement des projets publiés, aucun message', async ({ request }) => {
  const projects = await request.get('/api/projects?limit=50')
  expect(projects.ok()).toBe(true)
  const body = await projects.json()
  for (const doc of body.docs) expect(doc._status).toBe('published')

  const messages = await request.get('/api/messages')
  expect([401, 403]).toContain(messages.status())
})

test('création publique interdite (users, messages, projects)', async ({ request }) => {
  for (const [path, data] of [
    ['/api/users', { email: 'x@y.co', password: 'Passw0rd!Passw0rd!' }],
    ['/api/messages', { name: 'A', email: 'a@b.co', topic: 'other', message: 'Bonjour, ceci est un test.' }],
    ['/api/projects', { title: 'Pirate' }],
  ] as const) {
    const res = await request.post(path, { data })
    expect([401, 403], path).toContain(res.status())
  }
})
```

- [ ] **Step 7 : `perf-budget.spec.ts`** — budget JS initial (la 3D et Lenis/GSAP ne doivent pas gonfler le chargement initial)

```ts
import { expect, test } from '@playwright/test'

test('JS transféré avant idle ≤ 400 Ko et aucun chunk three/R3F sans média 3D', async ({ page }) => {
  let bytes = 0
  const urls: string[] = []
  page.on('response', async (r) => {
    if (r.request().resourceType() !== 'script') return
    urls.push(r.url())
    bytes += Number(r.headers()['content-length'] ?? (await r.body()).length)
  })
  await page.goto('/fr')
  await page.waitForLoadState('networkidle')
  expect(bytes).toBeLessThanOrEqual(400_000)
  const hasThree = await page.evaluate(() => performance.getEntriesByType('resource').some((e) => /three|drei|fiber/.test(e.name)))
  expect(hasThree).toBe(false)
})
```
> Si le budget est dépassé : **enquêter** (`pnpm build` → « First Load JS », chargement dynamique de `AvatarCanvas`, imports lourds côté client) ; ne pas relever le seuil sans le justifier dans `docs/quality-report.md`.

- [ ] **Step 8 : Lighthouse mobile + rapport**

Lancer sur un build de production (`pnpm build && pnpm start -p 3100`) :
```bash
CHROME_PATH="$(node -e "console.log(require('@playwright/test').chromium.executablePath())")" \
  pnpm dlx lighthouse http://localhost:3100/fr --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=./lh-fr.json --quiet --chrome-flags="--headless=new --no-sandbox"
```
Consigner dans `docs/quality-report.md` : scores réels **tels que mesurés** (cibles : accessibilité ≥ 95, performance mobile ≥ 85, CLS < 0,1), la date, la config, et la liste des défauts trouvés/corrigés. Si une cible n'est pas atteinte : diagnostiquer (LCP = poster/h1 ? polices ? JS ?), corriger, remesurer — ou documenter honnêtement l'écart et sa cause.

- [ ] **Step 9 : Exécuter** — `pnpm build && pnpm e2e` (4 projets) **PASS** ; `NEXT_PUBLIC_E2E=1 pnpm build && pnpm e2e tests/e2e/sections/hero.spec.ts` **PASS** (chemin 3D).

- [ ] **Step 10 : Commit**

```bash
git add tests/e2e docs/quality-report.md
git commit -m "test(e2e): add structure, responsive, a11y, i18n, motion, CMS and JS-budget suites with quality report"
```
(+ commits séparés `fix(...)` pour chaque correction de composant.)

---

## Task 18 : Docker, CI, SEO, documentation

**Files :**
- Create : `Dockerfile`, `.dockerignore`, `.github/workflows/ci.yml`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/presentation/components/seo/PersonJsonLd.tsx`, `README.md`, `docs/cms-guide.md`, `docs/deploy.md`, `tests/e2e/seo.spec.ts`
- Modify : `docker-compose.yml` (ajoute les services `migrate` et `app`, profil `app`), `"src/app/(site)/[locale]/(shell)/page.tsx"` (injecte `<PersonJsonLd/>`), `"src/app/(site)/[locale]/(shell)/layout.tsx"` et `"…/projects/[slug]/page.tsx"` (garde `SKIP_BUILD_STATIC`)

**Interfaces :**
- Consumes : `getPortfolioUseCases().getSiteProfile` / `.listProjectRefs` (T7, via `@/composition`) ; `routing` (T6) ; scripts `package.json` (T1)
- Produces : image Docker exécutable ; workflow CI ; `robots.txt`, `sitemap.xml` (home ×2 langues + chaque projet ×2 langues, `alternates.languages`), JSON-LD `Person` ; docs

- [ ] **Step 1 : Build sans base (Docker) — garde `SKIP_BUILD_STATIC`**

Un `docker build` n'a pas de Postgres : les pages ne doivent pas être pré-rendues à ce moment. Dans `(shell)/layout.tsx` et `(shell)/page.tsx` : `import { connection } from 'next/server'` puis, en tête du composant, `if (process.env.SKIP_BUILD_STATIC === '1') await connection()` (opt-out du pré-rendu, exécuté seulement quand le drapeau est posé). Dans `projects/[slug]/page.tsx` : `generateStaticParams` renvoie `[]` si `SKIP_BUILD_STATIC === '1'`. **Sans le drapeau (CI, Vercel), comportement inchangé** (ISR + revalidation).

- [ ] **Step 2 : `Dockerfile`** (multi-étapes, sortie `standalone`)

```dockerfile
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL SKIP_BUILD_STATIC=1
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
RUN mkdir -p media && chown app:app media
USER app
EXPOSE 3000
CMD ["node", "server.js"]
```
`.dockerignore` : `node_modules`, `.next`, `.git`, `img`, `media`, `media-out`, `.env*`, `tests`, `docs`, `design-system`, `playwright-report`.
`docker-compose.yml` — ajouter (profil `app`, sans toucher au service `postgres`) :
```yaml
  migrate:
    profiles: [app]
    build: { context: ., target: build }
    command: pnpm migrate
    environment: &appenv
      DATABASE_URI: postgres://portfolio:portfolio@postgres:5432/portfolio
      PAYLOAD_SECRET: ${PAYLOAD_SECRET:?définis PAYLOAD_SECRET}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}
      IP_HASH_SALT: ${IP_HASH_SALT:-change-me}
    depends_on: { postgres: { condition: service_healthy } }
  app:
    profiles: [app]
    build: { context: ., target: runner }
    ports: ['3000:3000']
    environment: *appenv
    volumes: [media:/app/media]
    depends_on: { postgres: { condition: service_healthy } }
```
(+ volume nommé `media`). Vérifier : `PAYLOAD_SECRET=… docker compose --profile app build`, `docker compose --profile app run --rm migrate`, `docker compose --profile app up -d app`, `curl -sI http://localhost:3000/fr` → `200`. **Noter** que le média uploadé en conteneur vit dans le volume `media` (en prod Vercel : Blob).

- [ ] **Step 3 : CI** — `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 25
    services:
      postgres:
        image: postgres:17-alpine
        env: { POSTGRES_USER: portfolio, POSTGRES_PASSWORD: portfolio, POSTGRES_DB: portfolio }
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U portfolio -d portfolio" --health-interval 5s --health-timeout 5s --health-retries 10
    env:
      DATABASE_URI: postgres://portfolio:portfolio@localhost:5432/portfolio
      PAYLOAD_SECRET: ci-secret-ci-secret-ci-secret-32chars
      NEXT_PUBLIC_SITE_URL: http://localhost:3100
      IP_HASH_SALT: ci-salt
      NEXT_PUBLIC_E2E: '1'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm migrate
      - run: pnpm test:int
      - run: pnpm seed
      - run: pnpm build
      - run: pnpm e2e:install
      - run: pnpm e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report, retention-days: 7 }
```
> Les actions doivent être valides à la date du jour : vérifier les versions majeures courantes de `checkout`, `setup-node`, `pnpm/action-setup`, `upload-artifact` et ajuster. **Le workflow est validé en local** avec `actionlint` (si dispo) ou par relecture ; sa première exécution réelle a lieu au push (Task 20).

- [ ] **Step 4 : SEO**

`robots.ts` : `{ rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }], sitemap: `${base}/sitemap.xml` }`.
`sitemap.ts` : entrées `/fr`, `/en`, puis, pour chaque `ProjectRef` de `listProjectRefs.execute()`, `/fr/projects/<slug>` et `/en/projects/<slug>`, avec `alternates.languages`, `lastModified` = `ref.updatedAt` ; `base = process.env.NEXT_PUBLIC_SITE_URL`.
`PersonJsonLd.tsx` : `<script type="application/ld+json">` `{ "@context": "https://schema.org", "@type": "Person", name, jobTitle, url, sameAs: [linkedin, github], address: { "@type": "PostalAddress", addressLocality: 'Nanterre', addressCountry: 'FR' } }` — **jamais** téléphone ni e-mail. Échapper `<` dans le JSON (`.replace(/</g, '\\u003c')`).
`tests/e2e/seo.spec.ts` : `/robots.txt` contient `Disallow: /admin` et `Sitemap:` ; `/sitemap.xml` contient `/fr`, `/en` et au moins un `/projects/` ; la home contient un JSON-LD `Person` valide (`JSON.parse`) **sans** `telephone` ni `email`.

- [ ] **Step 5 : Documentation** (français, concise, exacte — chaque commande a été **exécutée** avant d'être écrite)

`README.md` : présentation (capture d'écran du site), stack, **démarrage en 6 commandes** (`pnpm i` → `cp .env.example .env` → `pnpm db:up` → `pnpm migrate` → `pnpm seed` → `pnpm dev`), table des scripts, structure, variables d'environnement, tests, pipeline média (lien `docs/higgsfield`), conventions de commit, licence « tous droits réservés ».
`docs/cms-guide.md` : créer le premier utilisateur ; **ajouter un projet** (champs, brouillon → publié, slug, cover, stacks) ; **ajouter une stack** (slug Simple Icons ou upload ; pas d'icône = monogramme) ; services, expériences, textes du site, chiffres auto/manuels, téléphone `showPhone`, CV ; **médias cinématiques** (slots) ; boîte de réception des messages ; changer de langue d'édition FR/EN ; « pourquoi ma modif n'apparaît pas ? » (revalidation).
`docs/deploy.md` : Vercel + Neon + Vercel Blob (variables, `pnpm build:prod`, création du premier utilisateur, `pnpm seed` contre la base distante — avec l'avertissement « idempotent mais écrase les textes seedés »), Resend, domaine, `NEXT_PUBLIC_SITE_URL` ; alternative Docker. **Aucun déploiement n'est lancé sans l'accord explicite de Denis.**

- [ ] **Step 6 : Vérifier** — `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e tests/e2e/seo.spec.ts` **PASS** ; build Docker OK (Step 2).

- [ ] **Step 7 : Commit**

```bash
git add Dockerfile .dockerignore docker-compose.yml .github README.md docs/cms-guide.md docs/deploy.md src/app/robots.ts src/app/sitemap.ts src/presentation/components/seo "src/app/(site)" tests/e2e/seo.spec.ts
git commit -m "chore: add Docker image, CI workflow, SEO (robots, sitemap, JSON-LD) and project documentation"
```

---

## Task 19 : Revue adversariale multi-angles + correctifs

**But :** trouver ce que les tests ne voient pas. Exécutée par le **Workflow** d'orchestration (finders parallèles → vérification sceptique → correctifs), pas par l'exécutant d'une tâche de code.

**Angles (un finder chacun, en lecture seule, avec captures 375/768/1024/1440 via le navigateur intégré) :**
1. **Accessibilité** — clavier, focus, ordre de lecture, `aria-*`, contrastes **mesurés** sur les fonds composités réels (pas seulement les tokens), `prefers-reduced-motion/transparency`, cibles 44px, mobile dock, formulaires.
2. **Performance** — LCP/CLS/TBT réels, taille du JS initial, chargement paresseux de three/R3F/Lenis, images (`sizes`, formats), polices, vidéo (`preload`), fuites (listeners, ScrollTrigger non nettoyés, RAF, contextes WebGL).
3. **Sécurité** — access control Payload (lecture/écriture par rôle, brouillons), server action (validation, spam, exposition de `contactTo`), en-têtes, CORS/CSRF, XSS (JSON-LD, richtext), secrets/PII dans le repo (`git ls-files`, historique), dépendances.
4. **Responsive & visuel** — débordements, chevauchements (chips/hero), cadre 4:5 sur petits écrans, nav/dock, tailles de texte, cohérence avec `MASTER.md` et `img/exemple-portfolio.jpg`, rendu Safari/Firefox (repli du verre).
5. **Exactitude du contenu** — chaque phrase du seed FR/EN **rapprochée du CV** : aucun fait, chiffre ou technologie inventé ; EN fidèle ; dates ; liens (`BDenisss`) ; pas de témoignages/logos.
6. **Clean Architecture & clean code** — règle de dépendance au-delà du test (logique métier qui fuit dans un composant, une page, un hook ou une collection Payload ; adaptateur qui dépend d'un autre adaptateur ; cas d'usage anémique ou qui connaît l'infrastructure ; port mal découpé), SOLID/DIP, fonctions trop longues ou complexes, nommage, nombres magiques, commentaires qui disent *quoi*, code mort, duplications, `any`/`!`, `catch` muets, tests à base de mocks là où un fake suffit.
7. **Conformité spec & plan** — écarts vs spec/plan, fichiers trop gros, tokens bruts, emojis-icônes.

**Procédure :** chaque finding = `{ dimension, sévérité, fichier:ligne, preuve, correctif proposé }` ; **3 sceptiques indépendants** tentent de le réfuter (défaut « réfuté » si doute) ; survivants (≥ 2/3) → correctif minimal + **test qui échouait avant** ; boucle jusqu'à **2 tours consécutifs sans nouveau finding confirmé** ; puis un **critique de complétude** (« quel angle, viewport ou navigateur n'a pas été couvert ? »). Consigner le tout dans `docs/quality-report.md` (section « Revue adversariale »).

- [ ] **Step final :** `pnpm typecheck && pnpm lint && pnpm test && pnpm test:int && pnpm build && pnpm e2e` **verts** ; commits `fix(...)` séparés.

---

## Task 20 : Vérification finale et push

Appliquer **superpowers:verification-before-completion** : aucune affirmation de réussite sans la sortie de la commande.

- [ ] **Step 1 : Suite complète, sortie collée**

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm test:int
pnpm build
pnpm e2e
NEXT_PUBLIC_E2E=1 pnpm build && pnpm e2e tests/e2e/sections/hero.spec.ts
```
- [ ] **Step 2 : Hygiène du repo**

```bash
git ls-files | grep -E '^(img/|\.env$|media/)' ; echo "attendu : aucune ligne"
git grep -nE '\+33|0[67][ .]?[0-9]{2}[ .]?[0-9]{2}' -- . ':!docs' ':!design-system' ; echo "attendu : aucune ligne (téléphone)"
git log --format='%an <%ae>%n%B---' | grep -ci 'co-authored-by\|generated with' ; echo "attendu : 0"
git log --format='%an <%ae>' | sort -u ; echo "attendu : uniquement BDenisss <bucspun.d@gmail.com>"
pnpm exec vitest run tests/unit/architecture.test.ts ; echo "attendu : vert (règle de dépendance)"
git grep -nE ': any\b|as any\b|<any>' -- src ':!src/infrastructure/cms/payload/payload-types.ts' ; echo "attendu : aucune ligne"
```
- [ ] **Step 3 : Preuve visuelle** — captures finales 375/768/1024/1440 (FR et EN) de : hero (poster/orbe + `?__fixture=avatar`), services, stack, projets, page détail, parcours, contact, `/admin`.
- [ ] **Step 4 : Push**

```bash
git push -u origin main
```
Si l'authentification échoue (identifiants Git Credential Manager invalides), **s'arrêter et le dire** : Denis relance le push depuis son terminal. Ne jamais contourner l'authentification. Après un push réussi : vérifier le workflow **CI** sur GitHub (`https://github.com/BDenisss/Portfolio2026-V2/actions`), corriger si rouge.
- [ ] **Step 5 : Rapport à Denis** — ce qui est fait/vérifié (avec les chiffres réels), et **ce qui reste à sa main** : générer avatar/vidéos avec Higgsfield (`docs/higgsfield`) et les déposer dans `/admin`, créer son compte admin, décider de publier ou non les CV (contiennent le téléphone), confirmer le lien GitHub (`BDenisss`), configurer Vercel/Neon/Blob/Resend et donner le feu vert au déploiement.

---

## Auto-revue du plan (spec → tâches)

| Section du spec | Tâche(s) |
|---|---|
| §2 décisions (versions, Postgres, médias, langues, git) | T1, T5, T6, T20 |
| §3 structure du repo | T1 → T18 |
| §4 modèle de données, accès, hooks | T3, T4, T5 |
| §5 sections (hero, à propos, services, stack, projets, parcours, méthode, contact) | T9–T14, T16 |
| §5 flux de contact, anti-spam | T16 |
| §5 seed depuis les CV | T8 |
| §6 Liquid Glass, contrastes | T2, T17 |
| §7 hero cinématique, slots, repli, garde-fous | T10, T11, T15 |
| §7 pack Higgsfield + scripts | T15 |
| §8 responsive, a11y, budgets | T9, T17, T19 |
| §9 tests TDD, e2e, axe, CI, Docker, sécurité | T1–T4, T16, T17, T18, T19 |
| §10 risques (proxy Next 16, Node 25, réfraction Chromium, perf, fidélité, lien GitHub, slugs icônes) | T6 + T17 (proxy), T1 (Node), T2 (réfraction), T10 + T17 (perf), T15 (fidélité), T8 (GitHub, icônes), T3 (icônes) |
| Clean Architecture adaptée + clean code (exigence de Denis) | T1 (garde-fous ESLint + test d'architecture), T3–T7 et T16 (couches), T19 (revue dédiée) |
| SEO (sitemap, robots, JSON-LD), docs | T18 |
| Lighthouse (a11y ≥ 95, perf ≥ 85, CLS < 0,1) | T17 |

**Cohérence des noms vérifiée :** `decideHeroMode`/`isLowPower` (T10) ↔ `hero.spec` (T11) ; `SubmitContactMessage`/`ContactMessageRepository`/`MIN_FILL_MS`/`RATE_MAX` (T16) ↔ tests ; `groupStacksByCategory`/`computeCareerStats` (T7, domaine) ↔ T12–T14 ; `GetHomePage`/`HomePage`/`getPortfolioUseCases` (T7) ↔ `page.tsx` (T9) ; signatures de sections (T9) ↔ T11–T16 (dont `TechStack` et `Contact({ site, submitAction })`) ; `stackSlug` du seed (T8) ↔ références des projets ; `pathsToRevalidate` (T4, application) ↔ hooks Payload ; `CONTACT_TOPICS` (T4, domaine) ↔ collection `messages` et T16.


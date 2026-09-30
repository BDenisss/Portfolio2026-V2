# Portfolio Denis Bucspun — Spécification de conception

**Date :** 2026-09-30 · **Statut :** approuvé par Denis (design présenté et validé en chat) · **Repo :** `BDenisss/Portfolio2026-V2`
**Design system :** [`design-system/portfolio-denis-bucspun/MASTER.md`](../../../design-system/portfolio-denis-bucspun/MASTER.md) (source de vérité visuelle)

## 1. Objectif

Portfolio de développeur full-stack au design **Liquid Glass** (Apple), inspiré de `img/exemple-portfolio.jpg`, avec :

- un **hero cinématique** mettant en scène un avatar **émoji Apple (Memoji) 3D** fidèle à Denis (buste, tête → nombril, mêmes vêtements que `img/Moi.jpg`), produit avec **Higgsfield** ;
- un **CMS** (Payload) pour ajouter/éditer soi-même projets, stacks, services, parcours, textes et médias ;
- un site **responsive**, **bilingue FR/EN**, accessible et performant ;
- un contenu **strictement issu des CV** (`img/CV_Denis_Bucspun_2026_FR.pdf`, `..._IA.pdf`) : rien d'inventé.

### Hors périmètre (v1)

Mode sombre · témoignages et logos clients (aucune donnée réelle) · blog · analytics · paiement · déploiement en production (config fournie, mise en ligne sur feu vert explicite de Denis).

## 2. Décisions actées

| Sujet | Décision |
|---|---|
| Architecture | **Une seule app** : Next.js 16.3 (App Router) + Payload CMS 3.90 embarqué (`/` site, `/admin` CMS) |
| Compat vérifiée | `@payloadcms/next@3.90.2` exige `next >=16.3.3 <17`. Node `>=20.9` (Node 25 local accepté ; CI en Node 22 LTS). **TypeScript 5.x** (pas 7) tant que l'outillage n'est pas validé |
| Base de données | **Postgres partout** : `docker-compose` en local, Neon en prod (pas de divergence SQLite/Postgres) |
| Médias | Disque local en dev ; `@payloadcms/storage-vercel-blob` en prod (activé par `BLOB_READ_WRITE_TOKEN`) |
| Langues | FR (défaut) + EN, bascule ; localisation native Payload + `next-intl` pour les chaînes d'UI |
| Higgsfield | Outils de génération **non exposés** dans la session → *contrat média* : slots CMS + repli intégré + pack de prompts + scripts d'optimisation. Denis génère, dépose dans `/admin`, le site suit |
| Gestionnaire | pnpm 10 |
| Git | Commits **`BDenisss <bucspun.d@gmail.com>`**, Conventional Commits, **aucun co-auteur Claude**, pas de mention « Generated with Claude Code » |

## 3. Structure du repo

```
.
├─ src/
│  ├─ app/
│  │  ├─ (payload)/            # /admin + /api (layout racine Payload)
│  │  └─ (site)/[locale]/      # site public : layout, page.tsx, projects/[slug]/page.tsx
│  ├─ collections/             # Users, Media, Stacks, Projects, Services, Experiences, Messages
│  ├─ globals/                 # Site, Cinematic
│  ├─ components/
│  │  ├─ glass/                # <Glass>, <GlassFilters> (défs SVG)
│  │  ├─ sections/             # Hero, About, Services, Stack, Projects, Journey, Process, Contact, Footer
│  │  ├─ cinematic/            # HeroStage, AvatarCanvas (R3F), ScrubVideo, GlassOrb, SmoothScroll
│  │  └─ ui/                   # Button, Chip, Eyebrow, LangSwitch, Nav, Dock
│  ├─ lib/                     # payload client, icons (simple-icons), a11y/contrast, rate-limit, i18n
│  ├─ messages/                # fr.json, en.json
│  ├─ styles/                  # tokens.css (tokens), glass.css, globals.css
│  ├─ payload.config.ts
│  └─ seed/                    # seed idempotent depuis les CV
├─ scripts/media/              # optimize-glb.mjs, optimize-video.mjs
├─ docs/{superpowers,higgsfield}/
├─ design-system/
├─ tests/{unit,e2e}/
├─ .github/workflows/ci.yml · Dockerfile · docker-compose.yml · .env.example · .nvmrc
```

## 4. Modèle de données (Payload)

Tous les champs textuels marqués **L** sont localisés (`fr`/`en`, repli sur `fr`).

**`stacks`** — `name`, `slug` (unique), `category` (select : `language`, `frontend`, `backend`, `architecture`, `testing`, `devops`, `security`, `ai`), `icon` (groupe : `simpleIconSlug` texte · `upload` média · repli monogramme automatique), `featured` (bool), `order` (nombre).
**`projects`** — `title` L, `slug` (unique), `tagline` L, `summary` L, `caseStudy` L (Lexical), `cover` (média), `gallery` (médias[]), `stacks` (relation → `stacks`[], **tri par catégorie à l'affichage**), `links` (`live`, `repo`, `caseStudyUrl`), `year`, `client` (texte), `featured` (bool), `order`, `_status` (**brouillon/publié**, versions activées).
**`services`** — `title` L, `description` L, `icon` (nom Lucide), `tint` (select : `amber|violet|blue|teal`), `order`.
**`experiences`** — `kind` (`work|education`), `role` L, `organization`, `location`, `start`, `end` (vide = en cours), `summary` L, `highlights` (texte L []), `stacks` (relation[]), `order`.
**`messages`** — `name`, `email`, `topic`, `message`, `ipHash`, `locale`, `status` (`new|read|archived`). **Lecture/écriture admin uniquement** ; créée uniquement par la server action (`overrideAccess`).
**`media`** — upload (images, PDF, vidéo, GLB), `alt` L (obligatoire pour les images), tailles `thumb/card/hero` (WebP/AVIF via sharp).
**`users`** — auth admin ; inscription publique **fermée** (création réservée aux admins, sauf premier utilisateur).

**Global `site`** (onglets) — *Identité* (nom, titre de poste L, accroche L, localisation) · *Hero* (eyebrow L, phrases rotatives L [], CTA L, chips L) · *À propos* (biographie L, stats [{valeur, libellé L}], `autoStats` bool) · *Méthode* (étapes [{titre L, texte L}]) · *Contact* (email, téléphone + `showPhone` **false par défaut**, LinkedIn, GitHub, localisation, `contactTo`) · *CV* (`cvFullstack` et `cvAi` : deux médias PDF, un par profil ; le bouton « Télécharger mon CV » ouvre un petit menu verre pour choisir le profil, libellés localisés) · *SEO* (titre, description L, image OG).
**Global `cinematic`** — slots médias (voir §7).

**Contrôles d'accès :** lecture publique des documents publiés uniquement ; toute écriture = utilisateur authentifié. **Hooks `afterChange`/`afterDelete`** → `revalidatePath` des routes concernées (`/fr`, `/en`, `/[locale]/projects/[slug]`) : publier dans le CMS met le site à jour immédiatement.

## 5. Site public

Navigation : pilule verre flottante (desktop) → **dock bas ≤ 5 items** (< 768px). Bascule FR/EN. Ancres + scroll fluide (Lenis).

| # | Section | Contenu |
|---|---|---|
| 1 | **Hero** | Eyebrow « Bonjour, je suis », **Denis Bucspun**, titre rotatif (*Développeur Full Stack* / *Ingénieur IA · GenAI*), accroche, CTA « Voir mes projets » + « Télécharger mon CV » (FR/IA), chips flottantes verre (« 3 ans d'alternance », « .NET · React · IA »), bande **« Ils m'ont fait confiance »** en texte : Bouygues Telecom Business Solutions, Axima Concept, Ville de Clamart |
| 2 | **À propos** | Bio issue du profil CV + 3–4 stats (ans d'alternance, expériences, technologies, projets — les deux derniers **calculés depuis le CMS**) |
| 3 | **Services** | 4 cartes : **Développement Full Stack** (web & mobile, React/Next/React Native + API .NET) · **Architecture & qualité** (Clean Architecture, DDD, hexagonale, tests xUnit/NSubstitute) · **IA générative & agents** (LLM, multi-agents, MCP, RAG, tool calling) · **Cloud, DevOps & sécurité** (Docker, Azure, CI/CD, OAuth 2.0/PKCE, Entra ID) |
| 4 | **Stack** | Tuiles verre groupées par catégorie, icônes Simple Icons |
| 5 | **Projets** | Grille de cartes, **filtre par stack**, page détail `/[locale]/projects/[slug]` (cover cinématique, étude de cas, liens, stacks) |
| 6 | **Parcours** | Timeline expériences + formation (Bouygues 2024→2026, Axima 2023→2024, Clamart 2023, Master IIM 2025→2026, projet Dywiki's) |
| 7 | **Méthode** | 5 étapes : *Comprendre le besoin → Modéliser → Construire → Tester → Déployer & faire évoluer* |
| 8 | **Contact** | Formulaire (nom, email, sujet, message) + coordonnées (email, LinkedIn, GitHub ; téléphone si `showPhone`) |
| — | Footer | Liens, langue, mentions, année |

**Contact — flux :** server action `submitContact` → validation zod → honeypot + *time-trap* (soumission < 3 s rejetée) → **limite de débit** (≤ 3 messages / 10 min par `ipHash`, sha256(ip + sel)) → écriture `messages` → email Resend **optionnel** (si `RESEND_API_KEY`). Réponses : erreur **sous le champ**, `aria-live` pour le statut, message générique côté anti-spam (pas d'indice au bot).

**Contenu seed (`pnpm seed`, idempotent par slug)** — services, ~30 stacks, expériences, global `site`, **5 projets** dérivés des CV (plateforme interne Bouygues *pré-pilote*, Dywiki's, quiz Ville de Clamart, supervision Axima, *ce portfolio*), CV PDF chargés depuis `img/` **si présents**. Textes FR rédigés à partir des puces du CV, traduction EN fidèle. Marqués « à compléter » quand le CV ne donne pas de détail.
> ⚠ Les PDF de CV contiennent le téléphone : les charger dans le CMS les rend téléchargeables publiquement (bouton « Télécharger mon CV »). C'est à Denis de décider de les publier.

## 6. Liquid Glass

Détails et tokens : [MASTER.md](../../../design-system/portfolio-denis-bucspun/MASTER.md). Points contractuels :

- **Un seul composant** `<Glass variant="surface|card|pill|dock">`, trois niveaux d'amélioration progressive (base → `backdrop-filter` → réfraction SVG Chromium) et **repli opaque** sous `prefers-reduced-transparency`.
- Texte uniquement sur verre ≥ 62 % blanc ou sous scrim ; jamais sur vidéo/3D nue.
- `#8B5CF6` (violet de la référence) est **décoratif** ; le texte violet utilise `#6D3FE0` (5,26:1). Test `tokens.contrast.test.ts` en CI.

## 7. Cinématique & contrat média

**Hero (séquence)** : (1) le **poster** s'affiche immédiatement (LCP) → (2) la **vidéo d'intro** (muette, inline) joue une fois → (3) fondu vers l'**avatar 3D interactif** (regarde le curseur, respiration idle) → (4) au scroll, le cadre « squircle » se rétracte, les chips partent en parallax, transition scrubée vers *À propos*. **Une seule section pinnée** (hero), transitions secondaires par révélations.

**Global `cinematic` — slots** (tous optionnels ; **repli garanti**) :

| Slot | Format / budget | Repli si vide |
|---|---|---|
| `avatarModel` | `.glb`, Draco/meshopt, ≤ 3 Mo | `avatarPortrait` puis `GlassOrb` procédural |
| `avatarPortrait` | PNG/WebP alpha, ≤ 150 Ko | `GlassOrb` |
| `heroPoster` | WebP/AVIF ≤ 150 Ko | dégradé mesh lavande |
| `heroVideoDesktop` | 16:9 mp4 (H.264) + webm, ≤ 4 Mo | poster |
| `heroVideoMobile` | 9:16 mp4 + webm, ≤ 2 Mo | poster |
| `scrubVideo` | mp4 **all-intra** (`-g 1`) pour scrub image par image, ≤ 6 Mo | révélations CSS |

**Garde-fous :** pas de GLB si `saveData`, `deviceMemory ≤ 4` ou `prefers-reduced-motion` → vidéo/poster ; DPR ≤ 1,5 sur mobile ; rendu suspendu hors écran ; Canvas chargé en `dynamic(ssr:false)` après `requestIdleCallback` ; `ScrollTrigger.refresh()` après polices/images ; contenu visible sans JS.

**Pack Higgsfield (`docs/higgsfield/`)** — prompts pas à pas basés sur `Moi.jpg` :
1. **Personnage** : Memoji Apple 3D, buste tête → nombril, cheveux châtain foncé bouclés (volume dessus, côtés plus courts), yeux clairs, barbe légère + fine moustache, léger sourire fermé, **surchemise sherpa crème** à col pointu, deux poches poitrine à rabat, bouton pression noir, **t-shirt blanc**, **bras croisés** ; fond verre lavande. Vues face + 3/4.
2. **Image → 3D** (GLB) puis `pnpm media:optimize:glb`.
3. **Vidéo hero** (dolly-in, clignement, salut discret) en 16:9 et 9:16, boucle et intro.
4. **Transitions** optionnelles (orbe de verre qui se réfracte) → `pnpm media:optimize:video`.
5. **Dépôt** : `/admin` → Globals → *Cinematic*.

Scripts : `gltf-transform` (Draco/meshopt, `--texture-compress webp`), `ffmpeg-static` (mp4 H.264 `faststart`, webm VP9, variante all-intra pour le scrub).
Si Denis reconnecte le connecteur Higgsfield complet, les mêmes prompts servent à générer directement ; le contrat média ne change pas.

## 8. Responsive & accessibilité

Mobile-first, testé à **375 / 768 / 1024 / 1440**. Cibles tactiles ≥ 44px, espacées ≥ 8px. Lien d'évitement, focus visible (`--accent-strong`), ordre de tabulation logique, `aria-hidden` sur le décor, alt obligatoires. `prefers-reduced-motion` → état final immédiat, Lenis coupé. **Objectifs :** accessibilité Lighthouse ≥ 95, performance mobile ≥ 85, CLS < 0,1, aucun scroll horizontal.

## 9. Qualité & tests (TDD)

**Vitest (unitaire, écrit avant l'implémentation)** : contrastes des tokens · règles d'accès des collections (fonctions pures) · hooks de revalidation (mocks) · `submitContact` (validation, honeypot, time-trap, rate-limit, dépendances injectées) · résolveur d'icônes (slug valide/inconnu/upload) · parité des clés `fr.json`/`en.json` · calcul des stats · idempotence du seed.
**Playwright** (Chromium) : home FR/EN aux 4 viewports, ancres, bascule de langue, filtre projets, page détail, validation du formulaire, `/admin` répond, **axe : 0 violation serious/critical**, émulation `reduced-motion` (contenu présent), `scrollWidth ≤ innerWidth` à 375px.
**CI GitHub Actions** : Node 22, service Postgres, `pnpm typecheck && lint && test && build && e2e`. **Docker** : `Dockerfile` multi-étapes (Next standalone) + `docker-compose.yml` (app + postgres).
**Sécurité** : `PAYLOAD_SECRET` fort, CORS/CSRF limités à `NEXT_PUBLIC_SITE_URL`, inscription publique fermée, `messages` non lisibles publiquement, en-têtes (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`), aucune donnée perso dans le repo (`img/` ignoré, `.env` ignoré).

## 10. Risques & points ouverts

| Risque | Parade |
|---|---|
| Next 16 renomme `middleware` en **`proxy`** ; interaction `next-intl` à confirmer | Vérifier dans la doc à l'implémentation ; test e2e de redirection `/` → `/fr` |
| Node 25 non-LTS | Engines `>=20.9`, `.nvmrc` = 22, CI 22 ; si incompat, on reste 22 |
| Réfraction SVG (`backdrop-filter:url()`) Chromium-only | Amélioration progressive, jamais requise |
| Perf mobile avec 3D + vidéo | Garde-fous §7, budgets, GLB coupé sur appareil faible |
| Fidélité de l'avatar (dépend de la génération Higgsfield) | Prompts dérivés de la photo, itérations côté Denis ; repli `GlassOrb` |
| Lien GitHub du CV (`BDeniss`) ≠ compte réel (`BDenisss`) | Valeur par défaut = `BDenisss`, modifiable dans le CMS |
| Slugs Simple Icons inexistants (ex. C#, xUnit) | Résolveur avec repli monogramme + test |

## 11. Exécution (ordre logique)

1. Scaffold (Next 16 + Payload 3 + Tailwind 4 + tooling) + Postgres docker + tokens/`<Glass>` → 2. Collections/globals + accès + hooks (TDD) → 3. Seed + i18n → 4. Sections (parallélisables : fichiers disjoints) → 5. Cinématique (hero, avatar, scrub, garde-fous) → 6. Contact → 7. Pack Higgsfield + scripts média → 8. Tests e2e + a11y + perf → 9. Revue adversariale multi-angles (a11y, perf, sécurité, responsive) → 10. Docs (README, CMS guide) + push.

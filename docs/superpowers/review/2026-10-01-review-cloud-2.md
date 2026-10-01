# Revue cloud n° 2 — analyse seule (T19)

Branche analysée : `claude/gracious-thompson-3ruisx` @ `4f1387d`. Aucune modification de `src/` ni des tests. Mesures du 01/10/2026 dans un conteneur Linux (4 cœurs, 15 Go, Node 22.22.2, pnpm 10.13.1, Postgres **16**.13 local à la place du 17 de la CI, Chromium **141** préinstallé à la place du 153 attendu par Playwright 1.63).

## Verdicts

| # | Point | Verdict | En une ligne |
|---|---|---|---|
| 1 | Reproductibilité machine propre | **KO** | tout passe jusqu'à `e2e` ; 4 tests rouges sur clone propre (CV absents sans `img/`) ; `e2e:install` bloqué ici (réseau) |
| 2 | Commandes des docs | **KO** | 4 écarts : seed + `PAYLOAD_DB_PUSH` piège `migrate`, `media:optimize:glb` cassé, « trois pastilles », téléphone « non public » faux via l'API |
| 3 | Firefox / WebKit | **OK** | repli opaque lisible ; navigateurs substitués (voir limites) |
| 4 | Accessibilité, verre translucide | **KO** | axe 0 violation, contrastes nav/dock OK ; mais focus masqué par le dock (jusqu'à 100 %) et la nav (50 %) ; un eyebrow à 4,4:1 |
| 5 | Lighthouse mobile | **OK (réserve)** | perf 89, LCP 3,63 s ; cause « reveal » confirmée en throttling appliqué ; backdrop-filter sans coût au chargement, mais coûteux au scroll desktop en rendu logiciel |
| 6 | Smoke production | **OK** | `build:prod`, `next start`, `/fr`, `/en`, `/admin`, robots, sitemap cohérents ; chemin Docker émulé OK |
| 7 | Responsive 320 → 1920 | **OK** | 0 débordement sur 24 combinaisons ; dock lisible à 320 px |

## Constats classés

| Gravité | Constat | Preuve |
|---|---|---|
| **Haute** | `GET /api/globals/site` et GraphQL, **sans authentification**, renvoient `contact.phone` et `contact.contactTo` même avec `showPhone=false` | point 6, `Site.ts:11` (`read: anyone`), aucun accès au niveau du champ ; contredit `docs/cms-guide.md:78` |
| **Haute** | CI rouge sur clone propre : `tests/e2e/sections/hero.spec.ts:58` (×4 projets) exige le bouton CV, absent sans `img/` (ignoré par git). La CI n'a **jamais tourné** sur GitHub (0 exécution) | point 1 |
| **Haute** | Focus clavier masqué : dock à 320/375 px (jusqu'à 100 %), nav à 1024 px (50 %) ; WCAG 2.2 SC 2.4.11 | point 4 |
| Moyenne | Scroll desktop en rendu logiciel : 30 fps avec verre (38 % d'images > 33 ms) contre 60 fps opaque | point 5 |
| Moyenne | Séquence « 6 commandes » du README : `pnpm seed` avec `PAYLOAD_DB_PUSH=true` pose un marqueur `dev`, puis `pnpm migrate` / `pnpm build:prod` attendent une confirmation interactive (« data loss will occur ») | point 2 |
| Moyenne | `pnpm media:optimize:glb -- <fichier>` (commande documentée) échoue : décalage d'indice `scripts/media/optimize-glb.mjs:14` | point 2 |
| Basse | `cms-guide.md:69` « trois pastilles maximum » : 3 saisissables, 2 affichées (`Hero.tsx:14,79`) | point 2 |
| Basse | Eyebrow du hero (13 px) à 4,40 / 4,45:1 à 375 px (seuil 4,5) ; marginal ailleurs ; indépendant du verre | point 4 |
| Basse | `X-Powered-By: Next.js, Payload` ; pas de CSP ; `IP_HASH_SALT` par défaut `change-me` (`docker-compose.yml:24`) | point 6 |
| Basse | `generate:importmap` laisse `importMap.js` modifié (mise en forme seule) ; 5 fichiers non conformes à Prettier (`.prettierrc.json`, `eslint.config.mjs`, `src/domain/shared/result.ts`, `tests/unit/architecture.test.ts`, `tsconfig.json`) | point 2 |
| Basse | À 375 px, 24 puces de filtre occupent plus d'un écran avant la première carte projet | point 3 |

---

## 1. Reproductibilité sur machine propre — KO

Clone neuf de la branche (sans `img/`, `.env`, `media/`), base `portfolio` recréée (rôle superutilisateur `portfolio`, comme le service CI). Variables exactes de la CI : `DATABASE_URI`, `PAYLOAD_SECRET` (32 car.), `NEXT_PUBLIC_SITE_URL=http://localhost:3100`, `IP_HASH_SALT=ci-salt`, `NEXT_PUBLIC_E2E=1`.

| Commande | Résultat |
|---|---|
| `pnpm install --frozen-lockfile` | exit 0, 19,9 s |
| `pnpm typecheck` | exit 0 |
| `pnpm lint` | exit 0 |
| `pnpm test` | exit 0 : `Test Files 43 passed`, `Tests 239 passed` |
| `pnpm migrate` | exit 0 : `Migrated: 20260930_172928_initial (295ms)` |
| `pnpm test:int` | exit 0 : `Test Files 4 passed`, `Tests 16 passed` |
| `pnpm seed` | exit 0 : `{ stacks: 41, services: 4, experiences: 5, projects: 4 }` |
| `pnpm build` | exit 0, 68,8 s : 16 pages statiques (`/fr`, `/en`, 4 projets × 2 langues, robots, sitemap) |
| `pnpm e2e:install` | **exit 1** : `Download failed: server returned code 403 … no rule or allowlist entry allows host "cdn.playwright.dev"` (politique de sortie du conteneur, non contournée) |
| `E2E_CHROMIUM_PATH=/opt/pw-browsers/chromium CI=true pnpm e2e --reporter=list` | **exit 1** : `4 failed, 6 skipped, 246 passed` (256 tests) |

Les 4 échecs sont le même test sur les 4 projets (`desktop`, `laptop`, `tablet`, `mobile`) :

```
tests/e2e/sections/hero.spec.ts:58  hero › propose le téléchargement des deux CV dans un menu accessible
  Locator: getByRole('button', { name: 'Télécharger mon CV' })  →  element(s) not found
```

Cause : `src/infrastructure/seed/seed-media.ts:23,38` ne rattache les CV que s'ils sont dans `img/` (ignoré par git, `.gitignore:43`) ; sans eux, le bouton n'existe pas. Contre-épreuve : `img/` copié dans le clone, `pnpm seed`, `pnpm build`, puis `pnpm e2e -g "deux CV"` → **4 passed**. La passation annonçait « 246 réussis / 10 ignorés / 0 échec » : c'était vrai avec `img/`, faux sur machine propre. `mcp github actions_list` : `total_count: 0`, la CI n'a jamais été exécutée.

Écarts d'environnement (non bloquants pour le verdict) : Postgres 16 au lieu de 17 ; Chromium 141 au lieu de 153 ; `e2e:install` remplacé par le navigateur préinstallé.

## 2. README, `cms-guide.md`, `deploy.md` — KO

**README « Démarrage en 6 commandes »**

| Commande | Résultat |
|---|---|
| `pnpm i` | OK |
| `cp .env.example .env` | OK (`PAYLOAD_SECRET` d'exemple de 34 car. : à remplacer, le README le dit) |
| `pnpm db:up` | **non testable** : `Cannot connect to the Docker daemon` (pas de démon). Vérification statique : `docker compose config -q` OK ; avec `--profile app` et sans variable, erreur attendue `required variable PAYLOAD_SECRET is missing a value: définis PAYLOAD_SECRET` |
| `pnpm migrate` (base vide) | OK |
| `pnpm seed` | OK, mais affiche `Pulling schema from database…` (`PAYLOAD_DB_PUSH=true` hérité de `.env.example`) |
| `pnpm dev` | OK : `/fr` 200, `/en` 200, `/admin` 200 (15 s à froid), robots 200, sitemap 200 |

**Écart n° 1 — piège de la séquence documentée.** Après `migrate` → `seed` avec `PAYLOAD_DB_PUSH=true`, `payload_migrations` contient une ligne `batch -1 | dev`. Tout `pnpm migrate` suivant (et `pnpm build:prod`) s'arrête sur une question interactive :

```
? It looks like you've run Payload in dev mode, meaning you've dynamically pushed changes to your database.
  If you'd like to run migrations, data loss will occur. Would you like to proceed? › (y/N)
```

Reproduit en base neuve : (1) `migrate` OK ; (2) `seed` avec `PAYLOAD_DB_PUSH=true` OK ; (3) `migrate` → la question. Le README décrit la confirmation (ligne 93) mais la séquence « 6 commandes » la provoque elle-même.

**Table des scripts du README**

| Commande | Résultat |
|---|---|
| `pnpm generate:types` | OK, aucun changement |
| `pnpm generate:importmap` | OK, mais laisse `src/app/(payload)/admin/importMap.js` modifié ; après Prettier, diff vide (mise en forme seule) |
| `pnpm migrate:create` (schéma inchangé) | OK : `No schema changes detected. Would you like to create a blank migration file? (y/N)` |
| `pnpm payload -- --help` | affiche les commandes puis exit 1 (mineur) |
| `pnpm format` | non lancé (le README le déconseille) ; `prettier --check .` : 5 fichiers non conformes (liste plus haut) |
| `pnpm start` | OK, avec l'avertissement que le README annonce : `"next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.` |
| `pnpm media:fixture` | OK, fichier régénéré à l'identique (aucun diff git) |
| `pnpm media:optimize:video -- clip.mp4 --preset hero-desktop` | OK : `hero-desktop.webm : 39 Ko (budget 4.00 Mo)` + `.mp4` |
| `pnpm media:optimize:glb -- avatar.glb` | **KO** : `Usage : pnpm media:optimize:glb -- <in.glb> …`, exit 2 |

**Écart n° 2 — `optimize-glb.mjs:14`.** `input = args.find((v, i) => !v.startsWith('--') && i !== outIndex + 1)` : sans `--out`, `outIndex = -1`, donc `i !== 0` exclut le premier argument, c'est-à-dire le fichier d'entrée. La commande documentée (`docs/higgsfield/02-avatar-3d.md:20`, `05-optimiser-et-deposer.md:6`) échoue toujours ; avec `--out media-out/avatar.glb` elle réussit (`15,72 KB → 5,58 KB`).

**`docs/deploy.md`**

| Étape | Résultat |
|---|---|
| § 5, forme bash `DATABASE_URI="…" PAYLOAD_SECRET="…" pnpm migrate; … pnpm seed` (base neuve, sans `PAYLOAD_DB_PUSH`) | OK, `Seed terminé : {…}` |
| § 4 `pnpm build:prod` (même base) | OK, exit 0, 59 s |
| `openssl rand -base64 32` | OK |
| Docker : `docker compose --profile app build/run/up`, `curl -sI` | **non testable** (pas de démon). Émulation : `SKIP_BUILD_STATIC=1 pnpm build` avec `DATABASE_URI` sur un port fermé → exit 0, **0 ligne `ECONNREFUSED`** ; puis serveur `standalone` lancé comme le `Dockerfile` (public + `.next/static` copiés) : `/fr` 200, `/en` 200, `/fr/projects/dywikis` 200, `/admin` 200, sitemap 200, en-tête `Cache-Control: private, no-cache, no-store` (conforme à « rendues à chaque requête, sans cache ») |

**`docs/cms-guide.md`** (admin parcouru par script sur une base vide)

| Affirmation du guide | Constat |
|---|---|
| premier utilisateur, inscription fermée ensuite | OK (`POST /api/users/first-register` → 403 la seconde fois) |
| groupes de menu Contenu / Médias / Boîte de réception / Réglages | OK |
| champs d'un projet, `order` = 100 par défaut, boutons brouillon/publier, sélecteur de langue | OK |
| onglets du Site : Identité, Hero, À propos, Méthode, Contact, CV, SEO | OK |
| messages : pas de bouton de création | OK |
| dix versions par projet | OK (`MAX_VERSIONS_PER_PROJECT = 10`) |
| table « Pourquoi ma modification n'apparaît pas ? » | OK : un service modifié apparaît aussitôt sur `/fr` ; une technologie non (rafraîchie par la revalidation suivante) ; le Site aussitôt |
| l. 69 « trois pastilles maximum » | **faux en pratique** : `Site.ts:5,43` accepte 3, `Hero.tsx:14,79` n'en affiche que 2 |
| l. 78 « le téléphone est enregistré mais n'est affiché publiquement que si `showPhone` est coché » | **faux via l'API** : voir point 6 |

## 3. Firefox et WebKit — OK (substitution déclarée)

`pnpm e2e:install` étant bloqué (403 sur `cdn.playwright.dev`, `download.mozilla.org`, `ftp.mozilla.org`, non contournés), j'ai utilisé deux navigateurs réels autorisés par la politique : **Firefox 157.0** (build conda-forge, `geckodriver 0.37.1`, headless) et **WebKitGTK 2.52.6** (`MiniBrowser` + `WebKitWebDriver` du dépôt Ubuntu, sous Xvfb). Ce ne sont pas les builds Playwright ni Safari.

Contraintes de taille : fenêtre Firefox headless ≥ 500 px, WebKitGTK ≥ 447 px. Pour obtenir un vrai viewport de 375 px : Firefox via `browsingContext.setViewport` (WebDriver BiDi, `innerWidth` mesuré = 375) ; WebKit via une iframe de 375 px servie par la même origine (l'en-tête `X-Frame-Options: SAMEORIGIN` bloque le reste).

| Mesure (`/fr` et `/en`, 375 et 1440) | Firefox 157 | WebKitGTK 2.52 |
|---|---|---|
| débordement horizontal (`scrollWidth − clientWidth`, avant/après défilement complet) | 0 / 0 | 0 / 0 |
| mode hero | `orb` | `orb` |
| `CSS.supports('backdrop-filter','blur(1px)')` | true | true (et `-webkit-` true) |
| `backdrop-filter` calculé (`.glass`, nav, dock) | `blur(24px) saturate(1.6)` | idem |
| fond calculé des pastilles/dock/cartes | `rgba(255,255,255,.78)` / `.62` | idem |
| réfraction SVG (`data-refract`) | absente (Chromium seul, voulu) | absente |

**Repli sans `backdrop-filter`** : Firefox relancé avec `layout.css.backdrop-filter.enabled=false` (`CSS.supports` → false). La branche `@supports not (…)` de `glass.css:85` s'active : `backdrop-filter` vide, fond **opaque `rgb(249, 248, 252)`** sur les 66 cartes, 5 pastilles, dock et surfaces, dans les 4 configurations.

Captures lues (`shots/firefox`, `shots/webkit`, `shots/firefox-nobd`) : `fr-375-top`, `fr-1440-top`, `en-375-top`/`en-1440-top` (les deux navigateurs), `fr-375-about`, `fr-375-projects`, `fr-375-contact`, `fr-1440-about`, `fr-1440-projects`. Constat : avec verre comme en repli opaque, titres, textes, pastilles de nav, dock, cartes et formulaire sont lisibles ; le repli donne des cartes blanc cassé presque identiques au verre translucide (le fond de page est un dégradé clair). La grille de projets à 375 px est précédée de 24 puces de filtre qui occupent plus d'un écran (constat basse gravité).

Limites : WebKit sans `backdrop-filter` non testé (pas d'interrupteur) ; Safari macOS/iOS non testé.

## 4. Accessibilité avec le verre translucide — KO

Chromium 141 sous Linux : `prefers-reduced-transparency` vaut `no-preference` par défaut, donc **verre translucide** (alpha .78/.62, `backdrop-filter` actif). Matrice : 375 (Pixel 7) / 768 / 1024 / 1440 × `no-preference` / `reduce` (émulé par CDP `Emulation.setEmulatedMedia`, vérifié par `matchMedia` à chaque exécution) × `/fr` / `/en` = **16 exécutions**, page parcourue en entier avant analyse.

**axe** (`wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice`, toutes sévérités) : **0 violation** dans les 16 exécutions. Mais `color-contrast` reste *incomplete* sur **272 à 275 nœuds** (« background color could not be determined due to a pseudo element ») : axe ne peut pas certifier les contrastes sur ces fonds, d'où les mesures ci-dessous.

**Contrastes sur fonds composités** (capture de la page, texte masqué, ratio calculé sur les pixels réels derrière chaque texte ; ~235 éléments par exécution) :

| Élément | Résultat |
|---|---|
| Eyebrow du hero 13 px (« Bonjour, je suis » / « Hello, I’m ») | **KO** à 375 px : médiane 4,40 (FR) et 4,45 (EN), minimum 4,24 / 4,30 pour 4,5 requis ; marginal à 768 px (4,51–4,54). Identique en `reduce` : cause = dégradé de page, pas le verre |
| Autres eyebrows (« Contact » 768 px, « Outils & compétences » 375 px, « Mon process » 375 px) | marginaux : médiane ≥ 4,5 mais minimum entre 3,5 et 4,5 |
| Titre dégradé du hero (36–44 px, seuil 3) | médianes 4,0 à 4,6 : OK |
| Tout le reste | aucun échec |

**Étiquettes de la nav et du dock sur le verre translucide** (balayage dense : un pas de 60 px, 265 positions à 375 px, 203 à 768 px, 166 à 1440 px ; texte masqué seulement dans le contrôle, flou et contenu transparent compris ; 0 image écartée) :

| Contrôle | Verre translucide (pire cas) | `reduce` (opaque) |
|---|---|---|
| dock 375 px, libellés 12 px | **4,75** (« À propos », y = 15 240), 4,76, 4,84, 5,34, 5,70 | ≥ 6,85 |
| nav 768 px, liens 14 px | 5,19 à 6,06 (« en » 7,09) | ≥ 6,85 |
| nav 1440 px, liens 14 px | 5,62 à 6,66 | ≥ 6,85 |

Le verre translucide **passe AA partout** (marge faible sur le dock : 4,75 pour 4,5). Vérification visuelle : un grand titre passant sous la nav ou le dock devient un fantôme flou pâle, les libellés restent nets (captures `dock-375-default`, `nav-1440-default`, `nav-1440-blur-only`, `dock-375-reduce`).

**Focus jamais masqué par la nav ou le dock — KO.** Parcours à la touche Tab (56 à 58 arrêts par configuration), part de la surface focalisée recouverte (grille de 100 points, `elementFromPoint`) :

| Largeur | Arrêts masqués (tout ou partie) | Cas notables |
|---|---|---|
| 320 | 12 | « Entity Framework Core » **100 %** sous le dock ; 5 puces à 17–70 % ; `textarea` message 80 % ; liens LinkedIn/GitHub/E-mail 70 % |
| 375 | 12 | « Microsoft Azure » et « OAuth 2.0 » **100 %** ; « Microsoft Entra ID » 69 % ; champ nom 70 % ; bouton « Envoyer le message » 80 % ; carte « Application de supervision » 50 % |
| 768 | 0 (lien d'évitement 4 % sous la nav) | — |
| 1024 | 1 | champ « nom » du formulaire de contact **50 %** sous la nav (arrêt à `top=66`, nav jusqu'à 88) |
| 1440 | 0 (lien d'évitement 4 %) | — |

Les résultats sont identiques en `reduce` : le défaut est indépendant du verre. Captures lues : `focus-375-0` (puce « Microsoft Azure » sous le dock, texte fantôme visible à travers) et `focus-1024-input`. Piste (non appliquée) : `scroll-padding-top` / `scroll-padding-bottom` sur `html` égaux à la hauteur de la nav (≈ 88 px) et du dock (≈ 100 px), comme `scroll-mt-28` déjà posé pour les ancres.

Méthode et limites : une première version de ma mesure de contraste lisait les couleurs en pleine transition (mesures de 1,0 à 2,1 sans réalité) ; elle a été corrigée (règle `transition: none` permanente) et refaite entièrement, seuls les résultats corrigés sont rapportés. Les titres animés (rotation du hero) produisent des minimums parasites ; seules les médianes sont retenues pour le texte dégradé.

## 5. Lighthouse mobile avec le verre translucide — OK (réserve)

Lighthouse 13.5.0 (`pnpm dlx lighthouse@13.5.0 http://localhost:3300/fr --form-factor=mobile --only-categories=… --chrome-flags="--headless=new --no-sandbox"`), build `build:prod` sans `NEXT_PUBLIC_E2E`, Chromium 141, `benchmarkIndex` 2 562–2 772 (3 143–3 232 dans `quality-report.md` : machine plus lente). Throttling simulé par défaut, 3 exécutions.

| | Exécutions | Médiane | `quality-report.md` (verre opaque, Windows) |
|---|---|---|---|
| Performance | 86 / 89 / 90 | **89** | 88 |
| Accessibilité | 100 ×3 | **100** | 100 |
| Bonnes pratiques | 96 ×3 | **96** | 96 |
| SEO | 100 ×3 | **100** | 91 |
| LCP | 3,59 / 3,65 / 3,63 s | **3,63 s** | 3,7 s |
| FCP | 1,37–1,38 s | 1,37 s | 1,4 s |
| TBT | 229 / 119 / 57 ms | 119 ms | 130 ms |
| CLS | 0 | 0 | 0 |
| Speed Index / TTI | 1,37 / 3,76 s | | 2,2 / 3,8 s |
| JS transféré / poids total | 226 Kio / 427 Kio | | 226 / 427 Kio |

Cibles du projet (accessibilité ≥ 95, performance ≥ 85, CLS < 0,1) : atteintes avec le verre translucide.

**LCP.** Élément : `section#hero > … > p.reveal` (paragraphe du hero, `opacity: 0` tant que le JS n'a pas lancé la révélation, `globals.css:104`). Mesuré (non limité) : FCP 195 ms, LCP 333 ms, délai de rendu de l'élément 306 ms. Pour isoler la cause sans toucher au dépôt, un proxy local injecte du CSS dans le HTML (`.reveal{opacity:1!important…}` ; `backdrop-filter:none`). Le proxy seul dégrade les valeurs absolues, donc la comparaison se fait avec une exécution « proxy sans injection » :

| Variante (3 exécutions chacune, médiane) | Simulé : perf / LCP | Throttling appliqué (`--throttling-method=devtools`) : perf / LCP |
|---|---|---|
| directe | 89 / 3,63 s | 80 / 4,10 s |
| proxy sans injection (référence) | 78 / 4,83 s | 76 / 4,85 s |
| `.reveal` visible d'emblée | 79 / 4,66 s | **92 / 2,29 s (= FCP)** |
| `backdrop-filter: none` | 78 / 4,84 s | 75 / 4,90 s |

- **Cause du LCP confirmée en throttling appliqué** : sans le masquage initial du reveal, le LCP tombe de 4,85 s à 2,29 s (égal au FCP). Le modèle *simulé* de Lighthouse ne montre qu'un gain de 0,17 s : le chiffre « 3,7 s » est donc réel, mais le simulateur sous-estime le levier.
- **Coût des `backdrop-filter` au chargement : nul** (LCP/FCP/performance identiques avec et sans).

**Coût au défilement** (`scrollperf.mjs`, défilement par `rAF` de 30 px/image sur toute la page, médiane de 3 passes, rendu logiciel SwiftShader sans GPU, donc pire cas) :

| Variante | 375 px (Pixel 7, CPU ×4) | 1440 px (CPU ×1) | 1440 px (CPU ×4) |
|---|---|---|---|
| défaut (réfraction + flou) | p95 33 ms, 1 % > 33 ms | p50 **33,4 ms**, p95 66,7, **38 %** > 33 ms, 12 % > 50 ms, 12,3 s | idem (39 %) |
| flou seul (sans réfraction) | 1 % > 33 ms | 30 % > 33 ms, 11,1 s | 29 % |
| opaque (`reduce`) | 0 % | **0 %**, p50 16,7 ms, 5,5 s | 0 % |
| `backdrop-filter: none` injecté | 0 % | 0 %, 5,5 s | 0 % |

Lecture : sur mobile le coût est négligeable ; sur grand écran sans accélération GPU, 66 cartes avec flou 24 px font tomber le défilement à ~30 fps. Le facteur limitant est le rastériseur (le ralentissement CPU ne change rien). Un vrai GPU doit s'en sortir mieux, ce que ce conteneur ne peut pas confirmer ; le repli `prefers-reduced-transparency` supprime le coût.

## 6. Smoke test de production — OK

Base neuve `portfolio_prod` (migrée et semée sans `PAYLOAD_DB_PUSH`), `pnpm build:prod` : exit 0, 59 s, `Migrated`/`Done` puis `✓ Compiled successfully`, 16 pages. `pnpm start -p 3300` (avertissement `standalone` attendu) :

| Requête | Statut |
|---|---|
| `/fr`, `/en` | 200 (`<html lang="fr">`, `canonical` = `http://localhost:3300/fr`, `s-maxage=3600`, `x-nextjs-cache: HIT`) |
| `/fr/projects/dywikis`, `/en/projects/dywikis` | 200 |
| `/admin` | 200 → redirige vers `/admin/create-first-user` ; Playwright : `h1 Welcome`, 5 champs, **0 erreur console, 0 réponse ≥ 400** |
| `/robots.txt` | `Allow: /`, `Disallow: /admin`, `Disallow: /api`, `Sitemap: http://localhost:3300/sitemap.xml` |
| `/sitemap.xml` | 10 `<loc>` : `/fr`, `/en`, 4 projets × 2 langues, hôte = `NEXT_PUBLIC_SITE_URL` |
| `/`, `/fr/` | 307 → `/fr`, 308 → `/fr` ; page inconnue 404 |
| `/api/messages`, `/api/users` anonymes | 403 ; `/api/graphql-playground` 404 |

**Constat haut (découvert ici) — fuite par l'API publique.** Base de test jetable, valeur de remplacement `REVIEW-PHONE-MASK` saisie dans `contact.phone` avec `showPhone=false`, puis lecture anonyme :

```
GET  /api/globals/site        -> {'phone': 'REVIEW-PHONE-MASK', 'showPhone': False, 'contactTo': 'review-private@example.test'}
POST /api/graphql  { Site { contact { phone showPhone contactTo } } }  -> mêmes valeurs
GET  /fr  -> 0 occurrence du masque (page et JSON-LD corrects)
```

Cause : `Site.ts:11` `access: { read: anyone }` sans contrôle au niveau des champs `phone` (`Site.ts:106`) et `contactTo`. Conséquence : un numéro saisi « pour le CMS seulement » reste lisible par n'importe qui, et `contactTo` (destinataire privé des notifications) aussi. Piste : accès en lecture réservé aux administrateurs sur ces deux champs (le site lit via l'API locale côté serveur), ou masquage conditionnel à `showPhone`.

## 7. Responsive 320 → 1920 px — OK

`responsive.mjs` sur le build de production : 6 largeurs (320, 375, 768, 1024, 1440, 1920) × 4 pages (`/fr`, `/en`, `/fr/projects/…`, `/en/projects/…`) = **24 combinaisons**, page parcourue en entier. Pour chacune : `scrollWidth − clientWidth = 0`, `body` sans débordement, `scrollTo(100, 0)` ne déplace rien, 0 élément hors de l'écran hors conteneurs défilants.

Dock (< 768 px) : 5 entrées, **49×44 px à 320 px** (60×44 à 375), police 12 px, 0 libellé tronqué, 0 chevauchement, 0 entrée hors du dock, cible ≥ 44 px de haut ; nav (≥ 768 px) : 9 à 10 éléments sans chevauchement, hauteur ≥ 44 px (mes drapeaux « wraps » sur les libellés masqués visuellement sont des faux positifs de l'heuristique). Captures lues : `fr-320-top`, `fr-320-mid` (dock lisible, « À propos » et « Services » très proches mais séparés), `fr-1920-top` (mise en page centrée, nav pleine largeur).

---

## Hygiène du dépôt : numéros et secrets (sans valeurs)

Parcours de **36 commits** (toutes références locales et `origin`) :

| Recherche | Résultat |
|---|---|
| Numéro de téléphone français (`+33…`, `0033…`, `0X XX XX XX XX`), masques trouvés : `+XX X XX XX XX XX` et `XX XX XX XX XX` | uniquement **les deux fichiers connus** : `docs/superpowers/plans/2026-09-30-portfolio-liquid-glass.md` (32 commits, du premier `295d4a6` au dernier `d921946`) et `tests/unit/infrastructure/seed/seed-data.test.ts` (21 commits, de `acdfbb8` à `d921946`). **Absent de l'arbre `HEAD`** (corrigé par `e54739a`). Toujours présent dans l'historique de `main` (`acdfbb8` en est un ancêtre) et de `origin/claude/gracious-thompson-3ruisx` / `origin/claude/t19-review`. Aucune autre occurrence. Historique non réécrit, conformément à la passation |
| numéros sans séparateurs (`+33` + 9 chiffres, `06/07` + 8 chiffres) | aucun |
| motifs de clés (`re_…`, `vercel_blob_rw_…`, `sk-…`, `ghp_…`, `AKIA…`, clés privées PEM, URI Postgres hébergée avec mot de passe) | aucun |
| fichiers `.env*`, `.pem` suivis | seul `.env.example` (valeurs d'exemple) |
| fichiers binaires suivis | `docs/screenshot.webp` (lue : aucune coordonnée visible) |
| défauts sensibles | `docker-compose.yml:24` `IP_HASH_SALT` par défaut `change-me` (documenté) |

## Limites de cette revue

- Docker : `pnpm db:up` et toutes les commandes `docker compose build/run/up` n'ont pas été exécutées (pas de démon) ; le chemin a été émulé (build sans base + serveur `standalone`).
- Navigateurs : Firefox 157 (conda-forge) et WebKitGTK 2.52.6 à la place des builds Playwright, `cdn.playwright.dev` étant refusé par la politique de sortie ; Chromium 141 au lieu de 153 ; Postgres 16 au lieu de 17 ; aucun Safari.
- Lighthouse et défilement : conteneur 4 cœurs sans GPU, `benchmarkIndex` ≈ 2 600 ; valeurs absolues non comparables à Windows, comparaisons relatives valides.
- Le test des CV a été confirmé sur les 4 tests concernés uniquement, pas sur une seconde suite complète avec `img/`.
- Hors périmètre non rouvert : décisions de la passation § 7 (dates IIM, GitHub, seed CV seul, pastilles non localisées, piège < 3 s, Resend).

## Reproduction rapide

```bash
# 1. clone propre + base
git clone --branch claude/gracious-thompson-3ruisx https://github.com/BDenisss/Portfolio2026-V2.git && cd Portfolio2026-V2
export DATABASE_URI=postgres://portfolio:<mdp>@localhost:5432/portfolio PAYLOAD_SECRET=<32 caractères, valeur du ci.yml> \
       NEXT_PUBLIC_SITE_URL=http://localhost:3100 IP_HASH_SALT=ci-salt NEXT_PUBLIC_E2E=1
pnpm install --frozen-lockfile && pnpm typecheck && pnpm lint && pnpm test && pnpm migrate && pnpm test:int && pnpm seed && pnpm build
CI=true pnpm e2e -g "deux CV"            # 4 échecs sans img/, 4 réussites avec
# 2. fuite API : modifier contact.phone (showPhone=false) puis, sans authentification : curl /api/globals/site
```

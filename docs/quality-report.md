# Rapport qualité — Lighthouse, axe, E2E

Mesures du **30/09/2026** sur le build de production local. Tous les chiffres ci-dessous ont été **mesurés** (aucune estimation).

## Configuration de mesure

| Élément | Valeur |
|---|---|
| Build | `pnpm build` (sans `NEXT_PUBLIC_E2E`), servi par `pnpm start -p 3100` |
| Contenu | Postgres (Docker) migré et seedé : 4 projets, 41 technologies, 5 entrées de parcours |
| Lighthouse | 13.5.0 (`pnpm dlx lighthouse`), catégories performance, accessibilité, bonnes pratiques, SEO |
| Navigateur | Chromium 153 headless de Playwright (`chromium-1243`), `--headless=new --no-sandbox` |
| Profil | `--form-factor=mobile` : émulation Moto G Power (412 × 823, DPR 1,75), limitation **simulée** (RTT 150 ms, 1,6 Mbit/s, CPU × 4) |
| Machine | Windows 11, indice de performance Lighthouse (`benchmarkIndex`) 3 143 à 3 232 |
| Page | `http://localhost:3100/fr`, 3 exécutions consécutives, médiane retenue |

Commande (chemins de cache et de sortie sur D:, voir « Reproduire ») :

```bash
CHROME_PATH="$(node -e "console.log(require('@playwright/test').chromium.executablePath())")" \
  pnpm dlx lighthouse http://localhost:3100/fr --form-factor=mobile \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=<hors du dépôt>/lh-fr.json --quiet --chrome-flags="--headless=new --no-sandbox"
```

## Scores Lighthouse mobile (build final)

| Exécution | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| 1 | 88 | 100 | 96 | 91 |
| 2 | 88 | 100 | 96 | 91 |
| 3 | 88 | 100 | 96 | 91 |
| **Médiane** | **88** | **100** | **96** | **91** |

| Métrique (médiane) | Mesure | Cible |
|---|---|---|
| Accessibilité | **100** | ≥ 95 : atteinte |
| Performance mobile | **88** | ≥ 85 : atteinte |
| CLS | **0** | < 0,1 : atteinte |
| First Contentful Paint | 1,4 s | |
| Largest Contentful Paint | 3,7 s | voir « Écarts restants » |
| Total Blocking Time | 130 ms (100 à 130) | |
| Speed Index | 2,2 s | |
| Time to Interactive | 3,8 s | |

**Avant correction** (même build, même machine, 2 exécutions) : performance **59**, TBT **2 740 à 3 510 ms**, TTI 6,6 à 7,3 s, LCP 3,7 à 3,8 s, CLS 0. Cause et correction : défaut n° 2 ci-dessous.

## Budget JavaScript initial

| Mesure | Valeur | Budget |
|---|---|---|
| Scripts avant `networkidle`, méthode de `perf-budget.spec.ts`, 375 px | 149 403 octets | ≤ 400 000 : respecté |
| Idem, 1440 px | 130 839 octets | ≤ 400 000 : respecté |
| Lighthouse : transfert des scripts (12 fichiers, chargements différés compris) | 226 Kio | |
| Lighthouse : poids total de la page | 427 Kio (dont 82 Kio de polices, 10 Kio de CSS) | |
| Chunk three / drei / fiber chargé sans média 3D | aucun | aucun |
| Contexte WebGL créé au chargement sans média 3D | 0 | 0 (nouveau test) |

## Accessibilité (axe) et E2E

- **axe** (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`) : **0 violation serious/critical** sur `/fr` et `/en` aux 4 viewports (375, 768, 1024, 1440) et sur la page détail d'un projet, après la correction n° 1. Sur cette machine, ces analyses ont vu le verre opaque (voir « Écarts restants »).
- **Suite complète** `pnpm e2e --workers=3`, 4 projets, build de production sans drapeau, refait après le correctif de verre n° 4 : **256 tests, 246 réussis, 10 ignorés, 0 échec** (mesuré le 01/10/2026, SEO inclus). Les tests ignorés sont attendus :
  - 6 = les 2 contrôles réservés au mobile (cibles tactiles, dock) sur desktop, laptop et tablette ;
  - 4 = le chemin 3D du hero, qui exige un build `NEXT_PUBLIC_E2E=1`.
- **Chemin 3D** : build `NEXT_PUBLIC_E2E=1`, puis `NEXT_PUBLIC_E2E=1 pnpm e2e tests/e2e/sections/hero.spec.ts -g "chemin 3D"` : **4/4 réussis** (desktop, laptop, tablette, mobile). Mode `avatar3d` atteint avec la fixture. Mesure antérieure sur le même build : `hero.spec.ts` et `perf-budget.spec.ts` **32/32**, aucun contexte WebGL sans fixture. Le build de production est refait sans le drapeau après chaque passe : aucun code de fixture dans `.next/static`.
- **Build sans base de données** : `SKIP_BUILD_STATIC=1` avec `DATABASE_URI` pointant un port fermé : **exit 0, 0 ligne `ECONNREFUSED`**. C'est le chemin du `docker build` et de la CI.
- **Intégration** : `pnpm test:int`, 4 fichiers, **16/16 réussis** sur Postgres 17 (Docker).

## Défauts trouvés et corrigés

1. **Parcours : sémantique de liste cassée**, trouvé par axe (`list` et `listitem`, serious, 8 échecs sur 4 viewports).
   - Cause : `Journey.tsx` enveloppait chaque `<li>` dans `<Reveal as="div">`, ce qui mettait un `<div>` directement dans `<ol>`.
   - Effet de bord visuel : chaque `<li>` était `:last-child` de son wrapper, donc `last:pb-0` et `last:before:h-4` s'appliquaient partout. Les cartes se touchaient (`padding-bottom` mesuré à 0 px sur les 5 items) et le rail n'était pas dessiné entre les items.
   - Correction : `TimelineItem` rend lui-même `<Reveal as="li">`, et `Journey` mappe `TimelineItem` sans wrapper.
   - Vérifié : axe à 0. `padding-bottom` mesuré à 32 px sur les items 1 à 4 et 0 px sur le dernier, à 375 et 1440 px.
2. **Hero : sonde WebGL bloquante pendant l'hydratation**, trouvé par Lighthouse (performance 59).
   - Cause : la plus longue tâche, 687 ms dans le trace Lighthouse, était la seule création d'un contexte WebGL par `detectCapabilities`, appelée par `useCapabilities` au premier rendu. `getContext('webgl2')` attend le processus GPU de façon synchrone ; pendant la rastérisation initiale de la page de verre, cela prend 137 ms non ralenti, contre 5 ms une fois la page chargée. Or `decideHeroMode` n'utilise `webgl` que si un modèle 3D existe, et aucun n'est publié.
   - Correction : `detectCapabilities(win, { probeWebgl })`, et `useCapabilities(media.hasModel)` ne sonde WebGL que si un modèle (CMS ou fixture E2E) peut être affiché. Le cache est tenu par variante.
   - Vérifié : TBT de 2 740-3 510 ms à 100-130 ms, performance de 59 à 88. Nouveau test E2E « aucun contexte WebGL créé au chargement sans média 3D » (rouge avant, vert après, 4 projets) ; test unitaire de `detectCapabilities`.
3. **Parcours : rail coupé au-dessus de chaque point**, trouvé par capture après la correction n° 1.
   - Cause : chaque segment allait de `top-7` (28 px, haut du point) à `-bottom-2`, soit 8 px dans l'item suivant. Il restait une coupure de 20 px juste au-dessus du point suivant, alors que le commentaire du composant annonce un raccord.
   - Correction : `before:-bottom-7`, pour que le segment s'arrête sur le point suivant.
   - Vérifié par capture à 375 et 1440 px : rail continu, espacement des cartes inchangé.
4. **Verre : la nav gardait flou et réfraction sous `prefers-reduced-transparency: reduce`**, trouvé par le test `motion.spec.ts` réécrit (voir « Adaptations des tests »).
   - Cause : la règle de réfraction `html[data-refract='on'] .glass[data-refract]` (spécificité 0,3,1) l'emportait sur le repli opaque `.glass` (0,1,0). Le fond devenait bien opaque, mais la nav (`<Glass variant="pill" refract>`) gardait `backdrop-filter: url("#lg-refract") blur(18px) saturate(1.7)`. Le dock, la bascule de langue et les boutons secondaires étaient déjà corrects.
   - Correction (`glass.css`) : le sélecteur de réfraction est ajouté au bloc `@media (prefers-reduced-transparency: reduce)`, qui le suit dans la source à spécificité égale.
   - Vérifié : rouge avant la correction sur les 4 projets (la nav seule, avec la valeur ci-dessus ; le test témoin est vert). Vert après reconstruction du build de production : les deux tests de transparence passent sur les 4 projets dans la suite complète ci-dessus.

## Écarts restants (non corrigés, cause documentée)

- **LCP 3,7 s** (score 0,57 ; la cible de performance globale est atteinte malgré tout).
  - L'élément LCP est le paragraphe d'accroche du hero (`section#hero p.reveal`). TTFB 24 ms, mais 0,86 à 1,06 s de « délai de rendu de l'élément » : sous `html.js`, les `.reveal` partent à opacité 0 et attendent GSAP.
  - Piste : ne pas masquer le texte du hero au-dessus de la ligne de flottaison, ou le révéler uniquement par `transform`.
  - C'est une décision de design, laissée à la revue (T19).
- **SEO 91 : `canonical` jugé invalide.** C'est un artefact local : la page déclare `http://localhost:3000/fr` (`NEXT_PUBLIC_SITE_URL` du `.env` local) alors que l'audit tourne sur le port 3100. Avec l'URL de production, canonical et hreflang pointent vers le même domaine.
- **« Avoid multiple page redirects » (600 ms)** : c'est un artefact de mesure. Le journal DevTools montre un 307 vers la même URL `/fr`, avec pour seul en-tête `Location`, c'est-à-dire une redirection interne de Chrome. Le serveur répond 200 à la même requête rejouée avec les en-têtes de Lighthouse.
- **Bonnes pratiques 96 : `favicon.ico` en 404.** Aucune icône n'existe dans `src/app` et aucune tâche du plan ne la prévoit. À ajouter (`src/app/icon.*`) avec un visuel validé par Denis.
- **`label-content-name-mismatch`** (règle axe expérimentale, poids 0 dans le score accessibilité de 100) :
  - le lien de marque de la nav a `aria-label="Denis Bucspun"` alors que le monogramme « DB » est visible ;
  - les cartes de service ont un `aria-label` qui commence par le titre visible mais ne contient pas la description.
  - Le titre visible est bien contenu dans le nom accessible. À arbitrer en revue (monogramme `aria-hidden` ou nom accessible aligné).
- **Pistes d'optimisation mineures relevées par Lighthouse** : 2 CSS bloquants (environ 10 Kio, 210 à 300 ms estimés), 57 Kio de JS inutilisé, 14 Kio de JS « legacy » (polyfills du runtime Next).
- **Mesures faites avec le verre opaque sur cette machine.** Le réglage Windows « Effets de transparence » y est désactivé (`EnableTransparency = 0`). Le Chromium de Playwright en hérite : sans émulation, `matchMedia('(prefers-reduced-transparency: reduce)')` vaut `true` sur les 4 projets (mesuré).
  - Conséquence pour axe : les contrastes ont été vérifiés sur le repli opaque (`--opaque-glass`), pas sur le verre translucide que voit un visiteur dont la transparence est active.
  - Conséquence probable pour Lighthouse (même navigateur, même machine, non vérifié à part) : la performance mesurée n'inclut pas le coût des `backdrop-filter`.
  - À refaire avec la transparence active : axe avec l'émulation CDP `prefers-reduced-transparency: no-preference` (comme dans `motion.spec.ts`), Lighthouse sur un hôte où la transparence est active.

## Adaptations des tests (par rapport au plan)

- `responsive.spec.ts`, **cibles tactiles** : le seuil est `44 − 0,01` px. Une révélation en cours (`translateY` sub-pixel) fait mesurer 43,99997 px à un bouton de 44 px CSS.
- `responsive.spec.ts`, **dock / pied de page** : le test mesure le contenu du pied de page (`footer > *`) et non la boîte `<footer>`, qui inclut par conception l'espace réservé au dock.
- `perf-budget.spec.ts` : ajout du test « aucun contexte WebGL créé au chargement sans média 3D » (garde de non-régression du défaut n° 2).
- `motion.spec.ts`, **transparence réduite** : le test du plan n'émulait pas la préférence (il émulait `reducedMotion`) et vérifiait seulement que le fond calculé contenait `rgb`, ce qui est vrai pour n'importe quel verre, même transparent. Il est remplacé par deux tests :
  - « le verre des contrôles devient opaque et sans flou » : préférence `reduce`, puis chaque `[data-glass="pill"]` et `[data-glass="dock"]` doit avoir `backdrop-filter: none` et un fond d'alpha 1 ;
  - « le verre des contrôles reste translucide et flouté » (témoin) : préférence `no-preference`, puis chaque contrôle doit avoir un `blur(…)` et un fond d'alpha inférieur à 1.
  - Playwright 1.63 n'expose pas cette préférence dans `emulateMedia` : les deux tests passent par CDP (`Emulation.setEmulatedMedia`), d'où `test.skip` hors Chromium. La préférence est toujours posée explicitement, car Chromium sous Windows suit le réglage système (voir « Écarts restants »). Chaque test vérifie d'abord `matchMedia`, pour qu'une émulation ignorée fasse échouer le test au lieu de le rendre vide.
  - La suite passe de 228 à 232 tests (un test de plus sur 4 projets), puis à 256 avec `seo.spec.ts` (6 tests × 4 projets).

## Reproduire

```bash
pnpm db:up                                   # Postgres migré et seedé
export PLAYWRIGHT_BROWSERS_PATH=<cache des navigateurs Playwright>
pnpm build && pnpm e2e --workers=3           # 4 projets
NEXT_PUBLIC_E2E=1 pnpm build && NEXT_PUBLIC_E2E=1 pnpm e2e tests/e2e/sections/hero.spec.ts --workers=3
pnpm build && pnpm start -p 3100             # puis la commande Lighthouse ci-dessus
```

`NEXT_PUBLIC_E2E=1` est lu au build (code client) **et** par Playwright, car le test 3D s'ignore sans le drapeau. Refaire un build sans le drapeau avant toute mesure ou tout déploiement.

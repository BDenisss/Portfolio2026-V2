# Design System Master — Portfolio Denis Bucspun

> **LOGIC:** pour une page précise, lire d'abord `design-system/portfolio-denis-bucspun/pages/<page>.md`.
> S'il existe, ses règles **surchargent** ce Master. Sinon, ce fichier fait foi.

**Style :** Liquid Glass (Apple) · **Mode :** clair (dark = v2)
**Dials ui-ux-pro-max :** Variance 6 (équilibré/moderne) · Motion 9 (cinématique) · Density 3 (aéré)
**Stack :** Next.js (App Router) · Tailwind v4 · GSAP ScrollTrigger + Lenis · react-three-fiber

## Provenance (ce qui est vérifié, ce qui est dérivé)

La première sortie brute de `--design-system` (palette marine/or, Playfair/Karla « restaurant », pattern
« Hero + Testimonials ») ne correspondait pas au produit et a été **rejetée**. Ce fichier la remplace.

| Décision | Source |
|---|---|
| Style Liquid Glass, règles d'usage (nav/contrôles/cartes, contenu sur couche séparée, fallback transparence réduite) | ui-ux-pro-max `--domain style` (résultat `liquid-glass`, vérifié) |
| Typo Outfit + Work Sans | ui-ux-pro-max `--domain typography` (« Geometric Modern », *Best for : portfolios*) |
| Neutres (`ink`, `muted`, `destructive`, ring) | ui-ux-pro-max `--domain color` (ligne *Portfolio/Personal*) |
| Lavande, violet, teintes d'icônes | **Dérivés de `img/exemple-portfolio.jpg`**, puis contrôlés au calcul (WCAG) |
| Règles GSAP (pin, scrub, parallax, reduced-motion) | ui-ux-pro-max `--domain gsap` |
| Ordre des sections | Demande de Denis ; guidance « Portfolio Grid » (visuels d'abord, filtre par catégorie, chargement rapide) |

## Couleurs (tokens — jamais de hex brut dans les composants)

| Token | Valeur | Usage | Contraste vérifié |
|---|---|---|---|
| `--bg` | `#EEEDF7` | Fond de page (sous les mesh gradients) | — |
| `--ink` | `#0B0B14` | Titres, bouton primaire | 16,9:1 sur `--bg` |
| `--ink-2` | `#2E2E42` | Texte courant | 11,4:1 |
| `--ink-muted` | `#55556B` | Texte secondaire | 6,2:1 (verre : 6,9) |
| `--accent` | `#8B5CF6` | **Décoratif / grands titres / UI ≥ 3:1 uniquement** | 3,65:1 — ⚠ *échoue 4,5:1* |
| `--accent-text` | `#6D3FE0` | Eyebrows, liens, texte violet < 24px | 5,26:1 (verre : 5,8) |
| `--accent-strong` | `#5B34D6` | Focus ring, états actifs, blanc dessus = 7,2:1 | 6,22:1 |
| `--accent-soft` | `#C9B8FB` | Halos, orbes, bordures teintées | décoratif |
| `--tint-amber` `--tint-violet` `--tint-blue` `--tint-teal` | `#F5C76B` `#B9A2F8` `#7B9BF5` `#6FD3CF` | Tuiles d'icônes services | décoratif |
| `--danger` | `#C0263A` | Erreurs formulaire | 5,55:1 sur verre |
| `--success` | `#0F7B5F` | Confirmation | 4,94:1 sur verre |

Règle : tout texte < 24px utilise `--ink`, `--ink-2`, `--ink-muted` ou `--accent-text`. Le test `tokens.contrast.test.ts`
recalcule ces ratios et fait échouer la CI si l'un passe sous 4,5:1 (3:1 pour le décoratif/grand texte).

## Matière « verre »

| Token | Valeur |
|---|---|
| `--glass-fill` | `rgba(255,255,255,.62)` → contenu porteur de texte (≥ 62 % blanc pour tenir 4,5:1) |
| `--glass-fill-strong` | `rgba(255,255,255,.78)` → nav, formulaires |
| `--glass-fill-subtle` | `rgba(255,255,255,.40)` → chips décoratives, sans texte long |
| `--glass-border` | `rgba(255,255,255,.70)` bordure de bord lumineux |
| `--glass-hairline` | `rgba(120,110,170,.18)` liseré extérieur 1px |
| `--shadow-glass` | `0 8px 32px rgba(70,50,140,.10), 0 1px 2px rgba(70,50,140,.06)` |
| Reflet spéculaire | `inset 0 1px 0 rgba(255,255,255,.9)` + dégradé 135° `rgba(255,255,255,.55)→transparent 40 %` |
| Flou | `backdrop-filter: blur(24px) saturate(160%)` |

`<Glass variant="surface|card|pill|dock">` est l'**unique** point d'entrée. Trois niveaux d'amélioration progressive :

1. **Base** (tous navigateurs) : fill + bordure + ombre + reflet.
2. **`@supports (backdrop-filter: blur(1px))`** : flou + saturation.
3. **`@supports (backdrop-filter: url(#lg-refract))`** (Chromium) : réfraction SVG `feTurbulence` + `feDisplacementMap`, échelle ≤ 12.

Repli **opaque** (`#F9F8FC` + liseré) sous `@media (prefers-reduced-transparency: reduce)` et sans `backdrop-filter`.
**Jamais de texte directement sur vidéo/3D** : toujours sur du verre ou sous un scrim.

## Typographie

- **Titres :** Outfit 600/700, tracking `-0.03em` · **Corps :** Work Sans 400/500 — via `next/font/google` (variable, zéro CLS).
- Échelle fluide : display `clamp(2.75rem, 1rem + 6vw, 5.5rem)` · h2 `clamp(1.75rem, 1rem + 3vw, 3rem)` · h3 `1.25rem` · corps `1rem/1.6` · eyebrow `0.8125rem` uppercase `+0.14em` en `--accent-text`.
- Corps ≥ 16px, jamais < 12px.

## Espacement (Density 3 — aéré)

`--space-xs 4` · `--space-sm 8` · `--space-base 16` · `--space-md 24` · `--space-lg 32` · `--space-xl 48` · `--space-2xl 64` · `--space-3xl 96` (px).
Conteneur max `1200px` ; gouttières 16 / 24 / 32 (mobile / tablette / desktop). Sections : `--space-3xl` desktop, `--space-2xl` mobile.

## Formes

Cartes `28px` · chips `16px` · pilules `999px` · cadre hero « squircle » `48px` (masque `corner-shape`/`clip-path` avec repli `border-radius`).

## Composants (specs)

- **Nav** : pilule verre flottante, `--glass-fill-strong`, lien actif = pilule blanche (comme la référence). Mobile ≤ 767px → **dock** bas, **≤ 5 items**, cibles ≥ 44px.
- **Bouton primaire** : pilule `--ink`, texte blanc (19,6:1), flèche `↗` SVG. **Secondaire** : pilule verre. Hover 150–250 ms, `translateY(-1px)`, pas de scale qui décale le layout. Effet magnétique sur **1 élément focal max** (CTA hero).
- **Carte service** : verre + tuile d'icône teintée (`--tint-*`) + titre + 2 lignes + flèche.
- **Tuile stack** : carré verre 88px, icône SVG (Simple Icons) + libellé dessous, groupées par catégorie.
- **Carte projet** : cover (dégradé de secours si absente) + barre de légende en verre ; hover = parallax léger de l'image (≤ 8 %).
- **Chip stat flottante** : `--glass-fill-subtle`, chiffre en Outfit, jamais de paragraphe.
- **Formulaire** : labels **visibles** au-dessus, erreur **sous le champ**, aide sous le label, `autocomplete` corrects, champ honeypot masqué.
- **Icônes** : Lucide (UI) + Simple Icons (technos), SVG uniquement. **Pas d'emoji comme icône** (l'avatar Memoji est du *contenu*, pas une icône).

## Motion (Motion 9 — cinématique, avec garde-fous)

| Usage | Réglage |
|---|---|
| Micro-interactions | 150–250 ms, `cubic-bezier(.2,.8,.2,1)` |
| Révélations au scroll | 400–600 ms, `power3.out`, décalage y ≤ 16px, `toggleActions: 'play none none reverse'` |
| Scrub hero / transitions | `scrub: 1` (0,5–1,5 toléré), `start: 'top top'`, `end: '+=150%'` |
| Parallax | **Décor uniquement**, `yPercent` 5–15, jamais sur le texte |
| Pin | **≤ 2 sections** sur la page (hero + 1 autre max) ; `ScrollTrigger.refresh()` après chargement des polices/images |
| Smooth scroll | Lenis, désactivé sous `prefers-reduced-motion` |

Tout passe par `gsap.matchMedia('(prefers-reduced-motion: reduce)')` → **état final immédiat, aucune animation**.
Le contenu est **visible par défaut sans JS** : les états initiaux masqués ne sont posés que sous la classe `.js`.
Rendu 3D : DPR plafonné (≤ 1,5 mobile), pause hors écran (`IntersectionObserver`), pas de GLB si `saveData` ou appareil faible → poster/vidéo.

## Pattern de page

Hero → À propos → Services → Stack → Projets → Parcours → Méthode → Contact.
**Pas de section Témoignages** ni de logos clients inventés (« Ils m'ont fait confiance » = noms réels en texte).

## Anti-patterns (interdits)

- ❌ Emoji comme icône · ❌ hex bruts dans les composants · ❌ texte < 4,5:1 · ❌ texte directement sur vidéo/3D
- ❌ Focus invisible · ❌ changements d'état instantanés (0 ms) · ❌ hover-only · ❌ hover qui décale le layout
- ❌ Animer `width`/`height` (transform/opacity uniquement) · ❌ parallax sur du texte · ❌ > 2 sections pinnées
- ❌ Contenu caché sans repli no-JS · ❌ scroll horizontal mobile · ❌ zoom désactivé

## Checklist de livraison (à passer avant chaque merge)

- [ ] Aucun emoji-icône ; icônes Lucide/Simple Icons cohérentes
- [ ] `cursor-pointer` + états hover 150–250 ms sur tout élément cliquable
- [ ] Contrastes ≥ 4,5:1 (test `tokens.contrast` vert)
- [ ] Focus visible partout, ordre de tabulation logique, lien d'évitement
- [ ] `prefers-reduced-motion` et `prefers-reduced-transparency` respectés
- [ ] Cibles tactiles ≥ 44px, espacées ≥ 8px
- [ ] Testé à 375 / 768 / 1024 / 1440 px, aucun scroll horizontal, rien masqué derrière la nav
- [ ] CLS < 0,1 (dimensions réservées pour médias, `next/font`)
- [ ] Alt text sur les images de contenu, `aria-hidden` sur le décor

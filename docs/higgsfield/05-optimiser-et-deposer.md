# 5. Optimiser et déposer dans le CMS

## Récapitulatif des commandes

```bash
pnpm media:optimize:glb   -- avatar.glb                              # → media-out/avatar.glb
pnpm media:optimize:video -- intro-16x9.mp4 --preset hero-desktop    # → media-out/hero-desktop.mp4 + .webm
pnpm media:optimize:video -- intro-9x16.mp4 --preset hero-mobile     # → media-out/hero-mobile.mp4 + .webm
pnpm media:optimize:video -- transition.mp4 --preset scrub           # → media-out/scrub.mp4
```

Le dossier `media-out/` n'est jamais versionné.

## Quel fichier va dans quel slot

| Slot du CMS | Fichier | Budget |
|---|---|---|
| `avatarModel` | `avatar.glb` | ≤ 3 Mo |
| `avatarPortrait` | PNG ou WebP transparent | ≤ 150 Ko |
| `heroPoster` | WebP (ou AVIF) | ≤ 150 Ko |
| `heroVideoDesktop` › mp4 / webm | `hero-desktop.mp4` / `hero-desktop.webm` | ≤ 4 Mo |
| `heroVideoMobile` › mp4 / webm | `hero-mobile.mp4` / `hero-mobile.webm` | ≤ 2 Mo |
| `scrubVideo` | `scrub.mp4` | ≤ 6 Mo |

Le webm est facultatif : le mp4 suffit, le webm n'est qu'une alternative plus légère pour les navigateurs qui le lisent.

## Où déposer

1. Connecte-toi à `/admin`.
2. Va dans **Réglages › Médias cinématiques**.
3. Pour chaque slot, choisis (ou téléverse) le fichier. **Pour une image, le texte alternatif est obligatoire** : décris-la pour les lecteurs d'écran.
4. Enregistre. La publication revalide le site automatiquement.

## Vérifier le résultat

Ouvre le site. Le cadre du hero porte l'attribut `data-hero-mode` (visible dans l'inspecteur du navigateur) :

| Valeur | Signification |
|---|---|
| `avatar3d` | le modèle 3D est actif |
| `video` | la vidéo est jouée (appareil modeste, pas de WebGL, ou pas de modèle) |
| `poster` | image fixe (économie de données, mouvement réduit, ou pas de vidéo) |
| `orb` | aucun média : orbe de verre |

L'attribut `data-hero-ready` passe à `true` quand le rendu final est affiché.

## Retour arrière

Vider un slot dans l'admin suffit : le site retombe automatiquement sur le média du niveau inférieur (3D → vidéo → poster → orbe). Rien à redéployer.

# 3. La vidéo du hero

Objectif : une courte vidéo d'introduction jouée une fois, avant que l'avatar 3D prenne le relais. Il en faut **deux formats** : 16:9 pour l'ordinateur et 9:16 pour le mobile.

Utilise l'outil **image vers vidéo** de Higgsfield, avec comme **image de départ** le personnage validé à l'étape 1.

## Intro 16:9 (6 secondes)

> Slow cinematic dolly-in on the 3D emoji character, bust framing. He blinks, tilts his head slightly and his smile widens; arms stay crossed. Pastel lavender liquid-glass studio, floating translucent glass orbs, soft caustics, shallow depth of field, smooth motion, no camera shake, no text.

## Boucle (optionnel)

Même prompt, en demandant que la **première image soit égale à la dernière** (*seamless loop*). Utile si tu préfères une vidéo qui tourne en continu plutôt qu'une intro jouée une fois.

## Mobile 9:16

Le même prompt, avec un **cadrage vertical 9:16**. Le personnage doit rester centré et entier.

## Contraintes

- **Muet** (aucune piste audio).
- **8 secondes maximum**.
- Aucun texte dans l'image : le site ne pose jamais de texte directement sur une vidéo.

## Optimisation

```bash
pnpm media:optimize:video -- intro-16x9.mp4 --preset hero-desktop
pnpm media:optimize:video -- intro-9x16.mp4 --preset hero-mobile
```

Chaque commande produit un `.mp4` (H.264) et un `.webm` (VP9) dans `media-out/`, puis vérifie les budgets : **≤ 4 Mo** pour le desktop, **≤ 2 Mo** pour le mobile. Si un fichier dépasse, raccourcis la vidéo ou simplifie le décor.

> Attention : les deux commandes écrivent dans le même dossier avec le nom du preset (`hero-desktop.mp4`, `hero-mobile.mp4`), elles ne s'écrasent donc pas.

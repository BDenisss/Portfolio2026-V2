# 4. Transitions (optionnel)

Objectif : une vidéo d'ambiance dont la lecture **suit le défilement** de la page, entre le hero et la section « À propos ». Si tu n'en fournis pas, le site utilise de simples révélations CSS : rien ne manque.

## Prompt

> Macro shot of a liquid glass sphere slowly refracting soft lavender and blue light, gentle morph, clean pastel background, no text, no faces.

Durée : **5 secondes**. Pas de visage, pas de texte : cette vidéo est purement décorative.

## Optimisation

```bash
pnpm media:optimize:video -- transition.mp4 --preset scrub
```

Le preset `scrub` produit un **mp4 « all-intra »** (une image clé par image), indispensable pour avancer et reculer image par image au défilement. Il n'y a pas de variante webm. Budget : **≤ 6 Mo**.

Dépose le fichier dans le slot `scrubVideo` (voir `05-optimiser-et-deposer.md`).

## Rappel

Aucun texte n'est jamais posé sur cette vidéo : la section qui l'affiche est décorative et masquée aux lecteurs d'écran.

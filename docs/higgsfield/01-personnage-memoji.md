# 1. Le personnage Memoji

Objectif : une image de **ton avatar style Memoji Apple 3D** (buste, de la tête au nombril), fidèle à la photo `img/Moi.jpg`. Cette image sert de base à la 3D (étape 2) et aux vidéos (étape 3).

## Prompt principal

> A 3D Apple Memoji-style emoji character, bust from head to navel, front view, of a young man with short dark-brown curly hair (voluminous curls on top, shorter tapered sides), light blue-grey eyes, light stubble, a thin moustache and a small chin beard, a subtle closed-mouth smile with a slight smirk, arms crossed over his chest. He wears a cream off-white teddy/sherpa fleece overshirt with a pointed collar, two chest flap pockets and a black snap button at the collar, over a plain white crew-neck t-shirt. Glossy soft 3D render, Apple Memoji and emoji aesthetic, smooth rounded shapes, slightly oversized head, simplified friendly features, soft studio lighting with a subtle rim light, plain pastel lavender background, no text, no logo.

## Prompt négatif

> photorealistic, uncanny, distorted hands, extra fingers, text, watermark, harsh shadows, busy background.

## Comment l'utiliser

1. Dans Higgsfield, choisis la génération d'**image** et ajoute `Moi.jpg` comme **image de référence de personnage** (ou image-to-image si l'outil n'a pas de référence de personnage).
2. Colle le prompt principal et le prompt négatif.
3. Génère **deux variantes** : vue de **face** (celle qui servira pour la 3D) et vue de **¾** (pour varier les poses de la vidéo).
4. Itère jusqu'à valider la checklist ci-dessous.

## Checklist de fidélité

- [ ] Les boucles : même forme et même volume (dessus fourni, côtés plus courts).
- [ ] Barbe légère et fine moustache, petite barbe au menton.
- [ ] Yeux clairs.
- [ ] Léger sourire, bouche fermée.
- [ ] Surchemise sherpa crème, col pointu, deux poches poitrine à rabat, bouton pression noir.
- [ ] T-shirt blanc dessous.
- [ ] Bras croisés, sans mains déformées ni doigts en trop.
- [ ] Cadrage de la tête au nombril, rien de coupé.

## Exports à conserver

| Fichier | Format | Usage |
|---|---|---|
| Face, **fond uni** | PNG | entrée de l'étape 2 (image vers 3D) |
| Face, **fond transparent** | PNG ou WebP, ≤ 150 Ko | slot `avatarPortrait` (repli quand la 3D n'est pas disponible) |
| Face, image de départ | PNG | entrée de l'étape 3 (vidéos) |

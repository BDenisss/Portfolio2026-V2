# Pack Higgsfield — avatar Memoji 3D et vidéos du hero

Ce dossier décrit, pas à pas, comment produire les médias cinématiques du portfolio avec **Higgsfield**, puis les déposer dans le CMS. Le site n'en dépend pas : chaque média est optionnel et a un repli (voir « Budgets et replis »).

## Le pipeline

```
Moi.jpg
  └─ (1) image Memoji ............ 01-personnage-memoji.md
        └─ (2) modèle 3D (.glb) ... 02-avatar-3d.md
        └─ (3) vidéo hero ......... 03-video-hero.md   (16:9 + 9:16)
        └─ (4) transitions ........ 04-transitions.md  (optionnel)
              └─ (5) optimisation + dépôt ... 05-optimiser-et-deposer.md
                     → /admin → Réglages › Médias cinématiques
```

## Ce qu'il te faut

- Un compte **Higgsfield** (génération d'image, image vers 3D, image vers vidéo).
- La photo de référence `img/Moi.jpg` (le dossier `img/` n'est jamais versionné).
- Node et pnpm installés (les scripts d'optimisation du dépôt sont déjà configurés : `pnpm install` suffit).

## Règle d'or

**Tu vérifies la ressemblance à chaque étape.** Une erreur sur le personnage (coiffure, barbe, vêtement) se propage à la 3D et aux vidéos : corrige-la à l'étape 1, pas plus tard. Chaque fichier du pack contient une checklist de fidélité.

## Budgets et replis

| Média | Format | Budget | Si le slot est vide |
|---|---|---|---|
| Modèle 3D `avatarModel` | `.glb` meshopt | ≤ 3 Mo | portrait, puis orbe de verre |
| Portrait `avatarPortrait` | PNG/WebP transparent | ≤ 150 Ko | orbe de verre |
| Poster `heroPoster` | WebP/AVIF | ≤ 150 Ko | dégradé lavande |
| Vidéo desktop `heroVideoDesktop` | mp4 + webm, 16:9 | ≤ 4 Mo | poster |
| Vidéo mobile `heroVideoMobile` | mp4 + webm, 9:16 | ≤ 2 Mo | poster |
| Transition `scrubVideo` | mp4 all-intra | ≤ 6 Mo | révélations CSS |

Les scripts d'optimisation refusent (code de sortie ≠ 0) tout fichier qui dépasse son budget.

Le site n'affiche la 3D que si l'appareil s'y prête : pas de modèle avec l'économie de données, sous 4 Go de mémoire ou 4 cœurs, ou si l'utilisateur a demandé moins d'animations. Dans ces cas, il montre la vidéo, le poster ou l'orbe.

## Avec le connecteur Higgsfield dans Claude

Si le connecteur Higgsfield complet est reconnecté à Claude, **les mêmes prompts servent tels quels** : Claude peut lancer les générations à ta place. Le contrat média (les slots et les budgets ci-dessus) ne change pas.

## Dépannage

| Symptôme | Piste |
|---|---|
| Le visage ne te ressemble pas | Repars de l'étape 1 avec `Moi.jpg` en image de référence de personnage et resserre le prompt (coiffure, barbe, vêtement). |
| Le modèle 3D regarde de côté ou à l'envers | Voir `02-avatar-3d.md` : exporte avec la face vers +Z. |
| `media:optimize:glb` dépasse 3 Mo | Baisse `TEXTURE_SIZE` dans `scripts/media/optimize-glb.mjs` ou décime avec `gltf-transform simplify`. |
| Une vidéo dépasse son budget | Raccourcis-la (≤ 8 s) ou simplifie le décor : les aplats se compressent mieux que les textures fines. |
| Rien ne change sur le site après le dépôt | La publication dans l'admin revalide la page ; attends quelques secondes et recharge. Vérifie `data-hero-mode` (voir `05-optimiser-et-deposer.md`). |

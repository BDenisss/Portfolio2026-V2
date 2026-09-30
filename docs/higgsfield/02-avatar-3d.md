# 2. L'avatar en 3D (.glb)

Objectif : transformer l'image de face validée à l'étape 1 en **modèle 3D** que le site affiche et fait pivoter vers le curseur.

## Génération

1. Dans Higgsfield, ouvre l'outil **image vers 3D** et charge l'image de face sur **fond uni**.
2. Exporte au format **`.glb`** (glTF binaire).

## Contrôles avant de continuer

- [ ] **Échelle** cohérente : le personnage n'est ni minuscule ni géant (le site le recadre automatiquement, mais un modèle aberrant est souvent un export raté).
- [ ] **Orientation** : le visage regarde vers **+Z** (vers la caméra). Si le visage regarde ailleurs, refais l'export avec la face vers +Z.
- [ ] **Textures présentes** : la laine du sherpa et la peau ne sont pas grises ou absentes.
- [ ] **Pas de trous** au niveau des bras croisés.

## Optimisation

```bash
pnpm media:optimize:glb -- avatar.glb
```

Le script écrit `media-out/avatar.glb` (compression **meshopt**, textures WebP 1024 px) et affiche la taille face au budget de **3 Mo** :

- `✅` : le fichier est prêt.
- `⚠️` : trop lourd. Baisse `TEXTURE_SIZE` dans `scripts/media/optimize-glb.mjs`, ou décime le maillage avec `pnpm exec gltf-transform simplify`.

Le format est volontairement **meshopt et non Draco** : le décodeur meshopt est embarqué dans le site, alors que Draco irait le chercher sur un CDN externe.

## Test local

Dépose `media-out/avatar.glb` dans `/admin` (voir `05-optimiser-et-deposer.md`), ouvre le site et vérifie que l'avatar suit le curseur et « respire » doucement.

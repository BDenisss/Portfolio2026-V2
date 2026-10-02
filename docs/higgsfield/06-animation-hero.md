# 6. L'animation du hero : il pointe le titre, qui se transforme « par magie »

Objectif : une scène de 8 secondes, en boucle, où l'avatar décroise les bras, regarde vers le texte du hero (à gauche de l'image) en gardant son sourire, pointe du doigt, fait un petit geste de magie, puis revient bras croisés. La transformation du titre (« Développeur Full Stack » devient « Ingénieur IA ») est faite **dans la page**, pas dans la vidéo : le site ne met jamais de texte dans une vidéo et ce texte doit rester du vrai HTML.

## Réglages

| Réglage | Valeur |
|---|---|
| Modèle | Seedance 2.0 Mini (essai) ou Seedance 2.0 (meilleure qualité, plus cher) |
| Image de départ **et** image de fin | la même : `img/higgsfield/head-v7-3.png` (la tête validée) |
| Format | 3:4 (portrait) |
| Durée | 8 s |
| Résolution | 720p |
| Son | désactivé |

Image de départ = image de fin : la scène revient à la pose initiale, ce qui fait une boucle sans à-coup.

## Prompt

```text
The 3D Memoji-style young man from the first frame (bust framing, arms crossed over his chest, facing the camera with a subtle smile). Locked-off camera with no camera movement. The background is a plain empty pastel lavender wall during the ENTIRE video: no object, no panel, no screen, no text, no letters, no particles, no sparkles, no light effect, nothing else in the frame at any time. Over 8 seconds, he ALWAYS keeps a warm friendly smile: the smile never disappears, even when he looks away from the camera. 1) He blinks and smiles. 2) He unfolds his arms: one arm extends toward the LEFT EDGE of the image with his index finger pointing at something outside the frame, as if pointing at a title written on a wall on the left; the other hand relaxes down. 3) At the same time he turns his head and his eyes toward the LEFT EDGE of the image (he looks at the left side of the screen, never to the right), still smiling, and leans his upper body slightly toward the left edge and slightly forward, as if peeking a little out of the picture frame. 4) He holds the pointing finger steady for about one second, then does a quick playful magic flick: a small snap and wiggle of the index finger, like casting a spell, with raised eyebrows and a bigger delighted smile. 5) He stays turned to the left, amused and satisfied, still smiling, as if admiring the result of his magic trick. 6) He lowers his arm, turns back to face the camera, crosses his arms over his chest again exactly like in the first frame, and returns exactly to the starting pose with a subtle smile, for a seamless loop. Throughout the whole video the cream sherpa overshirt keeps its fluffy bouclé wool texture and the same cream colour, and the character keeps exactly the same face, short curly hair, dark green eyes, goatee and single stud earring on the right side of the image. Smooth natural motion, no camera shake.
```

## Pourquoi ce prompt est écrit comme ça

- « no text, no particles, no sparkles » : un essai précédent a fait inventer un panneau avec du texte ; les étincelles seront ajoutées par le site (CSS/GSAP), pas par la vidéo, pour garder un fond propre et un détourage net.
- Le côté est dit **deux fois** (« LEFT EDGE of the image » et « never to the right ») : un essai a regardé du mauvais côté.
- La texture de la veste est rappelée : elle a tendance à devenir lisse quand les bras bougent.

## Après la génération

1. Télécharge le `.mp4` (avec le plan Plus il n'y a pas de filigrane).
2. Lance l'outil **Remove background** de Higgsfield sur cette vidéo : il rend le sujet sur fond noir uni. Télécharge ce second `.mp4`.
3. Dépose les deux fichiers dans `img/higgsfield/` (dossier ignoré par git) sous des noms clairs, par exemple `scene-originale.mp4` et `scene-fond-noir.mp4`, et préviens-moi.

Je fabrique ensuite le WebM transparent (voir `05-optimiser-et-deposer.md` pour les budgets) et je note la seconde exacte du geste de magie pour synchroniser la transformation du titre.

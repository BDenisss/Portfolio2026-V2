# Guide du CMS

Tout le contenu du site se gère depuis l'administration Payload : `/admin` (par exemple `http://localhost:3000/admin` en local). Ce guide dit où cliquer et ce qui se passe sur le site.

Le menu de gauche regroupe les contenus : **Contenu** (Projects, Stacks, Services, Experiences), **Médias** (Media), **Boîte de réception** (Messages) et **Réglages** (Site, Médias cinématiques).

## Créer le premier utilisateur

1. Ouvre `/admin` sur une base vide : l'écran **Créer le premier utilisateur** (*Create first user*) s'affiche.
2. Saisis un e-mail et un mot de passe. Ce compte est administrateur.
3. L'inscription publique est fermée ensuite : les autres comptes se créent depuis **Users**, en étant connecté.

Sur un site en ligne, crée ce compte **immédiatement** après le premier déploiement : tant qu'il n'existe pas, l'écran est ouvert à la première personne qui le visite.

## Changer de langue d'édition (FR / EN)

Les textes sont saisis dans deux langues. En haut de chaque fiche, le sélecteur **Paramètres régionaux** (*Locale*) bascule entre Français et English : saisis d'abord le français, puis passe en anglais et traduis les champs.

- Un champ anglais laissé vide **retombe sur le français** : le site n'affiche jamais de trou.
- Les champs non localisés (nom d'une technologie, dates, liens, ordre…) sont communs aux deux langues.
- La langue de l'interface d'administration se change dans ton compte, champ **Langue**.

## Ajouter un projet

**Contenu › Projects**, puis le bouton **Créer un(e) nouveau ou nouvelle** (*Create New*).

| Champ | Rôle |
|---|---|
| `title` | titre (par langue) |
| `slug` (colonne de droite) | fin de l'URL : `/fr/projects/<slug>`. Rempli depuis le titre s'il est vide. Ne le change pas après publication : l'ancienne adresse cesserait de fonctionner |
| `tagline` | une phrase, affichée sur la carte |
| `summary` | résumé, en tête de la page du projet |
| `caseStudy` | étude de cas en texte enrichi (titres, listes, liens…) |
| `cover` | image de couverture. Le texte alternatif de l'image est obligatoire |
| `gallery` | images supplémentaires |
| `stacks` | technologies utilisées (ce sont elles qui alimentent le filtre de la grille) |
| `links` | site en ligne, dépôt, étude de cas externe : adresses en `http(s)://` uniquement |
| `year`, `client` | affichés sur la carte et la page |
| `featured` (colonne de droite) | les projets mis en avant passent en premier dans la grille |
| `order` (colonne de droite) | plus petit = plus haut. Un nouveau projet prend 100, donc s'affiche après les autres |

**Brouillon puis publication.** Les projets ont un cycle de vie : **Enregistrer le brouillon** (*Save Draft*) garde tes modifications sans les montrer au public ; **Publier** (*Publish*) les met en ligne. Seuls les projets publiés apparaissent sur le site, dans le sitemap et sur leur page. **Annuler la publication** (*Unpublish*) retire un projet. Les dix dernières versions de chaque projet sont conservées.

## Ajouter une technologie

**Contenu › Stacks.**

- `name` : le nom affiché. `slug` : rempli depuis le nom s'il est vide.
- `category` : Langages, Frontend, Backend, Architecture, Tests, DevOps & Cloud, Sécurité ou IA. Elle détermine le groupe dans la section « Stack ».
- `icon` : deux façons de donner une icône.
  - **Slug Simple Icons** : le nom de l'icône sur [simpleicons.org](https://simpleicons.org), en minuscules et sans espace (`docker`, `react`…).
  - **Upload** : un fichier SVG depuis la médiathèque.
  - **Aucune des deux** : le site affiche un monogramme (les premières lettres du nom).
- `order` : plus petit = plus haut (100 par défaut).

La case `featured` existe mais n'a pas d'effet visible sur le site pour l'instant. Les technologies rattachées à un projet se choisissent dans la fiche du projet.

## Services, expériences et textes du site

**Services** (Contenu › Services) : les cartes de la section Services. Champs : titre, description, icône (liste fermée), teinte (`amber`, `violet`, `blue`, `teal`) et ordre.

**Experiences** (Contenu › Experiences) : la frise du parcours. `kind` distingue **Expérience** et **Formation**. Les dates se saisissent au mois. **Laisse `end` vide pour une période en cours.** `highlights` est une liste de points forts, `stacks` les technologies utilisées, `order` place l'entrée (plus petit = plus haut).

**Réglages › Site** : un onglet par bloc de la page.

| Onglet | Contenu |
|---|---|
| Identité | nom, titre de poste, accroche, localisation |
| Hero | sur-titre, phrases qui défilent, boutons, trois pastilles maximum, bandeau « Ils m'ont fait confiance » |
| À propos | titre, biographie, chiffres |
| Méthode | titre et étapes de la section Méthode |
| Contact | e-mail, téléphone, LinkedIn, GitHub, destinataire des messages |
| CV | les deux CV en PDF |
| SEO | titre, description et image de partage (Open Graph) |

**Chiffres de la section À propos.** Avec `autoStats` coché (par défaut), le site calcule seul : les années d'expérience (depuis le début de la plus ancienne entrée de type Expérience), le nombre d'expériences, le nombre de technologies et le nombre de projets publiés. Décoche `autoStats` pour saisir tes propres chiffres (valeur et libellé par langue).

**Téléphone.** Le champ `phone` est enregistré mais **n'est affiché publiquement que si `showPhone` est coché**. Il est décoché par défaut : l'affichage d'un numéro attire le démarchage. Le téléphone et l'e-mail ne figurent jamais dans les données structurées pour les moteurs de recherche.

**CV.** `cvFullstack` et `cvAi` acceptent un PDF chacun. Avec les deux, le bouton « Télécharger mon CV » du hero ouvre un petit menu pour choisir le profil ; avec un seul, il télécharge directement ce PDF ; sans PDF, le bouton n'apparaît pas. **Un CV téléversé est téléchargeable par tout le monde** : vérifie qu'il ne contient que ce que tu veux publier (les PDF d'origine contiennent un numéro de téléphone).

## Médias

**Médias › Media** regroupe tous les fichiers. Formats acceptés : images, PDF, vidéos `mp4` et `webm`, modèles `glb`. Le **texte alternatif est obligatoire pour toute image** (il décrit l'image aux lecteurs d'écran).

Les fichiers sont stockés dans le dossier `media/` en local et dans le volume `media` en Docker ; sur Vercel, ils partent vers Vercel Blob dès que `BLOB_READ_WRITE_TOKEN` est défini (voir [`deploy.md`](deploy.md)).

### Médias cinématiques

**Réglages › Médias cinématiques** : l'avatar 3D et les vidéos du hero. Tous les slots sont facultatifs, et chacun a un repli.

| Slot | Fichier attendu | Si vide |
|---|---|---|
| `avatarModel` | `.glb` compressé, 3 Mo maximum | portrait, puis orbe de verre |
| `avatarPortrait` | PNG ou WebP transparent, 150 Ko maximum | orbe de verre |
| `heroPoster` | WebP ou AVIF, 150 Ko maximum | dégradé lavande |
| `heroVideoDesktop` | `mp4` (+ `webm` facultatif), 16:9, 4 Mo maximum | poster |
| `heroVideoMobile` | `mp4` (+ `webm` facultatif), 9:16, 2 Mo maximum | poster |
| `scrubVideo` | `mp4` all-intra, 6 Mo maximum | révélations CSS |

Comment produire et optimiser ces fichiers : [`docs/higgsfield`](higgsfield/README.md).

## Boîte de réception

**Boîte de réception › Messages** liste les messages du formulaire de contact : nom, e-mail, sujet (`project`, `ai`, `job`, `other`), message, langue, et un champ `status` dans la colonne de droite (`new`, `read`, `archived`) que tu changes à la main pour t'organiser.

- Les messages ne se créent que depuis le formulaire du site : le bouton de création est inutile ici.
- L'adresse IP n'est jamais stockée en clair, seulement un condensé (`ipHash`).
- Un e-mail de notification n'est envoyé que si Resend est configuré (`RESEND_API_KEY`). Le destinataire est le champ `contactTo` de **Réglages › Site › Contact**, à défaut la variable `CONTACT_TO`. Sans Resend, rien n'est perdu : les messages restent visibles ici.
- Un envoi en moins de 3 secondes après l'affichage du formulaire est ignoré en silence : c'est le piège anti-robot.

## Pourquoi ma modification n'apparaît pas ?

Le site est généré à l'avance puis rafraîchi quand le contenu change (*revalidation*).

| Tu as modifié… | Le site se met à jour… |
|---|---|
| un projet, un service, une expérience | tout de suite : `/fr` et `/en` sont rafraîchies, ainsi que la page du projet |
| Réglages › Site ou Médias cinématiques | tout de suite |
| une technologie (Stacks) ou un fichier de Media | au plus une heure plus tard (filet de sécurité du site). Pour forcer, enregistre un service ou un projet : cela rafraîchit `/fr` et `/en` |
| le sitemap (nouveau projet publié) | au plus une heure plus tard |

Si rien ne bouge :

1. **Le projet est-il publié ?** Un brouillon n'apparaît jamais sur le site, même quand tu es connecté à l'admin : il n'y a pas d'aperçu des brouillons.
2. **Es-tu dans la bonne langue ?** Une modification en anglais ne change pas `/fr`.
3. **Recharge sans cache** (Ctrl+Maj+R), puis attends quelques secondes.
4. **Après un `pnpm seed` sur un site déjà construit**, refais un build : le seed désactive la revalidation, le site ne se rafraîchit pas seul.
5. **Le champ anglais est vide ?** Le site affiche alors le français.

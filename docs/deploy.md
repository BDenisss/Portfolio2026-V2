# Déploiement

Deux voies : **Vercel + Neon + Vercel Blob** (recommandée, prévue par le projet) ou **Docker** (auto-hébergement). Ce guide décrit la procédure : chaque étape est manuelle, rien ne se déploie tout seul.

Sur Vercel, le build de production lit la base pour générer les pages : migre et charge le contenu **avant** le premier build. L'image Docker, elle, se construit sans base (voir plus bas).

## Vercel + Neon + Vercel Blob

### 1. Base de données (Neon)

Crée un projet Neon et copie la chaîne de connexion. Elle doit se terminer par `?sslmode=require` :

```
postgres://UTILISATEUR:MOT_DE_PASSE@HOTE/BASE?sslmode=require
```

### 2. Médias (Vercel Blob)

Dans Vercel, crée un store **Blob** et rattache-le au projet : cela fournit `BLOB_READ_WRITE_TOKEN`. Dès que cette variable existe, les médias du CMS partent vers Blob au lieu du disque.

### 3. Variables d'environnement

À définir dans Vercel (Production) :

| Variable | Valeur |
|---|---|
| `DATABASE_URI` | la chaîne Neon ci-dessus |
| `PAYLOAD_SECRET` | 32 caractères aléatoires minimum (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | l'URL publique, avec `https://` et **sans `/` final** |
| `IP_HASH_SALT` | une chaîne aléatoire (sel du hachage d'IP du formulaire de contact) |
| `BLOB_READ_WRITE_TOKEN` | fourni par le store Blob |
| `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` | voir « Resend » ci-dessous |

Ne définis **ni** `PAYLOAD_DB_PUSH`, **ni** `NEXT_PUBLIC_E2E`, **ni** `SKIP_BUILD_STATIC` en production. `NEXT_PUBLIC_SITE_URL` est figée dans le build : après l'avoir changée, redéploie.

### 4. Commande de build

Dans les réglages du projet Vercel, remplace la commande de build par :

```bash
pnpm build:prod
```

Elle enchaîne `payload migrate` (applique les migrations sur Neon) puis `next build`. Dans Settings › General › Node.js Version, choisis 22.x (la version de `.nvmrc`).

### 5. Charger le contenu de départ

Depuis ta machine, **avant le premier déploiement**, contre la base Neon :

```bash
# bash
DATABASE_URI="postgres://…?sslmode=require" PAYLOAD_SECRET="…" pnpm migrate
DATABASE_URI="postgres://…?sslmode=require" PAYLOAD_SECRET="…" pnpm seed
```

```powershell
# PowerShell
$env:DATABASE_URI = "postgres://…?sslmode=require"; $env:PAYLOAD_SECRET = "…"
pnpm migrate; pnpm seed
```

Avertissements :

- **Le seed est idempotent, mais il écrase les textes qu'il a semés.** Relancé plus tard, il remet aux valeurs du dépôt les champs qu'il gère : textes FR/EN du site (identité, hero, à propos, méthode, SEO), e-mail et liens de contact, `showPhone` (remis à décoché), et pour les projets, services, expériences et technologies : textes, ordre et, pour les projets, l'état **publié** (un projet que tu avais dépublié est republié). Les champs qu'il ne connaît pas, comme `contactTo`, sont conservés.
- **Les CV ne sont rattachés que s'ils sont trouvés dans `img/`.** Sans ce dossier, le seed remet `cvFullstack` et `cvAi` à vide : relancé sur un site déjà en ligne, il **retire** les CV. À l'inverse, les PDF de `img/` contiennent un numéro de téléphone : ils deviendraient publics. Sur une base de production vide, lance donc le seed **sans** `img/` et téléverse depuis l'admin les CV que tu veux publier.
- **Vise la bonne base.** Si `PAYLOAD_DB_PUSH=true` est défini dans ton `.env` ou ton environnement, Payload synchronise le schéma de la base visée avec le code : retire cette variable (ou mets `false`) avant de lancer `migrate` ou `seed` contre Neon.
- `SEED_PHONE` ne sert qu'à renseigner un téléphone dans le CMS. Laisse-le vide : le numéro n'est jamais affiché tant que `showPhone` est décoché, et n'a pas à sortir de ta machine.
- Le seed désactive la revalidation : charge le contenu avant le build, ou refais un build ensuite.

### 6. Déployer, puis créer le premier utilisateur

Déclenche le déploiement. Dès qu'il est en ligne, ouvre `/admin` et **crée immédiatement le premier utilisateur** ([`cms-guide.md`](cms-guide.md#créer-le-premier-utilisateur)) : tant qu'il n'existe pas, cet écran est ouvert au premier visiteur.

Vérifie ensuite `/fr`, `/en`, `/robots.txt` et `/sitemap.xml` : les adresses du sitemap doivent porter ton domaine.

### 7. Resend (e-mails du formulaire de contact)

1. Crée un compte Resend, ajoute et vérifie ton domaine (enregistrements DNS).
2. Crée une clé d'API : `RESEND_API_KEY`.
3. `CONTACT_FROM` : l'expéditeur, sur le domaine vérifié, par exemple `Portfolio <contact@ton-domaine>`. Sans domaine vérifié, l'expéditeur de test `onboarding@resend.dev` est limité par Resend.
4. `CONTACT_TO` : le destinataire de repli. Le champ `contactTo` de **Réglages › Site › Contact** dans le CMS prime.

Sans `RESEND_API_KEY`, le formulaire fonctionne : les messages sont enregistrés dans **Boîte de réception › Messages** et aucun e-mail n'est envoyé.

### 8. Nom de domaine

Ajoute ton domaine dans Vercel (Settings › Domains) et configure le DNS indiqué. Mets ensuite `NEXT_PUBLIC_SITE_URL` à l'adresse définitive et redéploie : canonical, sitemap, `robots.txt` et données structurées en dépendent.

## Alternative : Docker

L'image est une sortie `standalone` de Next.js (multi-étapes, utilisateur non-root). Elle se construit **sans base** : `SKIP_BUILD_STATIC=1` empêche le pré-rendu. Conséquence : en Docker, les pages d'accueil (`/fr`, `/en`) et le sitemap sont rendus à chaque requête, sans cache ; les pages de projet sont générées à leur première visite puis mises en cache (une heure, ou jusqu'à la publication).

```bash
export PAYLOAD_SECRET="…"          # obligatoire (PowerShell : $env:PAYLOAD_SECRET = "…")
docker compose --profile app build
docker compose --profile app run --rm migrate
docker compose --profile app up -d app
curl -sI http://localhost:3000/fr   # HTTP/1.1 200 OK
```

- `PAYLOAD_SECRET` peut aussi venir du fichier `.env`. `IP_HASH_SALT` (valeur par défaut `change-me`) et `NEXT_PUBLIC_SITE_URL` (par défaut `http://localhost:3000`) se règlent de la même façon.
- `NEXT_PUBLIC_SITE_URL` est figée au build : reconstruis l'image après l'avoir changée (`docker compose --profile app build`).
- Les médias téléversés dans le conteneur vivent dans le volume nommé `media` (`/app/media`). Ils ne sont pas dans l'image. En production sur Vercel, c'est Vercel Blob qui les porte.
- Crée le premier utilisateur sur `/admin`, comme ci-dessus. Pour charger le contenu, lance `pnpm seed` depuis ta machine, avec les mêmes précautions que plus haut (le Postgres du compose est publié sur `localhost:5432`).
- Le service `postgres` de `docker-compose.yml` est pensé pour le développement : identifiants fixes et port publié. Pour un vrai hébergement, utilise une base gérée et passe-la à l'application par `DATABASE_URI`.
- Arrêter l'application sans toucher à Postgres : `docker compose --profile app stop app`.

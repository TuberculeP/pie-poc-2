# Bloop

DAW collaboratif web avec réseau social intégré.

## Stack

- **Frontend** : Vue 3 + Pinia + TypeScript + SCSS
- **Backend** : Express.js + TypeORM + PostgreSQL
- **Storage** : Cloudflare R2 (S3-compatible)
- **Cache audio** : IndexedDB (500MB, LRU)

## Installation

```bash
# Cloner le repo
git clone <repo-url>
cd pie-poc-2

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer en dev
npm run dev
```

## Variables d'environnement

Copier `.env.example` vers `.env` et remplir les valeurs :

```bash
cp .env.example .env
```

### Variables requises

```env
# ================================
# Cloudflare R2 (stockage samples)
# ================================
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# URL publique du bucket R2 (custom domain ou r2.dev)
CDN_BASE_URL=
VITE_CDN_BASE_URL=

# ================================
# Admin initial
# ================================
# Créé au premier lancement si n'existe pas
DEFAULT_ADMIN_EMAIL=your@email.com
DEFAULT_ADMIN_PASSWORD=password
```

### Variables optionnelles

```env
# ================================
# Email (Resend)
# ================================
RESEND_API_KEY=

# ================================
# PostgreSQL (prod uniquement)
# ================================
# En dev, SQLite est utilisé par défaut
POSTGRES_URL=

# ================================
# Google OAuth
# ================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Obtenir les credentials R2

1. Aller sur [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Sélectionner votre compte > **R2 Object Storage**
3. **Account ID** : visible dans l'URL (`https://dash.cloudflare.com/{ACCOUNT_ID}/r2`)
4. **API Token** : Cliquer sur "Manage R2 API Tokens" > "Create API Token"
   - Permissions : Object Read & Write
   - Bucket : Sélectionner votre bucket ou "All buckets"
   - Copier `Access Key ID` et `Secret Access Key`

### Configurer CORS sur R2

Dans le dashboard R2, bucket settings > CORS policy :

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://bloop-on.cloud",
      "https://staging.bloop-on.cloud"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Commandes

```bash
# Dev (lance server + webapp)
npm run dev

# Build production
npm run build

# Lint
npm run lint
```

### Depuis /webapp

```bash
npm run dev      # Vite dev server
npm run build    # Build production
npm run preview  # Preview build
```

### Depuis /server

```bash
npm run dev      # Express avec nodemon
npm run build    # Compile TypeScript
```

## Structure

```
pie-poc-2/
├── webapp/                    # Frontend Vue 3
│   └── src/
│       ├── components/app/    # DAW Timeline
│       ├── views/             # Pages
│       └── stores/            # Pinia stores
├── server/                    # Backend Express
│   └── src/
│       ├── config/entities/   # Entités TypeORM
│       └── routes/            # API REST
├── .env                       # Variables d'environnement
└── README.md
```

## Documentation technique

- [CLAUDE.md](./CLAUDE.md) - Vue d'ensemble technique
- [webapp/src/components/app/CLAUDE.md](./webapp/src/components/app/CLAUDE.md) - DAW Timeline
- [webapp/src/views/admin/CLAUDE.md](./webapp/src/views/admin/CLAUDE.md) - Interface Admin

## Environnements

| Env | URL |
|-----|-----|
| Dev | http://localhost:3000 |
| Staging | https://staging.bloop-on.cloud |
| Prod | https://bloop-on.cloud |
| CDN Samples | https://samples.bloop-on.cloud |

# Sommaire

1. [Introduction](#introduction)
2. [Structure du projet](#structure-du-projet)
3. [Installation](#installation)
4. [Utilisation](#utilisation)
5. [Docker & déploiement](#docker--déploiement)
6. [CI/CD](#cicd)

## Introduction

Ce projet est un template généraliste pour la création de sites ou d'applications web. Il est basé sur ces différentes technologies :

- [Express.js](https://expressjs.com/) - Framework back-end pour Node.js
- [Next.js](https://nextjs.org/) - Framework front-end & headless pour React.js
- [Velite](velite.js.org) - Outil de génération de contenu statique à partir de fichiers Markdown
- [0Auth Google](https://developers.google.com/identity/protocols/oauth2) - Authentification via Google

### Fonctionnalités

- **Gestion de pages & contenus statiques** : Créez des pages statiques à partir de fichiers Markdown
- **Gestion de pages réactives** : Créez des pages dynamiques avec Next.js
- **Connexion via Google** : Authentifiez-vous via Google
- **Sécurité via Cookie** : Stockez les informations de connexion dans un cookie sécurisé

## Structure du projet

### Front-end

Le front-end est basé sur Next.js. Les pages dynamiques et la gestion de l'état global est géré selon les bonnes pratiques de Next.js en mode [App Router](https://nextjs.org/docs/app).

Les pages statiques sont générées à partir de fichiers Markdown grâce à Velite et rendus ensuite par Next.js.

Les dossiers du premier niveau concernés par le front-end sont :

```
.
├── components      # Composants React
├── app             # Pages et cœur de Next.js
├── public          # Fichiers statiques (ico)
├── content         # Contenu statique Velite (md)
├── lib             # Fonctions utilitaires
└── hooks           # Hooks React
```

### Back-end

Le back-end est basé sur Express.js. Il gère les routes de l'API et les connexions à la base de données ainsi que le lien avec Google OAuth.

Voici la structure Express.js pour ce projet :

```
.
└── server/
    ├── tests/      # Tests unitaires
    └── src/        # Code source
```

#### Structure du code source

```
.
└── src/
    ├── config/         # DB, Google OAuth, etc.
    ├── middlewares/    # Middlewares Express
    ├── domains/        # Logique métier trié par domaine
    ├── routes/         # Routes Express
    └── main.ts         # Point d'entrée de l'application
```

Les domaines sont des modules qui regroupent la logique métier par domaine. Par exemple, un domaine `users` contiendrait les fonctions pour gérer les utilisateurs. Il pourra être découpé comme suit :

```
.
└── user/
    ├── users.service.ts    # Service métier
    ├── users.types.ts      # Types TypeScript
    └── users.query.ts      # Requêtes SQL
```

#### Points d'attention

Toute nouvelle configuration ajoutée qui nécessiterait des variables d'environnement doivent être enveloppé dans une fonction d'initialisation. La librairie [TSX](https://tsx.is/)

Les types potentiellement partagés entre le front-end et le back-end sont stockés dans le dossier `/types/` à la racine du projet.

Les fonctions métier déclarées dans *.service.ts sont utilisées dans les routes Express pour gérer les requêtes HTTP.

## Installation

[Node.js](https://nodejs.org/en) et NPM doivent être installés pour compiler et lancer le projet.

```bash
npm install
```

## Utilisation

### Variables d'environnement

Dans le fichier `.env` ou dans une copie `.env.local`, ajoutez les variables suivantes :

```env
POSTGRES_URL=           # URL de connexion à la base de données PostgreSQL

GOOGLE_AUTH_CLIENT=     # ID client Google OAuth
GOOGLE_AUTH_SECRET=     # Secret client Google OAuth

EXPRESS_URL=            # URL de votre serveur Express
SESSION_SECRET=         # Clé salt pour les sessions Express
```

> Soyez sûr que `EXPRESS_URL` soit la même que celle configurée dans Google OAuth.

### Lancement

#### Développement

```bash
npm run dev
```

Lance un tsx pour express, lequel sert automatiquement Next.js en mode développement.

#### Production

```bash
npm run build   # Compile le front-end, le back-end et les pages Velite
npm start       # Lance le serveur Express sur le port 3000
```

## Docker & déploiement

Un Dockerfile est lié à ce projet, permettant de construire une image Docker unique pour le déploiement de l'application.

```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

### Coolify

Ce projet est facilité pour être déployé sur [Coolify](https://coolify.io/). Il suffit de créer un nouveau projet et de lier le dépôt GitHub.
Vous pourrez ensuite directement ajouter les variables d'environnement dans les paramètres du projet.

> Si vous décidez d'assigner une url personnalisée à votre projet, n'oubliez pas de l'ajouter dans les variables d'environnement à la place de `EXPRESS_URL` pour le bon fonctionnement des callbacks de connexion 0Auth.

## CI/CD

Deux workflows GitHub sont configurés pour ce projet :

- **Build** : Compile le front-end, le back-end et les pages Velite
- **Test** : Lance les tests unitaires du back-end

> Lien avec [Codecov](https://about.codecov.io/) : Si une clé `CODECOV_TOKEN` est ajoutée dans les secrets du projet, le workflow de test enverra les résultats à Codecov pour un monitoring détaillé des coverages.

# Déploiement sur Netlify

Ce projet est configuré pour être déployé sur Netlify.

## Instructions de déploiement

### Méthode 1: Déploiement via l'interface Netlify

1. Créez un compte sur [Netlify](https://www.netlify.com/)
2. Cliquez sur "New site from Git"
3. Connectez votre compte GitHub, GitLab ou Bitbucket
4. Sélectionnez ce dépôt
5. Configurez les options de build:
   - Build command: `cd frontend && npm install && npm run build:static`
   - Publish directory: `frontend/build`
6. Cliquez sur "Deploy site"

### Méthode 2: Déploiement via Netlify CLI

1. Installez Netlify CLI: `npm install -g netlify-cli`
2. Connectez-vous à votre compte Netlify: `netlify login`
3. Initialisez votre projet: `netlify init`
4. Suivez les instructions pour configurer votre site
5. Déployez votre site: `netlify deploy --prod`

## Variables d'environnement

Configurez les variables d'environnement suivantes dans les paramètres de votre site Netlify:

- `REACT_APP_API_URL`: URL de l'API backend (si vous déployez également le backend)
- `REACT_APP_IGDB_PROXY_URL`: URL du proxy pour l'API IGDB

## Domaine personnalisé

Pour configurer un domaine personnalisé:

1. Allez dans les paramètres de votre site Netlify
2. Cliquez sur "Domain settings"
3. Cliquez sur "Add custom domain"
4. Suivez les instructions pour configurer votre domaine

## Support

Pour toute question sur le déploiement, contactez support@ludotheque-app.com

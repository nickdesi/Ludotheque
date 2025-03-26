// Configuration pour le déploiement sur Netlify
const path = require('path');
const fs = require('fs');

// Créer un fichier de configuration pour Netlify
const netlifyConfig = `
# Configuration Netlify pour l'application Ludothèque

# Paramètres de build
[build]
  publish = "frontend/build"
  command = "cd frontend && npm install && npm run build:static"

# Redirection pour le routage côté client
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# En-têtes de sécurité
[[headers]]
  for = "/*"
    [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.igdb.com;"

# Configuration des fonctions Netlify (si nécessaire plus tard)
[functions]
  directory = "netlify/functions"

# Variables d'environnement pour la production
[build.environment]
  NODE_VERSION = "16.14.0"
  NPM_VERSION = "8.5.0"
`;

// Écrire le fichier netlify.toml à la racine du projet
fs.writeFileSync(path.join(__dirname, '../netlify.toml'), netlifyConfig);
console.log('Fichier netlify.toml créé avec succès.');

// Créer un fichier _redirects pour Netlify (redondant avec netlify.toml mais recommandé)
const redirects = `
# Redirections pour l'application Ludothèque
/*    /index.html   200
`;

// Créer le répertoire public s'il n'existe pas
const publicDir = path.join(__dirname, '../frontend/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Écrire le fichier _redirects
fs.writeFileSync(path.join(publicDir, '_redirects'), redirects);
console.log('Fichier _redirects créé avec succès.');

// Créer un fichier README pour le déploiement
const deployReadme = `# Déploiement sur Netlify

Ce projet est configuré pour être déployé sur Netlify.

## Instructions de déploiement

### Méthode 1: Déploiement via l'interface Netlify

1. Créez un compte sur [Netlify](https://www.netlify.com/)
2. Cliquez sur "New site from Git"
3. Connectez votre compte GitHub, GitLab ou Bitbucket
4. Sélectionnez ce dépôt
5. Configurez les options de build:
   - Build command: \`cd frontend && npm install && npm run build:static\`
   - Publish directory: \`frontend/build\`
6. Cliquez sur "Deploy site"

### Méthode 2: Déploiement via Netlify CLI

1. Installez Netlify CLI: \`npm install -g netlify-cli\`
2. Connectez-vous à votre compte Netlify: \`netlify login\`
3. Initialisez votre projet: \`netlify init\`
4. Suivez les instructions pour configurer votre site
5. Déployez votre site: \`netlify deploy --prod\`

## Variables d'environnement

Configurez les variables d'environnement suivantes dans les paramètres de votre site Netlify:

- \`REACT_APP_API_URL\`: URL de l'API backend (si vous déployez également le backend)
- \`REACT_APP_IGDB_PROXY_URL\`: URL du proxy pour l'API IGDB

## Domaine personnalisé

Pour configurer un domaine personnalisé:

1. Allez dans les paramètres de votre site Netlify
2. Cliquez sur "Domain settings"
3. Cliquez sur "Add custom domain"
4. Suivez les instructions pour configurer votre domaine

## Support

Pour toute question sur le déploiement, contactez support@ludotheque-app.com
`;

// Écrire le fichier README pour le déploiement
fs.writeFileSync(path.join(__dirname, '../DEPLOY_NETLIFY.md'), deployReadme);
console.log('Fichier DEPLOY_NETLIFY.md créé avec succès.');

console.log('Configuration pour le déploiement sur Netlify terminée.');

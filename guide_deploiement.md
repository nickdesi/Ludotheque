# Guide de déploiement - Application Ludothèque

Ce document fournit les instructions détaillées pour déployer l'application Ludothèque dans un environnement de production.

## Prérequis

- Node.js v16.x ou supérieur
- MongoDB v5.x ou supérieur
- NPM v8.x ou supérieur
- Un serveur Linux (Ubuntu 20.04 LTS recommandé)
- Un nom de domaine (pour le déploiement en production)
- Certificat SSL (Let's Encrypt recommandé)

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-organisation/ludotheque.git
cd ludotheque
```

### 2. Configurer les variables d'environnement

```bash
# Backend
cd backend
cp .env.example .env
```

Éditez le fichier `.env` avec vos propres valeurs :

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://votre-serveur-mongodb:27017/ludotheque
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=30d

# Configuration IGDB API
TWITCH_CLIENT_ID=votre_client_id_twitch
TWITCH_CLIENT_SECRET=votre_client_secret_twitch

# Configuration de sécurité
ENCRYPTION_SECRET=votre_cle_de_chiffrement
CORS_ORIGIN=https://votre-domaine.com
```

### 3. Installer les dépendances

```bash
# Backend
cd backend
npm install --production

# Frontend
cd ../frontend
npm install --production
```

### 4. Construire l'application frontend

```bash
cd frontend
npm run build
```

### 5. Configurer la base de données

Assurez-vous que MongoDB est installé et en cours d'exécution :

```bash
# Vérifier le statut de MongoDB
sudo systemctl status mongodb

# Si MongoDB n'est pas en cours d'exécution
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 6. Démarrer l'application en mode production

```bash
cd backend
npm run start:prod
```

## Déploiement avec PM2 (recommandé)

Pour une gestion robuste des processus en production, nous recommandons d'utiliser PM2 :

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer l'application avec PM2
cd backend
pm2 start npm --name "ludotheque" -- run start:prod

# Configurer le démarrage automatique
pm2 startup
pm2 save
```

## Configuration Nginx (pour servir l'application)

Installez Nginx :

```bash
sudo apt update
sudo apt install nginx
```

Créez un fichier de configuration pour votre application :

```bash
sudo nano /etc/nginx/sites-available/ludotheque
```

Ajoutez la configuration suivante :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activez la configuration et redémarrez Nginx :

```bash
sudo ln -s /etc/nginx/sites-available/ludotheque /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Configuration SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## Mise à jour de l'application

Pour mettre à jour l'application vers une nouvelle version :

```bash
# Arrêter l'application
pm2 stop ludotheque

# Récupérer les dernières modifications
git pull

# Installer les dépendances
cd backend
npm install --production
cd ../frontend
npm install --production

# Construire le frontend
npm run build

# Redémarrer l'application
cd ../backend
pm2 start ludotheque
```

## Sauvegarde de la base de données

Configurez des sauvegardes régulières de votre base de données MongoDB :

```bash
# Créer un script de sauvegarde
nano backup_mongodb.sh
```

Contenu du script :

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/chemin/vers/vos/sauvegardes"
mkdir -p $BACKUP_DIR
mongodump --out $BACKUP_DIR/mongodb_$TIMESTAMP
```

Rendez le script exécutable et configurez une tâche cron :

```bash
chmod +x backup_mongodb.sh
crontab -e
```

Ajoutez la ligne suivante pour une sauvegarde quotidienne à 2h du matin :

```
0 2 * * * /chemin/vers/backup_mongodb.sh
```

## Surveillance et maintenance

### Surveillance avec PM2

```bash
# Vérifier le statut de l'application
pm2 status

# Consulter les logs
pm2 logs ludotheque

# Configurer le tableau de bord de surveillance
pm2 plus
```

### Vérification des performances

```bash
# Vérifier l'utilisation des ressources
htop

# Vérifier l'espace disque
df -h
```

## Résolution des problèmes courants

### L'application ne démarre pas

Vérifiez les logs :

```bash
pm2 logs ludotheque
```

### Problèmes de connexion à MongoDB

Vérifiez que MongoDB est en cours d'exécution :

```bash
sudo systemctl status mongodb
```

Vérifiez la connectivité :

```bash
mongo --eval "db.adminCommand('ping')"
```

### Problèmes de certificat SSL

Renouvelez le certificat :

```bash
sudo certbot renew
```

## Support

Pour toute assistance supplémentaire, contactez notre équipe de support à support@ludotheque-app.com.

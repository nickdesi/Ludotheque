// Script de déploiement sur Netlify
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Fonction pour exécuter une commande et afficher la sortie
function runCommand(command, directory) {
  console.log(`Exécution de: ${command}`);
  try {
    const output = execSync(command, { 
      cwd: directory || process.cwd(),
      stdio: 'inherit'
    });
    return output;
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Fonction principale
async function deployToNetlify() {
  console.log('Début du déploiement sur Netlify...');
  
  // Vérifier si le répertoire frontend existe
  const frontendDir = path.join(__dirname, '../frontend');
  if (!fs.existsSync(frontendDir)) {
    console.error('Le répertoire frontend n\'existe pas.');
    process.exit(1);
  }
  
  // Installer les dépendances du frontend
  console.log('Installation des dépendances du frontend...');
  runCommand('npm install', frontendDir);
  
  // Construire l'application
  console.log('Construction de l\'application...');
  runCommand('npm run build', frontendDir);
  
  // Optimiser les fichiers statiques
  console.log('Optimisation des fichiers statiques...');
  runCommand('npm run build:static', frontendDir);
  
  // Vérifier si Netlify CLI est installé
  try {
    execSync('netlify --version', { stdio: 'ignore' });
    console.log('Netlify CLI est déjà installé.');
  } catch (error) {
    console.log('Installation de Netlify CLI...');
    runCommand('npm install -g netlify-cli');
  }
  
  // Déployer sur Netlify
  console.log('Déploiement sur Netlify...');
  console.log('Note: Cette étape nécessite une interaction manuelle pour l\'authentification et la configuration.');
  console.log('Instructions pour le déploiement manuel:');
  console.log('1. Créez un compte sur Netlify (https://www.netlify.com/)');
  console.log('2. Installez Netlify CLI: npm install -g netlify-cli');
  console.log('3. Connectez-vous à votre compte: netlify login');
  console.log('4. Initialisez votre projet: netlify init');
  console.log('5. Déployez votre site: netlify deploy --prod');
  
  // Créer un fichier de déploiement simulé pour démonstration
  const deploymentInfo = {
    name: 'ludotheque-app',
    url: 'https://ludotheque-app.netlify.app',
    deployedAt: new Date().toISOString(),
    status: 'ready',
    buildSettings: {
      buildCommand: 'cd frontend && npm install && npm run build:static',
      publishDirectory: 'frontend/build',
      framework: 'react'
    }
  };
  
  // Écrire les informations de déploiement dans un fichier
  fs.writeFileSync(
    path.join(__dirname, '../deployment-info.json'), 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('\nDéploiement simulé terminé avec succès!');
  console.log(`URL du site: ${deploymentInfo.url}`);
  console.log('\nPour un déploiement réel, suivez les instructions ci-dessus.');
  
  return deploymentInfo;
}

// Exécuter la fonction principale
deployToNetlify().catch(error => {
  console.error('Erreur lors du déploiement:', error);
  process.exit(1);
});

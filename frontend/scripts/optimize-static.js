// Script d'optimisation des fichiers statiques pour le déploiement web
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Chemin vers le répertoire de build
const buildDir = path.resolve(__dirname, '../build');

// Fonction pour parcourir récursivement un répertoire
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Fonction pour optimiser les images
function optimizeImages() {
  console.log('Optimisation des images...');
  
  // Vérifier si imagemin est installé
  try {
    execSync('npx imagemin --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('Installation des dépendances pour l\'optimisation d\'images...');
    execSync('npm install -g imagemin-cli imagemin-jpegtran imagemin-pngquant', { stdio: 'inherit' });
  }
  
  // Trouver toutes les images
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
  const images = [];
  
  walkDir(buildDir, filePath => {
    const ext = path.extname(filePath).toLowerCase();
    if (imageExtensions.includes(ext)) {
      images.push(filePath);
    }
  });
  
  if (images.length === 0) {
    console.log('Aucune image trouvée à optimiser.');
    return;
  }
  
  console.log(`Optimisation de ${images.length} images...`);
  
  // Créer un répertoire temporaire pour les images optimisées
  const tempDir = path.join(__dirname, '../temp_images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  // Optimiser chaque image
  images.forEach(imagePath => {
    const relativePath = path.relative(buildDir, imagePath);
    const outputPath = path.join(tempDir, relativePath);
    
    // Créer le répertoire de sortie s'il n'existe pas
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Optimiser l'image
    try {
      if (path.extname(imagePath).toLowerCase() === '.svg') {
        // Optimiser les SVG
        execSync(`npx svgo "${imagePath}" -o "${outputPath}"`, { stdio: 'ignore' });
      } else if (['.jpg', '.jpeg'].includes(path.extname(imagePath).toLowerCase())) {
        // Optimiser les JPEG
        execSync(`npx imagemin "${imagePath}" --plugin=jpegtran --out-dir="${outputDir}"`, { stdio: 'ignore' });
      } else {
        // Optimiser les PNG et autres
        execSync(`npx imagemin "${imagePath}" --plugin=pngquant --out-dir="${outputDir}"`, { stdio: 'ignore' });
      }
      
      // Remplacer l'image originale par l'image optimisée
      if (fs.existsSync(outputPath)) {
        fs.copyFileSync(outputPath, imagePath);
        console.log(`Optimisé: ${relativePath}`);
      }
    } catch (error) {
      console.error(`Erreur lors de l'optimisation de ${relativePath}:`, error.message);
    }
  });
  
  // Nettoyer le répertoire temporaire
  fs.rmSync(tempDir, { recursive: true, force: true });
  
  console.log('Optimisation des images terminée.');
}

// Fonction pour optimiser le HTML
function optimizeHtml() {
  console.log('Optimisation des fichiers HTML...');
  
  // Trouver tous les fichiers HTML
  const htmlFiles = [];
  
  walkDir(buildDir, filePath => {
    if (path.extname(filePath).toLowerCase() === '.html') {
      htmlFiles.push(filePath);
    }
  });
  
  if (htmlFiles.length === 0) {
    console.log('Aucun fichier HTML trouvé à optimiser.');
    return;
  }
  
  console.log(`Optimisation de ${htmlFiles.length} fichiers HTML...`);
  
  // Optimiser chaque fichier HTML
  htmlFiles.forEach(htmlPath => {
    try {
      let html = fs.readFileSync(htmlPath, 'utf8');
      
      // Supprimer les commentaires HTML (sauf les commentaires conditionnels pour IE)
      html = html.replace(/<!--(?![\[\]>])[\s\S]*?-->/g, '');
      
      // Supprimer les espaces inutiles
      html = html.replace(/\s{2,}/g, ' ');
      
      // Supprimer les espaces entre les balises
      html = html.replace(/>\s+</g, '><');
      
      // Écrire le HTML optimisé
      fs.writeFileSync(htmlPath, html);
      
      console.log(`Optimisé: ${path.relative(buildDir, htmlPath)}`);
    } catch (error) {
      console.error(`Erreur lors de l'optimisation de ${path.relative(buildDir, htmlPath)}:`, error.message);
    }
  });
  
  console.log('Optimisation des fichiers HTML terminée.');
}

// Fonction pour créer un fichier de configuration Netlify
function createNetlifyConfig() {
  console.log('Création du fichier de configuration Netlify...');
  
  const netlifyToml = `
[build]
  publish = "build"
  command = "npm run build:static"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
    [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.igdb.com;"
`;
  
  fs.writeFileSync(path.join(buildDir, '../netlify.toml'), netlifyToml);
  console.log('Fichier netlify.toml créé.');
}

// Fonction pour créer un fichier robots.txt
function createRobotsTxt() {
  console.log('Création du fichier robots.txt...');
  
  const robotsTxt = `
User-agent: *
Allow: /

Sitemap: https://ludotheque-app.netlify.app/sitemap.xml
`;
  
  fs.writeFileSync(path.join(buildDir, 'robots.txt'), robotsTxt);
  console.log('Fichier robots.txt créé.');
}

// Fonction pour créer un fichier sitemap.xml basique
function createSitemap() {
  console.log('Création du fichier sitemap.xml...');
  
  const today = new Date().toISOString().split('T')[0];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ludotheque-app.netlify.app/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ludotheque-app.netlify.app/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ludotheque-app.netlify.app/register</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ludotheque-app.netlify.app/features</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
`;
  
  fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemap);
  console.log('Fichier sitemap.xml créé.');
}

// Fonction principale
function main() {
  console.log('Début de l\'optimisation des fichiers statiques...');
  
  // Vérifier si le répertoire de build existe
  if (!fs.existsSync(buildDir)) {
    console.error(`Le répertoire de build n'existe pas: ${buildDir}`);
    console.log('Exécutez d\'abord "npm run build" pour créer le build.');
    process.exit(1);
  }
  
  // Optimiser les images
  optimizeImages();
  
  // Optimiser le HTML
  optimizeHtml();
  
  // Créer les fichiers de configuration pour le déploiement
  createNetlifyConfig();
  createRobotsTxt();
  createSitemap();
  
  console.log('Optimisation des fichiers statiques terminée avec succès!');
  console.log('Le site est prêt à être déployé sur Netlify ou un autre service d\'hébergement statique.');
}

// Exécuter la fonction principale
main();

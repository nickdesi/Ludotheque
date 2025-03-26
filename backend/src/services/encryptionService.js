// Service de chiffrement pour les sauvegardes
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class EncryptionService {
  constructor() {
    // Algorithme de chiffrement AES-256-CBC
    this.algorithm = 'aes-256-cbc';
    // Taille de la clé en octets (256 bits = 32 octets)
    this.keyLength = 32;
    // Taille du vecteur d'initialisation en octets
    this.ivLength = 16;
    // Fonction de dérivation de clé
    this.iterations = 100000;
    // Fonction de hachage pour PBKDF2
    this.digest = 'sha512';
  }

  // Générer une clé à partir d'un mot de passe
  async deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
      // Si aucun sel n'est fourni, en générer un nouveau
      if (!salt) {
        salt = crypto.randomBytes(16);
      }
      
      crypto.pbkdf2(password, salt, this.iterations, this.keyLength, this.digest, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({ key: derivedKey, salt });
      });
    });
  }

  // Chiffrer des données
  async encrypt(data, password) {
    try {
      // Générer une clé à partir du mot de passe
      const { key, salt } = await this.deriveKey(password);
      
      // Générer un vecteur d'initialisation aléatoire
      const iv = crypto.randomBytes(this.ivLength);
      
      // Créer un chiffreur
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Chiffrer les données
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Retourner les données chiffrées avec le sel et le vecteur d'initialisation
      return {
        encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex')
      };
    } catch (error) {
      console.error('Erreur lors du chiffrement:', error);
      throw new Error('Erreur lors du chiffrement des données');
    }
  }

  // Déchiffrer des données
  async decrypt(encryptedData, password, salt, iv) {
    try {
      // Convertir le sel et le vecteur d'initialisation en Buffer
      const saltBuffer = Buffer.from(salt, 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      
      // Dériver la clé à partir du mot de passe et du sel
      const { key } = await this.deriveKey(password, saltBuffer);
      
      // Créer un déchiffreur
      const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer);
      
      // Déchiffrer les données
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      throw new Error('Erreur lors du déchiffrement des données');
    }
  }

  // Chiffrer un fichier
  async encryptFile(inputPath, outputPath, password) {
    try {
      // Lire le contenu du fichier
      const data = fs.readFileSync(inputPath, 'utf8');
      
      // Chiffrer les données
      const { encrypted, salt, iv } = await this.encrypt(data, password);
      
      // Créer l'objet de métadonnées
      const metadata = {
        algorithm: this.algorithm,
        keyLength: this.keyLength,
        ivLength: this.ivLength,
        iterations: this.iterations,
        digest: this.digest,
        salt,
        iv
      };
      
      // Créer l'objet de sortie
      const output = {
        metadata,
        data: encrypted
      };
      
      // Écrire le fichier chiffré
      fs.writeFileSync(outputPath, JSON.stringify(output), 'utf8');
      
      return outputPath;
    } catch (error) {
      console.error('Erreur lors du chiffrement du fichier:', error);
      throw new Error(`Erreur lors du chiffrement du fichier ${inputPath}`);
    }
  }

  // Déchiffrer un fichier
  async decryptFile(inputPath, outputPath, password) {
    try {
      // Lire le contenu du fichier chiffré
      const encryptedContent = fs.readFileSync(inputPath, 'utf8');
      const { metadata, data } = JSON.parse(encryptedContent);
      
      // Déchiffrer les données
      const decrypted = await this.decrypt(data, password, metadata.salt, metadata.iv);
      
      // Écrire le fichier déchiffré
      fs.writeFileSync(outputPath, decrypted, 'utf8');
      
      return outputPath;
    } catch (error) {
      console.error('Erreur lors du déchiffrement du fichier:', error);
      throw new Error(`Erreur lors du déchiffrement du fichier ${inputPath}`);
    }
  }

  // Compresser des données avec compression différentielle
  compressData(data, previousData = null) {
    try {
      // Si des données précédentes sont fournies, calculer la différence
      let dataToCompress = data;
      
      if (previousData) {
        // Implémentation simplifiée de la compression différentielle
        // Dans une implémentation réelle, on utiliserait un algorithme plus sophistiqué
        const diff = this.calculateDiff(previousData, data);
        dataToCompress = JSON.stringify(diff);
      }
      
      // Compresser les données avec gzip
      const compressed = zlib.gzipSync(dataToCompress);
      
      return compressed;
    } catch (error) {
      console.error('Erreur lors de la compression:', error);
      throw new Error('Erreur lors de la compression des données');
    }
  }

  // Décompresser des données
  decompressData(compressedData, previousData = null) {
    try {
      // Décompresser les données
      const decompressed = zlib.gunzipSync(compressedData).toString();
      
      // Si des données précédentes sont fournies, appliquer la différence
      if (previousData) {
        // Analyser la différence
        const diff = JSON.parse(decompressed);
        
        // Appliquer la différence aux données précédentes
        return this.applyDiff(previousData, diff);
      }
      
      return decompressed;
    } catch (error) {
      console.error('Erreur lors de la décompression:', error);
      throw new Error('Erreur lors de la décompression des données');
    }
  }

  // Calculer la différence entre deux objets (implémentation simplifiée)
  calculateDiff(oldObj, newObj) {
    const diff = {};
    
    // Parcourir les propriétés du nouvel objet
    for (const key in newObj) {
      // Si la propriété n'existe pas dans l'ancien objet ou si elle a changé
      if (!(key in oldObj) || oldObj[key] !== newObj[key]) {
        diff[key] = newObj[key];
      }
    }
    
    // Marquer les propriétés supprimées
    for (const key in oldObj) {
      if (!(key in newObj)) {
        diff[key] = null; // Marquer comme supprimé
      }
    }
    
    return diff;
  }

  // Appliquer une différence à un objet (implémentation simplifiée)
  applyDiff(oldObj, diff) {
    const result = { ...oldObj };
    
    // Appliquer les modifications
    for (const key in diff) {
      if (diff[key] === null) {
        // Supprimer la propriété
        delete result[key];
      } else {
        // Mettre à jour ou ajouter la propriété
        result[key] = diff[key];
      }
    }
    
    return result;
  }

  // Créer une sauvegarde chiffrée et compressée
  async createBackup(data, password, previousBackupPath = null) {
    try {
      // Convertir les données en chaîne JSON
      const jsonData = JSON.stringify(data);
      
      // Charger la sauvegarde précédente si elle existe
      let previousData = null;
      if (previousBackupPath && fs.existsSync(previousBackupPath)) {
        try {
          const encryptedContent = fs.readFileSync(previousBackupPath, 'utf8');
          const { metadata, data: encryptedData } = JSON.parse(encryptedContent);
          previousData = await this.decrypt(encryptedData, password, metadata.salt, metadata.iv);
        } catch (error) {
          console.warn('Impossible de charger la sauvegarde précédente, création d\'une sauvegarde complète');
        }
      }
      
      // Compresser les données
      const compressed = this.compressData(jsonData, previousData);
      
      // Chiffrer les données compressées
      const { key, salt } = await this.deriveKey(password);
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(compressed, null, 'hex');
      encrypted += cipher.final('hex');
      
      // Créer l'objet de métadonnées
      const metadata = {
        algorithm: this.algorithm,
        keyLength: this.keyLength,
        ivLength: this.ivLength,
        iterations: this.iterations,
        digest: this.digest,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        compressed: true,
        differential: !!previousData,
        timestamp: Date.now(),
        originalSize: jsonData.length,
        compressedSize: compressed.length
      };
      
      // Créer l'objet de sortie
      const output = {
        metadata,
        data: encrypted
      };
      
      return output;
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
      throw new Error('Erreur lors de la création de la sauvegarde');
    }
  }

  // Restaurer une sauvegarde chiffrée et compressée
  async restoreBackup(backup, password, previousBackup = null) {
    try {
      const { metadata, data: encryptedData } = backup;
      
      // Déchiffrer les données
      const saltBuffer = Buffer.from(metadata.salt, 'hex');
      const ivBuffer = Buffer.from(metadata.iv, 'hex');
      
      const { key } = await this.deriveKey(password, saltBuffer);
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer);
      let decrypted = decipher.update(encryptedData, 'hex');
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      // Décompresser les données
      let decompressed;
      
      if (metadata.differential && previousBackup) {
        // Restaurer d'abord la sauvegarde précédente
        const previousData = await this.restoreBackup(previousBackup, password);
        
        // Décompresser avec les données précédentes
        decompressed = this.decompressData(decrypted, previousData);
      } else {
        // Décompresser sans données précédentes
        decompressed = this.decompressData(decrypted);
      }
      
      // Analyser les données JSON
      return JSON.parse(decompressed);
    } catch (error) {
      console.error('Erreur lors de la restauration de la sauvegarde:', error);
      throw new Error('Erreur lors de la restauration de la sauvegarde');
    }
  }
}

module.exports = new EncryptionService();

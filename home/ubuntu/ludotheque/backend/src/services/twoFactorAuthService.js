// Service d'authentification à deux facteurs
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');

class TwoFactorAuthService {
  constructor() {
    this.issuer = 'Ludothèque App';
  }

  // Générer un secret pour l'authentification à deux facteurs
  generateSecret(username) {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${this.issuer}:${username}`,
      issuer: this.issuer
    });

    return {
      base32: secret.base32,
      otpauth_url: secret.otpauth_url
    };
  }

  // Générer un QR code à partir d'une URL otpauth
  async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      throw new Error('Impossible de générer le QR code');
    }
  }

  // Vérifier un code TOTP
  verifyToken(secret, token) {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Permet une fenêtre de 1 intervalle (±30 secondes)
      });

      return verified;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  }

  // Configurer l'authentification à deux facteurs pour un utilisateur
  async setupTwoFactor(userId) {
    try {
      // Récupérer l'utilisateur
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Générer un nouveau secret
      const secret = this.generateSecret(user.username);
      
      // Générer un QR code
      const qrCodeUrl = await this.generateQRCode(secret.otpauth_url);
      
      return {
        secret: secret.base32,
        qrCodeUrl
      };
    } catch (error) {
      console.error('Erreur lors de la configuration 2FA:', error);
      throw new Error('Erreur lors de la configuration de l\'authentification à deux facteurs');
    }
  }

  // Activer l'authentification à deux facteurs pour un utilisateur
  async enableTwoFactor(userId, secret, token) {
    try {
      // Vérifier le token
      const isValid = this.verifyToken(secret, token);
      
      if (!isValid) {
        throw new Error('Code invalide');
      }
      
      // Mettre à jour l'utilisateur
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Activer 2FA et sauvegarder le secret
      user.twoFactorEnabled = true;
      user.twoFactorSecret = secret;
      
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'activation 2FA:', error);
      throw new Error('Erreur lors de l\'activation de l\'authentification à deux facteurs');
    }
  }

  // Désactiver l'authentification à deux facteurs pour un utilisateur
  async disableTwoFactor(userId) {
    try {
      // Mettre à jour l'utilisateur
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Désactiver 2FA et supprimer le secret
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la désactivation 2FA:', error);
      throw new Error('Erreur lors de la désactivation de l\'authentification à deux facteurs');
    }
  }

  // Vérifier l'authentification à deux facteurs pour un utilisateur
  async verifyTwoFactor(userId, token) {
    try {
      // Récupérer l'utilisateur
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new Error('L\'authentification à deux facteurs n\'est pas activée pour cet utilisateur');
      }
      
      // Vérifier le token
      const isValid = this.verifyToken(user.twoFactorSecret, token);
      
      return isValid;
    } catch (error) {
      console.error('Erreur lors de la vérification 2FA:', error);
      throw new Error('Erreur lors de la vérification de l\'authentification à deux facteurs');
    }
  }

  // Générer des codes de récupération pour un utilisateur
  async generateRecoveryCodes(userId) {
    try {
      // Récupérer l'utilisateur
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Générer 10 codes de récupération aléatoires
      const recoveryCodes = [];
      for (let i = 0; i < 10; i++) {
        const code = this.generateRandomCode();
        recoveryCodes.push(code);
      }
      
      // Hacher les codes avant de les stocker
      const hashedCodes = await Promise.all(
        recoveryCodes.map(async (code) => {
          const salt = await bcrypt.genSalt(10);
          return bcrypt.hash(code, salt);
        })
      );
      
      // Stocker les codes hachés
      user.recoveryCodes = hashedCodes;
      
      await user.save();
      
      // Retourner les codes en clair à l'utilisateur
      return recoveryCodes;
    } catch (error) {
      console.error('Erreur lors de la génération des codes de récupération:', error);
      throw new Error('Erreur lors de la génération des codes de récupération');
    }
  }

  // Générer un code aléatoire
  generateRandomCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    
    // Générer un code de 10 caractères
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    
    // Formater le code en groupes de 5 caractères
    return `${code.slice(0, 5)}-${code.slice(5, 10)}`;
  }

  // Vérifier un code de récupération
  async verifyRecoveryCode(userId, code) {
    try {
      // Récupérer l'utilisateur
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      if (!user.recoveryCodes || user.recoveryCodes.length === 0) {
        throw new Error('Aucun code de récupération disponible');
      }
      
      // Vérifier le code
      for (let i = 0; i < user.recoveryCodes.length; i++) {
        const isValid = await bcrypt.compare(code, user.recoveryCodes[i]);
        
        if (isValid) {
          // Supprimer le code utilisé
          user.recoveryCodes.splice(i, 1);
          await user.save();
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du code de récupération:', error);
      throw new Error('Erreur lors de la vérification du code de récupération');
    }
  }
}

module.exports = new TwoFactorAuthService();

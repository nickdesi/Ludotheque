// Contrôleur pour la gestion des utilisateurs
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email ou nom d\'utilisateur est déjà utilisé'
      });
    }
    
    // Créer un nouvel utilisateur
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'ludotheque_secret',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier si l'authentification à deux facteurs est activée
    if (user.twoFactorEnabled) {
      // Générer un token temporaire pour la vérification 2FA
      const tempToken = jwt.sign(
        { id: user._id, require2FA: true },
        process.env.JWT_SECRET || 'ludotheque_secret',
        { expiresIn: '5m' }
      );
      
      return res.status(200).json({
        success: true,
        require2FA: true,
        tempToken
      });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'ludotheque_secret',
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// Vérification du code 2FA
exports.verify2FA = async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    
    // Vérifier le token temporaire
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'ludotheque_secret');
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
    
    if (!decoded.require2FA) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide pour la vérification 2FA'
      });
    }
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier le code 2FA
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code
    });
    
    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Code 2FA invalide'
      });
    }
    
    // Générer un token JWT complet
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'ludotheque_secret',
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification 2FA',
      error: error.message
    });
  }
};

// Obtenir le profil de l'utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// Mettre à jour le profil de l'utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    
    // Vérifier si le nom d'utilisateur ou l'email est déjà utilisé
    if (username || email) {
      const existingUser = await User.findOne({
        $or: [
          { username: username, _id: { $ne: req.user.id } },
          { email: email, _id: { $ne: req.user.id } }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet email ou nom d\'utilisateur est déjà utilisé'
        });
      }
    }
    
    // Mettre à jour le profil
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          username: username,
          email: email,
          profilePicture: profilePicture
        }
      },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// Mettre à jour le mot de passe
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du mot de passe',
      error: error.message
    });
  }
};

// Configurer l'authentification à deux facteurs
exports.setup2FA = async (req, res) => {
  try {
    // Générer un secret pour 2FA
    const secret = speakeasy.generateSecret({
      name: `Ludothèque - ${req.user.email}`
    });
    
    // Générer un QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    // Stocker temporairement le secret dans la session
    // Dans une application réelle, cela devrait être stocké de manière sécurisée
    req.session = req.session || {};
    req.session.temp2FASecret = secret.base32;
    
    res.status(200).json({
      success: true,
      data: {
        qrCodeUrl,
        secret: secret.base32
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la configuration 2FA',
      error: error.message
    });
  }
};

// Vérifier et activer l'authentification à deux facteurs
exports.verify2FASetup = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Récupérer le secret temporaire
    const secret = req.session?.temp2FASecret;
    
    if (!secret) {
      return res.status(400).json({
        success: false,
        message: 'Configuration 2FA non initialisée'
      });
    }
    
    // Vérifier le code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code
    });
    
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Code invalide'
      });
    }
    
    // Activer 2FA pour l'utilisateur
    const user = await User.findById(req.user.id);
    user.enableTwoFactor(secret);
    await user.save();
    
    // Nettoyer la session
    delete req.session.temp2FASecret;
    
    res.status(200).json({
      success: true,
      message: 'Authentification à deux facteurs activée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation 2FA',
      error: error.message
    });
  }
};

// Désactiver l'authentification à deux facteurs
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Récupérer l'utilisateur
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }
    
    // Désactiver 2FA
    user.disableTwoFactor();
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Authentification à deux facteurs désactivée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation 2FA',
      error: error.message
    });
  }
};

// Mettre à jour les préférences utilisateur
exports.updatePreferences = async (req, res) => {
  try {
    const { theme, glowEffects, glowIntensity, glowColor, defaultView } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Mettre à jour les préférences
    const updatedPreferences = user.updatePreferences({
      theme,
      glowEffects,
      glowIntensity,
      glowColor,
      defaultView
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        preferences: updatedPreferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des préférences',
      error: error.message
    });
  }
};

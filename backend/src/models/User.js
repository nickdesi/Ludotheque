// Modèle pour les utilisateurs
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// Schéma pour les utilisateurs
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  preferences: {
    theme: {
      type: String,
      default: 'dark'
    },
    glowEffects: {
      type: Boolean,
      default: true
    },
    glowIntensity: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1
    },
    glowColor: {
      type: String,
      default: 'primary'
    },
    defaultView: {
      type: String,
      enum: ['gallery', 'map'],
      default: 'gallery'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour le champ updatedAt avant la sauvegarde
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware pour hacher le mot de passe avant la sauvegarde
UserSchema.pre('save', async function(next) {
  // Seulement hacher le mot de passe s'il a été modifié ou est nouveau
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour activer l'authentification à deux facteurs
UserSchema.methods.enableTwoFactor = function(secret) {
  this.twoFactorSecret = secret;
  this.twoFactorEnabled = true;
  return true;
};

// Méthode pour désactiver l'authentification à deux facteurs
UserSchema.methods.disableTwoFactor = function() {
  this.twoFactorSecret = undefined;
  this.twoFactorEnabled = false;
  return true;
};

// Méthode pour mettre à jour les préférences utilisateur
UserSchema.methods.updatePreferences = function(newPreferences) {
  this.preferences = {
    ...this.preferences,
    ...newPreferences
  };
  return this.preferences;
};

module.exports = mongoose.model('User', UserSchema);

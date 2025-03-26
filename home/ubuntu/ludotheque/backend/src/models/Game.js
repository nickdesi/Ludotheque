// Modèle pour la collection de jeux
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schéma pour les jeux
const GameSchema = new Schema({
  barcode: {
    type: String,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  publisher: String,
  developer: String,
  releaseYear: Number,
  coverImage: String,
  ageRating: {
    system: {
      type: String,
      enum: ['PEGI', 'ESRB']
    },
    value: String
  },
  genre: [String],
  description: String,
  userRating: {
    type: {
      type: String,
      enum: ['masterpiece', 'bon', 'moyen', 'decu']
    },
    visualIcon: {
      type: String,
      enum: ['🎮', '👾', '🕹️', '💣']
    }
  },
  customTags: [{
    category: String,
    value: String
  }],
  completed: {
    type: Boolean,
    default: false
  },
  completionDate: Date,
  playTime: Number,
  qrCodeId: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrichedData: {
    officialGuideLinks: [String],
    speedrunLinks: [String],
    modLinks: [String]
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
GameSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour générer un QR code unique
GameSchema.methods.generateQRCode = function() {
  // Cette méthode sera implémentée avec une bibliothèque de génération de QR code
  this.qrCodeId = 'QR_' + this._id + '_' + Date.now();
  return this.qrCodeId;
};

// Méthode pour calculer les statistiques de jeu
GameSchema.statics.getStatsByPlatform = async function(userId) {
  return this.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$platform', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// Méthode pour calculer le taux de complétion
GameSchema.statics.getCompletionRate = async function(userId) {
  const stats = await this.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: null,
      total: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] } }
    }}
  ]);
  
  if (stats.length === 0) {
    return 0;
  }
  
  return (stats[0].completed / stats[0].total) * 100;
};

module.exports = mongoose.model('Game', GameSchema);

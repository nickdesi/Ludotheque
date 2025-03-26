// Modèle pour la liste de souhaits
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schéma pour la liste de souhaits
const WishlistSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  games: [{
    game: {
      title: {
        type: String,
        required: true
      },
      platform: {
        type: String,
        required: true
      },
      publisher: String,
      releaseYear: Number,
      coverImage: String
    },
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  shareableLink: {
    type: String,
    unique: true
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
WishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware pour limiter le nombre de jeux à 30
WishlistSchema.pre('save', function(next) {
  if (this.games.length > 30) {
    const error = new Error('La liste de souhaits ne peut pas contenir plus de 30 jeux');
    return next(error);
  }
  next();
});

// Méthode pour générer un lien partageable crypté
WishlistSchema.methods.generateShareableLink = function() {
  const crypto = require('crypto');
  const randomString = crypto.randomBytes(16).toString('hex');
  this.shareableLink = `${randomString}_${this._id}`;
  return this.shareableLink;
};

// Méthode pour ajouter un jeu à la liste de souhaits
WishlistSchema.methods.addGame = function(gameData) {
  if (this.games.length >= 30) {
    throw new Error('La liste de souhaits ne peut pas contenir plus de 30 jeux');
  }
  
  // Vérifier si le jeu existe déjà dans la liste
  const existingGameIndex = this.games.findIndex(item => 
    item.game.title === gameData.title && item.game.platform === gameData.platform
  );
  
  if (existingGameIndex !== -1) {
    throw new Error('Ce jeu est déjà dans votre liste de souhaits');
  }
  
  this.games.push({
    game: {
      title: gameData.title,
      platform: gameData.platform,
      publisher: gameData.publisher,
      releaseYear: gameData.releaseYear,
      coverImage: gameData.coverImage
    },
    priority: gameData.priority || 3,
    notes: gameData.notes || ''
  });
  
  return this.games.length;
};

// Méthode pour supprimer un jeu de la liste de souhaits
WishlistSchema.methods.removeGame = function(gameId) {
  const initialLength = this.games.length;
  this.games = this.games.filter(item => item._id.toString() !== gameId.toString());
  
  return initialLength !== this.games.length;
};

// Méthode pour mettre à jour la priorité d'un jeu
WishlistSchema.methods.updatePriority = function(gameId, newPriority) {
  if (newPriority < 1 || newPriority > 5) {
    throw new Error('La priorité doit être comprise entre 1 et 5');
  }
  
  const gameIndex = this.games.findIndex(item => item._id.toString() === gameId.toString());
  
  if (gameIndex === -1) {
    throw new Error('Jeu non trouvé dans la liste de souhaits');
  }
  
  this.games[gameIndex].priority = newPriority;
  return true;
};

// Méthode statique pour trouver une liste de souhaits par son lien partageable
WishlistSchema.statics.findByShareableLink = function(link) {
  return this.findOne({ shareableLink: link });
};

module.exports = mongoose.model('Wishlist', WishlistSchema);

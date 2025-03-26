// Modèle pour la gestion des prêts
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schéma pour les prêts
const LoanSchema = new Schema({
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  borrower: {
    name: {
      type: String,
      required: true
    },
    contact: {
      type: String,
      required: true
    }
  },
  loanDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
    default: 'active'
  },
  notes: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Index pour rechercher rapidement les prêts par jeu
LoanSchema.index({ game: 1 });

// Index pour rechercher rapidement les prêts par statut
LoanSchema.index({ status: 1 });

// Middleware pour mettre à jour le champ updatedAt avant la sauvegarde
LoanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware pour vérifier et mettre à jour le statut avant la sauvegarde
LoanSchema.pre('save', function(next) {
  // Si le prêt est déjà retourné, ne pas changer son statut
  if (this.status === 'returned') {
    return next();
  }
  
  const now = new Date();
  
  // Si la date de retour prévue est dépassée, marquer comme en retard
  if (this.expectedReturnDate < now && this.status !== 'overdue') {
    this.status = 'overdue';
  }
  
  // Si une date de retour réelle est définie, marquer comme retourné
  if (this.actualReturnDate && this.status !== 'returned') {
    this.status = 'returned';
  }
  
  next();
});

// Méthode pour prolonger un prêt
LoanSchema.methods.extend = function(additionalDays) {
  if (this.status === 'returned') {
    throw new Error('Impossible de prolonger un prêt déjà retourné');
  }
  
  const currentExpectedDate = new Date(this.expectedReturnDate);
  const newExpectedDate = new Date(currentExpectedDate);
  newExpectedDate.setDate(currentExpectedDate.getDate() + additionalDays);
  
  this.expectedReturnDate = newExpectedDate;
  
  // Si le nouveau délai est dans le futur, réinitialiser le statut à 'active'
  const now = new Date();
  if (newExpectedDate > now && this.status === 'overdue') {
    this.status = 'active';
  }
  
  return this.expectedReturnDate;
};

// Méthode pour marquer un prêt comme retourné
LoanSchema.methods.markAsReturned = function() {
  if (this.status === 'returned') {
    throw new Error('Ce prêt est déjà marqué comme retourné');
  }
  
  this.actualReturnDate = new Date();
  this.status = 'returned';
  
  return true;
};

// Méthode statique pour trouver les prêts actifs pour un utilisateur
LoanSchema.statics.findActiveLoans = function(userId) {
  return this.find({
    owner: userId,
    status: { $in: ['active', 'overdue'] }
  }).populate('game');
};

// Méthode statique pour trouver les prêts en retard pour un utilisateur
LoanSchema.statics.findOverdueLoans = function(userId) {
  return this.find({
    owner: userId,
    status: 'overdue'
  }).populate('game');
};

// Méthode statique pour vérifier si un jeu est actuellement prêté
LoanSchema.statics.isGameLoaned = async function(gameId) {
  const activeLoans = await this.countDocuments({
    game: gameId,
    status: { $in: ['active', 'overdue'] }
  });
  
  return activeLoans > 0;
};

// Méthode statique pour obtenir des statistiques sur les prêts
LoanSchema.statics.getLoanStats = async function(userId) {
  return this.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: '$status',
      count: { $sum: 1 }
    }}
  ]);
};

module.exports = mongoose.model('Loan', LoanSchema);

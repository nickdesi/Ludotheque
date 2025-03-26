// Contrôleur pour la gestion des prêts
const Loan = require('../models/Loan');
const Game = require('../models/Game');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Créer un nouveau prêt
exports.createLoan = async (req, res) => {
  try {
    const { gameId, borrowerName, borrowerContact, expectedReturnDate, notes } = req.body;
    
    // Vérifier si le jeu existe et appartient à l'utilisateur
    const game = await Game.findOne({
      _id: gameId,
      owner: req.user.id
    });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    // Vérifier si le jeu est déjà prêté
    const isLoaned = await Loan.isGameLoaned(gameId);
    
    if (isLoaned) {
      return res.status(400).json({
        success: false,
        message: 'Ce jeu est déjà prêté'
      });
    }
    
    // Créer un nouveau prêt
    const newLoan = new Loan({
      game: gameId,
      borrower: {
        name: borrowerName,
        contact: borrowerContact
      },
      loanDate: new Date(),
      expectedReturnDate: new Date(expectedReturnDate),
      notes,
      owner: req.user.id,
      status: 'active'
    });
    
    await newLoan.save();
    
    res.status(201).json({
      success: true,
      data: newLoan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du prêt',
      error: error.message
    });
  }
};

// Obtenir tous les prêts d'un utilisateur
exports.getLoans = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { owner: req.user.id };
    
    // Filtrer par statut si spécifié
    if (status && ['active', 'returned', 'overdue'].includes(status)) {
      query.status = status;
    }
    
    const loans = await Loan.find(query).populate('game');
    
    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des prêts',
      error: error.message
    });
  }
};

// Obtenir un prêt spécifique
exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('game');
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Prêt non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du prêt',
      error: error.message
    });
  }
};

// Marquer un prêt comme retourné
exports.markAsReturned = async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Prêt non trouvé'
      });
    }
    
    if (loan.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Ce prêt est déjà marqué comme retourné'
      });
    }
    
    loan.markAsReturned();
    await loan.save();
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage du prêt comme retourné',
      error: error.message
    });
  }
};

// Prolonger un prêt
exports.extendLoan = async (req, res) => {
  try {
    const { additionalDays } = req.body;
    
    if (!additionalDays || additionalDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez spécifier un nombre de jours valide'
      });
    }
    
    const loan = await Loan.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Prêt non trouvé'
      });
    }
    
    if (loan.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de prolonger un prêt déjà retourné'
      });
    }
    
    loan.extend(additionalDays);
    await loan.save();
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la prolongation du prêt',
      error: error.message
    });
  }
};

// Obtenir les statistiques des prêts
exports.getLoanStats = async (req, res) => {
  try {
    const stats = await Loan.getLoanStats(req.user.id);
    
    // Formater les statistiques
    const formattedStats = {
      active: 0,
      overdue: 0,
      returned: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });
    
    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Scanner un QR code pour identifier un jeu
exports.scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'Données QR manquantes'
      });
    }
    
    let gameData;
    try {
      gameData = JSON.parse(qrData);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Format de données QR invalide'
      });
    }
    
    if (!gameData.id) {
      return res.status(400).json({
        success: false,
        message: 'Données QR incomplètes'
      });
    }
    
    // Vérifier si le jeu existe
    const game = await Game.findById(gameData.id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    // Vérifier si le jeu est actuellement prêté
    const activeLoan = await Loan.findOne({
      game: game._id,
      status: { $in: ['active', 'overdue'] }
    }).populate('game');
    
    if (activeLoan) {
      return res.status(200).json({
        success: true,
        isLoaned: true,
        data: activeLoan
      });
    }
    
    res.status(200).json({
      success: true,
      isLoaned: false,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du scan du QR code',
      error: error.message
    });
  }
};

// Générer un QR code pour un prêt
exports.generateLoanQRCode = async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('game');
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Prêt non trouvé'
      });
    }
    
    // Créer le répertoire pour les QR codes s'il n'existe pas
    const qrCodeDir = path.join(__dirname, '../../public/qrcodes');
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    // Générer un nom de fichier unique
    const qrCodeFileName = `loan_${loan._id}_${Date.now()}.png`;
    const qrCodePath = path.join(qrCodeDir, qrCodeFileName);
    
    // Données à encoder dans le QR code
    const qrData = JSON.stringify({
      id: loan._id,
      gameId: loan.game._id,
      gameTitle: loan.game.title,
      borrower: loan.borrower.name,
      expectedReturnDate: loan.expectedReturnDate
    });
    
    // Générer le QR code
    await QRCode.toFile(qrCodePath, qrData);
    
    res.status(200).json({
      success: true,
      data: {
        qrCodeUrl: `/qrcodes/${qrCodeFileName}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du QR code',
      error: error.message
    });
  }
};

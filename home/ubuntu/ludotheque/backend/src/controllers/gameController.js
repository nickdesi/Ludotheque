// Contrôleur pour la gestion des jeux
const Game = require('../models/Game');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Créer un nouveau jeu
exports.createGame = async (req, res) => {
  try {
    const { 
      barcode, title, platform, publisher, developer, 
      releaseYear, coverImage, ageRating, genre, description 
    } = req.body;
    
    // Vérifier si le jeu existe déjà pour cet utilisateur
    const existingGame = await Game.findOne({ 
      owner: req.user.id,
      title,
      platform
    });
    
    if (existingGame) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce jeu existe déjà dans votre collection' 
      });
    }
    
    // Créer un nouveau jeu
    const newGame = new Game({
      barcode,
      title,
      platform,
      publisher,
      developer,
      releaseYear,
      coverImage,
      ageRating,
      genre: Array.isArray(genre) ? genre : [genre],
      description,
      owner: req.user.id
    });
    
    // Générer un QR code unique
    const qrCodeId = newGame.generateQRCode();
    
    // Générer l'image du QR code
    const qrCodeDir = path.join(__dirname, '../../public/qrcodes');
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    const qrCodePath = path.join(qrCodeDir, `${qrCodeId}.png`);
    
    // Générer le QR code avec les informations du jeu
    await QRCode.toFile(qrCodePath, JSON.stringify({
      id: newGame._id,
      title: newGame.title,
      platform: newGame.platform,
      owner: req.user.id
    }));
    
    // Sauvegarder le jeu
    await newGame.save();
    
    res.status(201).json({
      success: true,
      data: newGame,
      qrCodeUrl: `/qrcodes/${qrCodeId}.png`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du jeu',
      error: error.message
    });
  }
};

// Obtenir tous les jeux d'un utilisateur
exports.getGames = async (req, res) => {
  try {
    const games = await Game.find({ owner: req.user.id });
    
    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des jeux',
      error: error.message
    });
  }
};

// Obtenir un jeu spécifique
exports.getGame = async (req, res) => {
  try {
    const game = await Game.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du jeu',
      error: error.message
    });
  }
};

// Mettre à jour un jeu
exports.updateGame = async (req, res) => {
  try {
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du jeu',
      error: error.message
    });
  }
};

// Supprimer un jeu
exports.deleteGame = async (req, res) => {
  try {
    const game = await Game.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    // Supprimer le QR code associé
    const qrCodePath = path.join(__dirname, `../../public/qrcodes/${game.qrCodeId}.png`);
    if (fs.existsSync(qrCodePath)) {
      fs.unlinkSync(qrCodePath);
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du jeu',
      error: error.message
    });
  }
};

// Mettre à jour la notation d'un jeu
exports.updateRating = async (req, res) => {
  try {
    const { type, visualIcon } = req.body;
    
    // Vérifier que le type et l'icône correspondent
    const validRatings = {
      'masterpiece': '🎮',
      'bon': '👾',
      'moyen': '🕹️',
      'decu': '💣'
    };
    
    if (validRatings[type] !== visualIcon) {
      return res.status(400).json({
        success: false,
        message: 'L\'icône ne correspond pas au type de notation'
      });
    }
    
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { userRating: { type, visualIcon } },
      { new: true }
    );
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notation',
      error: error.message
    });
  }
};

// Ajouter un tag personnalisé à un jeu
exports.addCustomTag = async (req, res) => {
  try {
    const { category, value } = req.body;
    
    const game = await Game.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    // Vérifier si le tag existe déjà dans cette catégorie
    const existingTagIndex = game.customTags.findIndex(
      tag => tag.category === category && tag.value === value
    );
    
    if (existingTagIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Ce tag existe déjà pour ce jeu'
      });
    }
    
    // Ajouter le nouveau tag
    game.customTags.push({ category, value });
    await game.save();
    
    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du tag',
      error: error.message
    });
  }
};

// Supprimer un tag personnalisé d'un jeu
exports.removeCustomTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    
    const game = await Game.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    // Filtrer le tag à supprimer
    game.customTags = game.customTags.filter(
      tag => tag._id.toString() !== tagId
    );
    
    await game.save();
    
    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du tag',
      error: error.message
    });
  }
};

// Obtenir les statistiques des jeux par plateforme
exports.getStatsByPlatform = async (req, res) => {
  try {
    const stats = await Game.getStatsByPlatform(req.user.id);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Obtenir le taux de complétion
exports.getCompletionRate = async (req, res) => {
  try {
    const completionRate = await Game.getCompletionRate(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        completionRate: Math.round(completionRate * 100) / 100 // Arrondir à 2 décimales
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul du taux de complétion',
      error: error.message
    });
  }
};

// Marquer un jeu comme terminé
exports.markAsCompleted = async (req, res) => {
  try {
    const { completionDate } = req.body;
    
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { 
        completed: true,
        completionDate: completionDate || new Date()
      },
      { new: true }
    );
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage du jeu comme terminé',
      error: error.message
    });
  }
};

// Rechercher des jeux dans la collection
exports.searchGames = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un terme de recherche'
      });
    }
    
    const games = await Game.find({
      owner: req.user.id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { platform: { $regex: query, $options: 'i' } },
        { publisher: { $regex: query, $options: 'i' } },
        { developer: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de jeux',
      error: error.message
    });
  }
};

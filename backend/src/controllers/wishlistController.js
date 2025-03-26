// Contrôleur pour la gestion des listes de souhaits
const Wishlist = require('../models/Wishlist');
const crypto = require('crypto');

// Obtenir la liste de souhaits de l'utilisateur
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ owner: req.user.id });
    
    // Si l'utilisateur n'a pas encore de liste de souhaits, en créer une
    if (!wishlist) {
      wishlist = new Wishlist({
        owner: req.user.id,
        games: []
      });
      
      // Générer un lien partageable
      wishlist.generateShareableLink();
      
      await wishlist.save();
    }
    
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la liste de souhaits',
      error: error.message
    });
  }
};

// Ajouter un jeu à la liste de souhaits
exports.addGameToWishlist = async (req, res) => {
  try {
    const { title, platform, publisher, releaseYear, coverImage, priority, notes } = req.body;
    
    let wishlist = await Wishlist.findOne({ owner: req.user.id });
    
    // Si l'utilisateur n'a pas encore de liste de souhaits, en créer une
    if (!wishlist) {
      wishlist = new Wishlist({
        owner: req.user.id,
        games: []
      });
      
      // Générer un lien partageable
      wishlist.generateShareableLink();
    }
    
    // Vérifier si la liste de souhaits a atteint sa limite
    if (wishlist.games.length >= 30) {
      return res.status(400).json({
        success: false,
        message: 'Votre liste de souhaits ne peut pas contenir plus de 30 jeux'
      });
    }
    
    // Vérifier si le jeu existe déjà dans la liste
    const existingGameIndex = wishlist.games.findIndex(item => 
      item.game.title === title && item.game.platform === platform
    );
    
    if (existingGameIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Ce jeu est déjà dans votre liste de souhaits'
      });
    }
    
    // Ajouter le jeu à la liste de souhaits
    wishlist.games.push({
      game: {
        title,
        platform,
        publisher,
        releaseYear,
        coverImage
      },
      priority: priority || 3,
      notes: notes || ''
    });
    
    await wishlist.save();
    
    res.status(201).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du jeu à la liste de souhaits',
      error: error.message
    });
  }
};

// Supprimer un jeu de la liste de souhaits
exports.removeGameFromWishlist = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const wishlist = await Wishlist.findOne({ owner: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Liste de souhaits non trouvée'
      });
    }
    
    // Vérifier si le jeu existe dans la liste
    const gameIndex = wishlist.games.findIndex(item => 
      item._id.toString() === gameId
    );
    
    if (gameIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé dans la liste de souhaits'
      });
    }
    
    // Supprimer le jeu de la liste
    wishlist.games.splice(gameIndex, 1);
    
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du jeu de la liste de souhaits',
      error: error.message
    });
  }
};

// Mettre à jour la priorité d'un jeu dans la liste de souhaits
exports.updateGamePriority = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { priority } = req.body;
    
    // Vérifier que la priorité est valide
    if (priority < 1 || priority > 5) {
      return res.status(400).json({
        success: false,
        message: 'La priorité doit être comprise entre 1 et 5'
      });
    }
    
    const wishlist = await Wishlist.findOne({ owner: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Liste de souhaits non trouvée'
      });
    }
    
    // Trouver le jeu dans la liste
    const gameIndex = wishlist.games.findIndex(item => 
      item._id.toString() === gameId
    );
    
    if (gameIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé dans la liste de souhaits'
      });
    }
    
    // Mettre à jour la priorité
    wishlist.games[gameIndex].priority = priority;
    
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la priorité',
      error: error.message
    });
  }
};

// Générer un nouveau lien partageable
exports.generateShareableLink = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ owner: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Liste de souhaits non trouvée'
      });
    }
    
    // Générer un nouveau lien partageable
    const shareableLink = wishlist.generateShareableLink();
    
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      data: {
        shareableLink
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du lien partageable',
      error: error.message
    });
  }
};

// Accéder à une liste de souhaits partagée
exports.getSharedWishlist = async (req, res) => {
  try {
    const { shareableLink } = req.params;
    
    const wishlist = await Wishlist.findByShareableLink(shareableLink);
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Liste de souhaits non trouvée ou lien expiré'
      });
    }
    
    // Ne pas renvoyer d'informations sensibles
    const sharedWishlist = {
      games: wishlist.games,
      createdAt: wishlist.createdAt
    };
    
    res.status(200).json({
      success: true,
      data: sharedWishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'accès à la liste de souhaits partagée',
      error: error.message
    });
  }
};

// Mettre à jour les notes d'un jeu dans la liste de souhaits
exports.updateGameNotes = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { notes } = req.body;
    
    const wishlist = await Wishlist.findOne({ owner: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Liste de souhaits non trouvée'
      });
    }
    
    // Trouver le jeu dans la liste
    const gameIndex = wishlist.games.findIndex(item => 
      item._id.toString() === gameId
    );
    
    if (gameIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé dans la liste de souhaits'
      });
    }
    
    // Mettre à jour les notes
    wishlist.games[gameIndex].notes = notes;
    
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des notes',
      error: error.message
    });
  }
};

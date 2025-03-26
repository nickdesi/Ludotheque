// Tests d'intégration pour l'application de ludothèque
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../src/app');
const User = require('../src/models/User');
const Game = require('../src/models/Game');
const Wishlist = require('../src/models/Wishlist');
const Loan = require('../src/models/Loan');
const mongoose = require('mongoose');

chai.use(chaiHttp);

describe('Tests d\'intégration de l\'application Ludothèque', function() {
  // Augmenter le timeout pour les tests d'intégration
  this.timeout(10000);
  
  // Variables pour stocker les données de test
  let testUser;
  let authToken;
  let testGame;
  let testWishlistItem;
  let testLoan;
  
  // Avant tous les tests, créer un utilisateur de test
  before(async function() {
    // Connecter à la base de données de test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ludotheque_test');
    }
    
    // Nettoyer la base de données de test
    await User.deleteMany({});
    await Game.deleteMany({});
    await Wishlist.deleteMany({});
    await Loan.deleteMany({});
    
    // Créer un utilisateur de test
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    });
    
    await testUser.save();
  });
  
  // Après tous les tests, nettoyer la base de données
  after(async function() {
    await User.deleteMany({});
    await Game.deleteMany({});
    await Wishlist.deleteMany({});
    await Loan.deleteMany({});
    
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
  });
  
  describe('Authentification', function() {
    it('devrait permettre à un utilisateur de se connecter', async function() {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('token');
      
      // Stocker le token pour les tests suivants
      authToken = res.body.token;
    });
    
    it('devrait refuser l\'accès avec des identifiants incorrects', async function() {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });
      
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('success', false);
    });
    
    it('devrait permettre d\'accéder au profil utilisateur avec un token valide', async function() {
      const res = await chai.request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('username', 'testuser');
      expect(res.body.data).to.have.property('email', 'test@example.com');
    });
  });
  
  describe('Gestion des jeux', function() {
    it('devrait permettre d\'ajouter un jeu à la collection', async function() {
      const gameData = {
        title: 'The Legend of Zelda: Breath of the Wild',
        platform: 'Nintendo Switch',
        publisher: 'Nintendo',
        developer: 'Nintendo EPD',
        releaseYear: 2017,
        genre: ['Action-Adventure', 'Open World'],
        ageRating: { system: 'PEGI', value: '12' }
      };
      
      const res = await chai.request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gameData);
      
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('title', gameData.title);
      expect(res.body.data).to.have.property('platform', gameData.platform);
      
      // Stocker l'ID du jeu pour les tests suivants
      testGame = res.body.data;
    });
    
    it('devrait permettre de récupérer tous les jeux de la collection', async function() {
      const res = await chai.request(app)
        .get('/api/games')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('count', 1);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data[0]).to.have.property('title', testGame.title);
    });
    
    it('devrait permettre de mettre à jour un jeu', async function() {
      const updateData = {
        userRating: {
          type: 'masterpiece',
          visualIcon: '🎮'
        }
      };
      
      const res = await chai.request(app)
        .put(`/api/games/${testGame._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data.userRating).to.have.property('type', 'masterpiece');
      expect(res.body.data.userRating).to.have.property('visualIcon', '🎮');
    });
  });
  
  describe('Liste de souhaits', function() {
    it('devrait permettre d\'ajouter un jeu à la liste de souhaits', async function() {
      const wishlistData = {
        title: 'Elden Ring',
        platform: 'PlayStation 5',
        publisher: 'Bandai Namco',
        releaseYear: 2022,
        priority: 5,
        notes: 'À acheter dès que possible'
      };
      
      const res = await chai.request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send(wishlistData);
      
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('games');
      expect(res.body.data.games).to.be.an('array');
      expect(res.body.data.games[0].game).to.have.property('title', wishlistData.title);
      expect(res.body.data.games[0]).to.have.property('priority', wishlistData.priority);
      
      // Stocker l'ID de l'élément de la liste de souhaits pour les tests suivants
      testWishlistItem = res.body.data.games[0];
    });
    
    it('devrait permettre de récupérer la liste de souhaits', async function() {
      const res = await chai.request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('games');
      expect(res.body.data.games).to.be.an('array').with.lengthOf(1);
    });
    
    it('devrait permettre de mettre à jour la priorité d\'un jeu dans la liste de souhaits', async function() {
      const res = await chai.request(app)
        .put(`/api/wishlist/${testWishlistItem._id}/priority`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ priority: 2 });
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data.games[0]).to.have.property('priority', 2);
    });
  });
  
  describe('Gestion des prêts', function() {
    it('devrait permettre de créer un prêt', async function() {
      const loanData = {
        gameId: testGame._id,
        borrowerName: 'John Doe',
        borrowerContact: 'john@example.com',
        expectedReturnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 jours
        notes: 'Prêté pour les vacances'
      };
      
      const res = await chai.request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(loanData);
      
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('game', testGame._id);
      expect(res.body.data.borrower).to.have.property('name', loanData.borrowerName);
      expect(res.body.data).to.have.property('status', 'active');
      
      // Stocker l'ID du prêt pour les tests suivants
      testLoan = res.body.data;
    });
    
    it('devrait permettre de récupérer tous les prêts', async function() {
      const res = await chai.request(app)
        .get('/api/loans')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('count', 1);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data[0]).to.have.property('_id', testLoan._id);
    });
    
    it('devrait permettre de marquer un prêt comme retourné', async function() {
      const res = await chai.request(app)
        .put(`/api/loans/${testLoan._id}/return`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('status', 'returned');
      expect(res.body.data).to.have.property('returnDate');
    });
  });
  
  describe('Fonctionnalités de sécurité', function() {
    it('devrait permettre de configurer l\'authentification à deux facteurs', async function() {
      // Ce test est simplifié car la vérification réelle nécessiterait une application TOTP
      const res = await chai.request(app)
        .post('/api/auth/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('qrCodeUrl');
      expect(res.body.data).to.have.property('secret');
    });
    
    it('devrait permettre de créer une sauvegarde chiffrée', async function() {
      const backupData = {
        password: 'BackupPassword123!',
        includeGames: true,
        includeWishlist: true,
        includeLoans: true
      };
      
      const res = await chai.request(app)
        .post('/api/backup/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(backupData);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('backupId');
      expect(res.body.data).to.have.property('timestamp');
      expect(res.body.data).to.have.property('size');
    });
  });
});

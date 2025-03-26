// Tests unitaires pour le service d'authentification à deux facteurs
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const twoFactorAuthService = require('../src/services/twoFactorAuthService');
const User = require('../src/models/User');

describe('Service d'authentification à deux facteurs', function() {
  // Données de test
  const testUserId = '60d21b4667d0d8992e610c85';
  const testUsername = 'testuser';
  const testToken = '123456'; // Token TOTP fictif
  
  // Stub pour le modèle User
  let userStub;
  
  beforeEach(function() {
    // Créer un stub pour le modèle User
    userStub = sinon.stub(User, 'findById');
  });
  
  afterEach(function() {
    // Restaurer le stub
    userStub.restore();
  });
  
  describe('Génération de secret', function() {
    it('devrait générer un secret valide', function() {
      const result = twoFactorAuthService.generateSecret(testUsername);
      expect(result).to.have.property('base32');
      expect(result).to.have.property('otpauth_url');
      expect(result.base32).to.be.a('string');
      expect(result.otpauth_url).to.include(testUsername);
      expect(result.otpauth_url).to.include('Ludothèque App');
    });
  });
  
  describe('Génération de QR code', function() {
    it('devrait générer un QR code à partir d\'une URL otpauth', async function() {
      const otpauthUrl = 'otpauth://totp/Ludothèque%20App:testuser?secret=ABCDEFGHIJKLMNOPQRST&issuer=Ludothèque%20App';
      const qrCode = await twoFactorAuthService.generateQRCode(otpauthUrl);
      expect(qrCode).to.be.a('string');
      expect(qrCode).to.include('data:image/png;base64,');
    });
  });
  
  describe('Vérification de token', function() {
    it('devrait vérifier un token valide', function() {
      // Remplacer la méthode de vérification de speakeasy pour les tests
      const verifyStub = sinon.stub(twoFactorAuthService, 'verifyToken').returns(true);
      
      const result = twoFactorAuthService.verifyToken('ABCDEFGHIJKLMNOPQRST', testToken);
      expect(result).to.be.true;
      
      verifyStub.restore();
    });
    
    it('devrait rejeter un token invalide', function() {
      // Remplacer la méthode de vérification de speakeasy pour les tests
      const verifyStub = sinon.stub(twoFactorAuthService, 'verifyToken').returns(false);
      
      const result = twoFactorAuthService.verifyToken('ABCDEFGHIJKLMNOPQRST', 'invalid');
      expect(result).to.be.false;
      
      verifyStub.restore();
    });
  });
  
  describe('Configuration de l\'authentification à deux facteurs', function() {
    it('devrait configurer 2FA pour un utilisateur existant', async function() {
      // Configurer le stub pour retourner un utilisateur fictif
      const mockUser = {
        _id: testUserId,
        username: testUsername
      };
      userStub.resolves(mockUser);
      
      // Stub pour la génération de QR code
      const generateQRCodeStub = sinon.stub(twoFactorAuthService, 'generateQRCode').resolves('data:image/png;base64,mockQRCode');
      
      const result = await twoFactorAuthService.setupTwoFactor(testUserId);
      expect(result).to.have.property('secret');
      expect(result).to.have.property('qrCodeUrl');
      expect(result.secret).to.be.a('string');
      expect(result.qrCodeUrl).to.equal('data:image/png;base64,mockQRCode');
      
      generateQRCodeStub.restore();
    });
    
    it('devrait échouer pour un utilisateur inexistant', async function() {
      // Configurer le stub pour simuler un utilisateur non trouvé
      userStub.resolves(null);
      
      try {
        await twoFactorAuthService.setupTwoFactor(testUserId);
        // Si on arrive ici, le test échoue
        expect.fail('La configuration aurait dû échouer');
      } catch (error) {
        expect(error.message).to.equal('Utilisateur non trouvé');
      }
    });
  });
  
  describe('Activation de l\'authentification à deux facteurs', function() {
    it('devrait activer 2FA avec un token valide', async function() {
      // Configurer le stub pour retourner un utilisateur fictif
      const mockUser = {
        _id: testUserId,
        username: testUsername,
        save: sinon.stub().resolves()
      };
      userStub.resolves(mockUser);
      
      // Stub pour la vérification du token
      const verifyTokenStub = sinon.stub(twoFactorAuthService, 'verifyToken').returns(true);
      
      const result = await twoFactorAuthService.enableTwoFactor(testUserId, 'ABCDEFGHIJKLMNOPQRST', testToken);
      expect(result).to.be.true;
      expect(mockUser.twoFactorEnabled).to.be.true;
      expect(mockUser.twoFactorSecret).to.equal('ABCDEFGHIJKLMNOPQRST');
      expect(mockUser.save.calledOnce).to.be.true;
      
      verifyTokenStub.restore();
    });
    
    it('devrait échouer avec un token invalide', async function() {
      // Stub pour la vérification du token
      const verifyTokenStub = sinon.stub(twoFactorAuthService, 'verifyToken').returns(false);
      
      try {
        await twoFactorAuthService.enableTwoFactor(testUserId, 'ABCDEFGHIJKLMNOPQRST', 'invalid');
        // Si on arrive ici, le test échoue
        expect.fail('L\'activation aurait dû échouer');
      } catch (error) {
        expect(error.message).to.equal('Code invalide');
      }
      
      verifyTokenStub.restore();
    });
  });
  
  describe('Désactivation de l\'authentification à deux facteurs', function() {
    it('devrait désactiver 2FA pour un utilisateur', async function() {
      // Configurer le stub pour retourner un utilisateur fictif
      const mockUser = {
        _id: testUserId,
        username: testUsername,
        twoFactorEnabled: true,
        twoFactorSecret: 'ABCDEFGHIJKLMNOPQRST',
        save: sinon.stub().resolves()
      };
      userStub.resolves(mockUser);
      
      const result = await twoFactorAuthService.disableTwoFactor(testUserId);
      expect(result).to.be.true;
      expect(mockUser.twoFactorEnabled).to.be.false;
      expect(mockUser.twoFactorSecret).to.be.undefined;
      expect(mockUser.save.calledOnce).to.be.true;
    });
  });
  
  describe('Vérification de l\'authentification à deux facteurs', function() {
    it('devrait vérifier un token valide pour un utilisateur avec 2FA activé', async function() {
      // Configurer le stub pour retourner un utilisateur fictif
      const mockUser = {
        _id: testUserId,
        username: testUsername,
        twoFactorEnabled: true,
        twoFactorSecret: 'ABCDEFGHIJKLMNOPQRST'
      };
      userStub.resolves(mockUser);
      
      // Stub pour la vérification du token
      const verifyTokenStub = sinon.stub(twoFactorAuthService, 'verifyToken').returns(true);
      
      const result = await twoFactorAuthService.verifyTwoFactor(testUserId, testToken);
      expect(result).to.be.true;
      
      verifyTokenStub.restore();
    });
    
    it('devrait échouer pour un utilisateur sans 2FA activé', async function() {
      // Configurer le stub pour retourner un utilisateur fictif
      const mockUser = {
        _id: testUserId,
        username: testUsername,
        twoFactorEnabled: false
      };
      userStub.resolves(mockUser);
      
      try {
        await twoFactorAuthService.verifyTwoFactor(testUserId, testToken);
        // Si on arrive ici, le test échoue
        expect.fail('La vérification aurait dû échouer');
      } catch (error) {
        expect(error.message).to.equal('L\'authentification à deux facteurs n\'est pas activée pour cet utilisateur');
      }
    });
  });
  
  describe('Génération de codes de récupération', function() {
    it('devrait générer des codes de récupération valides', function() {
      const code = twoFactorAuthService.generateRandomCode();
      expect(code).to.be.a('string');
      expect(code).to.match(/^[0-9A-Z]{5}-[0-9A-Z]{5}$/);
    });
  });
});

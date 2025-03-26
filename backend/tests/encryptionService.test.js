// Tests unitaires pour le service de chiffrement
const chai = require('chai');
const expect = chai.expect;
const encryptionService = require('../src/services/encryptionService');
const fs = require('fs');
const path = require('path');

describe('Service de chiffrement', function() {
  // Augmenter le timeout pour les tests de chiffrement
  this.timeout(10000);
  
  const testPassword = 'motDePasseTest123!';
  const testData = { 
    name: 'Test Data',
    items: [1, 2, 3, 4, 5],
    nested: {
      value: 'Nested value',
      array: ['a', 'b', 'c']
    }
  };
  
  describe('Dérivation de clé', function() {
    it('devrait dériver une clé à partir d\'un mot de passe', async function() {
      const result = await encryptionService.deriveKey(testPassword);
      expect(result).to.have.property('key');
      expect(result).to.have.property('salt');
      expect(result.key).to.be.an.instanceOf(Buffer);
      expect(result.key.length).to.equal(32); // 256 bits = 32 bytes
    });
    
    it('devrait dériver la même clé avec le même sel', async function() {
      const result1 = await encryptionService.deriveKey(testPassword);
      const result2 = await encryptionService.deriveKey(testPassword, result1.salt);
      expect(result2.key.toString('hex')).to.equal(result1.key.toString('hex'));
    });
  });
  
  describe('Chiffrement et déchiffrement', function() {
    it('devrait chiffrer et déchiffrer des données correctement', async function() {
      const dataStr = JSON.stringify(testData);
      
      // Chiffrer les données
      const encrypted = await encryptionService.encrypt(dataStr, testPassword);
      expect(encrypted).to.have.property('encrypted');
      expect(encrypted).to.have.property('salt');
      expect(encrypted).to.have.property('iv');
      
      // Déchiffrer les données
      const decrypted = await encryptionService.decrypt(
        encrypted.encrypted, 
        testPassword, 
        encrypted.salt, 
        encrypted.iv
      );
      
      expect(decrypted).to.equal(dataStr);
      expect(JSON.parse(decrypted)).to.deep.equal(testData);
    });
    
    it('devrait échouer avec un mauvais mot de passe', async function() {
      const dataStr = JSON.stringify(testData);
      
      // Chiffrer les données
      const encrypted = await encryptionService.encrypt(dataStr, testPassword);
      
      // Tenter de déchiffrer avec un mauvais mot de passe
      try {
        await encryptionService.decrypt(
          encrypted.encrypted, 
          'mauvaisMotDePasse', 
          encrypted.salt, 
          encrypted.iv
        );
        // Si on arrive ici, le test échoue
        expect.fail('Le déchiffrement aurait dû échouer');
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });
  
  describe('Compression différentielle', function() {
    it('devrait compresser et décompresser des données correctement', function() {
      const dataStr = JSON.stringify(testData);
      
      // Compresser les données
      const compressed = encryptionService.compressData(dataStr);
      expect(compressed).to.be.an.instanceOf(Buffer);
      expect(compressed.length).to.be.lessThan(dataStr.length);
      
      // Décompresser les données
      const decompressed = encryptionService.decompressData(compressed);
      expect(decompressed).to.equal(dataStr);
      expect(JSON.parse(decompressed)).to.deep.equal(testData);
    });
    
    it('devrait calculer et appliquer des différences correctement', function() {
      const oldObj = { a: 1, b: 2, c: 3 };
      const newObj = { a: 1, b: 3, d: 4 }; // b modifié, c supprimé, d ajouté
      
      // Calculer la différence
      const diff = encryptionService.calculateDiff(oldObj, newObj);
      expect(diff).to.deep.equal({ b: 3, c: null, d: 4 });
      
      // Appliquer la différence
      const result = encryptionService.applyDiff(oldObj, diff);
      expect(result).to.deep.equal(newObj);
    });
  });
  
  describe('Sauvegarde et restauration', function() {
    it('devrait créer et restaurer une sauvegarde correctement', async function() {
      // Créer une sauvegarde
      const backup = await encryptionService.createBackup(testData, testPassword);
      expect(backup).to.have.property('metadata');
      expect(backup).to.have.property('data');
      expect(backup.metadata).to.have.property('salt');
      expect(backup.metadata).to.have.property('iv');
      
      // Restaurer la sauvegarde
      const restored = await encryptionService.restoreBackup(backup, testPassword);
      expect(restored).to.deep.equal(testData);
    });
    
    it('devrait créer et restaurer une sauvegarde différentielle correctement', async function() {
      // Données initiales
      const initialData = { ...testData };
      
      // Créer une sauvegarde initiale
      const initialBackup = await encryptionService.createBackup(initialData, testPassword);
      
      // Modifier les données
      const updatedData = { 
        ...initialData,
        items: [1, 2, 3, 4, 5, 6], // Ajout d'un élément
        nested: {
          ...initialData.nested,
          value: 'Updated nested value' // Modification d'une valeur
        }
      };
      
      // Créer une sauvegarde différentielle
      const diffBackup = await encryptionService.createBackup(
        updatedData, 
        testPassword,
        JSON.stringify(initialBackup)
      );
      
      // Restaurer la sauvegarde différentielle
      const restored = await encryptionService.restoreBackup(
        diffBackup, 
        testPassword,
        initialBackup
      );
      
      expect(restored).to.deep.equal(updatedData);
    });
  });
});

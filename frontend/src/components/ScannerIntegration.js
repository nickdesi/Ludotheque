// Intégration du scanner de codes-barres avec l'API IGDB
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import BarcodeScanner from '../services/BarcodeScanner';
import axios from 'axios';

// Conteneur principal
const ScannerIntegrationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

// Zone de prévisualisation du scanner
const ScannerPreview = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.large};
  border: 1px solid ${props => props.theme.colors.border};
`;

// Cadre de scan
const ScanFrame = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 150px;
  border: 2px solid ${props => props.theme.colors.primary};
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5);
  z-index: 2;
  pointer-events: none;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 10px ${props => props.theme.colors.glow.primary};
  }
  
  &::before {
    top: -2px;
    left: -2px;
    border-top: 2px solid;
    border-left: 2px solid;
  }
  
  &::after {
    bottom: -2px;
    right: -2px;
    border-bottom: 2px solid;
    border-right: 2px solid;
  }
`;

// Ligne de scan animée
const ScanLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: ${props => props.theme.colors.primary};
  box-shadow: 0 0 10px ${props => props.theme.colors.glow.primary};
  animation: scanAnimation 2s linear infinite;
  z-index: 3;
  pointer-events: none;
  
  @keyframes scanAnimation {
    0% {
      top: 0;
    }
    100% {
      top: 100%;
    }
  }
`;

// Contrôles du scanner
const ScannerControls = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

// Bouton de contrôle
const ControlButton = styled.button`
  background-color: ${props => props.primary ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.primary ? '#000' : props.theme.colors.text.primary};
  border: ${props => props.primary ? 'none' : `2px solid ${props.theme.colors.border}`};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover {
    background-color: ${props => props.primary ? props.theme.colors.primary : 'rgba(0, 255, 255, 0.1)'};
    box-shadow: ${props => props.primary ? props.theme.shadows.neonPrimary : '0 0 5px rgba(0, 255, 255, 0.5)'};
    transform: translateY(-2px);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// Résultat du scan
const ScanResult = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.medium};
  display: ${props => props.visible ? 'flex' : 'none'};
  gap: ${props => props.theme.spacing.lg};
`;

// Image du jeu scanné
const GameImage = styled.div`
  width: 120px;
  height: 160px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.medium};
`;

// Détails du jeu scanné
const GameDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

// Titre du jeu scanné
const GameTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

// Informations du jeu scanné
const GameInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
`;

// Groupe d'information
const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

// Libellé d'information
const InfoLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// Valeur d'information
const InfoValue = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.md};
  color: ${props => props.theme.colors.text.primary};
`;

// Badge PEGI/ESRB
const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.pegi ? 'rgba(255, 0, 255, 0.1)' : 'rgba(57, 255, 20, 0.1)'};
  border-radius: ${props => props.theme.borderRadius.sm};
  width: fit-content;
  
  span {
    font-size: ${props => props.theme.typography.fontSizes.md};
    font-weight: ${props => props.theme.typography.fontWeights.bold};
    color: ${props => props.pegi ? props.theme.colors.secondary : props.theme.colors.accent};
  }
`;

// Actions pour le jeu scanné
const GameActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

// Message d'état du scanner
const ScannerStatus = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: ${props => props.theme.colors.text.primary};
  background-color: rgba(0, 0, 0, 0.7);
  padding: ${props => props.theme.spacing.sm};
  z-index: 4;
`;

// Composant d'intégration du scanner
const ScannerIntegration = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [status, setStatus] = useState('Prêt à scanner');
  const [loading, setLoading] = useState(false);
  
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  
  // Initialiser le scanner
  useEffect(() => {
    return () => {
      // Nettoyer le scanner lors du démontage du composant
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);
  
  // Gestionnaire de détection de code-barres
  const handleBarcodeDetected = async (result) => {
    if (!result || !result.codeResult || !result.codeResult.code) return;
    
    const barcode = result.codeResult.code;
    setStatus(`Code-barres détecté: ${barcode}`);
    
    // Arrêter le scanner après une détection réussie
    if (scannerRef.current) {
      scannerRef.current.stop();
      setIsScanning(false);
    }
    
    setScanResult(barcode);
    
    // Rechercher les informations du jeu
    try {
      setLoading(true);
      setStatus('Recherche des informations du jeu...');
      
      // Appel à l'API backend pour rechercher le jeu
      const response = await axios.get(`/api/games/barcode/${barcode}`);
      
      if (response.data && response.data.success) {
        setGameData(response.data.data);
        setStatus('Jeu trouvé!');
      } else {
        setStatus('Jeu non trouvé. Veuillez réessayer ou ajouter manuellement.');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche du jeu:', error);
      setStatus('Erreur lors de la recherche du jeu. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Démarrer le scanner
  const startScanner = async () => {
    try {
      setStatus('Initialisation du scanner...');
      
      // Créer une nouvelle instance du scanner si nécessaire
      if (!scannerRef.current) {
        scannerRef.current = new BarcodeScanner();
      }
      
      // Initialiser le scanner avec l'élément vidéo
      await scannerRef.current.init(videoRef.current, handleBarcodeDetected);
      
      // Démarrer le scanner
      scannerRef.current.start();
      setIsScanning(true);
      setStatus('Scanner actif. Placez un code-barres dans le cadre.');
      
      // Réinitialiser les résultats précédents
      setScanResult(null);
      setGameData(null);
    } catch (error) {
      console.error('Erreur lors du démarrage du scanner:', error);
      setStatus('Erreur: Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };
  
  // Arrêter le scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      setIsScanning(false);
      setStatus('Scanner arrêté.');
    }
  };
  
  // Changer de caméra
  const switchCamera = async () => {
    try {
      if (scannerRef.current) {
        setStatus('Changement de caméra...');
        await scannerRef.current.switchCamera();
        setStatus('Caméra changée. Scanner actif.');
      }
    } catch (error) {
      console.error('Erreur lors du changement de caméra:', error);
      setStatus('Erreur lors du changement de caméra.');
    }
  };
  
  // Ajouter le jeu à la collection
  const addGameToCollection = async () => {
    if (!gameData) return;
    
    try {
      setLoading(true);
      setStatus('Ajout du jeu à la collection...');
      
      // Appel à l'API backend pour ajouter le jeu
      const response = await axios.post('/api/games', gameData);
      
      if (response.data && response.data.success) {
        setStatus('Jeu ajouté à votre collection avec succès!');
        // Réinitialiser après quelques secondes
        setTimeout(() => {
          setScanResult(null);
          setGameData(null);
          setStatus('Prêt à scanner');
        }, 3000);
      } else {
        setStatus('Erreur lors de l\'ajout du jeu. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du jeu:', error);
      setStatus('Erreur lors de l\'ajout du jeu. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScannerIntegrationContainer>
      <ScannerPreview>
        <div ref={videoRef} style={{ width: '100%', height: '100%' }}></div>
        {isScanning && (
          <>
            <ScanFrame>
              <ScanLine />
            </ScanFrame>
          </>
        )}
        <ScannerStatus>{status}</ScannerStatus>
      </ScannerPreview>
      
      <ScannerControls>
        {!isScanning ? (
          <ControlButton primary onClick={startScanner}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z"/>
            </svg>
            Démarrer le scan
          </ControlButton>
        ) : (
          <ControlButton onClick={stopScanner}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h12v12H6z"/>
            </svg>
            Arrêter le scan
          </ControlButton>
        )}
        
        {isScanning && (
          <ControlButton onClick={switchCamera}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/>
            </svg>
            Changer de caméra
          </ControlButton>
        )}
        
        <ControlButton>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
          Importer image
        </ControlButton>
      </ScannerControls>
      
      {gameData && (
        <ScanResult visible={true}>
          <GameImage src={gameData.coverImage || "https://via.placeholder.com/120x160/121212/00FFFF?text=Jeu"} />
          
          <GameDetails>
            <GameTitle>{gameData.title}</GameTitle>
            
            <GameInfo>
              <InfoGroup>
                <InfoLabel>Plateforme</InfoLabel>
                <InfoValue>{gameData.platform}</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Éditeur</InfoLabel>
                <InfoValue>{gameData.publisher}</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Développeur</InfoLabel>
                <InfoValue>{gameData.developer}</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Année</InfoLabel>
                <InfoValue>{gameData.releaseYear}</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Genre</InfoLabel>
                <InfoValue>{Array.isArray(gameData.genre) ? gameData.genre.join(', ') : gameData.genre}</InfoValue>
              </InfoGroup>
              
              {gameData.ageRating && gameData.ageRating.system && (
                <InfoGroup>
                  <InfoLabel>Classification</InfoLabel>
                  <RatingBadge pegi={gameData.ageRating.system === 'PEGI'}>
                    <span>{gameData.ageRating.system} {gameData.ageRating.value}</span>
                  </RatingBadge>
                </InfoGroup>
              )}
            </GameInfo>
            
            <GameActions>
              <ControlButton primary onClick={addGameToCollection} disabled={loading}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Ajouter à ma collection
              </ControlButton>
              
              <ControlButton>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Modifier les détails
              </ControlButton>
            </GameActions>
          </GameDetails>
        </ScanResult>
      )}
    </ScannerIntegrationContainer>
  );
};

export default ScannerIntegration;

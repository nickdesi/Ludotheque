import React, { useState } from 'react';
import styled from 'styled-components';

// Conteneur principal pour le module de scan
const ScannerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

// Zone de prévisualisation de la caméra
const CameraPreview = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.large};
  border: 1px solid ${props => props.theme.colors.border};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(to right, rgba(0, 255, 255, 0.2) 0%, transparent 5%, transparent 95%, rgba(0, 255, 255, 0.2) 100%),
      linear-gradient(to bottom, rgba(0, 255, 255, 0.2) 0%, transparent 5%, transparent 95%, rgba(0, 255, 255, 0.2) 100%);
    pointer-events: none;
    z-index: 1;
  }
`;

// Vidéo de la caméra (simulée pour la maquette)
const CameraVideo = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000;
  background-image: url('https://via.placeholder.com/800x400/000000/333333?text=Camera+Preview');
  background-size: cover;
  background-position: center;
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
  
  @keyframes scanAnimation {
    0% {
      top: 0;
    }
    100% {
      top: 100%;
    }
  }
`;

// Contrôles de la caméra
const CameraControls = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

// Bouton de contrôle de la caméra
const CameraButton = styled.button`
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

// Onglets pour les modes de scan
const ScanTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.sm};
  box-shadow: ${props => props.theme.shadows.medium};
`;

// Onglet individuel
const ScanTab = styled.button`
  background-color: ${props => props.active ? 'rgba(0, 255, 255, 0.1)' : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
    color: ${props => props.theme.colors.primary};
  }
  
  ${props => props.active && `
    box-shadow: 0 0 5px ${props.theme.colors.glow.primary};
    text-shadow: 0 0 5px ${props.theme.colors.glow.primary};
  `}
  
  svg {
    width: 18px;
    height: 18px;
    margin-right: ${props => props.theme.spacing.xs};
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
const ScannedGameImage = styled.div`
  width: 120px;
  height: 160px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.medium};
`;

// Détails du jeu scanné
const ScannedGameDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

// Titre du jeu scanné
const ScannedGameTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

// Informations du jeu scanné
const ScannedGameInfo = styled.div`
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
const ScannedGameActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

// Composant de module de scan
const ScannerModule = () => {
  // États pour la démo
  const [scanMode, setScanMode] = useState('add'); // 'add' ou 'return'
  const [showResult, setShowResult] = useState(false);
  
  // Simuler un scan
  const handleScan = () => {
    setShowResult(true);
  };
  
  // Réinitialiser le scan
  const handleReset = () => {
    setShowResult(false);
  };
  
  return (
    <ScannerContainer>
      <ScanTabs>
        <ScanTab 
          active={scanMode === 'add'} 
          onClick={() => { setScanMode('add'); setShowResult(false); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Scanner pour ajouter
        </ScanTab>
        
        <ScanTab 
          active={scanMode === 'return'} 
          onClick={() => { setScanMode('return'); setShowResult(false); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          Scanner pour retour
        </ScanTab>
      </ScanTabs>
      
      <CameraPreview>
        <CameraVideo />
        <ScanFrame>
          <ScanLine />
        </ScanFrame>
      </CameraPreview>
      
      <CameraControls>
        <CameraButton onClick={handleReset}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Réinitialiser
        </CameraButton>
        
        <CameraButton primary onClick={handleScan}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z"/>
          </svg>
          Scanner
        </CameraButton>
        
        <CameraButton>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
          Importer image
        </CameraButton>
      </CameraControls>
      
      {scanMode === 'add' && (
        <ScanResult visible={showResult}>
          <ScannedGameImage src="https://via.placeholder.com/120x160/121212/00FFFF?text=Horizon" />
          
          <ScannedGameDetails>
            <ScannedGameTitle>Horizon Forbidden West</ScannedGameTitle>
            
            <ScannedGameInfo>
              <InfoGroup>
                <InfoLabel>Plateforme</InfoLabel>
                <InfoValue>PlayStation 5</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Éditeur</InfoLabel>
                <InfoValue>Sony Interactive Entertainment</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Développeur</InfoLabel>
                <InfoValue>Guerrilla Games</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Année</InfoLabel>
                <InfoValue>2022</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Genre</InfoLabel>
                <InfoValue>Action-RPG, Open World</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Classification</InfoLabel>
                <RatingBadge pegi>
                  <span>PEGI 16</span>
                </RatingBadge>
              </InfoGroup>
            </ScannedGameInfo>
            
            <ScannedGameActions>
              <CameraButton primary>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Ajouter à ma collection
              </CameraButton>
              
              <CameraButton>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Modifier les détails
              </CameraButton>
            </ScannedGameActions>
          </ScannedGameDetails>
        </ScanResult>
      )}
      
      {scanMode === 'return' && (
        <ScanResult visible={showResult}>
          <ScannedGameImage src="https://via.placeholder.com/120x160/121212/FF00FF?text=TLOU+II" />
          
          <ScannedGameDetails>
            <ScannedGameTitle>The Last of Us Part II</ScannedGameTitle>
            
            <ScannedGameInfo>
              <InfoGroup>
                <InfoLabel>Plateforme</InfoLabel>
                <InfoValue>PlayStation 4</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Prêté à</InfoLabel>
                <InfoValue>Marie Laurent</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Date de prêt</InfoLabel>
                <InfoValue>15/02/2025</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Retour prévu</InfoLabel>
                <InfoValue style={{ color: '#FF3131', textShadow: '0 0 5px rgba(255, 49, 49, 0.7)' }}>15/03/2025</InfoValue>
              </InfoGroup>
              
              <InfoGroup>
                <InfoLabel>Statut</InfoLabel>
                <InfoValue style={{ color: '#FF3131', textShadow: '0 0 5px rgba(255, 49, 49, 0.7)' }}>En retard</InfoValue>
              </InfoGroup>
            </ScannedGameInfo>
            
            <ScannedGameActions>
              <CameraButton primary>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
                Marquer comme retourné
              </CameraButton>
              
              <CameraButton>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                Prolonger le prêt
              </CameraButton>
            </ScannedGameActions>
          </ScannedGameDetails>
        </ScanResult>
      )}
    </ScannerContainer>
  );
};

export default ScannerModule;

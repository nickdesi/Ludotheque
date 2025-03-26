import React, { useState } from 'react';
import styled from 'styled-components';

// Conteneur principal pour la vue galerie
const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

// Filtres et options de tri
const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.medium};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

// Groupe de filtres
const FilterGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
`;

// Étiquette de filtre
const FilterLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

// Sélecteur stylisé
const StyledSelect = styled.select`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  font-family: ${props => props.theme.typography.fontFamily};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  outline: none;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 5px ${props => props.theme.colors.glow.primary};
  }
  
  option {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
  }
`;

// Bouton de changement de vue
const ViewToggleButton = styled.button`
  background-color: ${props => props.active ? 'rgba(0, 255, 255, 0.1)' : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
    color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 5px ${props => props.theme.colors.glow.primary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Conteneur de la grille de jeux
const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

// Conteneur pour la vue carte interactive
const MapContainer = styled.div`
  height: 70vh;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  position: relative;
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
      radial-gradient(circle at 10% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 20%),
      radial-gradient(circle at 80% 30%, rgba(255, 0, 255, 0.1) 0%, transparent 25%),
      radial-gradient(circle at 40% 70%, rgba(57, 255, 20, 0.1) 0%, transparent 30%),
      radial-gradient(circle at 90% 90%, rgba(0, 255, 255, 0.1) 0%, transparent 20%);
    z-index: 0;
  }
`;

// Nœud de jeu sur la carte
const GameNode = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.surface};
  border: 2px solid ${props => {
    switch(props.category) {
      case 'rpg': return props.theme.colors.primary;
      case 'fps': return props.theme.colors.secondary;
      case 'strategy': return props.theme.colors.accent;
      default: return props.theme.colors.text.primary;
    }
  }};
  box-shadow: 0 0 10px ${props => {
    switch(props.category) {
      case 'rpg': return props.theme.colors.glow.primary;
      case 'fps': return props.theme.colors.glow.secondary;
      case 'strategy': return props.theme.colors.glow.accent;
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  z-index: 1;
  
  &:hover {
    transform: scale(1.2);
    z-index: 2;
  }
`;

// Ligne de connexion entre les nœuds
const ConnectionLine = styled.div`
  position: absolute;
  height: 2px;
  background: linear-gradient(to right, 
    ${props => {
      switch(props.category) {
        case 'rpg': return props.theme.colors.primary;
        case 'fps': return props.theme.colors.secondary;
        case 'strategy': return props.theme.colors.accent;
        default: return props.theme.colors.text.primary;
      }
    }}, 
    transparent
  );
  transform-origin: left center;
  z-index: 0;
  opacity: 0.6;
`;

// Composant de visualisation de la collection
const CollectionVisualization = () => {
  // État pour suivre le mode de visualisation actif
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' ou 'map'
  
  // Données de jeux fictives pour la démo
  const games = [
    { id: 1, title: 'The Last Guardian', platform: 'PlayStation 4', rating: 'masterpiece', category: 'adventure' },
    { id: 2, title: 'Hollow Knight', platform: 'Nintendo Switch', rating: 'bon', category: 'metroidvania' },
    { id: 3, title: 'Cyberpunk 2077', platform: 'PC', rating: 'moyen', category: 'rpg' },
    { id: 4, title: 'Anthem', platform: 'Xbox One', rating: 'decu', category: 'action' },
    { id: 5, title: 'Elden Ring', platform: 'PlayStation 5', rating: 'masterpiece', category: 'rpg' },
    { id: 6, title: 'Call of Duty: Modern Warfare', platform: 'PC', rating: 'bon', category: 'fps' },
    { id: 7, title: 'Civilization VI', platform: 'PC', rating: 'masterpiece', category: 'strategy' },
    { id: 8, title: 'Animal Crossing: New Horizons', platform: 'Nintendo Switch', rating: 'bon', category: 'simulation' }
  ];
  
  // Fonction pour obtenir l'icône de notation
  const getRatingIcon = (rating) => {
    switch(rating) {
      case 'masterpiece': return '🎮';
      case 'bon': return '👾';
      case 'moyen': return '🕹️';
      case 'decu': return '💣';
      default: return '';
    }
  };
  
  // Fonction pour obtenir la couleur de catégorie
  const getCategoryColor = (category) => {
    switch(category) {
      case 'rpg': return 'primary';
      case 'fps': return 'secondary';
      case 'strategy': return 'accent';
      default: return 'primary';
    }
  };
  
  // Rendu des nœuds de jeu sur la carte
  const renderGameNodes = () => {
    return games.map((game, index) => {
      // Positionnement aléatoire pour la démo
      const left = 10 + (index % 4) * 25;
      const top = 10 + Math.floor(index / 4) * 25;
      
      return (
        <GameNode 
          key={game.id} 
          style={{ left: `${left}%`, top: `${top}%` }}
          category={game.category}
          title={game.title}
        >
          {getRatingIcon(game.rating)}
        </GameNode>
      );
    });
  };
  
  // Rendu des lignes de connexion entre les nœuds
  const renderConnectionLines = () => {
    const lines = [];
    
    // Création de quelques connexions pour la démo
    for (let i = 0; i < games.length - 1; i++) {
      if (i % 2 === 0) {
        const startLeft = 10 + (i % 4) * 25;
        const startTop = 10 + Math.floor(i / 4) * 25;
        const endLeft = 10 + ((i + 1) % 4) * 25;
        const endTop = 10 + Math.floor((i + 1) / 4) * 25;
        
        // Calcul de la longueur et de l'angle de la ligne
        const length = Math.sqrt(Math.pow(endLeft - startLeft, 2) + Math.pow(endTop - startTop, 2));
        const angle = Math.atan2(endTop - startTop, endLeft - startLeft) * 180 / Math.PI;
        
        lines.push(
          <ConnectionLine 
            key={`line-${i}`}
            style={{ 
              left: `${startLeft}%`, 
              top: `${startTop}%`,
              width: `${length}%`,
              transform: `rotate(${angle}deg)`
            }}
            category={games[i].category}
          />
        );
      }
    }
    
    return lines;
  };
  
  return (
    <GalleryContainer>
      <FilterBar>
        <FilterGroup>
          <FilterLabel>Plateforme:</FilterLabel>
          <StyledSelect>
            <option value="all">Toutes</option>
            <option value="ps4">PlayStation 4</option>
            <option value="ps5">PlayStation 5</option>
            <option value="switch">Nintendo Switch</option>
            <option value="xbox">Xbox One</option>
            <option value="pc">PC</option>
          </StyledSelect>
          
          <FilterLabel>Genre:</FilterLabel>
          <StyledSelect>
            <option value="all">Tous</option>
            <option value="rpg">RPG</option>
            <option value="fps">FPS</option>
            <option value="strategy">Stratégie</option>
            <option value="adventure">Aventure</option>
            <option value="simulation">Simulation</option>
          </StyledSelect>
          
          <FilterLabel>Notation:</FilterLabel>
          <StyledSelect>
            <option value="all">Toutes</option>
            <option value="masterpiece">🎮 Masterpiece</option>
            <option value="bon">👾 Bon</option>
            <option value="moyen">🕹️ Moyen</option>
            <option value="decu">💣 Déçu</option>
          </StyledSelect>
        </FilterGroup>
        
        <FilterGroup>
          <ViewToggleButton 
            active={viewMode === 'gallery'} 
            onClick={() => setViewMode('gallery')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z"/>
            </svg>
            Galerie
          </ViewToggleButton>
          
          <ViewToggleButton 
            active={viewMode === 'map'} 
            onClick={() => setViewMode('map')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Carte
          </ViewToggleButton>
        </FilterGroup>
      </FilterBar>
      
      {viewMode === 'gallery' ? (
        <GamesGrid>
          {games.map(game => (
            <GameCard key={game.id}>
              <RatingBadge rating={game.rating}>{getRatingIcon(game.rating)}</RatingBadge>
              <GameCover src={`https://via.placeholder.com/250x350/121212/${getCategoryColor(game.category) === 'primary' ? '00FFFF' : getCategoryColor(game.category) === 'secondary' ? 'FF00FF' : '39FF14'}?text=${game.title.replace(/ /g, '+')}`} />
              <GameInfo>
                <GameTitle>{game.title}</GameTitle>
                <GamePlatform>{game.platform}</GamePlatform>
              </GameInfo>
            </GameCard>
          ))}
        </GamesGrid>
      ) : (
        <MapContainer>
          {renderConnectionLines()}
          {renderGameNodes()}
        </MapContainer>
      )}
    </GalleryContainer>
  );
};

// Composants importés du fichier App.js
const GameCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${props => props.theme.transitions.normal};
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.neonPrimary};
  }
`;

const GameCover = styled.div`
  height: 350px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, ${props => props.theme.colors.surface}, transparent);
  }
`;

const GameInfo = styled.div`
  padding: ${props => props.theme.spacing.md};
`;

const GameTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.primary};
`;

const GamePlatform = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.secondary};
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const RatingBadge = styled.span`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  background-color: rgba(0, 0, 0, 0.7);
  color: ${props => {
    switch(props.rating) {
      case 'masterpiece': return props.theme.colors.primary;
      case 'bon': return props.theme.colors.accent;
      case 'moyen': return props.theme.colors.secondary;
      case 'decu': return props.theme.colors.error;
      default: return props.theme.colors.text.primary;
    }
  }};
  font-size: ${props => props.theme.typography.fontSizes.xl};
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

export default CollectionVisualization;

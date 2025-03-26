import React, { useState } from 'react';
import styled from 'styled-components';

// Conteneur principal pour la liste de souhaits
const WishlistContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

// En-tête de la liste de souhaits avec compteur
const WishlistHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.medium};
`;

// Compteur de jeux dans la liste de souhaits
const WishlistCounter = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  span {
    font-size: ${props => props.theme.typography.fontSizes.lg};
    font-weight: ${props => props.theme.typography.fontWeights.bold};
    color: ${props => props.theme.colors.primary};
    text-shadow: ${props => props.theme.shadows.neonPrimary};
  }
  
  small {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

// Bouton de partage de la liste de souhaits
const ShareButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.secondary};
  border: 2px solid ${props => props.theme.colors.secondary};
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
    background-color: rgba(255, 0, 255, 0.1);
    box-shadow: ${props => props.theme.shadows.neonSecondary};
    text-shadow: ${props => props.theme.shadows.neonSecondary};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// Tableau de la liste de souhaits
const WishlistTable = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.medium};
`;

// En-tête du tableau
const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 3fr 1fr 1fr 100px;
  padding: ${props => props.theme.spacing.md};
  background-color: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  span {
    font-size: ${props => props.theme.typography.fontSizes.sm};
    font-weight: ${props => props.theme.typography.fontWeights.bold};
    color: ${props => props.theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

// Ligne du tableau
const TableRow = styled.div`
  display: grid;
  grid-template-columns: 80px 3fr 1fr 1fr 100px;
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  align-items: center;
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

// Image miniature du jeu
const GameThumbnail = styled.div`
  width: 60px;
  height: 80px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: ${props => props.theme.borderRadius.sm};
  box-shadow: ${props => props.theme.shadows.small};
`;

// Informations du jeu
const GameDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

// Titre du jeu dans la liste de souhaits
const WishlistGameTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

// Détails du jeu dans la liste de souhaits
const WishlistGameInfo = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

// Badge de plateforme
const PlatformBadge = styled.span`
  background-color: rgba(255, 0, 255, 0.1);
  color: ${props => props.theme.colors.secondary};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

// Date d'ajout à la liste de souhaits
const AddedDate = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

// Indicateur de priorité
const PriorityIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

// Barre de priorité
const PriorityBar = styled.div`
  display: flex;
  gap: 2px;
`;

// Segment de la barre de priorité
const PrioritySegment = styled.div`
  width: 8px;
  height: 20px;
  background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 2px;
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover {
    background-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.active ? props.theme.shadows.neonPrimary : 'none'};
  }
`;

// Actions sur l'élément de la liste de souhaits
const WishlistItemActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

// Bouton d'action
const ActionButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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

// Bouton d'ajout de jeu à la liste de souhaits
const AddGameButton = styled.button`
  background-color: ${props => props.theme.colors.accent};
  color: #000;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  align-self: flex-end;
  margin-top: ${props => props.theme.spacing.md};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.neonAccent};
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// Composant de liste de souhaits
const Wishlist = () => {
  // Données fictives pour la démo
  const [wishlistItems, setWishlistItems] = useState([
    { 
      id: 1, 
      title: 'The Legend of Zelda: Breath of the Wild 2', 
      platform: 'Nintendo Switch', 
      publisher: 'Nintendo', 
      releaseYear: 2023, 
      priority: 5, 
      addedDate: '15/03/2025' 
    },
    { 
      id: 2, 
      title: 'Starfield', 
      platform: 'PC', 
      publisher: 'Bethesda', 
      releaseYear: 2023, 
      priority: 4, 
      addedDate: '10/03/2025' 
    },
    { 
      id: 3, 
      title: 'God of War: Ragnarok', 
      platform: 'PlayStation 5', 
      publisher: 'Sony', 
      releaseYear: 2022, 
      priority: 3, 
      addedDate: '05/03/2025' 
    },
    { 
      id: 4, 
      title: 'Metroid Prime 4', 
      platform: 'Nintendo Switch', 
      publisher: 'Nintendo', 
      releaseYear: 2023, 
      priority: 5, 
      addedDate: '01/03/2025' 
    },
    { 
      id: 5, 
      title: 'Fable', 
      platform: 'Xbox Series X', 
      publisher: 'Microsoft', 
      releaseYear: 2023, 
      priority: 2, 
      addedDate: '25/02/2025' 
    }
  ]);
  
  // Rendu des segments de priorité
  const renderPrioritySegments = (priority) => {
    const segments = [];
    for (let i = 1; i <= 5; i++) {
      segments.push(
        <PrioritySegment 
          key={i} 
          active={i <= priority} 
          onClick={() => handlePriorityChange(i)}
        />
      );
    }
    return segments;
  };
  
  // Gestion du changement de priorité (fictif pour la démo)
  const handlePriorityChange = (newPriority) => {
    console.log(`Priorité changée à ${newPriority}`);
  };
  
  return (
    <WishlistContainer>
      <WishlistHeader>
        <WishlistCounter>
          <span>{wishlistItems.length}</span>
          <small>/ 30 jeux dans votre liste de souhaits</small>
        </WishlistCounter>
        
        <ShareButton>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>
          Partager ma liste
        </ShareButton>
      </WishlistHeader>
      
      <WishlistTable>
        <TableHeader>
          <span></span>
          <span>Jeu</span>
          <span>Ajouté le</span>
          <span>Priorité</span>
          <span>Actions</span>
        </TableHeader>
        
        {wishlistItems.map(item => (
          <TableRow key={item.id}>
            <GameThumbnail src={`https://via.placeholder.com/60x80/121212/FF00FF?text=${item.title.substring(0, 3)}`} />
            
            <GameDetails>
              <WishlistGameTitle>{item.title}</WishlistGameTitle>
              <WishlistGameInfo>
                <PlatformBadge>{item.platform}</PlatformBadge>
                <span>{item.publisher} • {item.releaseYear}</span>
              </WishlistGameInfo>
            </GameDetails>
            
            <AddedDate>{item.addedDate}</AddedDate>
            
            <PriorityIndicator>
              <PriorityBar>
                {renderPrioritySegments(item.priority)}
              </PriorityBar>
            </PriorityIndicator>
            
            <WishlistItemActions>
              <ActionButton title="Éditer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </ActionButton>
              
              <ActionButton title="Supprimer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </ActionButton>
              
              <ActionButton title="Acheter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </ActionButton>
            </WishlistItemActions>
          </TableRow>
        ))}
      </WishlistTable>
      
      <AddGameButton>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        Ajouter un jeu
      </AddGameButton>
    </WishlistContainer>
  );
};

export default Wishlist;

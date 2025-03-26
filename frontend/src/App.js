import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import theme from './theme';

// Styles globaux pour l'application
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Rajdhani:wght@300;400;500;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: ${props => props.theme.typography.fontFamily};
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: all ${props => props.theme.transitions.normal};
    
    &:hover {
      text-shadow: ${props => props.theme.shadows.neonPrimary};
    }
  }
  
  button {
    font-family: ${props => props.theme.typography.fontFamily};
    cursor: pointer;
  }
`;

// Conteneur principal de l'application
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

// En-tête de l'application avec effet néon
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 0 15px ${props => props.theme.colors.glow.primary};
  z-index: ${props => props.theme.zIndex.header};
`;

// Logo avec effet de lueur
const Logo = styled.div`
  font-family: 'Orbitron', sans-serif;
  font-size: ${props => props.theme.typography.fontSizes.xxl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  text-shadow: ${props => props.theme.shadows.neonPrimary};
  letter-spacing: 2px;
`;

// Barre de navigation
const Nav = styled.nav`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
`;

// Lien de navigation avec effet néon au survol
const NavLink = styled.a`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover, &.active {
    background-color: rgba(0, 255, 255, 0.1);
    color: ${props => props.theme.colors.primary};
    text-shadow: ${props => props.theme.shadows.neonPrimary};
    box-shadow: 0 0 10px ${props => props.theme.colors.glow.primary};
  }
`;

// Contenu principal
const Main = styled.main`
  flex: 1;
  padding: ${props => props.theme.spacing.xl};
`;

// Bouton avec effet néon
const NeonButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors[props.color || 'primary']};
  border: 2px solid ${props => props.theme.colors[props.color || 'primary']};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover {
    background-color: rgba(${props => props.color === 'secondary' ? '255, 0, 255' : props.color === 'accent' ? '57, 255, 20' : '0, 255, 255'}, 0.1);
    box-shadow: ${props => props.theme.shadows[`neon${props.color === 'secondary' ? 'Secondary' : props.color === 'accent' ? 'Accent' : 'Primary'}`]};
    text-shadow: ${props => props.theme.shadows[`neon${props.color === 'secondary' ? 'Secondary' : props.color === 'accent' ? 'Accent' : 'Primary'}`]};
  }
`;

// Carte de jeu avec effet néon
const GameCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${props => props.theme.transitions.normal};
  position: relative;
  width: 250px;
  margin: ${props => props.theme.spacing.md};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.neonPrimary};
  }
`;

// Image de couverture du jeu
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

// Informations du jeu
const GameInfo = styled.div`
  padding: ${props => props.theme.spacing.md};
`;

// Titre du jeu
const GameTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.primary};
`;

// Plateforme du jeu
const GamePlatform = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.secondary};
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

// Badge pour la notation personnalisée
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

// Exemple d'application
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Logo>LUDOTEK</Logo>
          <Nav>
            <NavLink href="#" className="active">Collection</NavLink>
            <NavLink href="#">Souhaits</NavLink>
            <NavLink href="#">Prêts</NavLink>
            <NavLink href="#">Statistiques</NavLink>
            <NavLink href="#">Profil</NavLink>
          </Nav>
        </Header>
        <Main>
          <h1>Prototype d'interface pour l'application de ludothèque</h1>
          <p>Cette maquette illustre le thème sombre néon avec effets de lueur paramétrables.</p>
          
          <div style={{ display: 'flex', marginTop: '2rem', gap: '1rem' }}>
            <NeonButton>Scanner un jeu</NeonButton>
            <NeonButton color="secondary">Ajouter manuellement</NeonButton>
            <NeonButton color="accent">Partager ma collection</NeonButton>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '2rem' }}>
            <GameCard>
              <RatingBadge rating="masterpiece">🎮</RatingBadge>
              <GameCover src="https://via.placeholder.com/250x350/121212/00FFFF?text=Jeu+1" />
              <GameInfo>
                <GameTitle>The Last Guardian</GameTitle>
                <GamePlatform>PlayStation 4</GamePlatform>
              </GameInfo>
            </GameCard>
            
            <GameCard>
              <RatingBadge rating="bon">👾</RatingBadge>
              <GameCover src="https://via.placeholder.com/250x350/121212/FF00FF?text=Jeu+2" />
              <GameInfo>
                <GameTitle>Hollow Knight</GameTitle>
                <GamePlatform>Nintendo Switch</GamePlatform>
              </GameInfo>
            </GameCard>
            
            <GameCard>
              <RatingBadge rating="moyen">🕹️</RatingBadge>
              <GameCover src="https://via.placeholder.com/250x350/121212/39FF14?text=Jeu+3" />
              <GameInfo>
                <GameTitle>Cyberpunk 2077</GameTitle>
                <GamePlatform>PC</GamePlatform>
              </GameInfo>
            </GameCard>
            
            <GameCard>
              <RatingBadge rating="decu">💣</RatingBadge>
              <GameCover src="https://via.placeholder.com/250x350/121212/FF3131?text=Jeu+4" />
              <GameInfo>
                <GameTitle>Anthem</GameTitle>
                <GamePlatform>Xbox One</GamePlatform>
              </GameInfo>
            </GameCard>
          </div>
        </Main>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;

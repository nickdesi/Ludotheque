import React, { useState } from 'react';
import styled from 'styled-components';

// Conteneur principal pour la gestion des prêts
const LoansContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

// En-tête avec statistiques des prêts
const LoansHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.medium};
`;

// Statistiques des prêts
const LoanStats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xl};
`;

// Carte de statistique
const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

// Valeur de statistique
const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xxl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => {
    switch(props.type) {
      case 'active': return props.theme.colors.primary;
      case 'overdue': return props.theme.colors.error;
      case 'returned': return props.theme.colors.accent;
      default: return props.theme.colors.text.primary;
    }
  }};
  text-shadow: ${props => {
    switch(props.type) {
      case 'active': return props.theme.shadows.neonPrimary;
      case 'overdue': return '0 0 10px rgba(255, 49, 49, 0.7), 0 0 20px rgba(255, 49, 49, 0.5)';
      case 'returned': return props.theme.shadows.neonAccent;
      default: return 'none';
    }
  }};
`;

// Libellé de statistique
const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// Bouton de scan pour les retours
const ScanButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.accent};
  border: 2px solid ${props => props.theme.colors.accent};
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
    background-color: rgba(57, 255, 20, 0.1);
    box-shadow: ${props => props.theme.shadows.neonAccent};
    text-shadow: ${props => props.theme.shadows.neonAccent};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// Onglets pour filtrer les prêts
const LoansTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.sm};
  box-shadow: ${props => props.theme.shadows.medium};
`;

// Onglet individuel
const Tab = styled.button`
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
`;

// Carte de prêt
const LoanCard = styled.div`
  display: flex;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.medium};
  transition: all ${props => props.theme.transitions.normal};
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => {
      switch(props.status) {
        case 'active': return props.theme.shadows.neonPrimary;
        case 'overdue': return '0 0 10px rgba(255, 49, 49, 0.7), 0 0 20px rgba(255, 49, 49, 0.5)';
        case 'returned': return props.theme.shadows.neonAccent;
        default: return props.theme.shadows.medium;
      }
    }};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background-color: ${props => {
      switch(props.status) {
        case 'active': return props.theme.colors.primary;
        case 'overdue': return props.theme.colors.error;
        case 'returned': return props.theme.colors.accent;
        default: return props.theme.colors.border;
      }
    }};
  }
`;

// Image du jeu prêté
const LoanGameImage = styled.div`
  width: 120px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`;

// Contenu de la carte de prêt
const LoanContent = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

// En-tête de la carte de prêt
const LoanCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

// Titre du jeu prêté
const LoanGameTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

// Badge de statut du prêt
const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 1px;
  background-color: ${props => {
    switch(props.status) {
      case 'active': return 'rgba(0, 255, 255, 0.1)';
      case 'overdue': return 'rgba(255, 49, 49, 0.1)';
      case 'returned': return 'rgba(57, 255, 20, 0.1)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'active': return props.theme.colors.primary;
      case 'overdue': return props.theme.colors.error;
      case 'returned': return props.theme.colors.accent;
      default: return props.theme.colors.text.primary;
    }
  }};
`;

// Détails de l'emprunteur
const BorrowerDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.sm};
`;

// Avatar de l'emprunteur
const BorrowerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  border: 2px solid ${props => props.theme.colors.primary};
  box-shadow: 0 0 5px ${props => props.theme.colors.glow.primary};
`;

// Informations de l'emprunteur
const BorrowerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

// Nom de l'emprunteur
const BorrowerName = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
`;

// Contact de l'emprunteur
const BorrowerContact = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

// Pied de la carte de prêt
const LoanCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.md};
`;

// Dates du prêt
const LoanDates = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
`;

// Groupe de date
const DateGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

// Libellé de date
const DateLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// Valeur de date
const DateValue = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.highlight ? props.theme.colors.error : props.theme.colors.text.primary};
  ${props => props.highlight && `text-shadow: 0 0 5px rgba(255, 49, 49, 0.7);`}
`;

// Actions sur le prêt
const LoanActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

// Bouton d'action sur le prêt
const LoanActionButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid ${props => props.theme.colors.border};
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
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 5px ${props => props.theme.colors.glow.primary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Bouton pour créer un nouveau prêt
const NewLoanButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
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
    box-shadow: ${props => props.theme.shadows.neonPrimary};
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// Composant de gestion des prêts
const LoanManagement = () => {
  // État pour suivre l'onglet actif
  const [activeTab, setActiveTab] = useState('all');
  
  // Données fictives pour la démo
  const loans = [
    {
      id: 1,
      game: {
        title: 'Elden Ring',
        platform: 'PlayStation 5',
        image: 'https://via.placeholder.com/120x160/121212/00FFFF?text=Elden+Ring'
      },
      borrower: {
        name: 'Thomas Dubois',
        contact: 'thomas.d@email.com',
        initials: 'TD'
      },
      loanDate: '10/03/2025',
      expectedReturnDate: '10/04/2025',
      status: 'active',
      notes: 'Prêté avec tous les DLC'
    },
    {
      id: 2,
      game: {
        title: 'The Last of Us Part II',
        platform: 'PlayStation 4',
        image: 'https://via.placeholder.com/120x160/121212/FF00FF?text=TLOU+II'
      },
      borrower: {
        name: 'Marie Laurent',
        contact: '06 12 34 56 78',
        initials: 'ML'
      },
      loanDate: '15/02/2025',
      expectedReturnDate: '15/03/2025',
      status: 'overdue',
      notes: 'A promis de le rendre bientôt'
    },
    {
      id: 3,
      game: {
        title: 'Super Mario Odyssey',
        platform: 'Nintendo Switch',
        image: 'https://via.placeholder.com/120x160/121212/39FF14?text=Mario'
      },
      borrower: {
        name: 'Lucas Martin',
        contact: 'lucas@email.com',
        initials: 'LM'
      },
      loanDate: '05/03/2025',
      expectedReturnDate: '05/04/2025',
      actualReturnDate: '20/03/2025',
      status: 'returned',
      notes: 'Rendu en parfait état'
    }
  ];
  
  // Filtrer les prêts en fonction de l'onglet actif
  const filteredLoans = activeTab === 'all' 
    ? loans 
    : loans.filter(loan => loan.status === activeTab);
  
  // Statistiques des prêts
  const loanStats = {
    active: loans.filter(loan => loan.status === 'active').length,
    overdue: loans.filter(loan => loan.status === 'overdue').length,
    returned: loans.filter(loan => loan.status === 'returned').length
  };
  
  return (
    <LoansContainer>
      <LoansHeader>
        <LoanStats>
          <StatCard>
            <StatValue type="active">{loanStats.active}</StatValue>
            <StatLabel>Prêts actifs</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue type="overdue">{loanStats.overdue}</StatValue>
            <StatLabel>En retard</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue type="returned">{loanStats.returned}</StatValue>
            <StatLabel>Retournés</StatLabel>
          </StatCard>
        </LoanStats>
        
        <ScanButton>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z"/>
          </svg>
          Scanner un retour
        </ScanButton>
      </LoansHeader>
      
      <LoansTabs>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          Tous
        </Tab>
        <Tab 
          active={activeTab === 'active'} 
          onClick={() => setActiveTab('active')}
        >
          Actifs
        </Tab>
        <Tab 
          active={activeTab === 'overdue'} 
          onClick={() => setActiveTab('overdue')}
        >
          En retard
        </Tab>
        <Tab 
          active={activeTab === 'returned'} 
          onClick={() => setActiveTab('returned')}
        >
          Retournés
        </Tab>
      </LoansTabs>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredLoans.map(loan => (
          <LoanCard key={loan.id} status={loan.status}>
            <LoanGameImage src={loan.game.image} />
            
            <LoanContent>
              <LoanCardHeader>
                <div>
                  <LoanGameTitle>{loan.game.title}</LoanGameTitle>
                  <span style={{ fontSize: '0.875rem', color: '#B0B0B0' }}>{loan.game.platform}</span>
                </div>
                
                <StatusBadge status={loan.status}>
                  {loan.status === 'active' ? 'En cours' : 
                   loan.status === 'overdue' ? 'En retard' : 'Retourné'}
                </StatusBadge>
              </LoanCardHeader>
              
              <BorrowerDetails>
                <BorrowerAvatar>{loan.borrower.initials}</BorrowerAvatar>
                <BorrowerInfo>
                  <Bo<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>
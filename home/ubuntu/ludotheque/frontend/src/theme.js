// Configuration de base pour le thème sombre néon
const theme = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#00FFFF', // Cyan néon
    secondary: '#FF00FF', // Magenta néon
    accent: '#39FF14', // Vert néon
    error: '#FF3131', // Rouge néon
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#757575'
    },
    border: '#333333',
    glow: {
      primary: 'rgba(0, 255, 255, 0.7)',
      secondary: 'rgba(255, 0, 255, 0.7)',
      accent: 'rgba(57, 255, 20, 0.7)'
    }
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.5)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.5)',
    large: '0 8px 16px rgba(0, 0, 0, 0.5)',
    neonPrimary: '0 0 10px rgba(0, 255, 255, 0.7), 0 0 20px rgba(0, 255, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3)',
    neonSecondary: '0 0 10px rgba(255, 0, 255, 0.7), 0 0 20px rgba(255, 0, 255, 0.5), 0 0 30px rgba(255, 0, 255, 0.3)',
    neonAccent: '0 0 10px rgba(57, 255, 20, 0.7), 0 0 20px rgba(57, 255, 20, 0.5), 0 0 30px rgba(57, 255, 20, 0.3)'
  },
  typography: {
    fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
      xxxl: '3rem'
    },
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '9999px'
  },
  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease'
  },
  zIndex: {
    modal: 1000,
    overlay: 900,
    dropdown: 800,
    header: 700,
    footer: 600
  }
};

export default theme;

// Configuration pour adapter l'application en site web statique
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import App from './App';
import store from './store';
import { theme } from './theme';
import './index.css';

// Configuration pour le mode site web
const isWebsiteMode = true;

// Adapter les fonctionnalités en fonction du mode
if (isWebsiteMode) {
  // Désactiver les fonctionnalités qui nécessitent des capacités natives
  window.WEBSITE_CONFIG = {
    disableNativeScanner: true,     // Désactiver le scanner natif
    useWebScanner: true,            // Utiliser le scanner web si disponible
    disableLocalBackup: true,       // Désactiver les sauvegardes locales
    useCloudBackup: true,           // Utiliser les sauvegardes cloud
    demoMode: false                 // Activer/désactiver le mode démo
  };
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

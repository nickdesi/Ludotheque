// Service d'intégration avec l'API IGDB
const axios = require('axios');
const qs = require('querystring');

// Configuration de l'API IGDB
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || 'votre_client_id';
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || 'votre_client_secret';
const IGDB_API_URL = 'https://api.igdb.com/v4';

// Classe pour gérer les appels à l'API IGDB
class IGDBService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Obtenir un token d'accès via l'API Twitch
  async getAccessToken() {
    // Si le token est valide, le retourner directement
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `https://id.twitch.tv/oauth2/token`,
        qs.stringify({
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Définir l'expiration du token (généralement 60 jours, mais on prend une marge)
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 3600000; // -1h de marge
      
      return this.accessToken;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token d\'accès:', error);
      throw new Error('Impossible d\'obtenir un token d\'accès pour l\'API IGDB');
    }
  }

  // Effectuer une requête à l'API IGDB
  async makeRequest(endpoint, query) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios({
        url: `${IGDB_API_URL}/${endpoint}`,
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`
        },
        data: query
      });
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la requête à l'API IGDB (${endpoint}):`, error);
      throw new Error(`Erreur lors de la requête à l'API IGDB: ${error.message}`);
    }
  }

  // Rechercher un jeu par son titre
  async searchGameByTitle(title, limit = 10) {
    const query = `
      search "${title}";
      fields name, platforms.name, cover.url, first_release_date, genres.name, involved_companies.company.name, age_ratings.*, summary;
      limit ${limit};
    `;
    
    return this.makeRequest('games', query);
  }

  // Rechercher un jeu par son code-barres (UPC/EAN)
  async searchGameByBarcode(barcode) {
    // IGDB n'a pas de recherche directe par code-barres
    // On peut essayer de trouver le jeu via une API de recherche de produits par code-barres
    // puis utiliser le titre obtenu pour chercher dans IGDB
    
    try {
      // Simuler une recherche par code-barres (à remplacer par une vraie API)
      const gameTitle = await this.findGameTitleByBarcode(barcode);
      
      if (gameTitle) {
        return this.searchGameByTitle(gameTitle, 5);
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la recherche par code-barres:', error);
      throw new Error(`Impossible de trouver un jeu avec le code-barres ${barcode}`);
    }
  }

  // Méthode fictive pour simuler la recherche d'un titre de jeu par code-barres
  // À remplacer par une intégration réelle avec une API de recherche par code-barres
  async findGameTitleByBarcode(barcode) {
    // Simulation - dans une implémentation réelle, on appellerait une API comme UPC Database
    const mockBarcodeDatabase = {
      '045496590420': 'The Legend of Zelda: Breath of the Wild',
      '711719511793': 'Horizon Forbidden West',
      '662248922973': 'Elden Ring',
      // Ajouter d'autres mappings de codes-barres fictifs
    };
    
    return mockBarcodeDatabase[barcode] || null;
  }

  // Obtenir les détails complets d'un jeu par son ID
  async getGameDetails(gameId) {
    const query = `
      fields name, platforms.name, cover.url, first_release_date, genres.name, 
      involved_companies.company.name, age_ratings.*, summary, screenshots.url, 
      similar_games.name, similar_games.cover.url, rating, aggregated_rating;
      where id = ${gameId};
    `;
    
    const games = await this.makeRequest('games', query);
    return games.length > 0 ? games[0] : null;
  }

  // Obtenir la classification d'âge d'un jeu (PEGI/ESRB)
  async getGameAgeRating(gameId) {
    const game = await this.getGameDetails(gameId);
    
    if (!game || !game.age_ratings || game.age_ratings.length === 0) {
      return null;
    }
    
    const ageRatings = {
      pegi: null,
      esrb: null
    };
    
    // Catégories: 1 = ESRB, 2 = PEGI
    // Valeurs ESRB: 6 = RP, 7 = EC, 8 = E, 9 = E10+, 10 = T, 11 = M, 12 = AO
    // Valeurs PEGI: 1 = 3, 2 = 7, 3 = 12, 4 = 16, 5 = 18
    
    for (const rating of game.age_ratings) {
      if (rating.category === 1) { // ESRB
        const esrbRatings = {
          6: 'RP', 7: 'EC', 8: 'E', 9: 'E10+', 10: 'T', 11: 'M', 12: 'AO'
        };
        ageRatings.esrb = esrbRatings[rating.rating] || null;
      } else if (rating.category === 2) { // PEGI
        const pegiRatings = {
          1: '3', 2: '7', 3: '12', 4: '16', 5: '18'
        };
        ageRatings.pegi = pegiRatings[rating.rating] || null;
      }
    }
    
    return ageRatings;
  }

  // Formater les données d'un jeu pour notre application
  formatGameData(igdbGame) {
    if (!igdbGame) return null;
    
    // Extraire l'éditeur et le développeur
    let publisher = '';
    let developer = '';
    
    if (igdbGame.involved_companies) {
      for (const company of igdbGame.involved_companies) {
        if (company.publisher) {
          publisher = company.company.name;
        }
        if (company.developer) {
          developer = company.company.name;
        }
      }
    }
    
    // Formater l'URL de la jaquette
    let coverUrl = '';
    if (igdbGame.cover && igdbGame.cover.url) {
      // Convertir l'URL thumbnail en URL haute résolution
      coverUrl = igdbGame.cover.url.replace('t_thumb', 't_cover_big');
      // Ajouter le préfixe https: si nécessaire
      if (coverUrl.startsWith('//')) {
        coverUrl = 'https:' + coverUrl;
      }
    }
    
    // Extraire les plateformes
    const platforms = igdbGame.platforms 
      ? igdbGame.platforms.map(p => p.name).join(', ') 
      : '';
    
    // Extraire les genres
    const genres = igdbGame.genres 
      ? igdbGame.genres.map(g => g.name) 
      : [];
    
    // Formater la date de sortie
    const releaseDate = igdbGame.first_release_date 
      ? new Date(igdbGame.first_release_date * 1000).getFullYear() 
      : null;
    
    // Extraire la classification d'âge
    let ageRating = { system: '', value: '' };
    if (igdbGame.age_ratings && igdbGame.age_ratings.length > 0) {
      // Priorité à PEGI pour le marché européen
      const pegi = igdbGame.age_ratings.find(r => r.category === 2);
      const esrb = igdbGame.age_ratings.find(r => r.category === 1);
      
      if (pegi) {
        const pegiValues = { 1: '3', 2: '7', 3: '12', 4: '16', 5: '18' };
        ageRating = { system: 'PEGI', value: pegiValues[pegi.rating] || '' };
      } else if (esrb) {
        const esrbValues = { 6: 'RP', 7: 'EC', 8: 'E', 9: 'E10+', 10: 'T', 11: 'M', 12: 'AO' };
        ageRating = { system: 'ESRB', value: esrbValues[esrb.rating] || '' };
      }
    }
    
    // Retourner les données formatées
    return {
      title: igdbGame.name,
      platform: platforms,
      publisher,
      developer,
      releaseYear: releaseDate,
      coverImage: coverUrl,
      ageRating,
      genre: genres,
      description: igdbGame.summary || '',
      igdbId: igdbGame.id
    };
  }
}

module.exports = new IGDBService();

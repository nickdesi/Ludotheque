# Schéma de base de données pour l'application de ludothèque

## Vue d'ensemble
Le schéma de base de données est conçu pour prendre en charge les 8 modules fonctionnels demandés, avec une architecture NoSQL (MongoDB) permettant une grande flexibilité dans la structure des données.

## Collections principales

### 1. Users
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  profilePicture: String (URL),
  twoFactorEnabled: Boolean,
  createdAt: Date,
  updatedAt: Date,
  preferences: {
    theme: String,
    glowEffects: Boolean,
    glowIntensity: Number,
    glowColor: String,
    defaultView: String // 'gallery' ou 'map'
  }
}
```

### 2. Games
```javascript
{
  _id: ObjectId,
  barcode: String,
  title: String,
  platform: String,
  publisher: String,
  developer: String,
  releaseYear: Number,
  coverImage: String (URL),
  ageRating: {
    system: String, // 'PEGI' ou 'ESRB'
    value: String
  },
  genre: [String],
  description: String,
  userRating: {
    type: String, // 'masterpiece', 'bon', 'moyen', 'decu'
    visualIcon: String // '🎮', '👾', '🕹️', '💣'
  },
  customTags: [{
    category: String, // 'difficulté', 'durée', 'ambiance'
    value: String
  }],
  completed: Boolean,
  completionDate: Date,
  playTime: Number, // en heures
  qrCodeId: String,
  owner: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date,
  enrichedData: {
    officialGuideLinks: [String],
    speedrunLinks: [String],
    modLinks: [String]
  }
}
```

### 3. Collections
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId (ref: Users),
  games: [ObjectId (ref: Games)],
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date,
  sharingSettings: {
    visibleToFriends: Boolean,
    friendsCanModify: Boolean,
    communityCanShare: Boolean
  }
}
```

### 4. Wishlist
```javascript
{
  _id: ObjectId,
  owner: ObjectId (ref: Users),
  games: [{
    game: {
      title: String,
      platform: String,
      publisher: String,
      releaseYear: Number,
      coverImage: String (URL)
    },
    priority: Number, // 1-5, 1 étant la plus haute priorité
    addedAt: Date,
    notes: String
  }],
  shareableLink: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Loans
```javascript
{
  _id: ObjectId,
  game: ObjectId (ref: Games),
  borrower: {
    name: String,
    contact: String // email ou téléphone
  },
  loanDate: Date,
  expectedReturnDate: Date,
  actualReturnDate: Date,
  status: String, // 'active', 'returned', 'overdue'
  notes: String,
  owner: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Backups
```javascript
{
  _id: ObjectId,
  owner: ObjectId (ref: Users),
  filename: String,
  size: Number, // en bytes
  createdAt: Date,
  encryptionMethod: String, // 'AES-256'
  compressionRatio: Number,
  checksum: String
}
```

### 7. Friends
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: Users),
  friend: ObjectId (ref: Users),
  status: String, // 'pending', 'accepted', 'blocked'
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Notifications
```javascript
{
  _id: ObjectId,
  recipient: ObjectId (ref: Users),
  type: String, // 'loan_reminder', 'wishlist_remaster', 'friend_request', etc.
  content: String,
  read: Boolean,
  relatedItem: {
    type: String, // 'game', 'loan', 'wishlist', etc.
    id: ObjectId
  },
  createdAt: Date
}
```

## Relations entre les entités

1. **User → Games**: Un utilisateur possède plusieurs jeux (relation one-to-many)
2. **User → Collections**: Un utilisateur peut créer plusieurs collections (relation one-to-many)
3. **User → Wishlist**: Un utilisateur possède une liste de souhaits (relation one-to-one)
4. **Games → Collections**: Un jeu peut appartenir à plusieurs collections (relation many-to-many)
5. **Games → Loans**: Un jeu peut avoir plusieurs prêts dans le temps (relation one-to-many)
6. **User → Friends**: Un utilisateur peut avoir plusieurs amis (relation many-to-many)
7. **User → Backups**: Un utilisateur peut avoir plusieurs sauvegardes (relation one-to-many)
8. **User → Notifications**: Un utilisateur peut recevoir plusieurs notifications (relation one-to-many)

## Indexation

Pour optimiser les performances, les index suivants seront créés:

1. `Games.barcode` - Pour la recherche rapide lors du scan
2. `Games.owner` - Pour récupérer rapidement tous les jeux d'un utilisateur
3. `Collections.owner` - Pour récupérer rapidement toutes les collections d'un utilisateur
4. `Loans.game` - Pour vérifier si un jeu est actuellement prêté
5. `Loans.status` - Pour filtrer les prêts actifs/en retard
6. `Wishlist.owner` - Pour accéder rapidement à la liste de souhaits d'un utilisateur
7. `Friends.user` et `Friends.friend` - Pour les recherches bidirectionnelles d'amis

## Considérations de sécurité

1. Les mots de passe seront hachés avec bcrypt avant stockage
2. Les sauvegardes seront chiffrées avec AES-256 avant stockage
3. Les liens partageables pour les listes de souhaits seront cryptés
4. Les QR codes générés pour les jeux seront uniques et liés à l'ID du jeu

## Gestion des données volumineuses

1. Les images de couverture seront stockées sur un service externe (comme AWS S3)
2. Les sauvegardes seront compressées avec compression différentielle
3. Les données enrichies (liens vers guides, speedruns, etc.) seront chargées à la demande

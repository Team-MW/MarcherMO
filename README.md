# 🥩 Marché MO - Système de File d'Attente

Système de gestion de file d'attente moderne pour boucherie avec notifications SMS, interface QR code et dashboard temps réel.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![Database](https://img.shields.io/badge/database-PlanetScale-orange)

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- Compte [PlanetScale](https://planetscale.com/) (gratuit)
- Compte [Twilio](https://www.twilio.com/) pour SMS

### Installation

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd marcheMO

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials

# 4. Vérifier la configuration
npm run check-db

# 5. Lancer en développement
npm run dev
```

🎯 **Nouveau ?** Consultez **[START_HERE.md](./START_HERE.md)** pour un guide complet !

---

## 📖 Documentation

| Document | Description | Quand le lire |
|----------|-------------|---------------|
| **[START_HERE.md](./START_HERE.md)** | 🎯 Point d'entrée principal | **Commencez ici** |
| **[QUICKSTART_PLANETSCALE.md](./QUICKSTART_PLANETSCALE.md)** | 🚀 Configuration PlanetScale (10 min) | Avant la migration |
| **[CHECKLIST.md](./CHECKLIST.md)** | ✅ Liste de progression | Pendant la migration |
| **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** | 📘 Guide technique complet | En cas de problème |
| **[DOCUMENTATION.md](./DOCUMENTATION.md)** | 📝 Documentation générale | Référence projet |
| **[SUMMARY.md](./SUMMARY.md)** | 📦 Vue d'ensemble complète | Comprendre la structure |

---

## 🎯 Fonctionnalités

### Pour les Clients
- ✅ Scan QR code pour rejoindre la file
- ✅ Numéro de ticket unique (#0001, #0002...)
- ✅ Notification SMS automatique (son tour)

### Pour le Boucher
- ✅ Dashboard temps réel
- ✅ Appel du prochain client en 1 clic
- ✅ Réinitialisation de la file
- ✅ Statistiques détaillées

### Technique
- ✅ Base de données PlanetScale (MySQL serverless)
- ✅ Websockets (Socket.io) pour temps réel
- ✅ Historique complet des clients
- ✅ Logs SMS avec traçabilité Twilio
- ✅ Statistiques avec filtres (jour, 7j, 30j, tout)

---

## 🗂️ Structure du Projet

```
marcheMO/
├── 📁 src/              # Frontend React
├── 📁 api/              # Backend API (Vercel)
├── 📁 db/               # Base de données
│   ├── schema.sql       # Schéma complet
│   ├── connection.js    # Pool MySQL
│   └── queries.js       # Requêtes SQL
├── 📁 scripts/          # Scripts utilitaires
├── 📁 public/           # Assets statiques
├── server.js            # Serveur principal
└── 📚 Documentation...  # Guides complets
```

---

## 🔧 Scripts NPM

```bash
npm run dev         # Lancer frontend + backend en local
npm run build       # Build pour production
npm start           # Démarrer en production
npm run check-db    # Vérifier configuration base de données
```

---

## 🌐 URLs du Système

- **`/`** ou **`/vue`** - Dashboard central / File d'attente
- **`/qr`** - Borne avec QR code pour clients
- **`/admin`** - Interface boucher (code: `000000`)
- **`/score`** - Affichage score / Numéro appelé

---

## 🗄️ Base de Données

### Tables
- **`clients`** - File d'attente (id, ticket_number, phone, status, created_at, called_at)
- **`daily_stats`** - Statistiques quotidiennes
- **`admin_users`** - Comptes administrateurs
- **`sms_logs`** - Historique des SMS

### Vues
- **`v_waiting_queue`** - File en temps réel
- **`v_today_stats`** - Stats du jour

📚 Détails complets : [db/README.md](./db/README.md)

---

## 🚀 Déploiement

### Render (Recommandé)

1. **Créer un Web Service** sur Render
2. **Build Command** : `npm install && npm run build`
3. **Start Command** : `npm start`
4. **Variables d'environnement** :
   ```
   DATABASE_URL=mysql://...
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_MESSAGING_SERVICE_SID=MG...
   NODE_ENV=production
   ```

📘 Guide détaillé : [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

## 🔑 Variables d'Environnement

Créez un fichier `.env` à la racine :

```env
# Base de données PlanetScale
DATABASE_URL=mysql://xxxxx:pscale_pw_xxxxx@aws.connect.psdb.cloud/marche-mo?ssl={"rejectUnauthorized":true}

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Environnement
NODE_ENV=development
```

📄 Template : [.env.example](./.env.example)

---

## 🧪 Tests

```bash
# 1. Lancer le serveur
npm run dev

# 2. Tests manuels
- Aller sur http://localhost:5173/qr
- Scanner le QR code
- Entrer un numéro de téléphone
- Vérifier apparition dans /vue
- Se connecter à /admin (code: 000000)
- Appeler le client
- Vérifier réception SMS
```

---

## 🛠️ Technologies

- **Frontend** : React 19, Vite, Framer Motion, Recharts
- **Backend** : Express, Socket.io
- **Base de données** : PlanetScale (MySQL)
- **SMS** : Twilio
- **Déploiement** : Render / Vercel

---

## 📈 Migration depuis Mémoire

Si vous migrez depuis l'ancienne version en mémoire :

1. Suivez **[QUICKSTART_PLANETSCALE.md](./QUICKSTART_PLANETSCALE.md)**
2. Exécutez `bash scripts/migrate.sh`
3. Testez avec `npm run dev`
4. Déployez

Les sauvegardes sont créées automatiquement dans `backups/`.

---

## 🆘 Support

### Debugging
```bash
npm run check-db  # Vérifier la config DB
```

### Restaurer une sauvegarde
```bash
cp backups/server.js.backup.* server.js
npm run dev
```

### Ressources
- [PlanetScale Docs](https://planetscale.com/docs)
- [Twilio Docs](https://www.twilio.com/docs)
- [Socket.io Docs](https://socket.io/docs/)

---

## 📄 Licence

Propriétaire - Marché MO

---

## 👨‍💻 Auteur

Créé pour **Marché MO** 🥩  
Janvier 2026

---

**🚀 Prêt à démarrer ? Consultez [START_HERE.md](./START_HERE.md) !**


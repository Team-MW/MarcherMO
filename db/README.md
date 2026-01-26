# 📁 Base de Données - Marché MO

Ce dossier contient tous les fichiers liés à la base de données PlanetScale (MySQL).

## 📄 Fichiers

### `schema.sql`
Schéma complet de la base de données incluant :
- Tables : `clients`, `daily_stats`, `admin_users`, `sms_logs`
- Vues : `v_waiting_queue`, `v_today_stats`
- Index optimisés pour les performances

**Utilisation :**
```bash
# Exécuter via la console PlanetScale
# Copier-coller le contenu dans l'onglet "Console"
```

---

### `connection.js`
Configuration du pool de connexions MySQL avec `mysql2/promise`.

**Export :**
- `pool` : Pool de connexions par défaut
- `query(sql, params)` : Helper pour exécuter des requêtes
- `transaction(callback)` : Helper pour gérer les transactions

**Exemple :**
```javascript
import { query } from './connection.js';
const result = await query('SELECT * FROM clients WHERE status = ?', ['waiting']);
```

---

### `queries.js`
Toutes les requêtes SQL de l'application organisées par catégorie.

#### 🔹 Gestion de la file d'attente
- `generateTicketNumber()` : Génère #0001, #0002, etc.
- `joinQueue(phone)` : Ajoute un client
- `getQueue()` : Récupère la file complète
- `callNextClient()` : Appelle le prochain client
- `resetQueue()` : Réinitialise la file
- `cancelClient(ticketNumber)` : Annule un client spécifique

#### 📊 Statistiques
- `getStats(filterRange)` : Stats générales (today, 7days, 30days, all)
- `getHistory(filterRange)` : Historique détaillé des clients
- `getHourlyData(filterRange)` : Données pour graphiques par heure

#### 📱 Logs SMS
- `logSMS(clientId, phone, message, twilioSid, status, errorMessage)` : Enregistre un SMS
- `getSMSLogs(limit)` : Récupère les logs récents

#### 👤 Admin
- `verifyAdmin(pinCode)` : Vérifie les credentials
- `createAdmin(username, pinCode, role)` : Crée un admin

---

## 🚀 Démarrage Rapide

### 1. Configuration
Ajoutez `DATABASE_URL` dans `.env` :
```env
DATABASE_URL=mysql://xxxxx:pscale_pw_xxxxx@aws.connect.psdb.cloud/marche-mo?ssl={"rejectUnauthorized":true}
```

### 2. Installation
```bash
npm install  # mysql2 sera installé automatiquement
```

### 3. Initialisation
Exécutez `schema.sql` dans la console PlanetScale.

### 4. Utilisation
```javascript
import * as db from './db/queries.js';

// Ajouter un client
const client = await db.joinQueue('+33612345678');

// Récupérer la file
const queue = await db.getQueue();

// Appeler le prochain
const next = await db.callNextClient();

// Stats
const stats = await db.getStats('today');
```

---

## 🔧 Maintenance

### Sauvegarder les données
```sql
-- Via PlanetScale Console
SELECT * INTO OUTFILE 'backup.csv' FROM clients;
```

### Nettoyer les anciennes données
```sql
-- Supprimer les clients de plus de 3 mois
DELETE FROM clients WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

### Monitoring
- **Dashboard PlanetScale** : Voir les métriques en temps réel
- **Table `sms_logs`** : Traçabilité complète des SMS

---

## 📚 Documentation Complète

Consultez `MIGRATION_GUIDE.md` à la racine du projet pour :
- Instructions de migration détaillées
- Exemples de code
- Troubleshooting
- Guide de déploiement

---

**Créé pour Marché MO** 🥩

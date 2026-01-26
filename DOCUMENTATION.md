# Documentation Marché MO - Système Unifié 🥩🚀

Le projet est désormais unifié : le **Frontend** et le **Backend** partagent le même dossier et le même dépôt GitHub.

## 🛠️ Installation en Local

1.  **Installation des dépendances :**
    ```bash
    npm install
    ```
2.  **Configuration :**
    Assurez-vous que votre fichier `.env` à la racine contient vos clés Twilio :
    - `TWILIO_ACCOUNT_SID`
    - `TWILIO_AUTH_TOKEN`
    - `TWILIO_MESSAGING_SERVICE_SID`

3.  **Lancer le projet :**
    ```bash
    npm run dev
    ```
    *Cette commande lance automatiquement le site (port 5173) ET le serveur (port 3001) avec un seul terminal.*

---

## 🌍 Déploiement sur Render (Recommandé)

Render est idéal car il permet d'héberger le front et le back sur une seule URL avec support complet de Socket.io (temps réel).

### Étape 2 : Créer le service sur Render
1.  Nouveau **Web Service**.
2.  Connectez votre dépôt GitHub.
3.  **Paramètres :**
    - **Runtime :** `Node`
    - **Build Command :** `npm install && npm run build`
    - **Start Command :** `npm start`
4.  **Variables d'Environnement (Advanced) :**
    - `NODE_ENV` : `production`
    - `TWILIO_ACCOUNT_SID` : (votre SID)
    - `TWILIO_AUTH_TOKEN` : (votre Token)
    - `TWILIO_MESSAGING_SERVICE_SID` : (votre SID de service)

---

## 🔗 URLs du système
- **Accueil / Dashboard Central :** `/vue`
- **Borne QR Code :** `/qr`
- **Admin Boucher :** `/admin` (Code: `000000`)
- **Affichage Score :** `/score`

---

## 🗄️ Base de Données PlanetScale (MySQL)

Le projet utilise **PlanetScale**, une base de données MySQL serverless, pour la persistance des données.

### 📁 Fichiers de la base de données

- **`db/schema.sql`** : Schéma complet des tables
- **`db/connection.js`** : Configuration de la connexion MySQL
- **`db/queries.js`** : Toutes les requêtes SQL
- **`MIGRATION_GUIDE.md`** : Guide détaillé de migration

### 🚀 Configuration rapide

1. **Créez votre base sur [PlanetScale](https://planetscale.com/)**
2. **Copiez votre `DATABASE_URL`**
3. **Ajoutez-la dans `.env`** :
   ```env
   DATABASE_URL=mysql://xxxxx:pscale_pw_xxxxx@aws.connect.psdb.cloud/marche-mo?ssl={"rejectUnauthorized":true}
   ```
4. **Exécutez le schéma** : Copiez le contenu de `db/schema.sql` dans la console PlanetScale
5. **Installez les dépendances** : `npm install` (mysql2 est déjà inclus)

### 📊 Structure des tables

- **`clients`** : File d'attente des clients avec numéros de ticket
- **`daily_stats`** : Statistiques quotidiennes agrégées
- **`admin_users`** : Comptes administrateurs (bouchers)
- **`sms_logs`** : Historique de tous les SMS envoyés

### 🔍 Vues disponibles

- **`v_waiting_queue`** : File d'attente en temps réel
- **`v_today_stats`** : Statistiques du jour

### 📝 Notes importantes

- **Ticket automatique :** Les numéros (#0001, #0002...) sont générés automatiquement par `db/queries.js`
- **Indexes optimisés :** Pour les requêtes fréquentes sur statut et dates
- **Logs SMS :** Traçabilité complète avec Twilio SID
- **Multi-utilisateurs :** Support de plusieurs comptes admin avec codes PIN

Pour plus de détails sur la migration, consultez **`MIGRATION_GUIDE.md`**.

---

## 🔗 Ressources Utiles

- **Guide de Migration :** Consulter `MIGRATION_GUIDE.md` pour migrer vers PlanetScale
- **Documentation PlanetScale :** [https://planetscale.com/docs](https://planetscale.com/docs)
- **Documentation Twilio :** [https://www.twilio.com/docs](https://www.twilio.com/docs)


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

## 🗄️ Schéma SQL pour Base de Données (Migration Future)

Lorsque vous serez prêt à passer d'un système en mémoire à une vraie base de données (PostgreSQL recommandé), voici le schéma complet à utiliser :

```sql
-- =====================================================
-- SCHÉMA BASE DE DONNÉES - MARCHÉ MO
-- Base: PostgreSQL 14+
-- =====================================================

-- Table principale : File d'attente des clients
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    ticket_number VARCHAR(10) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    called_at TIMESTAMP WITH TIME ZONE,
    
    -- Contraintes
    CONSTRAINT chk_status CHECK (status IN ('waiting', 'called', 'cancelled')),
    CONSTRAINT chk_phone CHECK (phone ~ '^\+?[0-9]{10,15}$')
);

-- Index pour performances
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX idx_clients_called_at ON clients(called_at DESC) WHERE called_at IS NOT NULL;
CREATE INDEX idx_clients_phone ON clients(phone);

-- Table : Statistiques quotidiennes (pour graphiques)
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    total_clients INTEGER DEFAULT 0,
    total_called INTEGER DEFAULT 0,
    avg_wait_minutes INTEGER DEFAULT 0,
    peak_hour INTEGER, -- Heure de pointe (0-23)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_stats_date ON daily_stats(stat_date DESC);

-- Table : Utilisateurs Admin (optionnel pour multi-bouchers)
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    pin_code VARCHAR(6) NOT NULL, -- Code à 6 chiffres
    role VARCHAR(20) DEFAULT 'butcher',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_pin CHECK (pin_code ~ '^[0-9]{6}$')
);

-- Insérer le compte admin par défaut
INSERT INTO admin_users (username, pin_code, role) 
VALUES ('admin', '000000', 'owner');

-- Table : Logs SMS (pour suivi Twilio)
CREATE TABLE sms_logs (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    twilio_sid VARCHAR(100),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT
);

CREATE INDEX idx_sms_logs_client ON sms_logs(client_id);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at DESC);

-- =====================================================
-- FONCTIONS UTILES
-- =====================================================

-- Fonction : Générer un numéro de ticket automatique
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR AS $$
DECLARE
    next_num INTEGER;
    ticket VARCHAR(10);
BEGIN
    SELECT COUNT(*) + 1 INTO next_num FROM clients WHERE DATE(created_at) = CURRENT_DATE;
    ticket := '#' || LPAD(next_num::TEXT, 4, '0');
    RETURN ticket;
END;
$$ LANGUAGE plpgsql;

-- Trigger : Auto-générer le ticket à l'insertion
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_ticket
BEFORE INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION set_ticket_number();

-- =====================================================
-- VUES PRATIQUES
-- =====================================================

-- Vue : Clients en attente (triés par ordre d'arrivée)
CREATE OR REPLACE VIEW v_waiting_queue AS
SELECT 
    id,
    ticket_number,
    phone,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 AS wait_minutes
FROM clients
WHERE status = 'waiting'
ORDER BY created_at ASC;

-- Vue : Statistiques du jour
CREATE OR REPLACE VIEW v_today_stats AS
SELECT 
    COUNT(*) AS total_clients,
    COUNT(*) FILTER (WHERE status = 'called') AS total_called,
    ROUND(AVG(EXTRACT(EPOCH FROM (called_at - created_at))/60)) AS avg_wait_minutes,
    MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM created_at)) AS peak_hour
FROM clients
WHERE DATE(created_at) = CURRENT_DATE;

-- =====================================================
-- REQUÊTES EXEMPLE POUR L'APPLICATION
-- =====================================================

-- 1. Rejoindre la file d'attente
-- INSERT INTO clients (phone) VALUES ('+33612345678') RETURNING *;

-- 2. Récupérer la file d'attente
-- SELECT * FROM v_waiting_queue;

-- 3. Appeler le prochain client
-- UPDATE clients 
-- SET status = 'called', called_at = NOW() 
-- WHERE id = (SELECT id FROM v_waiting_queue LIMIT 1)
-- RETURNING *;

-- 4. Réinitialiser la file
-- UPDATE clients SET status = 'cancelled' WHERE status = 'waiting';

-- 5. Statistiques des 30 derniers jours
-- SELECT * FROM clients 
-- WHERE created_at >= NOW() - INTERVAL '30 days'
-- ORDER BY created_at DESC;
```

### 📝 Notes d'implémentation :
- **Ticket automatique :** Le numéro de ticket (#0001, #0002...) est généré automatiquement via un trigger PostgreSQL.
- **Indexes :** Les index sont optimisés pour les requêtes fréquentes (statut, date).
- **Logs SMS :** La table `sms_logs` permet de tracer tous les SMS envoyés (utile pour le débogage Twilio).
- **Stats agrégées :** La table `daily_stats` peut être remplie via un CRON job quotidien pour accélérer les graphiques.
- **Multi-utilisateurs :** La table `admin_users` permet de gérer plusieurs comptes boucher avec leurs propres codes PIN.

### 🔧 Migration depuis le code actuel :
Il suffira de remplacer les appels `queue.push()` et `queue.filter()` par des requêtes SQL via une bibliothèque comme **`pg`** (node-postgres) ou **Prisma ORM**.

---

## 🤖 PROMPT DE MIGRATION VERS BASE DE DONNÉES

**Copiez-collez ce prompt quand vous serez prêt à migrer vers PostgreSQL :**

```
Je veux migrer mon application Marché MO vers une base de données PostgreSQL.

🎯 OBJECTIF :
Remplacer le système en mémoire actuel (`let queue = []`) par PostgreSQL en utilisant le schéma SQL fourni dans DOCUMENTATION.md.

📋 INSTRUCTIONS PRÉCISES :

1. **Créer la connexion PostgreSQL :**
   - Installer la bibliothèque `pg` (node-postgres)
   - Créer un fichier `db/connection.js` avec un pool de connexions
   - Ajouter les variables d'environnement dans `.env` :
     * DATABASE_URL (connection string PostgreSQL)

2. **Créer les fichiers de requêtes :**
   - Créer `db/queries.js` avec toutes les fonctions SQL nécessaires :
     * `joinQueue(phone)` - Ajouter un client
     * `getQueue()` - Récupérer la file complète
     * `callNextClient()` - Appeler le prochain
     * `resetQueue()` - Réinitialiser
     * `getStats(filterRange)` - Statistiques filtrées
     * `logSMS(clientId, phone, message, twilioSid, status)` - Logger les SMS

3. **Modifier le backend (api/index.js et server.js) :**
   - Remplacer TOUTES les occurrences de manipulation du tableau `queue` par les fonctions SQL
   - Garder Socket.io fonctionnel (émettre les events après les INSERT/UPDATE)
   - Gérer les erreurs de connexion DB de manière propre

4. **Ajouter la persistance des logs SMS :**
   - Logger chaque SMS envoyé dans la table `sms_logs`
   - Inclure le SID Twilio, le statut, et les erreurs éventuelles

5. **Mettre à jour les statistiques (Analytics.jsx) :**
   - Utiliser les requêtes SQL optimisées au lieu de calculer en JavaScript
   - Tirer parti des vues SQL (`v_today_stats`, etc.)

6. **Instructions de déploiement :**
   - Me fournir les étapes pour créer une base PostgreSQL sur Render
   - Expliquer comment exécuter le schéma SQL initial
   - Mettre à jour les variables d'environnement

⚠️ CONTRAINTES IMPORTANTES :
- NE PAS casser les fonctionnalités existantes
- Conserver TOUS les filtres de temps (Aujourd'hui, 7j, 30j, Tout)
- Garder les numéros de ticket (#0001, #0002...) automatiques
- Maintenir la compatibilité avec Vercel ET Render
- Tester toutes les routes (/api/queue/join, /api/queue/call, etc.)

📦 LIVRABLE ATTENDU :
- Tous les fichiers modifiés (api/index.js, server.js, db/connection.js, db/queries.js)
- Un fichier `db/schema.sql` prêt à exécuter
- Instructions complètes de déploiement dans DOCUMENTATION.md
- Liste des nouvelles variables d'environnement à configurer

🔗 INFORMATION COMPLÉMENTAIRE :
Mon schéma SQL complet se trouve dans DOCUMENTATION.md sous la section "Schéma SQL pour Base de Données".

Commence par me confirmer que tu as bien compris, puis procède à la migration étape par étape en m'informant de chaque changement.
```

**💡 Conseil :** Avant d'envoyer ce prompt, assurez-vous d'avoir :
1. Créé votre base PostgreSQL (sur Render, Supabase, ou ailleurs)
2. Récupéré votre `DATABASE_URL` (connection string)
3. Sauvegardé votre code actuel avec `git commit`

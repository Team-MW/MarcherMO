# 📘 Guide de Migration vers PlanetScale

## 🎯 Objectif
Migrer le système de file d'attente de la mémoire vers PlanetScale (MySQL serverless).

---

## 📋 Étape 1 : Configuration PlanetScale

### 1.1 Créer la base de données

1. **Allez sur [PlanetScale](https://planetscale.com/)**
2. **Créez un nouveau projet** : `marche-mo`
3. **Créez une branche principale** : `main`
4. **Obtenez la connection string** :
   - Cliquez sur "Connect"
   - Sélectionnez "Node.js"
   - Copiez le `DATABASE_URL`

### 1.2 Configurer les variables d'environnement

1. **Copiez `.env.example` → `.env`** :
   ```bash
   cp .env.example .env
   ```

2. **Modifiez `.env`** avec vos vraies valeurs :
   ```env
   DATABASE_URL=mysql://xxxxx:pscale_pw_xxxxx@aws.connect.psdb.cloud/marche-mo?ssl={"rejectUnauthorized":true}
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NODE_ENV=development
   ```

### 1.3 Exécuter le schéma SQL

**Option A : Via l'interface PlanetScale**
1. Allez dans l'onglet "Console"
2. Collez le contenu de `db/schema.sql`
3. Cliquez sur "Execute"

**Option B : Via CLI PlanetScale**
```bash
# Installer le CLI
brew install planetscale/tap/pscale

# Se connecter
pscale auth login

# Se connecter à la base
pscale shell marche-mo main

# Copier-coller le contenu de db/schema.sql
```

---

## 🔄 Étape 2 : Modifier le Backend

### 2.1 Fichiers à modifier

#### **`api/index.js`**

Remplacez les imports et la gestion de la queue :

```javascript
// ANCIEN CODE (À REMPLACER)
let queue = [];

// NOUVEAU CODE
import * as db from '../db/queries.js';
```

#### Exemple de modification pour `/api/queue/join` :

**AVANT :**
```javascript
app.post('/api/queue/join', async (req, res) => {
  const { phone } = req.body;
  const ticketNumber = `#${String(queue.length + 1).padStart(4, '0')}`;
  const newClient = {
    id: Date.now(),
    ticketNumber,
    phone,
    status: 'waiting',
    timestamp: new Date()
  };
  queue.push(newClient);
  io.emit('queueUpdate', queue);
  res.json(newClient);
});
```

**APRÈS :**
```javascript
app.post('/api/queue/join', async (req, res) => {
  try {
    const { phone } = req.body;
    const newClient = await db.joinQueue(phone);
    
    // Récupérer la file complète et émettre via Socket.io
    const queue = await db.getQueue();
    io.emit('queueUpdate', queue);
    
    res.json(newClient);
  } catch (error) {
    console.error('❌ Erreur joinQueue:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
```

### 2.2 Liste complète des endpoints à migrer

| Endpoint | Ancienne méthode | Nouvelle méthode |
|----------|------------------|------------------|
| `POST /api/queue/join` | `queue.push()` | `db.joinQueue(phone)` |
| `GET /api/queue` | `res.json(queue)` | `db.getQueue()` |
| `POST /api/queue/call` | `queue.shift()` | `db.callNextClient()` |
| `POST /api/queue/reset` | `queue = []` | `db.resetQueue()` |
| `GET /api/stats` | Calcul JS | `db.getStats(filter)` |

---

## 📊 Étape 3 : Mettre à jour les Statistiques

Dans les composants React qui utilisent `/api/stats`, les données viennent maintenant de la DB.

**Exemple dans `Analytics.jsx` :**

Aucun changement côté frontend nécessaire ! Les endpoints `/api/stats` retournent le même format.

---

## 🧪 Étape 4 : Tests

### 4.1 Tester en local

```bash
npm run dev
```

**Checklist :**
- [ ] Scanner un QR code et rejoindre la file
- [ ] Vérifier que le client apparaît dans `/vue`
- [ ] Appeler le client depuis `/admin`
- [ ] Vérifier la réception du SMS
- [ ] Consulter les stats dans `/admin`
- [ ] Réinitialiser la file

### 4.2 Vérifier les données sur PlanetScale

```sql
-- Voir tous les clients
SELECT * FROM clients ORDER BY created_at DESC LIMIT 10;

-- Voir la file actuelle
SELECT * FROM v_waiting_queue;

-- Voir les stats du jour
SELECT * FROM v_today_stats;

-- Voir les logs SMS
SELECT * FROM sms_logs ORDER BY sent_at DESC LIMIT 10;
```

---

## 🚀 Étape 5 : Déploiement sur Render

### 5.1 Mettre à jour les variables d'environnement

Dans Render → Settings → Environment :

```
DATABASE_URL=mysql://xxxxx:pscale_pw_xxxxx@aws.connect.psdb.cloud/marche-mo?ssl={"rejectUnauthorized":true}
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxx
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxx
NODE_ENV=production
```

### 5.2 Déployer

```bash
git add .
git commit -m "Migration vers PlanetScale"
git push
```

Render va automatiquement redéployer.

---

## 🔍 Debugging

### Erreur : "Cannot connect to database"

**Solution :**
- Vérifiez que `DATABASE_URL` est correct
- Assurez-vous que PlanetScale accepte les connexions externes
- Vérifiez que le SSL est activé

### Erreur : "Table doesn't exist"

**Solution :**
- Vérifiez que `db/schema.sql` a bien été exécuté
- Connectez-vous à PlanetScale et listez les tables :
  ```sql
  SHOW TABLES;
  ```

### Les SMS ne sont pas loggés

**Solution :**
- Vérifiez que `db.logSMS()` est appelé après l'envoi Twilio
- Exemple :
  ```javascript
  const message = await twilioClient.messages.create({...});
  await db.logSMS(clientId, phone, messageBody, message.sid, 'sent');
  ```

---

## 📈 Migration des données existantes (optionnel)

Si vous avez des données en production à migrer :

```javascript
// Script de migration (à créer dans /scripts/migrate-data.js)
import * as db from '../db/queries.js';

const oldQueue = [ /* vos anciennes données */ ];

for (const client of oldQueue) {
  await db.joinQueue(client.phone);
}
```

---

## ✅ Checklist finale

- [ ] PlanetScale configuré
- [ ] Schéma SQL exécuté
- [ ] Variables d'environnement configurées
- [ ] `npm install mysql2` installé
- [ ] `api/index.js` migré
- [ ] Tests locaux OK
- [ ] Déployé sur Render
- [ ] Tests production OK
- [ ] Monitoring PlanetScale activé

---

## 📞 Support

- **PlanetScale Docs :** https://planetscale.com/docs
- **mysql2 Docs :** https://github.com/sidorares/node-mysql2

Bonne migration ! 🚀

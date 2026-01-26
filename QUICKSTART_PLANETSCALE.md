# 🚀 Guide Rapide : Configuration PlanetScale

## ⏱️ Temps estimé : 10 minutes

---

## 📝 Étape 1 : Créer un compte PlanetScale

1. Allez sur **[https://planetscale.com/](https://planetscale.com/)**
2. Cliquez sur **"Get Started"** ou **"Sign Up"**
3. Inscrivez-vous avec GitHub (recommandé) ou email
4. Vérifiez votre email si nécessaire

✅ **Compte créé !**

---

## 🗄️ Étape 2 : Créer votre base de données

1. Dans le dashboard PlanetScale, cliquez sur **"Create a new database"**
2. Remplissez les informations :
   - **Name:** `marche-mo` (ou le nom de votre choix)
   - **Region:** Choisissez la région proche de vous (ex: EU West pour l'Europe)
   - **Plan:** Sélectionnez **Hobby (Free)** pour commencer
3. Cliquez sur **"Create database"**

⏳ La création prend environ 30 secondes...

✅ **Base de données créée !**

---

## 🔌 Étape 3 : Obtenir la connection string

1. Dans votre base de données, cliquez sur **"Connect"**
2. Sélectionnez le framework : **"Node.js"**
3. Copiez la **connection string** qui ressemble à :
   ```
   mysql://xxxxxxxxx:pscale_pw_xxxxxxxxx@aws.connect.psdb.cloud/marche-mo?ssl={"rejectUnauthorized":true}
   ```
4. **Gardez cette string en sécurité** (vous en aurez besoin pour le `.env`)

✅ **Connection string obtenue !**

---

## 🏗️ Étape 4 : Exécuter le schéma SQL

⚠️ **Important :** PlanetScale n'accepte qu'**une seule requête à la fois** dans leur console.

### Solution : Fichiers séparés dans `db/migrations/`

Nous avons créé **7 fichiers SQL séparés** à exécuter **dans l'ordre**.

#### Instructions détaillées :

1. **Ouvrez le dossier** `db/migrations/` dans votre éditeur
2. **Lisez le fichier** `db/migrations/README.md` pour les instructions complètes
3. **Exécutez les fichiers un par un** dans la console PlanetScale :

```
📁 db/migrations/
  ├── 1️⃣  01_create_clients.sql          ← Copiez → Exécutez
  ├── 2️⃣  02_create_daily_stats.sql      ← Copiez → Exécutez
  ├── 3️⃣  03_create_admin_users.sql      ← Copiez → Exécutez
  ├── 4️⃣  04_insert_default_admin.sql    ← Copiez → Exécutez
  ├── 5️⃣  05_create_sms_logs.sql         ← Copiez → Exécutez
  ├── 6️⃣  06_create_view_waiting_queue.sql ← Copiez → Exécutez
  └── 7️⃣  07_create_view_today_stats.sql   ← Copiez → Exécutez
```

#### Procédure pour chaque fichier :

1. Ouvrez le fichier dans votre éditeur
2. **Copiez tout le contenu** (Cmd/Ctrl + A, puis Cmd/Ctrl + C)
3. Allez dans la **console PlanetScale**
4. **Collez** le contenu (Cmd/Ctrl + V)
5. Cliquez sur **"Execute"** ou appuyez sur `Cmd/Ctrl + Enter`
6. Vérifiez qu'il n'y a **pas d'erreur**
7. Passez au fichier suivant

**⏱️ Temps estimé : 2-3 minutes**

✅ **Tables créées !**


### Vérification

Dans la console, exécutez :
```sql
SHOW TABLES;
```

Vous devriez voir :
- `admin_users`
- `clients`
- `daily_stats`
- `sms_logs`
- `v_today_stats`
- `v_waiting_queue`

---

## 🔐 Étape 5 : Configurer le .env

1. Ouvrez votre fichier `.env` (ou créez-le depuis `.env.example`)
2. Ajoutez la `DATABASE_URL` que vous avez copiée à l'étape 3 :

```env
DATABASE_URL=mysql://xxxxx:pscale_pw_xxxxx@aws.connect.psdb.cloud/marche-mo?ssl={"rejectUnauthorized":true}

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

NODE_ENV=development
```

3. **Sauvegardez** le fichier

✅ **Configuration terminée !**

---

## 🧪 Étape 6 : Tester la connexion

Exécutez le script de vérification :

```bash
npm run check-db
```

Si tout est OK, vous verrez :
```
✅ Fichier db/schema.sql présent
✅ Fichier db/connection.js présent
✅ Fichier db/queries.js présent
✅ DATABASE_URL configuré (MySQL)
✅ TWILIO_ACCOUNT_SID configuré
✅ TWILIO_AUTH_TOKEN configuré
✅ TWILIO_MESSAGING_SERVICE_SID configuré
✅ Package mysql2 installé
✅ Connexion à PlanetScale réussie !
✅ Toutes les vérifications sont passées ! ✨
```

✅ **Connexion validée !**

---

## 🔄 Étape 7 : Migrer le code

### Méthode automatique (Recommandé)

```bash
bash scripts/migrate.sh
```

Le script va :
- ✅ Créer des sauvegardes de vos fichiers actuels
- ✅ Vérifier la connexion DB
- ✅ Remplacer `server.js` et `api/index.js`
- ✅ Vous donner les prochaines étapes

### Méthode manuelle

1. Renommez les anciens fichiers :
   ```bash
   mv server.js server.old.js
   mv api/index.js api/index.old.js
   ```

2. Renommez les nouveaux fichiers :
   ```bash
   mv server.new.js server.js
   mv api/index.new.js api/index.js
   ```

✅ **Migration effectuée !**

---

## 🏃 Étape 8 : Tester en local

Lancez le serveur :

```bash
npm run dev
```

Vous devriez voir :
```
🚀 Serveur Marché MO (Front + Back) en ligne sur le port 3001
🗄️  Base de données PlanetScale connectée
```

**Tests à effectuer :**

1. ✅ Allez sur `http://localhost:5173/qr`
2. ✅ Scannez le QR code et entrez un numéro
3. ✅ Vérifiez que le client apparaît dans `http://localhost:5173/vue`
4. ✅ Connectez-vous à `/admin` (code: `000000`)
5. ✅ Appelez le client et vérifiez la réception du SMS

✅ **Tout fonctionne !**

---

## 🚀 Étape 9 : Déployer sur Render

### 9.1 Ajouter la DATABASE_URL dans Render

1. Allez dans **Render Dashboard** → Votre service
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Cliquez sur **"Add Environment Variable"**
4. Ajoutez :
   - **Key:** `DATABASE_URL`
   - **Value:** Votre connection string PlanetScale
5. Cliquez sur **"Save Changes"**

### 9.2 Déployer

```bash
git add .
git commit -m "✨ Migration vers PlanetScale"
git push
```

Render va automatiquement redéployer votre application.

✅ **Déployé en production !**

---

## 🎉 Félicitations !

Votre application Marché MO utilise maintenant PlanetScale ! 🎊

### Prochainement

Vous pouvez :
- 📊 Consulter les métriques dans le dashboard PlanetScale
- 🔍 Analyser les requêtes SQL lentes
- 📈 Suivre l'utilisation de votre base de données
- 🛡️ Activer le mode production (après tests)

---

## 🆘 En cas de problème

### La connexion ne fonctionne pas

1. Vérifiez que `DATABASE_URL` commence par `mysql://`
2. Vérifiez qu'il n'y a pas d'espaces dans le `.env`
3. Redémarrez le serveur : `npm run dev`

### Les tables n'existent pas

1. Retournez dans la console PlanetScale
2. Exécutez `SHOW TABLES;` pour vérifier
3. Si vide, réexécutez tout le contenu de `db/schema.sql`

### Restaurer l'ancienne version

```bash
cp backups/server.js.backup.* server.js
cp backups/api_index.js.backup.* api/index.js
npm run dev
```

---

## 📚 Ressources

- **Documentation PlanetScale :** https://planetscale.com/docs
- **Guide de migration complet :** `MIGRATION_GUIDE.md`
- **Documentation du dossier db :** `db/README.md`

---

**Bon déploiement ! 🚀**

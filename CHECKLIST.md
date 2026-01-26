# ✅ Checklist de Migration PlanetScale

Cochez les étapes au fur et à mesure de votre progression.

---

## 📋 Phase 1 : Préparation

- [ ] J'ai lu `SUMMARY.md` pour comprendre les fichiers créés
- [ ] J'ai lu `QUICKSTART_PLANETSCALE.md` pour le guide rapide
- [ ] J'ai un compte sur [PlanetScale](https://planetscale.com/)
- [ ] J'ai mes credentials Twilio à portée de main
- [ ] J'ai fait un backup de mon code actuel

---

## 🗄️ P. hase 2 : Configuration PlanetScale

- [ ] Base de données créée sur PlanetScale (nom: `marche-mo`)
- [ ] Connection string récupérée
- [ ] Fichier `.env` créé (copié depuis `.env.example`)
- [ ] `DATABASE_URL` ajoutée dans `.env`
- [ ] Credentials Twilio ajoutés dans `.env`

---

## 🏗️ Phase 3 : Initialisation Base de Données

- [ ] Schéma SQL exécuté (copié-collé `db/schema.sql` dans console PlanetScale)
- [ ] Tables vérifiées avec `SHOW TABLES;`
- [ ] 4 tables présentes : `clients`, `daily_stats`, `admin_users`, `sms_logs`
- [ ] 2 vues présentes : `v_waiting_queue`, `v_today_stats`
- [ ] Compte admin créé (username: `admin`, PIN: `000000`)

---

## 🔍 Phase 4 : Vérification

- [ ] Dépendances installées : `npm install`
- [ ] Script de vérification exécuté : `npm run check-db`
- [ ] Toutes les vérifications passées ✅
- [ ] Connexion à PlanetScale réussie

---

## 🔄 Phase 5 : Migration du Code

### Option A : Automatique (Recommandé)
- [ ] Script de migration exécuté : `bash scripts/migrate.sh`
- [ ] Sauvegardes créées dans `backups/`
- [ ] Fichiers `server.js` et `api/index.js` remplacés

### Option B : Manuelle
- [ ] Ancien `server.js` renommé en `server.old.js`
- [ ] Ancien `api/index.js` renommé en `api/index.old.js`
- [ ] Nouveau `server.new.js` renommé en `server.js`
- [ ] Nouveau `api/index.new.js` renommé en `api/index.js`

---

## 🧪 Phase 6 : Tests Locaux

- [ ] Serveur démarré : `npm run dev`
- [ ] Message "Base de données PlanetScale connectée" affiché
- [ ] Aucune erreur dans la console

### Tests Fonctionnels

- [ ] **Test 1 : QR Code**
  - [ ] Page `/qr` accessible
  - [ ] QR code généré
  - [ ] Scan du QR code fonctionnel
  - [ ] Numéro de téléphone saisi
  - [ ] Ticket généré (#0001, #0002, etc.)

- [ ] **Test 2 : Dashboard Central**
  - [ ] Page `/vue` accessible
  - [ ] Client ajouté visible dans la liste
  - [ ] Temps d'attente affiché
  - [ ] Mise à jour en temps réel (Socket.io)

- [ ] **Test 3 : Admin**
  - [ ] Page `/admin` accessible
  - [ ] Connexion avec code `000000` réussie
  - [ ] Client visible dans la file
  - [ ] Bouton "Appeler" fonctionnel
  - [ ] SMS reçu sur le téléphone
  - [ ] Client marqué comme "appelé"

- [ ] **Test 4 : Statistiques** (optionnel si implémenté)
  - [ ] Statistiques affichées correctement
  - [ ] Filtres fonctionnels (Aujourd'hui, 7j, 30j, Tout)

- [ ] **Test 5 : Réinitialisation**
  - [ ] Bouton "Réinitialiser" fonctionnel
  - [ ] File vidée
  - [ ] Confirmation visuelle

- [ ] **Test 6 : Base de Données**
  - [ ] Vérification dans console PlanetScale : `SELECT * FROM clients;`
  - [ ] Clients enregistrés visibles
  - [ ] Logs SMS présents : `SELECT * FROM sms_logs;`

---

## 🚀 Phase 7 : Déploiement

### Configuration Render

- [ ] Variables d'environnement ajoutées dans Render :
  - [ ] `DATABASE_URL`
  - [ ] `TWILIO_ACCOUNT_SID`
  - [ ] `TWILIO_AUTH_TOKEN`
  - [ ] `TWILIO_MESSAGING_SERVICE_SID`
  - [ ] `NODE_ENV=production`

### Déploiement Git

- [ ] Changements committés : `git add .`
- [ ] Commit créé : `git commit -m "Migration vers PlanetScale"`
- [ ] Code poussé : `git push`
- [ ] Render a redéployé automatiquement
- [ ] Déploiement réussi (logs vérifiés)

### Tests Production

- [ ] Site accessible en production
- [ ] QR code fonctionnel
- [ ] File d'attente fonctionnelle
- [ ] SMS envoyés correctement
- [ ] Admin accessible
- [ ] Pas d'erreurs dans les logs Render

---

## 📊 Phase 8 : Validation Finale

- [ ] Application fonctionne en local
- [ ] Application fonctionne en production
- [ ] Données persistantes (survivent aux redémarrages)
- [ ] SMS envoyés et loggés
- [ ] Statistiques correctes
- [ ] Aucune régression fonctionnelle

---

## 🎯 Phase 9 : Nettoyage (Optionnel)

- [ ] Tests réussis depuis au moins 24h
- [ ] Sauvegardes conservées quelque part (just in case)
- [ ] Fichiers `.old.js` supprimés
- [ ] Fichiers `.new.js` supprimés (déjà fait si migration auto)
- [ ] Documentation lue et comprise

---

## 🎉 Félicitations !

Si toutes les cases sont cochées, votre migration est **TERMINÉE** ! 🎊

### 📈 Prochaines Étapes Recommandées

- [ ] Monitorer PlanetScale pendant quelques jours
- [ ] Vérifier les métriques de performance
- [ ] Configurer des alertes (optionnel)
- [ ] Documenter tout problème rencontré
- [ ] Partager votre retour d'expérience

---

## 🆘 En Cas de Problème

Si une étape échoue :

1. **Ne pas paniquer** 😊
2. Consulter `QUICKSTART_PLANETSCALE.md` section "En cas de problème"
3. Vérifier les logs : terminal + console PlanetScale + Render logs
4. Exécuter `npm run check-db` pour diagnostiquer
5. Si besoin, restaurer la sauvegarde :
   ```bash
   cp backups/server.js.backup.* server.js
   cp backups/api_index.js.backup.* api/index.js
   npm run dev
   ```

---

**Date de migration :** _____________________  
**Durée totale :** _____________________  
**Notes personnelles :**

_____________________________________________
_____________________________________________
_____________________________________________

---

**Bon courage ! 💪**

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

### Étape 1 : Push sur GitHub
```bash
git add .
git commit -m "Fusion Front + Back pour déploiement"
git push origin main
```

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

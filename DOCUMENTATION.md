# Documentation Marché MO - Notification SMS 🥩

Cette application utilise **Twilio** pour envoyer des notifications SMS aux clients de la boucherie dès que c'est leur tour.

## 🚀 Configuration Twilio

Les identifiants Twilio ont été configurés dans le fichier `backend/.env`.

### 1. Activer votre numéro Twilio
Pour que les SMS partent réellement, vous devez mettre votre numéro Twilio (acheté sur votre interface Twilio) dans le fichier `backend/.env` à la ligne :
`TWILIO_PHONE_NUMBER=+1234567890` (Remplacez par le vôtre au format international).

### 2. Format des numéros clients
Les clients doivent entrer leur numéro au format international pour que Twilio puisse envoyer le message (ex: `+33612345678` pour la France).

---

## 🛠️ Structure du Projet

- **Frontend (Dossier racine) :** React + Vite. Gère l'interface client, l'affichage QR, et la tablette boucher.
- **Backend (Dossier `backend/`) :** Serveur Node.js. Gère la file d'attente, le temps réel (Socket.io) et l'envoi des SMS via Twilio.

---

## 💻 Lancer le projet en local

### Étape 1 : Lancer le Backend
```bash
cd backend
npm install
npm run dev
```
Le serveur écoute sur le port **3001**.

### Étape 2 : Lancer le Frontend
Ouvrez un nouveau terminal à la racine :
```bash
npm install
npm run dev
```
L'application est accessible sur le port **5173** (ou similaire).

---

## 🔗 URLs Utiles
- **Borne QR Code :** `/qr` (À afficher à l'entrée).
- **Page Client :** `/` (Une fois le QR scanné).
- **Tablette Boucher :** `/admin` (Pour gérer la file).

---

## 🔒 Sécurité & Base de données
- Actuellement, les données sont stockées en mémoire vive (elles s'effacent si le serveur redémarre).
- Pour enregistrer les clients de manière permanente, vous devrez connecter un service comme **MongoDB** ou **PostgreSQL** dans `backend/server.js`.

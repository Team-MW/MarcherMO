#!/bin/bash

# =====================================================
# Script de Migration - Marché MO vers PlanetScale
# =====================================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage de la migration vers PlanetScale..."
echo ""

# Couleurs pour le terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# 1. Vérifier que les fichiers .new existent
echo "📋 Étape 1/5 : Vérification des fichiers..."
if [ ! -f "server.new.js" ]; then
    echo -e "${RED}❌ Erreur: server.new.js introuvable${NC}"
    exit 1
fi

if [ ! -f "api/index.new.js" ]; then
    echo -e "${RED}❌ Erreur: api/index.new.js introuvable${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tous les fichiers nécessaires sont présents${NC}"
echo ""

# 2. Créer des sauvegardes
echo "💾 Étape 2/5 : Création de sauvegardes..."
mkdir -p backups
cp server.js backups/server.js.backup.$(date +%Y%m%d_%H%M%S)
cp api/index.js backups/api_index.js.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✅ Sauvegardes créées dans le dossier backups/${NC}"
echo ""

# 3. Vérifier la connexion à la base de données
echo "🔍 Étape 3/5 : Vérification de la connexion DB..."
if npm run check-db; then
    echo -e "${GREEN}✅ Connexion à PlanetScale validée${NC}"
else
    echo -e "${RED}❌ Erreur de connexion à PlanetScale${NC}"
    echo -e "${YELLOW}⚠️  Vérifiez votre .env et votre DATABASE_URL${NC}"
    exit 1
fi
echo ""

# 4. Remplacer les fichiers
echo "🔄 Étape 4/5 : Remplacement des fichiers..."
mv server.new.js server.js
mv api/index.new.js api/index.js
echo -e "${GREEN}✅ Fichiers remplacés${NC}"
echo ""

# 5. Redémarrer le serveur (optionnel)
echo "🎉 Étape 5/5 : Migration terminée !"
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✅ Migration réussie vers PlanetScale !${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Prochaines étapes :"
echo "1. Exécutez 'npm run dev' pour tester en local"
echo "2. Vérifiez que tout fonctionne correctement"
echo "3. Commitez les changements : git add . && git commit -m 'Migration vers PlanetScale'"
echo "4. Déployez sur Render : git push"
echo ""
echo "En cas de problème, restaurez les sauvegardes :"
echo "- cp backups/server.js.backup.* server.js"
echo "- cp backups/api_index.js.backup.* api/index.js"
echo ""

#!/usr/bin/env node

/**
 * Script de vérification avant migration vers PlanetScale
 * Vérifie que tous les prérequis sont remplis
 */

import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const checks = [];
let allChecksPassed = true;

// Couleurs pour le terminal
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

console.log('\n🔍 Vérification des prérequis pour la migration PlanetScale\n');

// Vérification 1 : Fichiers de base de données
async function checkDatabaseFiles() {
    const files = ['schema.sql', 'connection.js', 'queries.js'];
    const projectRoot = join(__dirname, '..');

    for (const file of files) {
        try {
            const path = join(projectRoot, 'db', file);
            await fs.access(path);
            log.success(`Fichier db/${file} présent`);
        } catch (error) {
            log.error(`Fichier db/${file} manquant`);
            allChecksPassed = false;
        }
    }
}

// Vérification 2 : Variables d'environnement
function checkEnvVariables() {
    const required = ['DATABASE_URL', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_MESSAGING_SERVICE_SID'];

    for (const varName of required) {
        if (process.env[varName]) {
            if (varName === 'DATABASE_URL') {
                if (process.env[varName].startsWith('mysql://')) {
                    log.success(`${varName} configuré (MySQL)`);
                } else {
                    log.error(`${varName} doit commencer par mysql://`);
                    allChecksPassed = false;
                }
            } else {
                log.success(`${varName} configuré`);
            }
        } else {
            log.error(`${varName} manquant dans .env`);
            allChecksPassed = false;
        }
    }
}

// Vérification 3 : Dépendances npm
async function checkNpmPackages() {
    const projectRoot = join(__dirname, '..');
    try {
        const packageJson = JSON.parse(
            await fs.readFile(join(projectRoot, 'package.json'), 'utf-8')
        );

        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps['mysql2']) {
            log.success('Package mysql2 installé');
        } else {
            log.error('Package mysql2 manquant - Exécutez: npm install mysql2');
            allChecksPassed = false;
        }

        if (deps['dotenv']) {
            log.success('Package dotenv installé');
        } else {
            log.warning('Package dotenv manquant - Recommandé pour .env');
        }
    } catch (error) {
        log.error('Impossible de lire package.json');
        allChecksPassed = false;
    }
}

// Vérification 4 : Test de connexion (optionnel)
async function testConnection() {
    if (!process.env.DATABASE_URL) {
        log.warning('Impossible de tester la connexion sans DATABASE_URL');
        return;
    }

    try {
        const { default: mysql } = await import('mysql2/promise');
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        await connection.ping();
        await connection.end();
        log.success('Connexion à PlanetScale réussie !');
    } catch (error) {
        log.error(`Erreur de connexion : ${error.message}`);
        log.info('Vérifiez votre DATABASE_URL et que la base existe sur PlanetScale');
        allChecksPassed = false;
    }
}

// Exécution des vérifications
async function runChecks() {
    console.log('📁 Fichiers de base de données :');
    await checkDatabaseFiles();

    console.log('\n🔐 Variables d\'environnement :');
    checkEnvVariables();

    console.log('\n📦 Dépendances npm :');
    await checkNpmPackages();

    console.log('\n🌐 Test de connexion :');
    await testConnection();

    console.log('\n' + '='.repeat(50));

    if (allChecksPassed) {
        log.success('Toutes les vérifications sont passées ! ✨');
        log.info('Vous êtes prêt à migrer vers PlanetScale');
        log.info('Consultez MIGRATION_GUIDE.md pour les prochaines étapes');
        process.exit(0);
    } else {
        log.error('Certaines vérifications ont échoué');
        log.info('Corrigez les erreurs ci-dessus avant de continuer');
        process.exit(1);
    }
}

runChecks().catch(error => {
    console.error('Erreur inattendue:', error);
    process.exit(1);
});

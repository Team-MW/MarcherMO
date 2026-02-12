
import { getSMSLogs } from '../db/queries.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env depuis la racine
dotenv.config({ path: join(__dirname, '..', '.env') });

async function checkLogs() {
    console.log('🔍 Vérification des derniers logs SMS...');
    try {
        const logs = await getSMSLogs(5);
        if (logs.length === 0) {
            console.log('⚠️ Aucun log SMS trouvé.');
        } else {
            console.log('📝 Derniers logs SMS :');
            logs.forEach(log => {
                console.log('------------------------------------------------');
                console.log(`ID: ${log.id}`);
                console.log(`Date: ${log.sent_at}`);
                console.log(`Vers: ${log.phone}`);
                console.log(`Status: ${log.status}`);
                console.log(`Twilio SID: ${log.twilio_sid}`);
                if (log.error_message) {
                    console.log(`❌ Erreur: ${log.error_message}`);
                } else {
                    console.log('✅ Pas d\'erreur enregistrée');
                }
            });
            console.log('------------------------------------------------');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des logs:', error);
        process.exit(1);
    }
}

checkLogs();

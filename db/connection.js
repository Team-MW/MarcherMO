/**
 * Configuration de la connexion MySQL pour PlanetScale
 * Utilise mysql2 avec support des Promises
 */

import mysql from 'mysql2/promise';

// Configuration du pool de connexions
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: true
  }
});

// Test de connexion au démarrage
pool.getConnection()
  .then(connection => {
    console.log('✅ Connexion MySQL établie avec succès (PlanetScale)');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion MySQL:', err.message);
    process.exit(1);
  });

// Fonction helper pour exécuter des requêtes
export const query = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Erreur SQL:', error.message);
    throw error;
  }
};

// Fonction helper pour les transactions
export const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;

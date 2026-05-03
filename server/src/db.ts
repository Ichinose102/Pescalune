import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
  // Plus besoin de créer les tables ici, car nous l'avons fait directement dans Neon SQL Editor.
  console.log("Connexion à Neon PostgreSQL établie.");
};

export default pool;

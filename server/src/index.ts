import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Clients
app.get('/api/clients', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM clients ORDER BY last_name ASC');
    res.json(rows);
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des clients." });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { last_name, first_name, phone, email } = req.body;
    const { rows } = await query(
      'INSERT INTO clients (last_name, first_name, phone, email) VALUES ($1, $2, $3, $4) RETURNING id',
      [last_name, first_name, phone, email]
    );
    res.json({ id: rows[0].id });
  } catch (error: any) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Erreur lors de la création du client." });
  }
});

// Additions
app.get('/api/additions', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT a.*, c.last_name as client_last_name, c.first_name as client_first_name 
      FROM additions a 
      LEFT JOIN clients c ON a.client_id = c.id 
      ORDER BY a.date DESC
    `);
    res.json(rows);
  } catch (error: any) {
    console.error("Error fetching additions:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des additions." });
  }
});

app.post('/api/additions', async (req, res) => {
  try {
    const { client_id, items, total } = req.body;
    
    // Pour Neon/Postgres, on utilise une transaction manuelle sur le pool
    const client = await query('BEGIN');
    try {
      const { rows } = await query(
        'INSERT INTO additions (client_id, total) VALUES ($1, $2) RETURNING id',
        [client_id, total]
      );
      const additionId = rows[0].id;
      
      for (const item of items) {
        await query(
          'INSERT INTO addition_items (addition_id, prestation_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
          [additionId, item.prestation_id, item.quantity, item.price_at_time]
        );
      }
      await query('COMMIT');
      res.json({ id: additionId });
    } catch (e) {
      await query('ROLLBACK');
      throw e;
    }
  } catch (error: any) {
    console.error("Error creating addition:", error);
    res.status(500).json({ error: "Erreur lors de la validation de l'addition." });
  }
});

// Notes
app.get('/api/notes', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM notes ORDER BY date DESC');
    res.json(rows);
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des notes." });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { content } = req.body;
    const { rows } = await query('INSERT INTO notes (content) VALUES ($1) RETURNING id', [content]);
    res.json({ id: rows[0].id });
  } catch (error: any) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Erreur lors de la création de la note." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

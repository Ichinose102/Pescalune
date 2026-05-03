import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initDb } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Initialisation de la DB
initDb();

// --- ROUTES ---

// Prestations (Carte)
app.get('/api/prestations', (req, res) => {
  try {
    console.log('Fetching prestations...');
    const prestations = db.prepare('SELECT * FROM prestations').all();
    console.log(`Found ${prestations.length} prestations`);
    res.json(prestations);
  } catch (error: any) {
    console.error("Error fetching prestations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des prestations." });
  }
});

app.post('/api/prestations', (req, res) => {
  const { category, name, unit_price } = req.body;
  const info = db.prepare('INSERT INTO prestations (category, name, unit_price) VALUES (?, ?, ?)').run(category, name, unit_price);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/prestations/:id', (req, res) => {
  const { id } = req.params;
  const { category, name, unit_price } = req.body;
  db.prepare('UPDATE prestations SET category = ?, name = ?, unit_price = ? WHERE id = ?').run(category, name, unit_price, id);
  res.sendStatus(200);
});

app.delete('/api/prestations/:id', (req, res) => {
  const { id } = req.params;
  try {
    // Suppression en cascade manuelle via une transaction pour "forcer" la suppression
    const deleteTransaction = db.transaction(() => {
      // 1. Supprimer les liens dans les additions
      db.prepare('DELETE FROM addition_items WHERE prestation_id = ?').run(id);
      // 2. Supprimer la prestation elle-même
      return db.prepare('DELETE FROM prestations WHERE id = ?').run(id);
    });

    const info = deleteTransaction();
    
    if (info.changes === 0) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Erreur lors de la suppression forcée de l'article." });
  }
});

app.delete('/api/prestations/category/:category', (req, res) => {
  const { category } = req.params;
  try {
    console.log(`Force deleting all prestations in category: ${category}`);
    const deleteTransaction = db.transaction(() => {
      // 1. Trouver tous les IDs de la catégorie
      const prestations = db.prepare('SELECT id FROM prestations WHERE LOWER(category) = LOWER(?)').all() as {id: number}[];
      const ids = prestations.map(p => p.id);
      
      if (ids.length > 0) {
        // 2. Supprimer les liens pour tous ces articles
        const placeholders = ids.map(() => '?').join(',');
        db.prepare(`DELETE FROM addition_items WHERE prestation_id IN (${placeholders})`).run(...ids);
        // 3. Supprimer les articles
        return db.prepare('DELETE FROM prestations WHERE LOWER(category) = LOWER(?)').run(category);
      }
      return { changes: 0 };
    });

    const info = deleteTransaction();
    res.json({ deletedCount: info.changes });
  } catch (error: any) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Erreur lors de la suppression forcée de la catégorie." });
  }
});

// Clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY last_name ASC').all();
    res.json(clients);
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des clients." });
  }
});

app.post('/api/clients', (req, res) => {
  try {
    const { last_name, first_name, phone, email } = req.body;
    const info = db.prepare('INSERT INTO clients (last_name, first_name, phone, email) VALUES (?, ?, ?, ?)').run(last_name, first_name, phone, email);
    res.json({ id: info.lastInsertRowid });
  } catch (error: any) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Erreur lors de la création du client." });
  }
});

app.put('/api/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { last_name, first_name, phone, email } = req.body;
    db.prepare('UPDATE clients SET last_name = ?, first_name = ?, phone = ?, email = ? WHERE id = ?').run(last_name, first_name, phone, email, id);
    res.sendStatus(200);
  } catch (error: any) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du client." });
  }
});

app.delete('/api/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    res.sendStatus(200);
  } catch (error: any) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Erreur lors de la suppression du client." });
  }
});

// Additions
app.get('/api/additions', (req, res) => {
  try {
    const additions = db.prepare(`
      SELECT a.*, c.last_name as client_last_name, c.first_name as client_first_name 
      FROM additions a 
      LEFT JOIN clients c ON a.client_id = c.id 
      ORDER BY a.date DESC
    `).all();
    res.json(additions);
  } catch (error: any) {
    console.error("Error fetching additions:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des additions." });
  }
});

app.get('/api/additions/:id/items', (req, res) => {
  try {
    const { id } = req.params;
    const items = db.prepare(`
      SELECT ai.*, p.name as prestation_name, p.category as prestation_category
      FROM addition_items ai
      JOIN prestations p ON ai.prestation_id = p.id
      WHERE ai.addition_id = ?
    `).all(id);
    res.json(items);
  } catch (error: any) {
    console.error("Error fetching addition items:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des détails de l'addition." });
  }
});

app.delete('/api/additions/:id', (req, res) => {
  const { id } = req.params;
  try {
    const deleteTransaction = db.transaction(() => {
      db.prepare('DELETE FROM addition_items WHERE addition_id = ?').run(id);
      return db.prepare('DELETE FROM additions WHERE id = ?').run(id);
    });
    deleteTransaction();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'addition." });
  }
});

app.post('/api/additions', (req, res) => {
  try {
    const { client_id, items, total } = req.body; // items: array of {prestation_id, quantity, price_at_time}
    
    const insertAddition = db.transaction(() => {
      const info = db.prepare('INSERT INTO additions (client_id, total) VALUES (?, ?)').run(client_id, total);
      const additionId = info.lastInsertRowid;
      
      const insertItem = db.prepare('INSERT INTO addition_items (addition_id, prestation_id, quantity, price_at_time) VALUES (?, ?, ?, ?)');
      for (const item of items) {
        insertItem.run(additionId, item.prestation_id, item.quantity, item.price_at_time);
      }
      return additionId;
    });

    const id = insertAddition();
    res.json({ id });
  } catch (error: any) {
    console.error("Error creating addition:", error);
    res.status(500).json({ error: "Erreur lors de la validation de l'addition." });
  }
});

// Notes
app.get('/api/notes', (req, res) => {
  try {
    const notes = db.prepare('SELECT * FROM notes ORDER BY date DESC').all();
    res.json(notes);
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des notes." });
  }
});

app.post('/api/notes', (req, res) => {
  try {
    const { content } = req.body;
    const info = db.prepare('INSERT INTO notes (content) VALUES (?)').run(content);
    res.json({ id: info.lastInsertRowid });
  } catch (error: any) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Erreur lors de la création de la note." });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    res.sendStatus(200);
  } catch (error: any) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la note." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

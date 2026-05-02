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
  console.log('Fetching prestations...');
  const prestations = db.prepare('SELECT * FROM prestations').all();
  console.log(`Found ${prestations.length} prestations`);
  res.json(prestations);
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
    // On essaie de supprimer
    const info = db.prepare('DELETE FROM prestations WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ 
        error: "Cet article est utilisé dans une ou plusieurs additions et ne peut pas être supprimé." 
      });
    }
    res.status(500).json({ error: "Erreur lors de la suppression de l'article." });
  }
});

app.delete('/api/prestations/category/:category', (req, res) => {
  const { category } = req.params;
  try {
    console.log(`Deleting all prestations in category: ${category}`);
    const info = db.prepare('DELETE FROM prestations WHERE LOWER(category) = LOWER(?)').run(category);
    res.json({ deletedCount: info.changes });
  } catch (error: any) {
    console.error("Delete category error:", error);
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ 
        error: "Certains articles de cette catégorie sont utilisés dans des additions et ne peuvent pas être supprimés." 
      });
    }
    res.status(500).json({ error: "Erreur lors de la suppression de la catégorie." });
  }
});

// Clients
app.get('/api/clients', (req, res) => {
  const clients = db.prepare('SELECT * FROM clients ORDER BY last_name ASC').all();
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  const { last_name, first_name, phone, email } = req.body;
  const info = db.prepare('INSERT INTO clients (last_name, first_name, phone, email) VALUES (?, ?, ?, ?)').run(last_name, first_name, phone, email);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const { last_name, first_name, phone, email } = req.body;
  db.prepare('UPDATE clients SET last_name = ?, first_name = ?, phone = ?, email = ? WHERE id = ?').run(last_name, first_name, phone, email, id);
  res.sendStatus(200);
});

app.delete('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  res.sendStatus(200);
});

// Additions
app.get('/api/additions', (req, res) => {
  const additions = db.prepare(`
    SELECT a.*, c.last_name as client_last_name, c.first_name as client_first_name 
    FROM additions a 
    LEFT JOIN clients c ON a.client_id = c.id 
    ORDER BY a.date DESC
  `).all();
  res.json(additions);
});

app.post('/api/additions', (req, res) => {
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
});

// Notes
app.get('/api/notes', (req, res) => {
  const notes = db.prepare('SELECT * FROM notes ORDER BY date DESC').all();
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const { content } = req.body;
  const info = db.prepare('INSERT INTO notes (content) VALUES (?)').run(content);
  res.json({ id: info.lastInsertRowid });
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

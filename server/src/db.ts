import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '../../pescalune.db'));
db.pragma('journal_mode = WAL');

// Initialisation des tables
export const initDb = () => {
  // Table de la Carte (Prestations)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS prestations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      unit_price REAL NOT NULL
    )
  `).run();

  // Table des Clients
  db.prepare(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      last_name TEXT NOT NULL,
      first_name TEXT,
      phone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Table des Additions
  db.prepare(`
    CREATE TABLE IF NOT EXISTS additions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      total REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (client_id) REFERENCES clients (id)
    )
  `).run();

  // Table des détails de l'addition (Lignes de facture)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS addition_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      addition_id INTEGER NOT NULL,
      prestation_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_time REAL NOT NULL,
      FOREIGN KEY (addition_id) REFERENCES additions (id),
      FOREIGN KEY (prestation_id) REFERENCES prestations (id)
    )
  `).run();

  // Table des Notes
  db.prepare(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Insertion de données de test si vide
  const count = db.prepare('SELECT COUNT(*) as count FROM prestations').get() as { count: number };
  console.log(`Initialisation DB: ${count.count} prestations trouvées.`);
  if (count.count === 0) {
    console.log("Insertion des prestations par défaut...");
    const insertPrestation = db.prepare('INSERT INTO prestations (category, name, unit_price) VALUES (?, ?, ?)');
    insertPrestation.run('Hébergement', 'Chambre Double', 120.0);
    insertPrestation.run('Petits-déjeuners', 'Petit-déjeuner Continental', 15.0);
    insertPrestation.run('Repas', 'Dîner Gastronomique', 45.0);
    insertPrestation.run('Activités', 'Balade en bateau', 30.0);
    console.log("Prestations par défaut insérées.");
  }
};

export default db;

import sql from './db';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM clients ORDER BY last_name ASC`;
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des clients.' });
    }
  } else if (req.method === 'POST') {
    try {
      const { last_name, first_name, phone, email } = req.body;
      const { rows } = await sql`
        INSERT INTO clients (last_name, first_name, phone, email) 
        VALUES (${last_name}, ${first_name}, ${phone}, ${email}) 
        RETURNING id
      `;
      res.status(200).json({ id: rows[0].id });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création du client.' });
    }
  } else {
    res.status(405).end();
  }
}

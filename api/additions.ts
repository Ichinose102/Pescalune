import pool from './db';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(`
        SELECT a.*, c.last_name as client_last_name, c.first_name as client_first_name 
        FROM additions a 
        LEFT JOIN clients c ON a.client_id = c.id 
        ORDER BY a.date DESC
      `);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des additions.' });
    }
  } else if (req.method === 'POST') {
    try {
      const { client_id, items, total } = req.body;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          'INSERT INTO additions (client_id, total) VALUES ($1, $2) RETURNING id',
          [client_id, total]
        );
        const additionId = rows[0].id;
        
        for (const item of items) {
          await client.query(
            'INSERT INTO addition_items (addition_id, prestation_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
            [additionId, item.prestation_id, item.quantity, item.price_at_time]
          );
        }
        await client.query('COMMIT');
        res.status(200).json({ id: additionId });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la validation de l\'addition.' });
    }
  } else {
    res.status(405).end();
  }
}

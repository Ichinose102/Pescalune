import sql from './db';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT a.*, c.last_name as client_last_name, c.first_name as client_first_name 
        FROM additions a 
        LEFT JOIN clients c ON a.client_id = c.id 
        ORDER BY a.date DESC
      `;
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des additions.' });
    }
  } else if (req.method === 'POST') {
    try {
      const { client_id, items, total } = req.body;
      
      await sql`BEGIN`;
      try {
        const { rows } = await sql`
          INSERT INTO additions (client_id, total) 
          VALUES (${client_id || null}, ${total}) 
          RETURNING id
        `;
        const additionId = rows[0].id;
        
        for (const item of items) {
          await sql`
            INSERT INTO addition_items (addition_id, prestation_id, quantity, price_at_time) 
            VALUES (${additionId}, ${item.prestation_id}, ${item.quantity}, ${item.price_at_time})
          `;
        }
        await sql`COMMIT`;
        res.status(200).json({ id: additionId });
      } catch (e) {
        await sql`ROLLBACK`;
        throw e;
      }
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la validation de l\'addition.' });
    }
  } else {
    res.status(405).end();
  }
}

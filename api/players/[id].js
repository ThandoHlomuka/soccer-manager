const db = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Player ID is required.' });
  const { method, body } = req;

  try {
    if (method === 'GET') {
      const player = await db.get('player', id);
      if (!player) return res.status(404).json({ error: 'Player not found.' });
      return res.json(player);
    }

    if (method === 'PUT') {
      const player = await db.update('player', id, body || {});
      return res.json(player);
    }

    if (method === 'DELETE') {
      await db.remove('player', id);
      return res.json({ success: true });
    }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  res.status(405).json({ error: 'Method not allowed.' });
};

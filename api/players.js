const db = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { method, body } = req;

  try {
    if (method === 'GET') {
      const players = await db.list('player');
      if (req.query.teamId) {
        const filtered = players.filter(p => p.teamId === req.query.teamId);
        return res.json({ players: filtered });
      }
      return res.json({ players });
    }

    if (method === 'POST') {
      const { name, number, position, teamId, nationality } = body || {};
      if (!name || !teamId) return res.status(400).json({ error: 'Player name and teamId are required.' });
      const id = db.uid();
      const player = {
        id, name, number: number || 0, position: position || 'MF', teamId, nationality: nationality || '',
        goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0, cleanSheets: 0,
      };
      await db.create('player', id, player);
      return res.status(201).json(player);
    }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  res.status(405).json({ error: 'Method not allowed.' });
};

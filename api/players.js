const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        const player = await db.get('player', id);
        if (!player) return res.status(404).json({ error: 'Player not found.' });
        return res.json(player);
      }
      const players = await db.list('player');
      if (req.query.teamId) {
        const filtered = players.filter(p => p.teamId === req.query.teamId);
        return res.json({ players: filtered });
      }
      return res.json({ players });
    }

    if (req.method === 'POST') {
      const { name, number, position, teamId, nationality, foot, diet, pace, shooting, passing, defending, dribbling, physical } = req.body || {};
      if (!name || !teamId) return res.status(400).json({ error: 'Player name and teamId are required.' });
      const pid = db.uid();
      const player = {
        id: pid, name, number: number || 0, position: position || 'MID', teamId, nationality: nationality || '',
        foot: foot || 'right', diet: diet || '',
        pace: pace || 50, shooting: shooting || 50, passing: passing || 50,
        defending: defending || 50, dribbling: dribbling || 50, physical: physical || 50,
        goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0, cleanSheets: 0,
      };
      await db.create('player', pid, player);
      return res.status(201).json(player);
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Player ID is required.' });
      const player = await db.update('player', id, req.body || {});
      return res.json(player);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Player ID is required.' });
      await db.remove('player', id);
      return res.json({ success: true });
    }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  res.status(405).json({ error: 'Method not allowed.' });
};

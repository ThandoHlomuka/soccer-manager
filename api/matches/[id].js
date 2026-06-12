const db = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Match ID is required.' });
  const { method, body } = req;

  try {
    if (method === 'GET') {
      const match = await db.get('match', id);
      if (!match) return res.status(404).json({ error: 'Match not found.' });
      const teams = await db.list('team');
      const teamMap = {};
      teams.forEach(t => teamMap[t.id] = t);
      return res.json({ ...match, homeTeam: teamMap[match.homeTeamId] || null, awayTeam: teamMap[match.awayTeamId] || null });
    }

    if (method === 'PUT') {
      const match = await db.update('match', id, body || {});
      return res.json(match);
    }

    if (method === 'DELETE') {
      await db.remove('match', id);
      return res.json({ success: true });
    }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  res.status(405).json({ error: 'Method not allowed.' });
};

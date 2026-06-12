const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { method, body } = req;

  try {
    if (method === 'GET') {
      const teams = await db.list('team');
      return res.json({ teams });
    }

    if (method === 'POST') {
      const { name, shortName, stadium, founded, colors, logo } = body || {};
      if (!name) return res.status(400).json({ error: 'Team name is required.' });
      const id = db.uid();
      const team = { id, name, shortName: shortName || name.substring(0, 3).toUpperCase(), stadium: stadium || '', founded: founded || '', colors: colors || ['#000000', '#ffffff'], logo: logo || '' };
      await db.create('team', id, team);
      return res.status(201).json(team);
    }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  res.status(405).json({ error: 'Method not allowed.' });
};

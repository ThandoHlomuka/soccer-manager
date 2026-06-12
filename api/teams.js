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
        const team = await db.get('team', id);
        if (!team) return res.status(404).json({ error: 'Team not found.' });
        return res.json(team);
      }
      const teams = await db.list('team');
      return res.json({ teams });
    }

    if (req.method === 'POST') {
      const { name, shortName, stadium, founded, colors, logo } = req.body || {};
      if (!name) return res.status(400).json({ error: 'Team name is required.' });
      const tid = db.uid();
      const team = { id: tid, name, shortName: shortName || name.substring(0, 3).toUpperCase(), stadium: stadium || '', founded: founded || '', colors: colors || ['#000000', '#ffffff'], logo: logo || '' };
      await db.create('team', tid, team);
      return res.status(201).json(team);
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Team ID is required.' });
      const team = await db.update('team', id, req.body || {});
      return res.json(team);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Team ID is required.' });
      await db.remove('team', id);
      return res.json({ success: true });
    }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  res.status(405).json({ error: 'Method not allowed.' });
};

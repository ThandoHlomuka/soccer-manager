const db = require('../../lib/db');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Transfer ID is required.' });
  try {
    if (req.method === 'GET') { const t = await db.get('transfer', id); if (!t) return res.status(404).json({ error: 'Transfer not found.' }); return res.json(t); }
    if (req.method === 'PUT') { const t = await db.update('transfer', id, req.body || {}); return res.json(t); }
    if (req.method === 'DELETE') { await db.remove('transfer', id); return res.json({ success: true }); }
  } catch (err) { return res.status(err.status || 500).json({ error: err.message }); }
  res.status(405).json({ error: 'Method not allowed.' });
};

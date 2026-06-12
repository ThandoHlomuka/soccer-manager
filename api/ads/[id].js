const db = require('../../lib/db');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Ad ID is required.' });
  try {
    if (req.method === 'GET') { const ad = await db.get('ad', id); if (!ad) return res.status(404).json({ error: 'Ad not found.' }); return res.json(ad); }
    if (req.method === 'PUT') { const ad = await db.update('ad', id, req.body || {}); return res.json(ad); }
    if (req.method === 'DELETE') { await db.remove('ad', id); return res.json({ success: true }); }
  } catch (err) { return res.status(err.status || 500).json({ error: err.message }); }
  res.status(405).json({ error: 'Method not allowed.' });
};

const db = require('../lib/db');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Ad ID required.' });
  try {
    const ad = await db.get('ad', id);
    if (ad) { ad.clicks = (ad.clicks || 0) + 1; await db.update('ad', id, ad); }
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
};

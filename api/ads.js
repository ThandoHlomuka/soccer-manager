const db = require('../lib/db');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    if (req.method === 'GET') {
      const ads = await db.list('ad');
      return res.json({ ads });
    }
    if (req.method === 'POST') {
      const { advertiser, product, description, imageUrl, linkUrl, status, clicks } = req.body || {};
      if (!advertiser) return res.status(400).json({ error: 'Advertiser is required.' });
      const id = db.uid();
      const ad = {
        id, advertiser, product: product || '', description: description || '',
        imageUrl: imageUrl || '', linkUrl: linkUrl || '',
        status: status || 'active', clicks: clicks || 0, createdAt: Date.now(),
      };
      await db.create('ad', id, ad);
      return res.status(201).json(ad);
    }
  } catch (err) { return res.status(err.status || 500).json({ error: err.message }); }
  res.status(405).json({ error: 'Method not allowed.' });
};

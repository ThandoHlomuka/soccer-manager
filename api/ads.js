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
        const ad = await db.get('ad', id);
        if (!ad) return res.status(404).json({ error: 'Ad not found.' });
        return res.json(ad);
      }
      const ads = await db.list('ad');
      return res.json({ ads });
    }

    if (req.method === 'POST') {
      const { advertiser, product, description, imageUrl, linkUrl, status, clicks } = req.body || {};
      if (!advertiser) return res.status(400).json({ error: 'Advertiser is required.' });
      const aid = db.uid();
      const ad = {
        id: aid, advertiser, product: product || '', description: description || '',
        imageUrl: imageUrl || '', linkUrl: linkUrl || '',
        status: status || 'active', clicks: clicks || 0, createdAt: Date.now(),
      };
      await db.create('ad', aid, ad);
      return res.status(201).json(ad);
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Ad ID is required.' });
      const ad = await db.update('ad', id, req.body || {});
      return res.json(ad);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Ad ID is required.' });
      await db.remove('ad', id);
      return res.json({ success: true });
    }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  res.status(405).json({ error: 'Method not allowed.' });
};

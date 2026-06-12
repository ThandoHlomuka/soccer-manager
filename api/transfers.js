const db = require('../lib/db');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    if (req.method === 'GET') {
      const transfers = await db.list('transfer');
      const players = await db.list('player');
      const teams = await db.list('team');
      const playerMap = {}; players.forEach(p => playerMap[p.id] = p);
      const teamMap = {}; teams.forEach(t => teamMap[t.id] = t);
      const enriched = transfers.map(t => ({
        ...t,
        playerName: playerMap[t.playerId]?.name || 'Unknown',
        player: playerMap[t.playerId] || null,
        fromTeam: teamMap[t.fromTeamId] || null,
        toTeam: t.toTeamId ? (teamMap[t.toTeamId] || null) : null,
      }));
      enriched.sort((a, b) => (b.listedAt || 0) - (a.listedAt || 0));
      return res.json({ transfers: enriched });
    }
    if (req.method === 'POST') {
      const { playerId, fromTeamId, toTeamId, fee, date, status } = req.body || {};
      if (!playerId || !fromTeamId) return res.status(400).json({ error: 'playerId and fromTeamId are required.' });
      const id = db.uid();
      const transfer = {
        id, playerId, fromTeamId, toTeamId: toTeamId || null,
        fee: fee || 0, date: date || '', status: status || 'pending',
        listedAt: Date.now(),
      };
      await db.create('transfer', id, transfer);
      return res.status(201).json(transfer);
    }
  } catch (err) { return res.status(err.status || 500).json({ error: err.message }); }
  res.status(405).json({ error: 'Method not allowed.' });
};

const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    const players = await db.list('player');
    const teams = await db.list('team');
    const teamMap = {};
    teams.forEach(t => teamMap[t.id] = t);

    const enriched = players.map(p => ({ ...p, teamName: teamMap[p.teamId]?.name || 'Unknown' }));

    const topScorers = [...enriched].sort((a, b) => (b.goals || 0) - (a.goals || 0)).slice(0, 20);
    const topAssists = [...enriched].sort((a, b) => (b.assists || 0) - (a.assists || 0)).slice(0, 20);
    const mostCards = [...enriched].sort((a, b) => ((b.yellowCards || 0) + (b.redCards || 0)) - ((a.yellowCards || 0) + (a.redCards || 0))).slice(0, 20);
    const mostAppearances = [...enriched].sort((a, b) => (b.appearances || 0) - (a.appearances || 0)).slice(0, 20);
    const topCleanSheets = [...enriched].sort((a, b) => (b.cleanSheets || 0) - (a.cleanSheets || 0)).slice(0, 20);

    return res.json({ topScorers, topAssists, mostCards, mostAppearances, topCleanSheets });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

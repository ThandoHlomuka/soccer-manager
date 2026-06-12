const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    const teams = await db.list('team');
    const matches = await db.list('match');
    const played = matches.filter(m => m.homeScore != null && m.awayScore != null);

    const standings = {};
    teams.forEach(t => {
      standings[t.id] = { teamId: t.id, teamName: t.name, shortName: t.shortName, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 };
    });

    for (const m of played) {
      if (!standings[m.homeTeamId] || !standings[m.awayTeamId]) continue;
      const h = standings[m.homeTeamId];
      const a = standings[m.awayTeamId];
      h.played++; a.played++;
      h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
      a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;

      if (m.homeScore > m.awayScore) { h.won++; a.lost++; h.points += 3; }
      else if (m.homeScore < m.awayScore) { a.won++; h.lost++; a.points += 3; }
      else { h.drawn++; a.drawn++; h.points++; a.points++; }
    }

    Object.values(standings).forEach(s => { s.goalDiff = s.goalsFor - s.goalsAgainst; });

    const sorted = Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });

    return res.json({ standings: sorted });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

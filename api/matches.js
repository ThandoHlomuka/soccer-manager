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
        const match = await db.get('match', id);
        if (!match) return res.status(404).json({ error: 'Match not found.' });
        const teams = await db.list('team');
        const teamMap = {};
        teams.forEach(t => teamMap[t.id] = t);
        return res.json({ ...match, homeTeam: teamMap[match.homeTeamId] || null, awayTeam: teamMap[match.awayTeamId] || null });
      }
      const matches = await db.list('match');
      const teams = await db.list('team');
      const teamMap = {};
      teams.forEach(t => teamMap[t.id] = t);
      const enriched = matches.map(m => ({ ...m, homeTeam: teamMap[m.homeTeamId] || null, awayTeam: teamMap[m.awayTeamId] || null }));
      enriched.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      return res.json({ matches: enriched });
    }

    if (req.method === 'POST') {
      const { homeTeamId, awayTeamId, date, time, venue, homeScore, awayScore, status, events } = req.body || {};
      if (!homeTeamId || !awayTeamId || !date) {
        return res.status(400).json({ error: 'homeTeamId, awayTeamId, and date are required.' });
      }
      if (homeTeamId === awayTeamId) {
        return res.status(400).json({ error: 'A team cannot play against itself.' });
      }

      const mid = db.uid();
      const match = {
        id: mid, homeTeamId, awayTeamId, date: date || '', time: time || '',
        venue: venue || '', homeScore: homeScore != null ? homeScore : null,
        awayScore: awayScore != null ? awayScore : null,
        status: status || 'scheduled', events: events || [],
      };

      await db.create('match', mid, match);

      if (match.homeScore != null && match.awayScore != null) {
        await updatePlayerStats(match);
      }

      return res.status(201).json(match);
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Match ID is required.' });
      const match = await db.update('match', id, req.body || {});
      return res.json(match);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Match ID is required.' });
      await db.remove('match', id);
      return res.json({ success: true });
    }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  res.status(405).json({ error: 'Method not allowed.' });
};

async function updatePlayerStats(match) {
  for (const evt of match.events || []) {
    if (evt.type === 'goal' && evt.playerId) {
      try { const p = await db.get('player', evt.playerId); if (p) { p.goals = (p.goals || 0) + 1; await db.update('player', evt.playerId, p); } } catch {}
    }
    if (evt.type === 'assist' && evt.playerId) {
      try { const p = await db.get('player', evt.playerId); if (p) { p.assists = (p.assists || 0) + 1; await db.update('player', evt.playerId, p); } } catch {}
    }
    if (evt.type === 'yellowCard' && evt.playerId) {
      try { const p = await db.get('player', evt.playerId); if (p) { p.yellowCards = (p.yellowCards || 0) + 1; await db.update('player', evt.playerId, p); } } catch {}
    }
    if (evt.type === 'redCard' && evt.playerId) {
      try { const p = await db.get('player', evt.playerId); if (p) { p.redCards = (p.redCards || 0) + 1; await db.update('player', evt.playerId, p); } } catch {}
    }
  }

  const homePlayers = (await db.list('player')).filter(p => p.teamId === match.homeTeamId);
  const awayPlayers = (await db.list('player')).filter(p => p.teamId === match.awayTeamId);

  for (const p of [...homePlayers, ...awayPlayers]) {
    try {
      const player = await db.get('player', p.id);
      if (player) {
        player.appearances = (player.appearances || 0) + 1;
        if (player.teamId === match.homeTeamId && match.awayScore === 0 && match.homeScore > 0) {
          player.cleanSheets = (player.cleanSheets || 0) + 1;
        }
        if (player.teamId === match.awayTeamId && match.homeScore === 0 && match.awayScore > 0) {
          player.cleanSheets = (player.cleanSheets || 0) + 1;
        }
        await db.update('player', player.id, player);
      }
    } catch {}
  }
}

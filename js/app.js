/* ─── State ─── */
const state = { teams: [], players: [], matches: [] };
const $ = id => document.getElementById(id);
const views = document.querySelectorAll('.view');
const navLinks = document.querySelectorAll('.nav-link');

/* ─── API client ─── */
const api = {
  async get(url) { const r = await fetch(url); return r.json(); },
  async post(url, b) { const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(b) }); return r.json(); },
  async put(url, b) { const r = await fetch(url, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(b) }); return r.json(); },
  async del(url) { const r = await fetch(url, { method:'DELETE' }); return r.json(); },
};

/* ─── Navigation ─── */
function navigate(viewName) {
  views.forEach(v => v.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const view = document.getElementById(`view-${viewName}`);
  if (view) { view.classList.add('active'); view.style.animation = 'none'; void view.offsetHeight; view.style.animation = 'fadeIn 0.3s ease'; }
  const link = document.querySelector(`.nav-link[data-view="${viewName}"]`);
  if (link) link.classList.add('active');
  renderView(viewName);
}

function handleHash() { navigate(location.hash.replace('#','') || 'dashboard'); }
navLinks.forEach(l => l.addEventListener('click', e => { e.preventDefault(); location.hash = l.dataset.view; }));
window.addEventListener('hashchange', handleHash);

/* ─── Modal helpers ─── */
function openModal(id) { const el = $(id); if (el) { el.style.display = 'flex'; setTimeout(() => el.classList.add('open'), 10); document.body.style.overflow = 'hidden'; } }
function closeModal(id) { const el = $(id); if (el) { el.classList.remove('open'); el.style.display = 'none'; document.body.style.overflow = ''; } }
document.addEventListener('click', e => {
  const c = e.target.closest('[data-close]'); if (c) closeModal(c.dataset.close);
  if (e.target.classList.contains('modal-backdrop')) closeModal(e.target.id);
});

/* ─── Toast ─── */
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ─── Animate counter ─── */
function animateCounter(el, target, dur = 800) {
  const start = performance.now();
  const from = 0;
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor(from + (target - from) * easeOut(p));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

/* ─── Load data ─── */
async function loadAll() {
  const [tr, pr, mr] = await Promise.all([api.get('/api/teams'), api.get('/api/players'), api.get('/api/matches')]);
  state.teams = tr.teams || []; state.players = pr.players || []; state.matches = mr.matches || [];
  if (!state.teams.length && !state.players.length && !state.matches.length) await seedData();
}

/* ─── Seed data ─── */
async function seedData() {
  const teamsData = [
    { name:'Arsenal', shortName:'ARS', stadium:'Emirates Stadium', founded:'1886', colors:['#ef0107','#ffffff'] },
    { name:'Chelsea', shortName:'CHE', stadium:'Stamford Bridge', founded:'1905', colors:['#034694','#ffffff'] },
    { name:'Liverpool', shortName:'LIV', stadium:'Anfield', founded:'1892', colors:['#c8102e','#ffffff'] },
    { name:'Manchester City', shortName:'MCI', stadium:'Etihad Stadium', founded:'1880', colors:['#6cabdd','#ffffff'] },
    { name:'Manchester United', shortName:'MUN', stadium:'Old Trafford', founded:'1878', colors:['#da291c','#fbe122'] },
    { name:'Tottenham', shortName:'TOT', stadium:'Tottenham Hotspur Stadium', founded:'1882', colors:['#132257','#ffffff'] },
  ];
  const created = [];
  for (const t of teamsData) {
    const r = await api.post('/api/teams', t);
    created.push(r);
  }
  state.teams = created;

  const playersData = [
    { name:'Bukayo Saka', number:7, position:'FW', teamId:created[0].id, nationality:'England' },
    { name:'Martin Ødegaard', number:8, position:'MID', teamId:created[0].id, nationality:'Norway' },
    { name:'Gabriel Jesus', number:9, position:'FW', teamId:created[0].id, nationality:'Brazil' },
    { name:'Cole Palmer', number:20, position:'MID', teamId:created[1].id, nationality:'England' },
    { name:'Enzo Fernández', number:8, position:'MID', teamId:created[1].id, nationality:'Argentina' },
    { name:'Raheem Sterling', number:7, position:'FW', teamId:created[1].id, nationality:'England' },
    { name:'Mohamed Salah', number:11, position:'FW', teamId:created[2].id, nationality:'Egypt' },
    { name:'Virgil van Dijk', number:4, position:'DEF', teamId:created[2].id, nationality:'Netherlands' },
    { name:'Alisson Becker', number:1, position:'GK', teamId:created[2].id, nationality:'Brazil' },
    { name:'Erling Haaland', number:9, position:'FW', teamId:created[3].id, nationality:'Norway' },
    { name:'Kevin De Bruyne', number:17, position:'MID', teamId:created[3].id, nationality:'Belgium' },
    { name:'Phil Foden', number:47, position:'MID', teamId:created[3].id, nationality:'England' },
    { name:'Bruno Fernandes', number:8, position:'MID', teamId:created[4].id, nationality:'Portugal' },
    { name:'Marcus Rashford', number:10, position:'FW', teamId:created[4].id, nationality:'England' },
    { name:'Casemiro', number:18, position:'MID', teamId:created[4].id, nationality:'Brazil' },
    { name:'Son Heung-min', number:7, position:'FW', teamId:created[5].id, nationality:'South Korea' },
    { name:'James Maddison', number:10, position:'MID', teamId:created[5].id, nationality:'England' },
    { name:'Cristian Romero', number:13, position:'DEF', teamId:created[5].id, nationality:'Argentina' },
  ];
  const pl = [];
  for (const p of playersData) {
    const r = await api.post('/api/players', p);
    pl.push(r);
  }
  state.players = pl;

  const fix = [
    { home:0, away:2, h:2, a:1 }, { home:3, away:4, h:3, a:0 }, { home:5, away:1, h:1, a:1 }, { home:4, away:0, h:1, a:2 },
    { home:1, away:3, h:0, a:2 }, { home:2, away:5, h:4, a:0 }, { home:0, away:3, h:1, a:1 }, { home:4, away:5, h:2, a:0 },
    { home:2, away:1, h:3, a:1 }, { home:3, away:5, h:5, a:0 },
  ];
  const now = new Date();
  for (let i = 0; i < fix.length; i++) {
    const d = new Date(now); d.setDate(d.getDate() - (fix.length - i) * 3);
    await api.post('/api/matches', {
      homeTeamId: created[fix[i].home].id, awayTeamId: created[fix[i].away].id,
      date: d.toISOString().split('T')[0], time: '20:00', venue: created[fix[i].home].stadium,
      homeScore: fix[i].h, awayScore: fix[i].a, status: 'played',
    });
  }
  state.matches = (await api.get('/api/matches')).matches || [];
}

/* ─── Render views ─── */
async function renderView(view) {
  await loadAll();
  populateTeamSelects();
  if (view === 'dashboard') renderDashboard();
  else if (view === 'teams') renderTeams();
  else if (view === 'players') renderPlayers();
  else if (view === 'matches') renderMatches();
  else if (view === 'standings') renderStandings();
  else if (view === 'stats') renderStats();
}

/* ─── Dashboard ─── */
function renderDashboard() {
  const played = state.matches.filter(m => m.homeScore != null);
  const totalGoals = played.reduce((s, m) => s + (m.homeScore || 0) + (m.awayScore || 0), 0);
  animateCounter($('stat-teams-count'), state.teams.length);
  animateCounter($('stat-players-count'), state.players.length);
  animateCounter($('stat-matches-count'), played.length);
  animateCounter($('stat-goals-count'), totalGoals);

  const recent = [...state.matches].sort((a, b) => new Date(b.date||0) - new Date(a.date||0)).slice(0, 5);
  $('recent-matches-list').innerHTML = recent.length
    ? recent.map(m => {
        const s = m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : 'v';
        return `<div class="dash-item"><div class="left"><span class="badge badge-${m.status}">${m.status}</span><span>${m.homeTeam?.shortName||'?'} vs ${m.awayTeam?.shortName||'?'}</span></div><span class="score">${s}</span></div>`;
      }).join('')
    : '<div class="empty"><p>No matches yet</p></div>';

  const scorers = [...state.players].sort((a, b) => (b.goals||0) - (a.goals||0)).slice(0, 5);
  $('top-scorers-list').innerHTML = scorers.length
    ? scorers.map(p => `<div class="dash-item"><div class="left">${esc(p.name)}</div><span class="score">${p.goals||0} goals</span></div>`).join('')
    : '<div class="empty"><p>No players yet</p></div>';
}

/* ─── Teams ─── */
function renderTeams() {
  const list = $('teams-list');
  if (!state.teams.length) { list.innerHTML = '<div class="empty"><p>No teams yet</p></div>'; return; }
  list.innerHTML = state.teams.map(t => `
    <div class="glass-card team-card">
      <div class="team-badge" style="background:linear-gradient(135deg,${t.colors?.[0]||'#666'},${t.colors?.[1]||'#999'})"></div>
      <div class="team-info"><div class="team-name">${esc(t.name)}</div><div class="team-meta">${esc(t.shortName||'')}${t.stadium ? ' · '+esc(t.stadium) : ''}${t.founded ? ' · Est. '+esc(t.founded) : ''}</div></div>
      <div class="card-actions"><button class="btn btn-outline btn-sm" onclick="editTeam('${t.id}')">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteTeam('${t.id}')">Del</button></div>
    </div>`).join('');
}

$('add-team-btn').addEventListener('click', () => { $('team-form').reset(); $('team-id').value = ''; $('team-modal-title').textContent = 'Add Team'; openModal('team-modal'); });

$('team-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('team-id').value, d = { name:$('team-name').value, shortName:$('team-short-name').value, stadium:$('team-stadium').value, founded:$('team-founded').value, colors:[$('team-color1').value,$('team-color2').value] };
  if (id) { await api.put(`/api/teams/${id}`, d); showToast('Team updated.'); }
  else { await api.post('/api/teams', d); showToast('Team created.'); }
  closeModal('team-modal'); renderTeams(); populateTeamSelects();
});

window.editTeam = async id => {
  const t = await api.get(`/api/teams/${id}`);
  $('team-id').value = t.id; $('team-name').value = t.name||''; $('team-short-name').value = t.shortName||''; $('team-stadium').value = t.stadium||''; $('team-founded').value = t.founded||''; $('team-color1').value = t.colors?.[0]||'#e00000'; $('team-color2').value = t.colors?.[1]||'#ffffff';
  $('team-modal-title').textContent = 'Edit Team'; openModal('team-modal');
};

window.deleteTeam = async id => {
  if (!confirm('Delete this team?')) return;
  await api.del(`/api/teams/${id}`); showToast('Team deleted.'); renderTeams(); populateTeamSelects();
};

/* ─── Players ─── */
function renderPlayers() {
  const filter = $('player-team-filter');
  if (filter) {
    const pv = filter.value;
    filter.innerHTML = '<option value="">All Teams</option>'+state.teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
    filter.value = pv;
  }
  let list = state.players;
  if (filter && filter.value) list = list.filter(p => p.teamId === filter.value);
  const container = $('players-list');
  if (!list.length) { container.innerHTML = '<div class="empty"><p>No players found</p></div>'; return; }
  container.innerHTML = list.map(p => {
    const team = state.teams.find(t => t.id === p.teamId);
    return `<div class="glass-card player-card"><div class="player-avatar">${(p.name||'?')[0]}</div><div class="player-info"><div class="player-name">${esc(p.name)} <span class="pos-badge">${p.position||'MID'}</span> ${p.number ? '#'+p.number : ''}</div><div class="player-meta">${team ? esc(team.name) : 'No team'}${p.nationality ? ' · '+esc(p.nationality) : ''}</div><div class="player-stats-row"><div class="player-stat-item"><div class="val">${p.goals||0}</div><div class="lbl">G</div></div><div class="player-stat-item"><div class="val">${p.assists||0}</div><div class="lbl">A</div></div><div class="player-stat-item"><div class="val">${p.appearances||0}</div><div class="lbl">Apps</div></div></div></div><div class="card-actions"><button class="btn btn-outline btn-sm" onclick="editPlayer('${p.id}')">Edit</button><button class="btn btn-danger btn-sm" onclick="deletePlayer('${p.id}')">Del</button></div></div>`;
  }).join('');
}

if ($('player-team-filter')) $('player-team-filter').addEventListener('change', renderPlayers);

$('add-player-btn').addEventListener('click', () => { $('player-form').reset(); $('player-id').value = ''; $('player-modal-title').textContent = 'Add Player'; openModal('player-modal'); });

$('player-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('player-id').value, d = { name:$('player-name').value, number:parseInt($('player-number').value)||0, position:$('player-position').value, teamId:$('player-team-id').value, nationality:$('player-nationality').value };
  if (id) { await api.put(`/api/players/${id}`, d); showToast('Player updated.'); }
  else { await api.post('/api/players', d); showToast('Player created.'); }
  closeModal('player-modal'); renderPlayers();
});

window.editPlayer = async id => {
  const p = await api.get(`/api/players/${id}`);
  $('player-id').value = p.id; $('player-name').value = p.name||''; $('player-number').value = p.number||''; $('player-position').value = p.position||'MID'; $('player-nationality').value = p.nationality||''; $('player-team-id').value = p.teamId||'';
  $('player-modal-title').textContent = 'Edit Player'; openModal('player-modal');
};

window.deletePlayer = async id => {
  if (!confirm('Delete this player?')) return;
  await api.del(`/api/players/${id}`); showToast('Player deleted.'); renderPlayers();
};

/* ─── Matches ─── */
function renderMatches() {
  const container = $('matches-list');
  if (!state.matches.length) { container.innerHTML = '<div class="empty"><p>No matches yet</p></div>'; return; }
  container.innerHTML = state.matches.map(m => {
    const s = m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : '<span class="vs">vs</span>';
    const sc = m.homeScore != null ? '' : 'pending';
    const bc = m.status === 'played' ? 'badge-played' : m.status === 'postponed' ? 'badge-postponed' : 'badge-scheduled';
    return `<div class="glass-card match-card"><div class="match-header"><span>${m.date||'TBD'} ${m.time||''}</span><span class="badge ${bc}">${m.status}</span></div><div class="match-scoreboard"><div class="match-team"><div class="name">${m.homeTeam?.shortName||'?'}</div></div><div class="match-score-display ${sc}">${s}</div><div class="match-team"><div class="name">${m.awayTeam?.shortName||'?'}</div></div></div><div class="match-footer"><span>${esc(m.venue||'')}</span><span><button class="btn btn-outline btn-sm" onclick="editMatch('${m.id}')">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteMatch('${m.id}')">Del</button></span></div></div>`;
  }).join('');
}

$('schedule-match-btn').addEventListener('click', () => { $('match-form').reset(); $('match-id').value = ''; $('match-modal-title').textContent = 'Schedule Match'; openModal('match-modal'); });

$('match-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('match-id').value;
  const d = { homeTeamId:$('match-home-team-id').value, awayTeamId:$('match-away-team-id').value, date:$('match-date').value, time:$('match-time').value, venue:$('match-venue').value, homeScore:$('match-home-score').value !== '' ? parseInt($('match-home-score').value) : null, awayScore:$('match-away-score').value !== '' ? parseInt($('match-away-score').value) : null, status:$('match-status').value };
  if (!d.homeTeamId||!d.awayTeamId) { showToast('Select both teams.'); return; }
  if (d.homeTeamId===d.awayTeamId) { showToast('Team cannot play itself.'); return; }
  if (id) { await api.put(`/api/matches/${id}`, d); showToast('Match updated.'); }
  else { await api.post('/api/matches', d); showToast('Match scheduled.'); }
  closeModal('match-modal'); renderMatches();
});

window.editMatch = async id => {
  const m = await api.get(`/api/matches/${id}`);
  $('match-id').value = m.id; $('match-home-team-id').value = m.homeTeamId; $('match-away-team-id').value = m.awayTeamId; $('match-date').value = m.date||''; $('match-time').value = m.time||''; $('match-venue').value = m.venue||''; $('match-home-score').value = m.homeScore??''; $('match-away-score').value = m.awayScore??''; $('match-status').value = m.status||'scheduled';
  $('match-modal-title').textContent = 'Edit Match'; openModal('match-modal');
};

window.deleteMatch = async id => {
  if (!confirm('Delete this match?')) return;
  await api.del(`/api/matches/${id}`); showToast('Match deleted.'); renderMatches();
};

/* ─── Standings ─── */
async function renderStandings() {
  const res = await api.get('/api/standings');
  const st = res.standings || [];
  const container = $('standings-table');
  if (!st.length) { container.innerHTML = '<div class="empty"><p>No standings data yet</p></div>'; return; }
  container.innerHTML = `<div class="table-wrap"><table><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead><tbody>${st.map((s,i)=>{const t=state.teams.find(t=>t.id===s.teamId);const c=t?.colors||['#666','#999'];const posClass=i<3?`pos pos-${i+1}`:'pos';return `<tr><td class="${posClass}">${i+1}</td><td><div class="team-cell"><div class="team-badge-sm" style="background:linear-gradient(135deg,${c[0]},${c[1]})"></div>${esc(s.teamName||s.shortName||'?')}</div></td><td>${s.played}</td><td>${s.won}</td><td>${s.drawn}</td><td>${s.lost}</td><td>${s.goalsFor}</td><td>${s.goalsAgainst}</td><td class="${(s.goalDiff||0)>0?'gd-positive':'gd-negative'}">${s.goalDiff>0?'+':''}${s.goalDiff}</td><td class="pts">${s.points}</td></tr>`}).join('')}</tbody></table></div>`;
}

/* ─── Stats ─── */
async function renderStats() {
  const res = await api.get('/api/stats');
  const { topScorers, topAssists, mostAppearances, topCleanSheets } = res;
  renderLeaderboard('stats-top-scorers', topScorers, 'goals');
  renderLeaderboard('stats-top-assists', topAssists, 'assists');
  renderLeaderboard('stats-most-appearances', mostAppearances, 'appearances');
  renderLeaderboard('stats-clean-sheets', topCleanSheets, 'cleanSheets');
}

function renderLeaderboard(containerId, data, field) {
  const c = $(containerId);
  if (!data||!data.length) { c.innerHTML = '<div class="empty"><p>No data yet</p></div>'; return; }
  c.innerHTML = data.map((p,i) => {
    const rankClass = i < 3 ? `rank rank-${i+1}` : 'rank';
    return `<div class="stat-leader"><div class="${rankClass}">${i+1}</div><div class="av">${(p.name||'?')[0]}</div><div class="info"><div class="nm">${esc(p.name)}</div><div class="tm">${esc(p.teamName||'')}</div></div><div class="val">${p[field]||0}</div></div>`;
  }).join('');
}

/* ─── Helpers ─── */
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function populateTeamSelects() {
  const opts = state.teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
  ['player-team-id','match-home-team-id','match-away-team-id'].forEach(id => {
    const sel = $(id); if (sel) { const v = sel.value; sel.innerHTML = '<option value="">Select Team</option>'+opts; sel.value = v; }
  });
}

/* ─── Init ─── */
(async function init() { await loadAll(); populateTeamSelects(); handleHash(); })();

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
function openModal(id) {
  const el = $(id);
  if (el) { el.style.display = 'flex'; setTimeout(() => el.classList.add('open'), 10); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = $(id);
  if (el) { el.classList.remove('open'); el.style.display = 'none'; document.body.style.overflow = ''; }
}
document.addEventListener('click', e => {
  const c = e.target.closest('[data-close]'); if (c) closeModal(c.dataset.close);
  if (e.target.classList.contains('modal-backdrop')) closeModal(e.target.closest('.modal').id);
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
  if (!el) return;
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
    { name:'Bukayo Saka', number:7, position:'FW', teamId:created[0].id, nationality:'England', foot:'left', diet:'', pace:82, shooting:76, passing:80, defending:42, dribbling:84, physical:68 },
    { name:'Martin Ødegaard', number:8, position:'MID', teamId:created[0].id, nationality:'Norway', foot:'left', diet:'', pace:65, shooting:72, passing:88, defending:55, dribbling:82, physical:60 },
    { name:'Gabriel Jesus', number:9, position:'FW', teamId:created[0].id, nationality:'Brazil', foot:'right', diet:'', pace:86, shooting:80, passing:74, defending:38, dribbling:85, physical:72 },
    { name:'Cole Palmer', number:20, position:'MID', teamId:created[1].id, nationality:'England', foot:'left', diet:'', pace:70, shooting:74, passing:78, defending:50, dribbling:80, physical:62 },
    { name:'Enzo Fernández', number:8, position:'MID', teamId:created[1].id, nationality:'Argentina', foot:'right', diet:'', pace:68, shooting:70, passing:84, defending:62, dribbling:78, physical:70 },
    { name:'Raheem Sterling', number:7, position:'FW', teamId:created[1].id, nationality:'England', foot:'right', diet:'', pace:90, shooting:74, passing:72, defending:35, dribbling:82, physical:60 },
    { name:'Mohamed Salah', number:11, position:'FW', teamId:created[2].id, nationality:'Egypt', foot:'left', diet:'halal', pace:88, shooting:84, passing:78, defending:40, dribbling:86, physical:72 },
    { name:'Virgil van Dijk', number:4, position:'DEF', teamId:created[2].id, nationality:'Netherlands', foot:'right', diet:'', pace:70, shooting:60, passing:76, defending:90, dribbling:67, physical:86 },
    { name:'Alisson Becker', number:1, position:'GK', teamId:created[2].id, nationality:'Brazil', foot:'right', diet:'', pace:55, shooting:20, passing:65, defending:20, dribbling:40, physical:75 },
    { name:'Erling Haaland', number:9, position:'FW', teamId:created[3].id, nationality:'Norway', foot:'left', diet:'', pace:86, shooting:92, passing:66, defending:40, dribbling:78, physical:88 },
    { name:'Kevin De Bruyne', number:17, position:'MID', teamId:created[3].id, nationality:'Belgium', foot:'right', diet:'', pace:72, shooting:80, passing:92, defending:54, dribbling:84, physical:72 },
    { name:'Phil Foden', number:47, position:'MID', teamId:created[3].id, nationality:'England', foot:'left', diet:'', pace:78, shooting:76, passing:82, defending:48, dribbling:86, physical:62 },
    { name:'Bruno Fernandes', number:8, position:'MID', teamId:created[4].id, nationality:'Portugal', foot:'right', diet:'', pace:70, shooting:78, passing:86, defending:58, dribbling:80, physical:68 },
    { name:'Marcus Rashford', number:10, position:'FW', teamId:created[4].id, nationality:'England', foot:'right', diet:'vegetarian', pace:90, shooting:78, passing:72, defending:34, dribbling:82, physical:68 },
    { name:'Casemiro', number:18, position:'MID', teamId:created[4].id, nationality:'Brazil', foot:'right', diet:'', pace:62, shooting:68, passing:74, defending:84, dribbling:70, physical:82 },
    { name:'Son Heung-min', number:7, position:'FW', teamId:created[5].id, nationality:'South Korea', foot:'right', diet:'', pace:86, shooting:82, passing:76, defending:40, dribbling:84, physical:68 },
    { name:'James Maddison', number:10, position:'MID', teamId:created[5].id, nationality:'England', foot:'right', diet:'', pace:70, shooting:74, passing:82, defending:52, dribbling:80, physical:60 },
    { name:'Cristian Romero', number:13, position:'DEF', teamId:created[5].id, nationality:'Argentina', foot:'right', diet:'', pace:72, shooting:58, passing:68, defending:86, dribbling:64, physical:80 },
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
  else if (view === 'ads') renderAds();
  else if (view === 'transfers') renderTransfers();
  else if (view === 'social') renderSocial();
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
  if (id) { await api.put(`/api/teams?id=${id}`, d); showToast('Team updated.'); }
  else { await api.post('/api/teams', d); showToast('Team created.'); }
  closeModal('team-modal'); renderTeams(); populateTeamSelects();
});

window.editTeam = async id => {
  const t = await api.get(`/api/teams?id=${id}`);
  $('team-id').value = t.id; $('team-name').value = t.name||''; $('team-short-name').value = t.shortName||''; $('team-stadium').value = t.stadium||''; $('team-founded').value = t.founded||''; $('team-color1').value = t.colors?.[0]||'#e00000'; $('team-color2').value = t.colors?.[1]||'#ffffff';
  $('team-modal-title').textContent = 'Edit Team'; openModal('team-modal');
};

window.deleteTeam = async id => {
  if (!confirm('Delete this team?')) return;
  await api.del(`/api/teams?id=${id}`); showToast('Team deleted.'); renderTeams(); populateTeamSelects();
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
    const ovr = p.pace && p.shooting ? Math.round((p.pace + p.shooting + p.passing + p.defending + p.dribbling + p.physical) / 6) : null;
    return `<div class="glass-card player-card" style="cursor:pointer" onclick="showPlayerDetail('${p.id}')"><div class="player-avatar">${(p.name||'?')[0]}</div><div class="player-info"><div class="player-name">${esc(p.name)} <span class="pos-badge">${p.position||'MID'}</span> ${p.number ? '#'+p.number : ''}</div><div class="player-meta">${team ? esc(team.name) : 'No team'}${p.nationality ? ' · '+esc(p.nationality) : ''}${ovr ? ' · OVR '+ovr : ''}</div><div class="player-stats-row"><div class="player-stat-item"><div class="val">${p.goals||0}</div><div class="lbl">G</div></div><div class="player-stat-item"><div class="val">${p.assists||0}</div><div class="lbl">A</div></div><div class="player-stat-item"><div class="val">${p.appearances||0}</div><div class="lbl">Apps</div></div></div></div><div class="card-actions"><button class="btn btn-outline btn-sm" onclick="event.stopPropagation();editPlayer('${p.id}')">Edit</button><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deletePlayer('${p.id}')">Del</button></div></div>`;
  }).join('');
}

$('player-team-filter').addEventListener('change', renderPlayers);

$('add-player-btn').addEventListener('click', () => { $('player-form').reset(); $('player-id').value = ''; $('player-modal-title').textContent = 'Add Player'; resetAbilities(); openModal('player-modal'); });

$('player-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('player-id').value, d = {
    name:$('player-name').value, number:parseInt($('player-number').value)||0,
    position:$('player-position').value, teamId:$('player-team-id').value,
    nationality:$('player-nationality').value,
    foot:$('player-foot').value, diet:$('player-diet').value,
    pace:parseInt($('player-pace').value)||50, shooting:parseInt($('player-shooting').value)||50,
    passing:parseInt($('player-passing').value)||50, defending:parseInt($('player-defending').value)||50,
    dribbling:parseInt($('player-dribbling').value)||50, physical:parseInt($('player-physical').value)||50,
  };
  if (id) { await api.put(`/api/players?id=${id}`, d); showToast('Player updated.'); }
  else { await api.post('/api/players', d); showToast('Player created.'); }
  closeModal('player-modal'); renderPlayers();
});

window.editPlayer = async id => {
  const p = await api.get(`/api/players?id=${id}`);
  $('player-id').value = p.id; $('player-name').value = p.name||''; $('player-number').value = p.number||'';
  $('player-position').value = p.position||'MID'; $('player-nationality').value = p.nationality||'';
  $('player-team-id').value = p.teamId||'';
  $('player-foot').value = p.foot||'right'; $('player-diet').value = p.diet||'';
  $('player-pace').value = p.pace||50; $('player-pace-val').textContent = p.pace||50;
  $('player-shooting').value = p.shooting||50; $('player-shooting-val').textContent = p.shooting||50;
  $('player-passing').value = p.passing||50; $('player-passing-val').textContent = p.passing||50;
  $('player-defending').value = p.defending||50; $('player-defending-val').textContent = p.defending||50;
  $('player-dribbling').value = p.dribbling||50; $('player-dribbling-val').textContent = p.dribbling||50;
  $('player-physical').value = p.physical||50; $('player-physical-val').textContent = p.physical||50;
  $('player-modal-title').textContent = 'Edit Player'; openModal('player-modal');
};

window.deletePlayer = async id => {
  if (!confirm('Delete this player?')) return;
  await api.del(`/api/players?id=${id}`); showToast('Player deleted.'); renderPlayers();
};

function resetAbilities() {
  ['pace','shooting','passing','defending','dribbling','physical'].forEach(a => {
    const s = $(`player-${a}`); const v = $(`player-${a}-val`);
    if (s) { s.value = 50; if (v) v.textContent = '50'; }
  });
}

['pace','shooting','passing','defending','dribbling','physical'].forEach(a => {
  const slider = $(`player-${a}`);
  if (slider) {
    slider.addEventListener('input', () => {
      const val = $(`player-${a}-val`);
      if (val) val.textContent = slider.value;
    });
  }
});

/* ─── Player Detail ─── */
window.showPlayerDetail = async id => {
  const p = await api.get(`/api/players?id=${id}`);
  const team = state.teams.find(t => t.id === p.teamId);
  const ovr = p.pace ? Math.round((p.pace + p.shooting + p.passing + p.defending + p.dribbling + p.physical) / 6) : 'N/A';
  const footIcons = { right: '🦶', left: '🦶', both: '🦶' };
  const dietLabels = { vegetarian: '🥦 Vegetarian', vegan: '🌱 Vegan', halal: '🥩 Halal', keto: '🥑 Keto' };
  const abilities = [
    { label:'Pace', val:p.pace||50 }, { label:'Shooting', val:p.shooting||50 },
    { label:'Passing', val:p.passing||50 }, { label:'Defending', val:p.defending||50 },
    { label:'Dribbling', val:p.dribbling||50 }, { label:'Physical', val:p.physical||50 },
  ];
  $('player-detail-title').textContent = p.name || 'Player Details';
  $('player-detail-body').innerHTML = `
    <div class="player-detail-header">
      <div class="player-detail-avatar">${(p.name||'?')[0]}</div>
      <div class="player-detail-info">
        <div class="player-detail-name">${esc(p.name)}</div>
        <div class="player-detail-meta">
          <span>${p.position||'MID'}</span>
          <span>${p.number ? '#'+p.number : ''}</span>
          <span>${team ? esc(team.name) : 'Free Agent'}</span>
          <span>${p.nationality||''}</span>
          <span>OVR ${ovr}</span>
        </div>
      </div>
    </div>
    <div class="detail-section">
      <h3>Details</h3>
      <div class="detail-grid">
        <div class="detail-stat"><div class="val">${p.goals||0}</div><div class="lbl">Goals</div></div>
        <div class="detail-stat"><div class="val">${p.assists||0}</div><div class="lbl">Assists</div></div>
        <div class="detail-stat"><div class="val">${p.appearances||0}</div><div class="lbl">Apps</div></div>
        <div class="detail-stat"><div class="val">${p.cleanSheets||0}</div><div class="lbl">Clean Sheets</div></div>
        <div class="detail-stat"><div class="val">${(p.foot||'right')[0].toUpperCase()+p.foot?.slice(1)||'Right'}</div><div class="lbl">Foot</div></div>
        <div class="detail-stat"><div class="val">${dietLabels[p.diet] || 'Standard'}</div><div class="lbl">Diet</div></div>
      </div>
    </div>
    <div class="detail-section">
      <h3>Abilities</h3>
      ${abilities.map(a => `
        <div class="ability-bar-container">
          <span class="ability-bar-label">${a.label}</span>
          <div class="ability-bar-track">
            <div class="ability-bar-fill" style="width:${a.val}%"></div>
          </div>
          <span class="ability-bar-value">${a.val}</span>
        </div>
      `).join('')}
    </div>
  `;
  openModal('player-detail-modal');
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
  if (id) { await api.put(`/api/matches?id=${id}`, d); showToast('Match updated.'); }
  else { await api.post('/api/matches', d); showToast('Match scheduled.'); }
  closeModal('match-modal'); renderMatches();
});

window.editMatch = async id => {
  const m = await api.get(`/api/matches?id=${id}`);
  $('match-id').value = m.id; $('match-home-team-id').value = m.homeTeamId; $('match-away-team-id').value = m.awayTeamId; $('match-date').value = m.date||''; $('match-time').value = m.time||''; $('match-venue').value = m.venue||''; $('match-home-score').value = m.homeScore??''; $('match-away-score').value = m.awayScore??''; $('match-status').value = m.status||'scheduled';
  $('match-modal-title').textContent = 'Edit Match'; openModal('match-modal');
};

window.deleteMatch = async id => {
  if (!confirm('Delete this match?')) return;
  await api.del(`/api/matches?id=${id}`); showToast('Match deleted.'); renderMatches();
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
  if (!c) return;
  if (!data||!data.length) { c.innerHTML = '<div class="empty"><p>No data yet</p></div>'; return; }
  c.innerHTML = data.map((p,i) => {
    const rankClass = i < 3 ? `rank rank-${i+1}` : 'rank';
    return `<div class="stat-leader"><div class="${rankClass}">${i+1}</div><div class="av">${(p.name||'?')[0]}</div><div class="info"><div class="nm">${esc(p.name)}</div><div class="tm">${esc(p.teamName||'')}</div></div><div class="val">${p[field]||0}</div></div>`;
  }).join('');
}

/* ─── Ads ─── */
let adsData = [];

async function renderAds() {
  const res = await api.get('/api/ads');
  adsData = res.ads || [];
  const container = $('ads-list');
  if (!adsData.length) { container.innerHTML = '<div class="empty"><p>No ads yet. Click "+ Add Ad" to create one.</p></div>'; return; }
  container.innerHTML = adsData.map(a => `
    <div class="glass-card ad-card">
      ${a.imageUrl ? `<img class="ad-image" src="${esc(a.imageUrl)}" alt="${esc(a.product)}" onerror="this.style.display='none'" />` : `<div class="ad-image" style="display:flex;align-items:center;justify-content:center;font-size:2rem;background:rgba(34,197,94,0.05)">📢</div>`}
      <div class="ad-info">
        <div class="ad-product">${esc(a.product)}</div>
        <div class="ad-advertiser">${esc(a.advertiser)}</div>
        ${a.description ? `<div class="ad-desc">${esc(a.description)}</div>` : ''}
        <div class="ad-footer">
          <span class="badge badge-${a.status}">${a.status}</span>
          <span class="ad-clicks">${a.clicks||0} clicks</span>
          ${a.linkUrl ? `<a class="ad-link" href="${esc(a.linkUrl)}" target="_blank">Visit →</a>` : ''}
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-outline btn-sm" onclick="editAd('${a.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAd('${a.id}')">Del</button>
      </div>
    </div>`).join('');
}

$('add-ad-btn').addEventListener('click', () => { $('ad-form').reset(); $('ad-id').value = ''; $('ad-clicks').value = 0; $('ad-modal-title').textContent = 'Add Ad'; openModal('ad-modal'); });

$('ad-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('ad-id').value;
  const d = {
    advertiser:$('ad-advertiser').value, product:$('ad-product').value,
    description:$('ad-description').value, imageUrl:$('ad-image-url').value,
    linkUrl:$('ad-link-url').value, status:$('ad-status').value,
    clicks:parseInt($('ad-clicks').value)||0,
  };
  if (id) { await api.put(`/api/ads?id=${id}`, d); showToast('Ad updated.'); }
  else { await api.post('/api/ads', d); showToast('Ad created.'); }
  closeModal('ad-modal'); renderAds();
});

window.editAd = async id => {
  const a = await api.get(`/api/ads?id=${id}`);
  $('ad-id').value = a.id; $('ad-advertiser').value = a.advertiser||'';
  $('ad-product').value = a.product||''; $('ad-description').value = a.description||'';
  $('ad-image-url').value = a.imageUrl||''; $('ad-link-url').value = a.linkUrl||'';
  $('ad-status').value = a.status||'active'; $('ad-clicks').value = a.clicks||0;
  $('ad-modal-title').textContent = 'Edit Ad'; openModal('ad-modal');
};

window.deleteAd = async id => {
  if (!confirm('Delete this ad?')) return;
  await api.del(`/api/ads?id=${id}`); showToast('Ad deleted.'); renderAds();
};

/* ─── Transfers ─── */
let transfersData = [];

async function renderTransfers() {
  const res = await api.get('/api/transfers');
  transfersData = res.transfers || [];
  const container = $('transfers-list');
  if (!transfersData.length) { container.innerHTML = '<div class="empty"><p>No transfers yet. Click "+ New Transfer" to add one.</p></div>'; return; }
  container.innerHTML = transfersData.map(t => {
    const fromTeam = state.teams.find(te => te.id === t.fromTeamId);
    const toTeam = state.teams.find(te => te.id === t.toTeamId);
    const fee = t.fee ? `£${parseFloat(t.fee).toLocaleString()}` : 'Free';
    return `<div class="glass-card transfer-card">
      <div class="transfer-icon">🔄</div>
      <div class="transfer-info">
        <div class="transfer-player">${esc(t.playerName||'Unknown Player')}</div>
        <div class="transfer-teams">${fromTeam ? esc(fromTeam.shortName||fromTeam.name) : '?'} <span class="transfer-arrow">→</span> ${toTeam ? esc(toTeam.shortName||toTeam.name) : '?'}</div>
        <div class="transfer-meta">
          <span class="transfer-fee">${fee}</span>
          <span>${t.date||''}</span>
          <span class="badge badge-${t.status}">${t.status||'pending'}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-outline btn-sm" onclick="editTransfer('${t.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTransfer('${t.id}')">Del</button>
      </div>
    </div>`;
  }).join('');
}

$('add-transfer-btn').addEventListener('click', () => {
  $('transfer-form').reset(); $('transfer-id').value = '';
  $('transfer-modal-title').textContent = 'New Transfer';
  populateTransferSelects(); openModal('transfer-modal');
});

$('transfer-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('transfer-id').value;
  const d = {
    playerId:$('transfer-player-id').value, fromTeamId:$('transfer-from-team-id').value,
    toTeamId:$('transfer-to-team-id').value, fee:$('transfer-fee').value ? parseFloat($('transfer-fee').value) : null,
    date:$('transfer-date').value, status:$('transfer-status').value,
  };
  if (!d.playerId||!d.fromTeamId||!d.toTeamId) { showToast('Fill in all required fields.'); return; }
  if (id) { await api.put(`/api/transfers?id=${id}`, d); showToast('Transfer updated.'); }
  else { await api.post('/api/transfers', d); showToast('Transfer created.'); }
  closeModal('transfer-modal'); renderTransfers();
});

function populateTransferSelects() {
  const teamOpts = state.teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
  const playerOpts = state.players.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  ['transfer-player-id'].forEach(id => {
    const sel = $(id); if (sel) { const v = sel.value; sel.innerHTML = '<option value="">Select Player</option>'+playerOpts; sel.value = v; }
  });
  ['transfer-from-team-id','transfer-to-team-id'].forEach(id => {
    const sel = $(id); if (sel) { const v = sel.value; sel.innerHTML = '<option value="">Select Team</option>'+teamOpts; sel.value = v; }
  });
}

window.editTransfer = async id => {
  const t = await api.get(`/api/transfers?id=${id}`);
  populateTransferSelects();
  $('transfer-id').value = t.id; $('transfer-player-id').value = t.playerId||'';
  $('transfer-from-team-id').value = t.fromTeamId||''; $('transfer-to-team-id').value = t.toTeamId||'';
  $('transfer-fee').value = t.fee||''; $('transfer-date').value = t.date||'';
  $('transfer-status').value = t.status||'pending';
  $('transfer-modal-title').textContent = 'Edit Transfer'; openModal('transfer-modal');
};

window.deleteTransfer = async id => {
  if (!confirm('Delete this transfer?')) return;
  await api.del(`/api/transfers?id=${id}`); showToast('Transfer deleted.'); renderTransfers();
};

/* ─── Social ─── */
async function renderSocial() {
  await renderMessages();
  await renderGroups();
  await renderFollowers();
}

async function renderMessages() {
  try {
    const res = await api.get('/api/social?type=messages');
    const msgs = res.messages || [];
    const container = $('social-messages');
    if (!msgs.length) { container.innerHTML = '<div class="empty"><p>No messages yet</p></div>'; return; }
    container.innerHTML = msgs.map(m => {
      const sender = state.players.find(p => p.id === m.fromId);
      const initial = sender ? sender.name[0] : '?';
      return `<div class="msg-item">
        <div class="msg-avatar">${initial}</div>
        <div class="msg-body">
          <div class="msg-subject">${esc(m.subject||'(No subject)')}</div>
          <div class="msg-preview">${esc(m.body||'')}</div>
        </div>
        <div class="msg-time">${m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''}</div>
      </div>`;
    }).join('');
  } catch { $('social-messages').innerHTML = '<div class="empty"><p>Could not load messages</p></div>'; }
}

async function renderGroups() {
  try {
    const res = await api.get('/api/social?type=groups');
    const groups = res.groups || [];
    const container = $('social-groups');
    if (!groups.length) { container.innerHTML = '<div class="empty"><p>No groups yet. Create one!</p></div>'; return; }
    container.innerHTML = groups.map(g => `
      <div class="group-card">
        <div class="group-icon">👥</div>
        <div class="group-info">
          <div class="group-name">${esc(g.name)}</div>
          ${g.description ? `<div class="group-desc">${esc(g.description)}</div>` : ''}
          <div class="group-meta">${g.memberCount||0} members</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="joinGroup('${g.id}')">Join</button>
      </div>
    `).join('');
  } catch { $('social-groups').innerHTML = '<div class="empty"><p>Could not load groups</p></div>'; }
}

async function renderFollowers() {
  try {
    const res = await api.get('/api/social?type=followers');
    const followers = res.followers || [];
    const container = $('social-followers');
    if (!followers.length) { container.innerHTML = '<div class="empty"><p>Follow players to build your network</p></div>'; return; }
    container.innerHTML = followers.map(f => {
      const player = state.players.find(p => p.id === f.playerId);
      const team = player ? state.teams.find(t => t.id === player.teamId) : null;
      const isFollowing = f.following !== false;
      return player ? `<div class="follower-card">
        <div class="follower-avatar">${player.name[0]}</div>
        <div class="follower-info">
          <div class="follower-name">${esc(player.name)}</div>
          <div class="follower-team">${team ? esc(team.name) : 'Free Agent'} · ${player.position||'MID'}</div>
        </div>
        <button class="btn btn-sm btn-follow ${isFollowing?'following':'not-following'}" onclick="toggleFollow('${player.id}', ${!isFollowing})">
          ${isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>` : '';
    }).join('');
  } catch { $('social-followers').innerHTML = '<div class="empty"><p>Could not load followers</p></div>'; }
}

$('send-msg-btn').addEventListener('click', () => {
  const opts = state.players.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  $('msg-recipient').innerHTML = '<option value="">Select Player</option>'+opts;
  $('message-form').reset(); openModal('message-modal');
});

$('message-form').addEventListener('submit', async e => {
  e.preventDefault();
  const d = { toId:$('msg-recipient').value, subject:$('msg-subject').value, body:$('msg-body').value };
  if (!d.toId) { showToast('Select a recipient.'); return; }
  await api.post('/api/social?type=messages', d);
  showToast('Message sent.');
  closeModal('message-modal'); renderMessages();
});

$('add-group-btn').addEventListener('click', () => {
  $('group-form').reset(); $('group-id').value = '';
  $('group-modal-title').textContent = 'Create Group'; openModal('group-modal');
});

$('group-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('group-id').value;
  const d = { name:$('group-name').value, description:$('group-description').value };
  if (id) {
    await api.put(`/api/social?type=groups`, { ...d, groupId:id });
    showToast('Group updated.');
  } else {
    await api.post('/api/social?type=groups', d);
    showToast('Group created.');
  }
  closeModal('group-modal'); renderGroups();
});

window.joinGroup = async groupId => {
  await api.post('/api/social?type=groups', { groupId, action:'join' });
  showToast('Joined group!'); renderGroups();
};

window.toggleFollow = async (playerId, follow) => {
  await api.post('/api/social?type=followers', { playerId, follow });
  showToast(follow ? 'Following player!' : 'Unfollowed player.');
  renderFollowers();
};

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

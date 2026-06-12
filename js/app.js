/* ─── State ─── */
const state = { teams: [], players: [], matches: [] };

/* ─── DOM refs ─── */
const $ = id => document.getElementById(id);
const views = document.querySelectorAll('.view');
const navLinks = document.querySelectorAll('.nav-link');

/* ─── API client ─── */
const api = {
  async get(url) { const r = await fetch(url); return r.json(); },
  async post(url, body) { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return r.json(); },
  async put(url, body) { const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return r.json(); },
  async del(url) { const r = await fetch(url, { method: 'DELETE' }); return r.json(); },
};

/* ─── Navigation ─── */
function navigate(viewName) {
  views.forEach(v => v.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const view = document.getElementById(`view-${viewName}`);
  if (view) view.classList.add('active');
  const link = document.querySelector(`.nav-link[data-view="${viewName}"]`);
  if (link) link.classList.add('active');
  renderView(viewName);
}

function handleHash() {
  const view = location.hash.replace('#', '') || 'dashboard';
  navigate(view);
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const view = link.dataset.view;
    location.hash = view;
  });
});

window.addEventListener('hashchange', handleHash);

/* ─── Modal helpers ─── */
function openModal(id) {
  const el = $(id);
  if (el) { el.style.display = 'flex'; setTimeout(() => el.classList.add('open'), 10); }
}

function closeModal(id) {
  const el = $(id);
  if (el) { el.classList.remove('open'); el.style.display = 'none'; }
}

document.addEventListener('click', (e) => {
  const close = e.target.closest('[data-close]');
  if (close) closeModal(close.dataset.close);
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal') && e.target.style.display === 'flex') {
    closeModal(e.target.id);
  }
});

/* ─── Toast ─── */
function showToast(msg, type) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'toast show';
  if (type === 'error') t.style.background = '#dc2626';
  else t.style.background = '#16a34a';
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ─── Load data ─── */
async function loadAll() {
  const [teamsRes, playersRes, matchesRes] = await Promise.all([
    api.get('/api/teams'), api.get('/api/players'), api.get('/api/matches'),
  ]);
  state.teams = teamsRes.teams || [];
  state.players = playersRes.players || [];
  state.matches = matchesRes.matches || [];
}

/* ─── Render views ─── */
async function renderView(view) {
  await loadAll();
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
  $('stat-teams-count').textContent = state.teams.length;
  $('stat-players-count').textContent = state.players.length;
  $('stat-matches-count').textContent = played.length;

  const recent = [...state.matches].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5);
  $('recent-matches-list').innerHTML = recent.length
    ? recent.map(m => `<li class="list-item">${m.homeTeam?.shortName || '?'} ${m.homeScore != null ? m.homeScore + '-' + m.awayScore : 'v'} ${m.awayTeam?.shortName || '?'} <span class="badge badge-${m.status}">${m.date || ''}</span></li>`).join('')
    : '<li class="empty"><p>No matches yet</p></li>';

  const scorers = [...state.players].sort((a, b) => (b.goals || 0) - (a.goals || 0)).slice(0, 5);
  $('top-scorers-list').innerHTML = scorers.length
    ? scorers.map(p => `<li class="list-item">${p.name} — ${p.goals || 0} goals</li>`).join('')
    : '<li class="empty"><p>No players yet</p></li>';
}

/* ─── Teams ─── */
function renderTeams() {
  const list = $('teams-list');
  if (!state.teams.length) {
    list.innerHTML = '<div class="empty"><p>No teams yet. Click "Add Team" to get started.</p></div>';
    return;
  }
  list.innerHTML = state.teams.map(t => `
    <div class="card team-card">
      <div class="team-colors">
        <div class="team-color" style="background:${t.colors?.[0] || '#ccc'}"></div>
        <div class="team-color" style="background:${t.colors?.[1] || '#fff'}"></div>
      </div>
      <div class="team-info">
        <div class="team-name">${esc(t.name)}</div>
        <div class="team-detail">${esc(t.shortName || '')}${t.stadium ? ' · ' + esc(t.stadium) : ''}${t.founded ? ' · Est. ' + esc(t.founded) : ''}</div>
      </div>
      <div class="card-actions">
        <button class="btn btn-outline btn-sm" onclick="editTeam('${t.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTeam('${t.id}')">Del</button>
      </div>
    </div>
  `).join('');
}

window.editTeam = async function(id) {
  const t = await api.get(`/api/teams/${id}`);
  $('team-id').value = t.id;
  $('team-name').value = t.name || '';
  $('team-short-name').value = t.shortName || '';
  $('team-stadium').value = t.stadium || '';
  $('team-founded').value = t.founded || '';
  $('team-color1').value = t.colors?.[0] || '#e00000';
  $('team-color2').value = t.colors?.[1] || '#ffffff';
  $('team-modal-title').textContent = 'Edit Team';
  openModal('team-modal');
};

window.deleteTeam = async function(id) {
  if (!confirm('Delete this team?')) return;
  await api.del(`/api/teams/${id}`);
  showToast('Team deleted.');
  renderTeams();
  populateTeamSelects();
};

$('add-team-btn').addEventListener('click', () => {
  $('team-form').reset(); $('team-id').value = ''; $('team-modal-title').textContent = 'Add Team';
  $('team-color1').value = '#e00000'; $('team-color2').value = '#ffffff';
  openModal('team-modal');
});

$('team-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('team-id').value;
  const data = {
    name: $('team-name').value, shortName: $('team-short-name').value, stadium: $('team-stadium').value,
    founded: $('team-founded').value, colors: [$('team-color1').value, $('team-color2').value],
  };
  if (id) { await api.put(`/api/teams/${id}`, data); showToast('Team updated.'); }
  else { await api.post('/api/teams', data); showToast('Team created.'); }
  closeModal('team-modal');
  renderTeams();
  populateTeamSelects();
});

/* ─── Players ─── */
function renderPlayers() {
  const filter = $('player-team-filter');
  const prevVal = filter.value;
  filter.innerHTML = '<option value="">All Teams</option>' +
    state.teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
  filter.value = prevVal;

  const teamId = filter.value;
  let list = state.players;
  if (teamId) list = list.filter(p => p.teamId === teamId);

  const container = $('players-list');
  if (!list.length) {
    container.innerHTML = '<div class="empty"><p>No players found.</p></div>';
    return;
  }
  container.innerHTML = list.map(p => {
    const initial = (p.name || '?')[0].toUpperCase();
    const team = state.teams.find(t => t.id === p.teamId);
    return `
    <div class="card player-card">
      <div class="player-avatar">${initial}</div>
      <div class="player-info">
        <div class="player-name">${esc(p.name)} ${p.number ? '#' + p.number : ''}</div>
        <div class="player-meta">${posLabel(p.position)} · ${team ? esc(team.name) : 'No team'}${p.nationality ? ' · ' + esc(p.nationality) : ''}</div>
        <div class="player-stats">
          <div class="player-stat"><span>${p.goals || 0}</span>G</div>
          <div class="player-stat"><span>${p.assists || 0}</span>A</div>
          <div class="player-stat"><span>${p.appearances || 0}</span>Apps</div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-outline btn-sm" onclick="editPlayer('${p.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deletePlayer('${p.id}')">Del</button>
      </div>
    </div>`;
  }).join('');
}

$('player-team-filter').addEventListener('change', renderPlayers);

window.editPlayer = async function(id) {
  const p = await api.get(`/api/players/${id}`);
  $('player-id').value = p.id; $('player-name').value = p.name || ''; $('player-number').value = p.number || '';
  $('player-position').value = p.position || 'MID'; $('player-nationality').value = p.nationality || '';
  $('player-team-id').value = p.teamId || '';
  $('player-modal-title').textContent = 'Edit Player';
  openModal('player-modal');
};

window.deletePlayer = async function(id) {
  if (!confirm('Delete this player?')) return;
  await api.del(`/api/players/${id}`);
  showToast('Player deleted.');
  renderPlayers();
};

$('add-player-btn').addEventListener('click', () => {
  $('player-form').reset(); $('player-id').value = ''; $('player-modal-title').textContent = 'Add Player';
  openModal('player-modal');
});

$('player-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('player-id').value;
  const data = {
    name: $('player-name').value, number: parseInt($('player-number').value) || 0,
    position: $('player-position').value, teamId: $('player-team-id').value,
    nationality: $('player-nationality').value,
  };
  if (id) { await api.put(`/api/players/${id}`, data); showToast('Player updated.'); }
  else { await api.post('/api/players', data); showToast('Player created.'); }
  closeModal('player-modal');
  renderPlayers();
});

/* ─── Matches ─── */
function renderMatches() {
  const container = $('matches-list');
  if (!state.matches.length) {
    container.innerHTML = '<div class="empty"><p>No matches yet. Schedule one!</p></div>';
    return;
  }
  container.innerHTML = state.matches.map(m => {
    const home = m.homeTeam, away = m.awayTeam;
    const scoreDisplay = m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : 'v';
    const scoreClass = m.homeScore != null ? '' : 'pending';
    const badgeClass = m.status === 'played' ? 'badge-played' : m.status === 'postponed' ? 'badge-postponed' : 'badge-scheduled';
    return `
    <div class="card match-card">
      <div class="match-header">
        <span>${m.date || 'TBD'} ${m.time || ''}</span>
        <span class="badge ${badgeClass}">${m.status}</span>
      </div>
      <div class="match-teams">
        <div class="match-team">${home ? esc(home.name) : '?'}</div>
        <div class="match-score ${scoreClass}">${scoreDisplay}</div>
        <div class="match-team">${away ? esc(away.name) : '?'}</div>
      </div>
      <div class="match-venue">${esc(m.venue || '')}</div>
      <div style="margin-top:0.5rem;text-align:right">
        <button class="btn btn-outline btn-sm" onclick="editMatch('${m.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMatch('${m.id}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}

$('schedule-match-btn').addEventListener('click', () => {
  $('match-form').reset(); $('match-id').value = ''; $('match-modal-title').textContent = 'Schedule Match';
  openModal('match-modal');
});

window.editMatch = async function(id) {
  const m = await api.get(`/api/matches/${id}`);
  $('match-id').value = m.id; $('match-home-team-id').value = m.homeTeamId;
  $('match-away-team-id').value = m.awayTeamId; $('match-date').value = m.date || '';
  $('match-time').value = m.time || ''; $('match-venue').value = m.venue || '';
  $('match-home-score').value = m.homeScore ?? ''; $('match-away-score').value = m.awayScore ?? '';
  $('match-status').value = m.status || 'scheduled';
  $('match-modal-title').textContent = 'Edit Match';
  openModal('match-modal');
};

window.deleteMatch = async function(id) {
  if (!confirm('Delete this match?')) return;
  await api.del(`/api/matches/${id}`);
  showToast('Match deleted.');
  renderMatches();
};

$('match-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('match-id').value;
  const data = {
    homeTeamId: $('match-home-team-id').value, awayTeamId: $('match-away-team-id').value,
    date: $('match-date').value, time: $('match-time').value, venue: $('match-venue').value,
    homeScore: $('match-home-score').value !== '' ? parseInt($('match-home-score').value) : null,
    awayScore: $('match-away-score').value !== '' ? parseInt($('match-away-score').value) : null,
    status: $('match-status').value,
  };
  if (!data.homeTeamId || !data.awayTeamId) { showToast('Select both teams.', 'error'); return; }
  if (data.homeTeamId === data.awayTeamId) { showToast('A team cannot play itself.', 'error'); return; }
  if (id) { await api.put(`/api/matches/${id}`, data); showToast('Match updated.'); }
  else { await api.post('/api/matches', data); showToast('Match scheduled.'); }
  closeModal('match-modal');
  renderMatches();
});

/* populate team selects in modals */
function populateTeamSelects() {
  const opts = state.teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
  ['player-team-id', 'match-home-team-id', 'match-away-team-id'].forEach(id => {
    const sel = $(id);
    if (sel) { const v = sel.value; sel.innerHTML = '<option value="">Select Team</option>' + opts; sel.value = v; }
  });
}

/* ─── Standings ─── */
async function renderStandings() {
  const res = await api.get('/api/standings');
  const st = res.standings || [];
  const container = $('standings-table');
  if (!st.length) {
    container.innerHTML = '<div class="empty"><p>No standings data yet. Add teams and play matches.</p></div>';
    return;
  }
  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${st.map((s, i) => {
            const team = state.teams.find(t => t.id === s.teamId);
            const colors = team?.colors || ['#ccc', '#fff'];
            return `<tr>
              <td class="pos">${i + 1}</td>
              <td><div class="team-cell"><div class="team-badge" style="background:linear-gradient(135deg,${colors[0]},${colors[1]})"></div>${esc(s.teamName || s.shortName || '?')}</div></td>
              <td>${s.played}</td>
              <td>${s.won}</td>
              <td>${s.drawn}</td>
              <td>${s.lost}</td>
              <td>${s.goalsFor}</td>
              <td>${s.goalsAgainst}</td>
              <td>${s.goalDiff > 0 ? '+' : ''}${s.goalDiff}</td>
              <td class="pts">${s.points}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ─── Stats ─── */
async function renderStats() {
  const res = await api.get('/api/stats');
  const { topScorers, topAssists, mostAppearances, topCleanSheets } = res;
  renderStatList('stats-top-scorers', topScorers, 'goals');
  renderStatList('stats-top-assists', topAssists, 'assists');
  renderStatList('stats-most-appearances', mostAppearances, 'appearances');
  renderStatList('stats-clean-sheets', topCleanSheets, 'cleanSheets');
}

function renderStatList(containerId, data, field) {
  const container = $(containerId);
  if (!data || !data.length) {
    container.innerHTML = '<div class="empty"><p>No data yet.</p></div>';
    return;
  }
  container.innerHTML = data.map((p, i) => `
    <div class="stat-leader">
      <div class="rank">${i + 1}</div>
      <div class="player-avatar" style="width:36px;height:36px;font-size:0.85rem">${(p.name || '?')[0]}</div>
      <div class="info">
        <div class="name">${esc(p.name)}</div>
        <div class="team">${esc(p.teamName || '')}</div>
      </div>
      <div class="value">${p[field] || 0}</div>
    </div>
  `).join('');
}

/* ─── Helpers ─── */
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s; return d.innerHTML;
}

function posLabel(p) {
  const m = { GK: 'GK', DEF: 'DEF', MID: 'MID', FW: 'FW' };
  return m[p] || p;
}

/* ─── Init ─── */
(async function init() {
  await loadAll();
  populateTeamSelects();
  handleHash();
})();

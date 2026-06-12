/* ─── State ─── */
const S = { teams:[], players:[], matches:[] };
const $ = id => document.getElementById(id);

/* ─── API ─── */
const api = {
  get: (url) => fetch(url).then(r=>r.json()),
  post: (url,b) => fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json()),
};

/* ─── Navigation ─── */
function navigate(view) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const v = document.getElementById('view-'+view);
  if(v){v.classList.add('active');v.style.animation='none';void v.offsetHeight;v.style.animation='viewIn 0.4s ease'}
  const n = document.querySelector('.nav-item[data-view="'+view+'"]');
  if(n)n.classList.add('active');
  $('nav-links').classList.remove('open');
  render(view);
}
function hash(){navigate(location.hash.replace('#','')||'home')}
document.querySelectorAll('.nav-item[data-view]').forEach(n=>n.addEventListener('click',e=>{e.preventDefault();location.hash=n.dataset.view}));
window.addEventListener('hashchange',hash);
$('nav-toggle').addEventListener('click',()=>$('nav-links').classList.toggle('open'));

/* ─── Modal ─── */
function openModal(id){const m=$(id);if(m){m.classList.add('open');document.body.style.overflow='hidden'}}
function closeModal(id){const m=$(id);if(m){m.classList.remove('open');document.body.style.overflow='';m.querySelector('#team-modal-body')&&(m.querySelector('#team-modal-body').innerHTML='')}}
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-close]');if(c)closeModal(c.dataset.close);
  if(e.target.classList.contains('modal-backdrop'))closeModal(e.target.closest('.modal').id);
});

/* ─── Toast ─── */
function toast(m){
  let t=document.querySelector('.toast');
  if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}
  t.textContent=m;t.classList.add('show');
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2500);
}

/* ─── Load ─── */
async function load(){
  const [tr,pr,mr]=await Promise.all([api.get('/api/teams'),api.get('/api/players'),api.get('/api/matches')]);
  S.teams=tr.teams||[];S.players=pr.players||[];S.matches=mr.matches||[];
  if(!S.teams.length&&!S.players.length&&!S.matches.length)await seed();
}

async function seed(){
  const td=[
    {name:'Arsenal',shortName:'ARS',stadium:'Emirates Stadium',founded:'1886',colors:['#ef0107','#ffffff']},
    {name:'Chelsea',shortName:'CHE',stadium:'Stamford Bridge',founded:'1905',colors:['#034694','#ffffff']},
    {name:'Liverpool',shortName:'LIV',stadium:'Anfield',founded:'1892',colors:['#c8102e','#ffffff']},
    {name:'Man City',shortName:'MCI',stadium:'Etihad Stadium',founded:'1880',colors:['#6cabdd','#ffffff']},
    {name:'Man United',shortName:'MUN',stadium:'Old Trafford',founded:'1878',colors:['#da291c','#fbe122']},
    {name:'Tottenham',shortName:'TOT',stadium:'Tottenham Hotspur Stadium',founded:'1882',colors:['#132257','#ffffff']},
  ];
  const c=[];
  for(const t of td){const r=await api.post('/api/teams',t);c.push(r)}
  S.teams=c;
  const pd=[
    {name:'Bukayo Saka',number:7,position:'FW',teamId:c[0].id,nationality:'England',foot:'left',pace:82,shooting:76,passing:80,defending:42,dribbling:84,physical:68},
    {name:'Martin Ødegaard',number:8,position:'MID',teamId:c[0].id,nationality:'Norway',foot:'left',pace:65,shooting:72,passing:88,defending:55,dribbling:82,physical:60},
    {name:'Gabriel Jesus',number:9,position:'FW',teamId:c[0].id,nationality:'Brazil',foot:'right',pace:86,shooting:80,passing:74,defending:38,dribbling:85,physical:72},
    {name:'Cole Palmer',number:20,position:'MID',teamId:c[1].id,nationality:'England',foot:'left',pace:70,shooting:74,passing:78,defending:50,dribbling:80,physical:62},
    {name:'Enzo Fernández',number:8,position:'MID',teamId:c[1].id,nationality:'Argentina',foot:'right',pace:68,shooting:70,passing:84,defending:62,dribbling:78,physical:70},
    {name:'Raheem Sterling',number:7,position:'FW',teamId:c[1].id,nationality:'England',foot:'right',pace:90,shooting:74,passing:72,defending:35,dribbling:82,physical:60},
    {name:'Mohamed Salah',number:11,position:'FW',teamId:c[2].id,nationality:'Egypt',foot:'left',diet:'halal',pace:88,shooting:84,passing:78,defending:40,dribbling:86,physical:72},
    {name:'Virgil van Dijk',number:4,position:'DEF',teamId:c[2].id,nationality:'Netherlands',foot:'right',pace:70,shooting:60,passing:76,defending:90,dribbling:67,physical:86},
    {name:'Alisson Becker',number:1,position:'GK',teamId:c[2].id,nationality:'Brazil',foot:'right',pace:55,shooting:20,passing:65,defending:20,dribbling:40,physical:75},
    {name:'Erling Haaland',number:9,position:'FW',teamId:c[3].id,nationality:'Norway',foot:'left',pace:86,shooting:92,passing:66,defending:40,dribbling:78,physical:88},
    {name:'Kevin De Bruyne',number:17,position:'MID',teamId:c[3].id,nationality:'Belgium',foot:'right',pace:72,shooting:80,passing:92,defending:54,dribbling:84,physical:72},
    {name:'Phil Foden',number:47,position:'MID',teamId:c[3].id,nationality:'England',foot:'left',pace:78,shooting:76,passing:82,defending:48,dribbling:86,physical:62},
    {name:'Bruno Fernandes',number:8,position:'MID',teamId:c[4].id,nationality:'Portugal',foot:'right',pace:70,shooting:78,passing:86,defending:58,dribbling:80,physical:68},
    {name:'Marcus Rashford',number:10,position:'FW',teamId:c[4].id,nationality:'England',foot:'right',diet:'vegetarian',pace:90,shooting:78,passing:72,defending:34,dribbling:82,physical:68},
    {name:'Casemiro',number:18,position:'MID',teamId:c[4].id,nationality:'Brazil',foot:'right',pace:62,shooting:68,passing:74,defending:84,dribbling:70,physical:82},
    {name:'Son Heung-min',number:7,position:'FW',teamId:c[5].id,nationality:'South Korea',foot:'right',pace:86,shooting:82,passing:76,defending:40,dribbling:84,physical:68},
    {name:'James Maddison',number:10,position:'MID',teamId:c[5].id,nationality:'England',foot:'right',pace:70,shooting:74,passing:82,defending:52,dribbling:80,physical:60},
    {name:'Cristian Romero',number:13,position:'DEF',teamId:c[5].id,nationality:'Argentina',foot:'right',pace:72,shooting:58,passing:68,defending:86,dribbling:64,physical:80},
  ];
  for(const p of pd){await api.post('/api/players',p)}
  const fx=[
    {h:0,a:2,hs:2,as:1},{h:3,a:4,hs:3,as:0},{h:5,a:1,hs:1,as:1},{h:4,a:0,hs:1,as:2},
    {h:1,a:3,hs:0,as:2},{h:2,a:5,hs:4,as:0},{h:0,a:3,hs:1,as:1},{h:4,a:5,hs:2,as:0},
    {h:2,a:1,hs:3,as:1},{h:3,a:5,hs:5,as:0},
  ];
  const now=new Date();
  for(let i=0;i<fx.length;i++){
    const d=new Date(now);d.setDate(d.getDate()-(fx.length-i)*3);
    await api.post('/api/matches',{homeTeamId:c[fx[i].h].id,awayTeamId:c[fx[i].a].id,date:d.toISOString().split('T')[0],time:'20:00',venue:c[fx[i].h].stadium,homeScore:fx[i].hs,awayScore:fx[i].as,status:'played'});
  }
  S.matches=(await api.get('/api/matches')).matches||[];
}

/* ─── Render ─── */
async function render(view){
  await load();
  populateFilters();
  if(view==='home')renderHome();
  else if(view==='standings')renderStandings();
  else if(view==='teams')renderTeams();
  else if(view==='players')renderPlayers();
  else if(view==='matches')renderMatches();
  else if(view==='stats')renderStats();
  else if(view==='transfers')renderTransfers();
}

/* ─── Home ─── */
function renderHome(){
  animNum('hero-teams',S.teams.length);
  animNum('hero-players',S.players.length);
  const played=S.matches.filter(m=>m.homeScore!=null);
  animNum('hero-matches',played.length);
  const tg=played.reduce((s,m)=>s+(m.homeScore||0)+(m.awayScore||0),0);
  animNum('hero-goals',tg);

  const recent=[...S.matches].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).slice(0,6);
  $('home-matches').innerHTML=recent.length
    ? recent.map(m=>{
        const s=m.homeScore!=null?`<span class="match-score">${m.homeScore}-${m.awayScore}</span>`:`<span class="match-score pending">v</span>`;
        const sc=m.status||'scheduled';
        return `<div class="match-card"><div class="match-date">${fDate(m.date)}</div><div class="match-teams"><div class="match-team">${m.homeTeam?.shortName||'?'}</div>${s}<div class="match-team">${m.awayTeam?.shortName||'?'}</div></div><span class="match-status status-${sc}">${sc}</span></div>`;
      }).join('')
    :'<div class="empty"><p>No matches yet</p></div>';

  const scorers=[...S.players].sort((a,b)=>(b.goals||0)-(a.goals||0)).slice(0,5);
  $('home-scorers').innerHTML=scorers.length
    ? scorers.map((p,i)=>{
        const rc=i===0?'gold':i===1?'silver':i===2?'bronze':'';
        const t=S.teams.find(t=>t.id===p.teamId);
        return `<div class="scorer-row"><div class="scorer-rank ${rc}">${i+1}</div><div class="scorer-avatar">${(p.name||'?')[0]}</div><div class="scorer-info"><div class="scorer-name">${esc(p.name)}</div><div class="scorer-team">${t?esc(t.name):''}</div></div><div class="scorer-goals">${p.goals||0}</div></div>`;
      }).join('')
    :'<div class="empty"><p>No players yet</p></div>';
}

function animNum(id,target){
  const el=$(id);if(!el)return;
  const s=performance.now(),f=0;
  function step(n){
    const p=Math.min((n-s)/600,1);
    el.textContent=Math.floor(f+(target-f)*(1-Math.pow(1-p,3)));
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function fDate(d){if(!d)return'?';const dt=new Date(d);return dt.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}

/* ─── Standings ─── */
async function renderStandings(){
  const res=await api.get('/api/standings');
  const st=res.standings||[];
  const c=$('standings-table');
  if(!st.length){c.innerHTML='<div class="empty"><p>No standings data yet</p></div>';return}
  c.innerHTML=`<table class="standings-table"><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead><tbody>${st.map((s,i)=>{const t=S.teams.find(t=>t.id===s.teamId);const co=t?.colors||['#555','#555'];const pc=i<3?`pos pos-${i+1}`:'pos';const gdc=(s.goalDiff||0)>0?'gd-pos':'gd-neg';return `<tr><td class="${pc}">${medal(i)}</td><td><div class="team-cell"><div class="team-badge-sm" style="background:linear-gradient(135deg,${co[0]},${co[1]})"></div>${esc(s.teamName||s.shortName||'?')}</div></td><td>${s.played}</td><td>${s.won}</td><td>${s.drawn}</td><td>${s.lost}</td><td>${s.goalsFor}</td><td>${s.goalsAgainst}</td><td class="${gdc}">${(s.goalDiff||0)>0?'+':''}${s.goalDiff}</td><td class="pts">${s.points}</td></tr>`}).join('')}</tbody></table>`;
}

function medal(i){if(i===0)return'🥇';if(i===1)return'🥈';if(i===2)return'🥉';return i+1}

/* ─── Teams ─── */
function renderTeams(){
  const grid=$('teams-grid');
  if(!S.teams.length){grid.innerHTML='<div class="empty"><p>No teams yet</p></div>';return}
  const ab=isAdmin?'<div class="admin-bar"><span class="badge">Admin</span><span>Manage teams</span><button class="admin-btn-add" onclick="openTeamForm()">+ Add Team</button></div>':'';
  grid.innerHTML=ab+S.teams.map(t=>{
    const played=S.matches.filter(m=>(m.homeTeamId===t.id||m.awayTeamId===t.id)&&m.homeScore!=null);
    const goals=played.reduce((s,m)=>s+(m.homeTeamId===t.id?m.homeScore:m.awayScore),0)+(played.reduce((s,m)=>s+(m.awayTeamId===t.id?m.awayScore:m.homeScore),0));
    const wins=played.filter(m=>(m.homeTeamId===t.id&&m.homeScore>m.awayScore)||(m.awayTeamId===t.id&&m.awayScore>m.homeScore)).length;
    const amb=isAdmin?`<div style="display:flex;gap:0.25rem;margin-top:0.5rem;justify-content:flex-end"><button class="admin-btn admin-btn-edit" onclick="event.stopPropagation();openTeamForm('${t.id}')">Edit</button><button class="admin-btn admin-btn-del" onclick="event.stopPropagation();deleteTeam('${t.id}')">Del</button></div>`:'';
    return `<div class="team-card" onclick="showTeam('${t.id}')"><div style="display:flex;align-items:center;gap:1rem"><div class="team-badge" style="background:linear-gradient(135deg,${t.colors?.[0]||'#666'},${t.colors?.[1]||'#999'})">${(t.shortName||t.name)[0]}</div><div><div class="team-card-name">${esc(t.name)}</div><div class="team-card-meta">${esc(t.shortName||'')}${t.stadium?' · '+esc(t.stadium):''}</div></div></div><div class="team-card-stats"><div class="team-card-stat"><div class="val">${played.length}</div><div class="lbl">Played</div></div><div class="team-card-stat"><div class="val">${wins}</div><div class="lbl">Wins</div></div><div class="team-card-stat"><div class="val">${goals}</div><div class="lbl">Goals</div></div></div>${amb}</div>`;
  }).join('');
}

window.showTeam=async id=>{
  const t=await api.get('/api/teams?id='+id);
  const played=S.matches.filter(m=>(m.homeTeamId===id||m.awayTeamId===id)&&m.homeScore!=null);
  const goalsF=played.reduce((s,m)=>s+(m.homeTeamId===id?m.homeScore||0:m.awayScore||0),0);
  const goalsA=played.reduce((s,m)=>s+(m.homeTeamId===id?m.awayScore||0:m.homeScore||0),0);
  const w=played.filter(m=>(m.homeTeamId===id&&m.homeScore>m.awayScore)||(m.awayTeamId===id&&m.awayScore>m.homeScore)).length;
  const d=played.filter(m=>(m.homeTeamId===id||m.awayTeamId===id)&&m.homeScore===m.awayScore).length;
  const l=played.length-w-d;
  const players=S.players.filter(p=>p.teamId===id);
  $('team-modal-body').innerHTML=`<button class="modal-close" data-close="team-modal">&times;</button>
    <div class="team-detail-header"><div class="team-detail-badge" style="background:linear-gradient(135deg,${t.colors?.[0]||'#666'},${t.colors?.[1]||'#999'})">${(t.shortName||t.name)[0]}</div><div><div class="team-detail-name">${esc(t.name)}</div><div class="team-detail-meta">${esc(t.shortName||'')}${t.stadium?' · '+esc(t.stadium):''}${t.founded?' · Est. '+t.founded:''}</div></div></div>
    <div class="team-detail-grid"><div class="team-detail-stat"><div class="v">${played.length}</div><div class="l">Played</div></div><div class="team-detail-stat"><div class="v">${w}</div><div class="l">Won</div></div><div class="team-detail-stat"><div class="v">${d}</div><div class="l">Drawn</div></div><div class="team-detail-stat"><div class="v">${l}</div><div class="l">Lost</div></div><div class="team-detail-stat"><div class="v">${goalsF}</div><div class="l">GF</div></div><div class="team-detail-stat"><div class="v">${goalsA}</div><div class="l">GA</div></div></div>
    ${players.length?`<div style="margin-top:1rem"><h3 class="detail-section-title">Squad (${players.length})</h3><div style="display:flex;flex-direction:column;gap:0.4rem">${players.map(p=>`<div style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0.6rem;background:rgba(255,255,255,0.02);border-radius:8px"><div class="player-avatar" style="width:32px;height:32px;font-size:0.8rem">${(p.name||'?')[0]}</div><div style="flex:1"><div style="font-weight:600;font-size:0.85rem;color:var(--text)">${esc(p.name)}</div><div style="font-size:0.7rem;color:var(--text-muted)">${p.position||'MID'} · ${p.nationality||''}</div></div><div style="text-align:right;font-size:0.8rem;font-weight:700;color:var(--primary-light)">${p.goals||0}G</div></div>`).join('')}</div></div>`:''}`;
  openModal('team-modal');
};

/* ─── Players ─── */
function renderPlayers(){
  const teamF=$('player-team-filter');const posF=$('player-pos-filter');
  if(teamF){const pv=teamF.value;teamF.innerHTML='<option value="">All Teams</option>'+S.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');teamF.value=pv}
  let list=S.players;
  if(teamF&&teamF.value)list=list.filter(p=>p.teamId===teamF.value);
  if(posF&&posF.value)list=list.filter(p=>p.position===posF.value);
  const grid=$('players-grid');
  if(!list.length){grid.innerHTML='<div class="empty"><p>No players found</p></div>';return}
  const pab=isAdmin?'<div class="admin-bar"><span class="badge">Admin</span><span>Manage players</span><button class="admin-btn-add" onclick="openPlayerForm()">+ Add Player</button></div>':'';
  grid.innerHTML=pab+list.map(p=>{
    const t=S.teams.find(t=>t.id===p.teamId);
    const ovr=p.pace?Math.round((p.pace+p.shooting+p.passing+p.defending+p.dribbling+p.physical)/6):null;
    const pamb=isAdmin?`<div style="display:flex;gap:0.25rem;margin-top:0.5rem;justify-content:flex-end"><button class="admin-btn admin-btn-edit" onclick="event.stopPropagation();openPlayerForm('${p.id}')">Edit</button><button class="admin-btn admin-btn-del" onclick="event.stopPropagation();deletePlayer('${p.id}')">Del</button></div>`:'';
    return `<div class="player-card" onclick="showPlayer('${p.id}')"><div class="player-avatar">${(p.name||'?')[0]}</div><div class="player-info"><div class="player-name">${esc(p.name)} <span class="pos-badge">${p.position||'MID'}</span></div><div class="player-team">${t?esc(t.name):'Free Agent'}${p.nationality?' · '+esc(p.nationality):''}</div><div class="player-mini-stats"><div class="player-mini-stat"><div class="v">${p.goals||0}</div><div class="l">G</div></div><div class="player-mini-stat"><div class="v">${p.assists||0}</div><div class="l">A</div></div><div class="player-mini-stat"><div class="v">${p.appearances||0}</div><div class="l">App</div></div></div></div>${ovr?`<div class="player-ovr">${ovr}</div>`:''}${pamb}</div>`;
  }).join('');
}

$('player-team-filter')&&$('player-team-filter').addEventListener('change',renderPlayers);
$('player-pos-filter')&&$('player-pos-filter').addEventListener('change',renderPlayers);

window.showPlayer=async id=>{
  const p=await api.get('/api/players?id='+id);
  const t=S.teams.find(t=>t.id===p.teamId);
  const ovr=p.pace?Math.round((p.pace+p.shooting+p.passing+p.defending+p.dribbling+p.physical)/6):'N/A';
  const abs=[
    {l:'Pace',v:p.pace||50},{l:'Shooting',v:p.shooting||50},{l:'Passing',v:p.passing||50},
    {l:'Defending',v:p.defending||50},{l:'Dribbling',v:p.dribbling||50},{l:'Physical',v:p.physical||50}
  ];
  const dietL={vegetarian:'🥦 Vegetarian',vegan:'🌱 Vegan',halal:'🥩 Halal',keto:'🥑 Keto'};
  $('player-modal-body').innerHTML=`<button class="modal-close" data-close="player-modal">&times;</button>
    <div class="player-detail"><div class="player-detail-top"><div class="player-detail-avatar">${(p.name||'?')[0]}</div><div><div class="player-detail-name">${esc(p.name)} <span class="pos-badge">${p.position||'MID'}</span></div><div class="player-detail-meta"><span>${t?esc(t.name):'Free Agent'}</span><span>#${p.number||'?'}</span><span>${p.nationality||''}</span></div></div><div class="ovr-badge">${ovr}</div></div>
    <div><h3 class="detail-section-title">Statistics</h3><div class="detail-stats"><div class="detail-stat-box"><div class="v">${p.goals||0}</div><div class="l">Goals</div></div><div class="detail-stat-box"><div class="v">${p.assists||0}</div><div class="l">Assists</div></div><div class="detail-stat-box"><div class="v">${p.appearances||0}</div><div class="l">Apps</div></div><div class="detail-stat-box"><div class="v">${p.cleanSheets||0}</div><div class="l">CS</div></div><div class="detail-stat-box"><div class="v">${(p.foot||'right')[0].toUpperCase()+p.foot?.slice(1)||'R'}</div><div class="l">Foot</div></div><div class="detail-stat-box"><div class="v">${dietL[p.diet]||'Standard'}</div><div class="l">Diet</div></div></div></div>
    <div><h3 class="detail-section-title">Abilities</h3>${abs.map(a=>`<div class="ability-row"><span class="ability-label">${a.l}</span><div class="ability-track"><div class="ability-fill" style="width:${a.v}%"></div></div><span class="ability-val">${a.v}</span></div>`).join('')}</div></div>`;
  openModal('player-modal');
};

/* ─── Matches ─── */
function renderMatches(){
  const list=$('matches-list');
  const sorted=[...S.matches].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  if(!sorted.length){list.innerHTML='<div class="empty"><p>No matches yet</p></div>';return}
  const mab=isAdmin?'<div class="admin-bar"><span class="badge">Admin</span><span>Manage matches</span><button class="admin-btn-add" onclick="openMatchForm()">+ Schedule Match</button></div>':'';
  list.innerHTML=mab+sorted.map(m=>{
    const s=m.homeScore!=null?`${m.homeScore}-${m.awayScore}`:'<span style="color:var(--text-muted)">vs</span>';
    const sc=m.status||'scheduled';
    const mamb=isAdmin?`<div style="display:flex;gap:0.25rem;margin-left:auto"><button class="admin-btn admin-btn-edit" onclick="event.stopPropagation();openMatchForm('${m.id}')">Edit</button><button class="admin-btn admin-btn-del" onclick="event.stopPropagation();deleteMatch('${m.id}')">Del</button></div>`:'';
    return `<div class="match-card" style="min-width:auto;flex-shrink:1"><div class="match-date">${fDate(m.date)}<br><span style="font-size:0.65rem;color:var(--text-muted)">${m.time||''}</span></div><div class="match-teams"><div class="match-team" style="text-align:right">${m.homeTeam?.shortName||'?'}</div><span class="match-score">${s}</span><div class="match-team" style="text-align:left">${m.awayTeam?.shortName||'?'}</div></div><span class="match-status status-${sc}">${sc}</span><span style="font-size:0.72rem;color:var(--text-muted);flex-shrink:0">${m.venue?esc(m.venue).split(' ').slice(0,2).join(' '):''}</span>${mamb}</div>`;
  }).join('');
}

/* ─── Stats ─── */
async function renderStats(){
  const res=await api.get('/api/stats');
  const {topScorers,topAssists,mostAppearances,topCleanSheets}=res;
  $('stats-dashboard').innerHTML=lbCard('⚽ Top Scorers',topScorers,'goals')
    +lbCard('🎯 Top Assists',topAssists,'assists')
    +lbCard('👟 Most Appearances',mostAppearances,'appearances')
    +lbCard('🧤 Clean Sheets',topCleanSheets,'cleanSheets');
}

function lbCard(title,data,field){
  return `<div class="stat-card"><div class="stat-card-title">${title}</div>${
    data&&data.length
    ? data.map((p,i)=>{
        const rc=i===0?'rk-1':i===1?'rk-2':i===2?'rk-3':'';
        return `<div class="stat-leader"><div class="rk ${rc}">${i+1}</div><div class="av">${(p.name||'?')[0]}</div><div class="inf"><div class="nm">${esc(p.name)}</div><div class="tm">${esc(p.teamName||'')}</div></div><div class="vl">${p[field]||0}</div></div>`;
      }).join('')
    :'<div class="empty"><p>No data</p></div>'
  }</div>`;
}

/* ─── Transfers ─── */
async function renderTransfers(){
  const res=await api.get('/api/transfers');
  const tfs=res.transfers||[];
  const list=$('transfers-list');
  if(!tfs.length){list.innerHTML='<div class="empty"><p>No transfers yet</p></div>';return}
  const tfab=isAdmin?'<div class="admin-bar"><span class="badge">Admin</span><span>Manage transfers</span><button class="admin-btn-add" onclick="openTransferForm()">+ Add Transfer</button></div>':'';
  list.innerHTML=tfab+tfs.map(t=>{
    const f=t.fee?`£${Number(t.fee).toLocaleString()}`:'Free';
    const from=S.teams.find(te=>te.id===t.fromTeamId);
    const to=S.teams.find(te=>te.id===t.toTeamId);
    const tfamb=isAdmin?`<div style="display:flex;gap:0.25rem;margin-top:0.5rem;justify-content:flex-end"><button class="admin-btn admin-btn-del" onclick="event.stopPropagation();deleteTransfer('${t.id}')">Delete</button></div>`:'';
    return `<div class="transfer-card" onclick="showTransfer('${t.id}')"><div class="transfer-icon">🔄</div><div class="transfer-info"><div class="transfer-player">${esc(t.playerName||'Unknown')}</div><div class="transfer-path">${from?esc(from.shortName||from.name):'?'} <span class="arrow">→</span> ${to?esc(to.shortName||to.name):'?'}</div><div class="transfer-footer"><span class="transfer-fee">${f}</span><span>${t.date||''}</span><span class="transfer-badge tb-${t.status||'pending'}">${t.status||'pending'}</span></div>${tfamb}</div></div>`;
  }).join('');
}

window.showTransfer=async id=>{
  const t=await api.get('/api/transfers?id='+id);
  const from=S.teams.find(te=>te.id===t.fromTeamId);
  const to=S.teams.find(te=>te.id===t.toTeamId);
  const p=S.players.find(pl=>pl.id===t.playerId);
  const fee=t.fee?`£${Number(t.fee).toLocaleString()}`:'Free';
  $('transfer-modal-body').innerHTML=`<button class="modal-close" data-close="transfer-modal">&times;</button>
    <div class="transfer-detail"><div style="font-size:3rem">🔄</div><div class="transfer-detail-path">${from?esc(from.shortName):'?'} <span class="x">→</span> ${to?esc(to.shortName):'?'}</div><div style="font-size:1.3rem;font-weight:800;color:var(--text)">${esc(t.playerName||p?.name||'Unknown')}</div><div class="transfer-detail-meta"><div class="transfer-detail-item"><div class="v">${fee}</div><div class="l">Fee</div></div><div class="transfer-detail-item"><div class="v">${t.date||'N/A'}</div><div class="l">Date</div></div><div class="transfer-detail-item"><div class="v" style="color:var(--primary-light)">${t.status||'pending'}</div><div class="l">Status</div></div></div></div>`;
  openModal('transfer-modal');
};

/* ─── Admin Mode ─── */
let isAdmin = false;

function toggleAdmin() {
  isAdmin = !isAdmin;
  document.body.classList.toggle('admin-mode', isAdmin);
  render(location.hash.replace('#','')||'home');
}
document.getElementById('admin-toggle')?.addEventListener('click', toggleAdmin);

function populateTeamSelects() {
  ['player-team-id','match-home-team-id','match-away-team-id','transfer-from-team-id','transfer-to-team-id'].forEach(id => {
    const sel = $(id); if (!sel) return;
    sel.innerHTML = '<option value="">Select Team</option>' + S.teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
  });
}
function populatePlayerSelect() {
  const sel = $('#transfer-player-id'); if (!sel) return;
  sel.innerHTML = '<option value="">Select Player</option>' + S.players.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
}

/* ── Team CRUD ── */
window.openTeamForm = function(id) {
  populateTeamSelects();
  const f = $('#team-form'); f && f.reset();
  $('#team-color1') && ($('#team-color1').value = '#059669');
  $('#team-color2') && ($('#team-color2').value = '#ffffff');
  if (id) {
    const t = S.teams.find(x => x.id === id); if (!t) return;
    $('#team-form-title').textContent = 'Edit Team';
    $('#team-id').value = t.id;
    $('#team-name').value = t.name || '';
    $('#team-short-name').value = t.shortName || '';
    $('#team-founded').value = t.founded || '';
    $('#team-stadium').value = t.stadium || '';
    $('#team-color1').value = t.colors?.[0] || '#059669';
    $('#team-color2').value = t.colors?.[1] || '#ffffff';
  } else {
    $('#team-form-title').textContent = 'Add Team';
    $('#team-id').value = '';
  }
  openModal('team-form-modal');
};
window.saveTeam = async function(e) {
  e.preventDefault();
  const id = $('#team-id').value;
  const data = { name: $('#team-name').value, shortName: $('#team-short-name').value, founded: $('#team-founded').value, stadium: $('#team-stadium').value, colors: [$('#team-color1').value, $('#team-color2').value] };
  const r = id ? await fetch('/api/teams?id='+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()) : await api.post('/api/teams',data);
  if (r.error) { toast('Error: '+r.error); return; }
  toast(id ? 'Team updated' : 'Team created');
  closeModal('team-form-modal');
  render(location.hash.replace('#','')||'home');
};
window.deleteTeam = async function(id) {
  if (!confirm('Delete this team?')) return;
  const r = await fetch('/api/teams?id='+id,{method:'DELETE'}).then(r=>r.json());
  if (r.error) { toast('Error: '+r.error); return; }
  toast('Team deleted');
  render(location.hash.replace('#','')||'home');
};

/* ── Player CRUD ── */
window.openPlayerForm = function(id) {
  populateTeamSelects();
  const f = $('#player-form'); f && f.reset();
  document.querySelectorAll('#player-abilities input[type="range"]').forEach(r => { r.value = 50; r.nextElementSibling.textContent = '50'; });
  if (id) {
    const p = S.players.find(x => x.id === id); if (!p) return;
    $('#player-form-title').textContent = 'Edit Player';
    $('#player-id').value = p.id;
    $('#player-name').value = p.name || '';
    $('#player-number').value = p.number || '';
    $('#player-position').value = p.position || 'MID';
    $('#player-team-id').value = p.teamId || '';
    $('#player-nationality').value = p.nationality || '';
    $('#player-foot').value = p.foot || 'right';
    $('#player-diet').value = p.diet || '';
    $('#player-pace').value = p.pace || 50;
    $('#player-shooting').value = p.shooting || 50;
    $('#player-passing').value = p.passing || 50;
    $('#player-defending').value = p.defending || 50;
    $('#player-dribbling').value = p.dribbling || 50;
    $('#player-physical').value = p.physical || 50;
    document.querySelectorAll('#player-abilities input[type="range"]').forEach(r => { r.nextElementSibling.textContent = r.value; });
  } else {
    $('#player-form-title').textContent = 'Add Player';
    $('#player-id').value = '';
  }
  openModal('player-form-modal');
};
window.savePlayer = async function(e) {
  e.preventDefault();
  const id = $('#player-id').value;
  const data = {
    name: $('#player-name').value, number: Number($('#player-number').value), position: $('#player-position').value,
    teamId: $('#player-team-id').value, nationality: $('#player-nationality').value, foot: $('#player-foot').value,
    diet: $('#player-diet').value, pace: Number($('#player-pace').value), shooting: Number($('#player-shooting').value),
    passing: Number($('#player-passing').value), defending: Number($('#player-defending').value),
    dribbling: Number($('#player-dribbling').value), physical: Number($('#player-physical').value),
  };
  const r = id ? await fetch('/api/players?id='+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()) : await api.post('/api/players',data);
  if (r.error) { toast('Error: '+r.error); return; }
  toast(id ? 'Player updated' : 'Player created');
  closeModal('player-form-modal');
  render(location.hash.replace('#','')||'home');
};
window.deletePlayer = async function(id) {
  if (!confirm('Delete this player?')) return;
  const r = await fetch('/api/players?id='+id,{method:'DELETE'}).then(r=>r.json());
  if (r.error) { toast('Error: '+r.error); return; }
  toast('Player deleted');
  render(location.hash.replace('#','')||'home');
};

/* ── Match CRUD ── */
window.openMatchForm = function(id) {
  populateTeamSelects();
  const f = $('#match-form'); f && f.reset();
  if (id) {
    const m = S.matches.find(x => x.id === id); if (!m) return;
    $('#match-form-title').textContent = 'Edit Match';
    $('#match-id').value = m.id;
    $('#match-home-team-id').value = m.homeTeamId || '';
    $('#match-away-team-id').value = m.awayTeamId || '';
    $('#match-date').value = m.date ? m.date.split('T')[0] : '';
    $('#match-time').value = m.time || '20:00';
    $('#match-venue').value = m.venue || '';
    $('#match-home-score').value = m.homeScore ?? '';
    $('#match-away-score').value = m.awayScore ?? '';
    $('#match-status').value = m.status || 'scheduled';
  } else {
    $('#match-form-title').textContent = 'Schedule Match';
    $('#match-id').value = '';
  }
  openModal('match-form-modal');
};
window.saveMatch = async function(e) {
  e.preventDefault();
  const id = $('#match-id').value;
  const hs = $('#match-home-score').value, as = $('#match-away-score').value;
  const data = {
    homeTeamId: $('#match-home-team-id').value, awayTeamId: $('#match-away-team-id').value,
    date: $('#match-date').value, time: $('#match-time').value, venue: $('#match-venue').value,
    homeScore: hs !== '' ? Number(hs) : null, awayScore: as !== '' ? Number(as) : null,
    status: $('#match-status').value,
  };
  const r = id ? await fetch('/api/matches?id='+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()) : await api.post('/api/matches',data);
  if (r.error) { toast('Error: '+r.error); return; }
  toast(id ? 'Match updated' : 'Match created');
  closeModal('match-form-modal');
  render(location.hash.replace('#','')||'home');
};
window.deleteMatch = async function(id) {
  if (!confirm('Delete this match?')) return;
  const r = await fetch('/api/matches?id='+id,{method:'DELETE'}).then(r=>r.json());
  if (r.error) { toast('Error: '+r.error); return; }
  toast('Match deleted');
  render(location.hash.replace('#','')||'home');
};

/* ── Ad CRUD ── */
window.openAdForm = function(id) {
  if (id) { toast('Editing ads inline coming soon'); return; }
  $('#ad-form-title').textContent = 'Add Ad';
  $('#ad-id').value = '';
  const f = $('#ad-form'); f && f.reset();
  openModal('ad-form-modal');
};
window.saveAd = async function(e) {
  e.preventDefault();
  const id = $('#ad-id').value;
  const data = {
    advertiser: $('#ad-advertiser').value, product: $('#ad-product').value,
    description: $('#ad-description').value, imageUrl: $('#ad-image-url').value,
    linkUrl: $('#ad-link-url').value, status: $('#ad-status').value,
    clicks: Number($('#ad-clicks').value),
  };
  const r = id ? await fetch('/api/ads?id='+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()) : await api.post('/api/ads',data);
  if (r.error) { toast('Error: '+r.error); return; }
  toast(id ? 'Ad updated' : 'Ad created');
  closeModal('ad-form-modal');
};
window.deleteAd = async function(id) {
  if (!confirm('Delete this ad?')) return;
  const r = await fetch('/api/ads?id='+id,{method:'DELETE'}).then(r=>r.json());
  if (r.error) { toast('Error: '+r.error); return; }
  toast('Ad deleted');
};

/* ── Transfer CRUD ── */
window.openTransferForm = function(id) {
  if (id) { toast('Editing transfers inline coming soon'); return; }
  populateTeamSelects();
  populatePlayerSelect();
  const f = $('#transfer-form'); f && f.reset();
  $('#transfer-form-title').textContent = 'Add Transfer';
  $('#transfer-id').value = '';
  openModal('transfer-form-modal');
};
window.saveTransfer = async function(e) {
  e.preventDefault();
  const id = $('#transfer-id').value;
  const data = {
    playerId: $('#transfer-player-id').value, fromTeamId: $('#transfer-from-team-id').value,
    toTeamId: $('#transfer-to-team-id').value, fee: Number($('#transfer-fee').value),
    date: $('#transfer-date').value, status: $('#transfer-status').value,
  };
  const r = id ? await fetch('/api/transfers?id='+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()) : await api.post('/api/transfers',data);
  if (r.error) { toast('Error: '+r.error); return; }
  toast(id ? 'Transfer updated' : 'Transfer created');
  closeModal('transfer-form-modal');
  render(location.hash.replace('#','')||'home');
};
window.deleteTransfer = async function(id) {
  if (!confirm('Delete this transfer?')) return;
  const r = await fetch('/api/transfers?id='+id,{method:'DELETE'}).then(r=>r.json());
  if (r.error) { toast('Error: '+r.error); return; }
  toast('Transfer deleted');
  render(location.hash.replace('#','')||'home');
};

/* ─── Helpers ─── */
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function populateFilters(){
  const sel=$('player-team-filter');
  if(sel){const pv=sel.value;sel.innerHTML='<option value="">All Teams</option>'+S.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');sel.value=pv}
}

/* ─── Init ─── */
(async function init(){await load();populateFilters();hash()})();

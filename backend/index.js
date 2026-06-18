const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── Utilitaire ────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ── Auth ──────────────────────────────────────────────────────
const users = {};    // { [id]: { id, email, password, nom } }
const sessions = {}; // { [token]: userId }

// Comptes toujours disponibles au démarrage
const _demoId = uid();
users[_demoId] = { id: _demoId, email: 'demo@brace4safe.fr', password: 'demo123', nom: 'Compte démo' };
const _testId = uid();
users[_testId] = { id: _testId, email: 'test@example.com', password: 'test', nom: 'Compte test' };
console.log('Compte démo : demo@brace4safe.fr / demo123');
console.log('Compte test : test@example.com / test');

function requireAuth(req, res, next) {
  const auth = req.headers['authorization'];
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const userId = token ? sessions[token] : null;
  if (!userId) return res.status(401).json({ error: 'Non authentifié' });
  req.userId = userId;
  req.user = users[userId];
  next();
}

app.post('/api/auth/register', (req, res) => {
  const { email, password, nom } = req.body ?? {};
  if (!email || !password || !nom) return res.status(400).json({ error: 'Champs requis manquants' });
  if (Object.values(users).find(u => u.email === email))
    return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  const id = uid();
  users[id] = { id, email, password, nom };
  const token = uid();
  sessions[token] = id;
  res.json({ token, user: { id, email, nom } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const user = Object.values(users).find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  const token = uid();
  sessions[token] = user.id;
  res.json({ token, user: { id: user.id, email: user.email, nom: user.nom } });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = req.headers['authorization']?.slice(7);
  delete sessions[token];
  res.sendStatus(204);
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const { id, email, nom } = req.user;
  res.json({ id, email, nom });
});

// ── Événements ────────────────────────────────────────────────
const events = {};

// ── Seed automatique pour test@example.com ────────────────────
(function seedTest() {
  const TYPES    = ['vagal','déshydratation','hypoglycémie','chaleur','alcool','chute'];
  const GRAVITES = ['faible','moderee','elevee'];
  const SEXES    = ['homme','femme','np'];
  const AGES     = ['<18','18-25','26-35','36-50','>50'];
  const ZONES    = ['milieu','avant_scene','arriere'];
  const DENSITES = ['faible','moyenne','forte'];
  const EVTS     = ['musique','sport','politique'];
  const ALCOELS  = ['faible','modere','non_mesure','eleve'];
  const TEMPS    = ['<10','10-20','>20'];
  const DATES    = ['2024-07-14','2024-07-15','2024-07-16','2024-07-17','2024-07-18'];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const evtId = uid();
  events[evtId] = {
    id: evtId, userId: _testId,
    nom: 'Festival Été 2024', lieu: 'Paris', type: 'musique',
    date: '2024-07-15', nbBracelets: 50,
    statut: 'actif', malaises: [],
    createdAt: new Date().toISOString(),
  };

  for (let i = 0; i < 60; i++) {
    const h = Math.floor(Math.random() * 14) + 10;
    const m = Math.floor(Math.random() * 60);
    events[evtId].malaises.push({
      id: uid(), eventId: evtId, userId: _testId,
      date:         pick(DATES),
      type:         pick(TYPES),
      age:          pick(AGES),
      sexe:         pick(SEXES),
      zone:         pick(ZONES),
      densite:      pick(DENSITES),
      event:        pick(EVTS),
      gravite:      pick(GRAVITES),
      intervention: 'oui',
      temps:        pick(TEMPS),
      alcool:       pick(ALCOELS),
      heure:        `${h}:${String(m).padStart(2, '0')}`,
    });
  }
  console.log(`Seed : 60 malaises créés pour test@example.com (événement "${events[evtId].nom}")`);
})();

// ── Seed automatique pour demo@brace4safe.fr ─────────────────
(function seedDemo() {
  const TYPES    = ['vagal','déshydratation','hypoglycémie','chaleur','alcool','chute'];
  const GRAVITES = ['faible','moderee','elevee'];
  const SEXES    = ['homme','femme','np'];
  const AGES     = ['<18','18-25','26-35','36-50','>50'];
  const ZONES    = ['milieu','avant_scene','arriere'];
  const DENSITES = ['faible','moyenne','forte'];
  const EVTS     = ['musique','sport','politique'];
  const ALCOELS  = ['faible','modere','non_mesure','eleve'];
  const TEMPS    = ['<10','10-20','>20'];
  const DATES    = ['2024-07-14','2024-07-15','2024-07-16','2024-07-17','2024-07-18'];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const evtId = uid();
  events[evtId] = {
    id: evtId, userId: _demoId,
    nom: 'Festival Été 2024', lieu: 'Paris', type: 'musique',
    date: '2024-07-15', nbBracelets: 50,
    statut: 'actif', malaises: [],
    createdAt: new Date().toISOString(),
  };

  for (let i = 0; i < 60; i++) {
    const h = Math.floor(Math.random() * 14) + 10;
    const m = Math.floor(Math.random() * 60);
    events[evtId].malaises.push({
      id: uid(), eventId: evtId, userId: _demoId,
      date:         pick(DATES),
      type:         pick(TYPES),
      age:          pick(AGES),
      sexe:         pick(SEXES),
      zone:         pick(ZONES),
      densite:      pick(DENSITES),
      event:        pick(EVTS),
      gravite:      pick(GRAVITES),
      intervention: 'oui',
      temps:        pick(TEMPS),
      alcool:       pick(ALCOELS),
      heure:        `${h}:${String(m).padStart(2, '0')}`,
    });
  }
  console.log(`Seed : 60 malaises créés pour demo@brace4safe.fr (événement "${events[evtId].nom}")`);
})();

app.post('/api/events', requireAuth, (req, res) => {
  const { nom, lieu, type, date, nbBracelets } = req.body ?? {};
  if (!nom || !lieu || !type || !date) return res.status(400).json({ error: 'Champs requis manquants' });
  const id = uid();
  events[id] = { id, userId: req.userId, nom, lieu, type, date, nbBracelets: nbBracelets || 0, statut: 'planifie', malaises: [], createdAt: new Date().toISOString() };
  res.json({ ...events[id], malaises: undefined, totalMalaises: 0 });
});

app.get('/api/events', requireAuth, (req, res) => {
  const list = Object.values(events)
    .filter(e => e.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(e => ({ ...e, malaises: undefined, totalMalaises: e.malaises.length }));
  res.json(list);
});

app.patch('/api/events/:id/activate', requireAuth, (req, res) => {
  const event = events[req.params.id];
  if (!event || event.userId !== req.userId) return res.status(404).json({ error: 'Introuvable' });
  Object.values(events).filter(e => e.userId === req.userId && e.statut === 'actif').forEach(e => { e.statut = 'planifie'; });
  event.statut = 'actif';
  res.json({ ...event, malaises: undefined, totalMalaises: event.malaises.length });
});

app.patch('/api/events/:id/close', requireAuth, (req, res) => {
  const event = events[req.params.id];
  if (!event || event.userId !== req.userId) return res.status(404).json({ error: 'Introuvable' });
  event.statut = 'termine';
  res.json({ ...event, malaises: undefined, totalMalaises: event.malaises.length });
});

// ── Malaises ──────────────────────────────────────────────────
app.post('/api/malaises', requireAuth, (req, res) => {
  const { eventId, malaise } = req.body ?? {};
  const event = eventId ? events[eventId] : null;
  if (!event || event.userId !== req.userId) return res.status(404).json({ error: 'Événement introuvable' });
  const m = { ...malaise, id: uid(), eventId, userId: req.userId, date: malaise?.date || new Date().toISOString().slice(0, 10) };
  event.malaises.push(m);
  res.json(m);
});

app.get('/api/malaises', requireAuth, (req, res) => {
  const { eventId } = req.query;
  if (eventId) {
    const event = events[eventId];
    if (!event || event.userId !== req.userId) return res.status(404).json({ error: 'Introuvable' });
    return res.json(event.malaises);
  }
  const all = Object.values(events).filter(e => e.userId === req.userId).flatMap(e => e.malaises);
  res.json(all);
});

// ── État bracelets simulation Python ──────────────────────────
let braceletsState = {};
let simBracelets = {}; // données complètes poussées par Python

// ── État vrai bracelet (envoyé par le hardware) ───────────────
let realBracelet = null;

app.get('/', (req, res) => res.send('Backend OK'));

// ── Routes simulation Python ──────────────────────────────────
app.post('/api/bracelet', (req, res) => {
  const { id, level, malaise } = req.body;
  braceletsState[id] = { id, level, malaise, time: new Date().toISOString() };
  simBracelets[id] = { ...req.body, time: new Date().toISOString() };
  res.sendStatus(200);
});

app.get('/api/sim-bracelets', (req, res) => {
  res.json(Object.values(simBracelets));
});

app.get('/api/bracelet', (req, res) => {
  const enAlerte = Object.values(braceletsState)
    .filter(b => b.level > 0)
    .sort((a, b) => a.id - b.id);
  res.json(enAlerte);
});

// ── Routes vrai bracelet ──────────────────────────────────────
app.post('/api/bracelet/real', (req, res) => {
  const body = req.body;
  console.log('📡 Bracelet réel reçu :', body);
  realBracelet = {
    bracelet_id: body.bracelet_id,
    bpm:         body.bpm,
    bpm_avg:     body.bpm_avg,
    spo2:        body.spo2,
    ir:          body.ir,
    humidity:    body.humidity,
    finger:      body.finger,
    gtag_count:  body.gtag_count,
    gtag_found:  body.gtag_found,
    gtags:       body.gtags || [],
    time:        new Date().toISOString()
  };
  res.sendStatus(200);
});

app.get('/api/bracelet/real', (req, res) => {
  res.json(realBracelet);
});

// ── Simulation design-test ────────────────────────────────────
const NUM_BRACELETS = 3;
const HISTORY = 60;

const ANCHORS = [
  { id: 'B1', x: 150, y: 80  },
  { id: 'B2', x: 650, y: 80  },
  { id: 'B3', x: 400, y: 430 },
];

const VITALS = {
  0: { bpm: 72,  spo2: 98.5, temp: 36.8 },
  1: { bpm: 98,  spo2: 96.0, temp: 37.3 },
  2: { bpm: 118, spo2: 92.0, temp: 38.0 },
  3: { bpm: 42,  spo2: 87.0, temp: 38.8 },
};

function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
function r1(v) { return Math.round(v * 10) / 10; }
function computeRSSI(bx, by, ax, ay) {
  const d = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2) / 100;
  return Math.round(clamp(-40 - 20 * Math.log10(Math.max(d, 0.1)) + rand(-3, 3), -100, -20));
}

const simState = Array.from({ length: NUM_BRACELETS }, (_, i) => ({
  id: i + 1, level: 0, malaise: null,
  x: rand(180, 620), y: rand(180, 350),
  vx: rand(-1.5, 1.5), vy: rand(-1.5, 1.5),
  bpm: rand(65, 80), spo2: rand(97, 99), temp: rand(36.4, 37.0),
  history: { bpm: [], spo2: [], temp: [], ts: [] },
}));

function syncLevels() {
  const alerts = Object.values(braceletsState);
  simState.forEach(b => { b.level = 0; b.malaise = null; });
  alerts.forEach(d => {
    const b = simState.find(x => x.id === d.id);
    if (b) { b.level = d.level; b.malaise = d.malaise; }
  });
}

function updateSimState() {
  const now = new Date().toISOString();
  simState.forEach(b => {
    b.vx += rand(-0.3, 0.3); b.vy += rand(-0.3, 0.3);
    b.vx = clamp(b.vx, -2, 2); b.vy = clamp(b.vy, -2, 2);
    b.x  = clamp(b.x + b.vx, 130, 670);
    b.y  = clamp(b.y + b.vy, 120, 390);
    if (b.x <= 130 || b.x >= 670) b.vx *= -1;
    if (b.y <= 120 || b.y >= 390) b.vy *= -1;

    const t = VITALS[b.level] ?? VITALS[0];
    b.bpm  += (t.bpm  - b.bpm)  * 0.15 + rand(-1.5, 1.5);
    b.spo2 += (t.spo2 - b.spo2) * 0.15 + rand(-0.2, 0.2);
    b.temp += (t.temp - b.temp) * 0.15 + rand(-0.06, 0.06);
    b.bpm  = clamp(Math.round(b.bpm), 30, 200);
    b.spo2 = clamp(r1(b.spo2), 70, 100);
    b.temp = clamp(r1(b.temp), 35, 42);

    const h = b.history;
    h.bpm.push(b.bpm); h.spo2.push(b.spo2); h.temp.push(b.temp); h.ts.push(now);
    if (h.bpm.length > HISTORY) { h.bpm.shift(); h.spo2.shift(); h.temp.shift(); h.ts.shift(); }
  });
}

setInterval(() => { syncLevels(); updateSimState(); }, 2000);
syncLevels(); updateSimState();

app.get('/api/design-test/bracelets', (_, res) => {
  res.json({
    bracelets: simState.map(b => ({
      id: b.id, level: b.level, malaise: b.malaise,
      x: Math.round(b.x), y: Math.round(b.y),
      bpm: b.bpm, spo2: b.spo2, temp: b.temp,
      rssi: ANCHORS.map(a => ({ id: a.id, value: computeRSSI(b.x, b.y, a.x, a.y) })),
      history: b.history,
    })),
    stats: {
      total:     NUM_BRACELETS,
      normal:    simState.filter(b => b.level === 0).length,
      attention: simState.filter(b => b.level === 1).length,
      alerte:    simState.filter(b => b.level === 2).length,
      urgence:   simState.filter(b => b.level === 3).length,
    },
  });
});

// ── Seed données de test ──────────────────────────────────────
app.post('/api/seed', requireAuth, (req, res) => {
  const TYPES    = ['vagal','déshydratation','hypoglycémie','chaleur','alcool','chute'];
  const GRAVITES = ['faible','moderee','elevee'];
  const SEXES    = ['homme','femme','np'];
  const AGES     = ['<18','18-25','26-35','36-50','>50'];
  const ZONES    = ['milieu','avant_scene','arriere'];
  const DENSITES = ['faible','moyenne','forte'];
  const EVENTS   = ['musique','sport','politique'];
  const ALCOELS  = ['faible','modere','non_mesure','eleve'];
  const TEMPS    = ['<10','10-20','>20'];
  const DATES    = ['2024-07-14','2024-07-15','2024-07-16','2024-07-17','2024-07-18'];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const eventId = uid();
  events[eventId] = {
    id: eventId,
    userId: req.userId,
    nom: 'Festival Été Test',
    lieu: 'Paris',
    type: 'musique',
    date: '2024-07-15',
    nbBracelets: 50,
    statut: 'actif',
    malaises: [],
    createdAt: new Date().toISOString(),
  };

  // Désactiver les autres événements actifs
  Object.values(events)
    .filter(e => e.userId === req.userId && e.id !== eventId && e.statut === 'actif')
    .forEach(e => { e.statut = 'planifie'; });

  for (let i = 0; i < 50; i++) {
    const h = Math.floor(Math.random() * 14) + 10;
    const m = Math.floor(Math.random() * 60);
    events[eventId].malaises.push({
      id: uid(),
      eventId,
      userId: req.userId,
      date:        pick(DATES),
      type:        pick(TYPES),
      age:         pick(AGES),
      sexe:        pick(SEXES),
      zone:        pick(ZONES),
      densite:     pick(DENSITES),
      event:       pick(EVENTS),
      gravite:     pick(GRAVITES),
      intervention:'oui',
      temps:       pick(TEMPS),
      alcool:      pick(ALCOELS),
      heure:       `${h}:${String(m).padStart(2,'0')}`,
    });
  }

  res.json({
    event: { ...events[eventId], malaises: undefined, totalMalaises: 50 },
    total: 50,
  });
});

// ── Démarrage ─────────────────────────────────────────────────
app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));

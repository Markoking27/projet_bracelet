// DESIGN-TEST — supprimer ce fichier pour retirer le dashboard
// Lancer avec : node design-test-server.js  (port 3001)
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const BACKEND_URL = 'http://localhost:3000/api/bracelet';
const NUM_BRACELETS = 3;
const HISTORY = 60;

function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
function r1(v) { return Math.round(v * 10) / 10; }

// 3 balises BLE — positionnées en triangle pour couvrir l'espace
const ANCHORS = [
  { id: 'B1', x: 150, y: 80  }, // haut-gauche
  { id: 'B2', x: 650, y: 80  }, // haut-droite
  { id: 'B3', x: 400, y: 430 }, // bas-centre
];

function computeRSSI(bx, by, ax, ay) {
  const d = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2) / 100;
  return Math.round(clamp(-40 - 20 * Math.log10(Math.max(d, 0.1)) + rand(-3, 3), -100, -20));
}

const VITALS = {
  0: { bpm: 72,  spo2: 98.5, temp: 36.8 },
  1: { bpm: 98,  spo2: 96.0, temp: 37.3 },
  2: { bpm: 118, spo2: 92.0, temp: 38.0 },
  3: { bpm: 42,  spo2: 87.0, temp: 38.8 },
};

const state = Array.from({ length: NUM_BRACELETS }, (_, i) => ({
  id: i + 1,
  level: 0,
  malaise: null,
  x: rand(180, 620),
  y: rand(180, 350),
  vx: rand(-1.5, 1.5),
  vy: rand(-1.5, 1.5),
  bpm:  rand(65, 80),
  spo2: rand(97, 99),
  temp: rand(36.4, 37.0),
  history: { bpm: [], spo2: [], temp: [], ts: [] },
}));

async function fetchHealth() {
  try {
    const res = await fetch(BACKEND_URL);
    const data = await res.json();
    state.forEach(b => { b.level = 0; b.malaise = null; });
    data.forEach(d => {
      const b = state.find(x => x.id === d.id);
      if (b) { b.level = d.level; b.malaise = d.malaise; }
    });
  } catch (_) {}
}

function updateState() {
  const now = new Date().toISOString();
  state.forEach(b => {
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

async function tick() { await fetchHealth(); updateState(); }
tick();
setInterval(tick, 2000);

app.get('/api/design-test/bracelets', (_, res) => {
  res.json({
    bracelets: state.map(b => ({
      id: b.id, level: b.level, malaise: b.malaise,
      x: Math.round(b.x), y: Math.round(b.y),
      bpm: b.bpm, spo2: b.spo2, temp: b.temp,
      rssi: ANCHORS.map(a => ({ id: a.id, value: computeRSSI(b.x, b.y, a.x, a.y) })),
      history: b.history,
    })),
    stats: {
      total:     NUM_BRACELETS,
      normal:    state.filter(b => b.level === 0).length,
      attention: state.filter(b => b.level === 1).length,
      alerte:    state.filter(b => b.level === 2).length,
      urgence:   state.filter(b => b.level === 3).length,
    },
  });
});

app.listen(3001, () => console.log('[DESIGN-TEST] http://localhost:3001'));

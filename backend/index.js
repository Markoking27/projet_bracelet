const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let braceletsState = {};

app.get('/', (req, res) => res.send('Backend OK'));

app.post('/api/bracelet', (req, res) => {
  const { id, level, malaise } = req.body;

  braceletsState[id] = {
    id,
    level,
    malaise,
    time: new Date().toISOString()
  };

  console.log('État mis à jour :', braceletsState[id]);
  res.sendStatus(200);
});

app.get('/api/bracelet', (req, res) => {
  const enAlerte = Object.values(braceletsState)
    .filter(b => b.level > 0)
    .sort((a, b) => a.id - b.id);

  res.json(enAlerte);
});

app.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000');
});
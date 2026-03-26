const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Backend OK');
});

app.listen(3000, () => {
  console.log('Serveur lancé sur port 3000');
});
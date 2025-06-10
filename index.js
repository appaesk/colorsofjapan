const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from 'public' and 'node_modules' if you really need to
app.use(express.static(path.join(__dirname)));
app.use('/libs', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
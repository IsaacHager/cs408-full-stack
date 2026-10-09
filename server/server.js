const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/main', (req, res) => {
    res.json({text: "Hello World"});
});

// Serve Vite's built static assets
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route to serve index.html for React Router / SPA navigation
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

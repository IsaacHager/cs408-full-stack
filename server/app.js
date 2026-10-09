const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve Vite's built static assets
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/health', (req, res) => {
    res.sendStatus(200);
});

app.get('/api/main', (req, res) => {
    res.json({text: "Hello World"});
});

// Catch-all route to serve index.html for React Router / SPA navigation
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = app;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const canvasRoutes = require('./routes/canvasRoutes');
const authRoutes = require('./routes/authRoutes');
const draftRoutes = require('./routes/draftRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve Vite's built static assets
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/health', (req, res) => {
    res.sendStatus(200);
});

app.get('/api/main', (req, res) => {
    res.json({ text: "Hello World" });
});

app.use('/api/canvas', canvasRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/draft', draftRoutes);

// Catch-all route to serve index.html for React Router / SPA navigation
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = app;
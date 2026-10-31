const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { encryptToken } = require('../utils/encryption');
const { makeAPIRequest } = require('../utils/canvasAPIInterface');

const app = express();

app.use(cors());
app.use(express.json());

// Serve Vite's built static assets
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/health', (req, res) => {
    res.sendStatus(200);
});

app.get('/api/main', (req, res) => {
    res.json({ text: "Hello World" });
});

app.post('/api/courses', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter.' });
    }

    try {
        const courses = await makeAPIRequest(userId, '/api/v1/users/self/favorites/courses?include[]=term&include[]=enrollments&include[]=course_image');

        return res.json(courses);
    } catch (error) {
        console.error('Error in /api/courses: ', error);
        res.status(500).json({ error: 'Failed to load course data.' });
    }
});

app.post('/api/users/sync', async (req, res) => {
    const { userId, email, name } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const db = mongoose.connection.db;

        const result = await db.collection('users').findOneAndUpdate(
            { userId },
            {
                $setOnInsert: {
                    userId,
                    createdAt: new Date(),
                    canvasToken: null,
                    canvasDomain: null,
                    hasCanvasToken: false,
                },
                $set: {
                    email: email || '',
                    name: name || '',
                    lastLogin: new Date(),
                },
            },
            { upsert: true, returnDocument: 'after' }
        );

        const userDoc = result.value || result;

        return res.json({
            userId: userDoc.userId,
            email: userDoc.email,
            name: userDoc.name,
            hasCanvasToken: !!userDoc.hasCanvasToken,
            canvasDomain: userDoc.canvasDomain || null,
        });
    } catch (error) {
        console.error('User sync error:', error);
        return res.status(500).json({ error: 'Failed to sync user record' });
    }
});

app.get('api/users/:userId', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const user = await db.collection('users').findOne({ userId: req.params.userId });

        if (!user) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        return res.json({
            userId: user.userId,
            email: user.email,
            name: user.name,
            hasCanvasToken: !!user.hasCanvasToken,
            canvasDomain: user.canvasDomain || null,
        });
    } catch (error) {
        console.error('Fetch user error:', error);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

app.post('/api/canvas/connect', async (req, res) => {
    const { userId, canvasDomain, canvasToken } = req.body;

    if (!userId || !canvasDomain || !canvasToken) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const cleanDomain = canvasDomain
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .trim();

    try {
        const canvasTestUrl = `https://${cleanDomain}/api/v1/users/self`;
        const canvasRes = await fetch(canvasTestUrl, {
            headers: { Authorization: `Bearer ${canvasToken.trim()}` },
            signal: AbortSignal.timeout(5000),
        });

        if (canvasRes.status === 401) {
            return res.status(401).json({ error: 'Canvas token is invalid or expired.' });
        }

        if (!canvasRes.ok) {
            return res.status(canvasRes.status).json({ 
                error: `Canvas server returned status ${canvasRes.status}. Check your Canvas domain.` 
            });
        }

        const canvasData = await canvasRes.json();

        if (!canvasData || !canvasData.id) {
            return res.status(400).json({ error: 'Invalid response format received from Canvas.' });
        }

        const encryptedToken = encryptToken(canvasToken.trim());

        const db = mongoose.connection.db;
        const result = await db.collection('users').updateOne(
            { userId },
            {
                $set: {
                    canvasDomain: cleanDomain,
                    canvasToken: encryptedToken,
                    hasCanvasToken: true,
                    canvasUserId: canvasData.id,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User record not found.' });
        }

        return res.json({
            success: true,
            message: 'Canvas token connected successfully.',
            canvasUser: {
                id: canvasData.id,
                name: canvasData.name,
            },
        });
    } catch (error) {
        if (error.name === 'TimeoutError') {
            return res.status(504).json({ error: 'Canvas server connection timed out.' });
        }
        console.error('Canvas connection error:', error.message);
        return res.status(500).json({ error: 'Failed to verify or connect Canvas token.' });
    }
});

// Catch-all route to serve index.html for React Router / SPA navigation
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = app;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { login, signup, DuplicateUserError } = require('../../utils/authentication');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password.' });
    }

    try {
        const response = await login(username, password);

        res.cookie('userId', response.id, { httpOnly: true, sameSite: 'Strict' });

        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to log in user.' });
    }

});

router.post('/logout', (req, res) => {
    res.clearCookie('userId', { httpOnly: true, sameSite: 'Strict' });
    return res.json({ message: 'User logged out successfully.' });
});

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password.' });
    }

    try {
        await signup(username, password);
        res.status(201).send();
    } catch (error) {
        if (error instanceof DuplicateUserError) {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to sign up user.' });
        }
    }
});

router.get('/sync', async (req, res) => {
    try {
        const userId = req.cookies?.userId || req.query?.userId;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

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
                    lastLogin: new Date(),
                },
            },
            { upsert: true, returnDocument: 'after' }
        );

        const userDoc = result.value || result;

        return res.json({
            id: userDoc.userId,
            name: userDoc.name,
            hasCanvasToken: !!userDoc.hasCanvasToken,
            canvasDomain: userDoc.canvasDomain || null,
        });
    } catch (error) {
        console.error('User sync error:', error);
        return res.status(500).json({ error: 'Failed to sync user record' });
    }
});

module.exports = router;

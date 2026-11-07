const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

class DuplicateUserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DuplicateUserError';
    }
}

async function login(username, password) {
    const db = mongoose.connection.db;

    const userInDb = await db.collection('users').findOne({ name: username });

    if (!userInDb) {
        throw new Error(`User with username ${username} not found in the database.`);
    }

    if (!bcrypt.compareSync(password, userInDb.passwordHash)) {
        throw new Error('Invalid password.');
    }

    return {
        id: userInDb.userId,
        name: userInDb.name,
        canvasDomain: userInDb.canvasDomain || null,
        hasCanvasToken: !!userInDb.canvasToken,
    };
}

async function signup(username, password) {
    const db = mongoose.connection.db;

    if (!username || !password) {
        throw new Error('Missing required fields for signup.');
    }

    const existingUser = await db.collection('users').findOne({ name: username });
    if (existingUser) {
        throw new DuplicateUserError('User with this username already exists.');
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = {
        userId: new mongoose.Types.ObjectId().toString(),
        name: username,
        passwordHash: passwordHash,
        canvasDomain: null,
        canvasToken: null,
        hasCanvasToken: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
    };

    await db.collection('users').insertOne(newUser);
}

module.exports = { login, signup, DuplicateUserError };
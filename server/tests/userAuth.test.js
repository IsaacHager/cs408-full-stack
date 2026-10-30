// NOTE this test no longer tests for auth, but for userSync
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { connectTestDb, clearTestDb, closeTestDb } = require('./setupDb');

describe('User Registration to Database', () => {
    beforeAll(async () => await connectTestDb());

    afterEach(async () => await clearTestDb());

    afterAll(async () => await closeTestDb());

    describe('POST /api/users/sync', () => {
        const secret = process.env.AUTH0_WEBHOOK_SECRET;
        
        const mockUserPayload = {
            userId: 'auth0|123456789',
            email: 'student@u.boisestate.edu',
            name: 'Student',
        };

        test('response succeeds', async () => {
            const response = await request(app)
                .post('/api/users/sync')
                .send(mockUserPayload);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                userId: 'auth0|123456789',
                email: 'student@u.boisestate.edu',
                name: 'Student',
                hasCanvasToken: false,
                canvasDomain: null,
            });
        });

        test('registered user exists in database', async () => {
            await request(app)
                .post('/api/users/sync')
                .send(mockUserPayload);

            const db = mongoose.connection.db;

            if (db) {
                const userInDb = await db.collection('users').findOne({ userId: mockUserPayload.userId });
                expect(userInDb.name).toBe('Student');
            }
        });

        test('edited data is preserved between logins', async() => {
                await request(app)
                .post('/api/users/sync')
                .send(mockUserPayload);

                const db = mongoose.connection.db;

                if (db) {
                    await db.collection('users').updateOne(
                        { userId: mockUserPayload.userId },
                        { $set: { hasCanvasToken: true, canvasDomain: 'canvas.boisestate.edu' } }
                    );
                }

                const repeatLoginResponse = await request(app)
                .post('/api/users/sync')
                .send(mockUserPayload);

                expect(repeatLoginResponse.status).toBe(200);

                if (db) {
                    const userInDb = await db.collection('users').findOne({ userId: mockUserPayload.userId });
                    expect(userInDb.hasCanvasToken).toBe(true);
                    expect(userInDb.canvasDomain).toBe('canvas.boisestate.edu');
                }
        });

        test('missing userId is rejected', async () => {
            const response = await request(app)
                .post('/api/users/sync')
                .send({ email: 'no_id@example.com' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
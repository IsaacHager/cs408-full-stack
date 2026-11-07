const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const { connectTestDb, clearTestDb, closeTestDb } = require('./setupDb');

describe('User Authentication and Database Sync', () => {
    beforeAll(async () => await connectTestDb());

    afterEach(async () => await clearTestDb());

    afterAll(async () => await closeTestDb());

    describe('POST /api/auth/signup', () => {

        const mockUserPayload = {
            username: 'student_user',
            password: 'securePassword123',
        };

        describe('POST /api/auth/signup', () => {
            test('successfully registers user and hashes password with bcrypt', async () => {
                const response = await request(app)
                    .post('/api/auth/signup')
                    .send(mockUserPayload);

                expect(response.status).toBe(201);

                const db = mongoose.connection.db;
                if (db) {
                    const userInDb = await db.collection('users').findOne({ name: mockUserPayload.username });
                    expect(userInDb).not.toBeNull();
                    expect(userInDb.password).toBeUndefined();
                    expect(userInDb.passwordHash).toBeDefined();

                    const isPasswordValid = await bcrypt.compare(mockUserPayload.password, userInDb.passwordHash);
                    expect(isPasswordValid).toBe(true);
                }
            });
        });

        describe('GET /api/auth/sync', () => {
            test('fetches user profile successfully using internal userId', async () => {
                await request(app)
                    .post('/api/auth/signup')
                    .send(mockUserPayload);

                const db = mongoose.connection.db;
                if (db) {
                    const userId = (await db.collection('users').findOne({ name: mockUserPayload.username })).userId;

                    const syncRes = await request(app)
                        .get(`/api/auth/sync?userId=${userId}`);

                    expect(syncRes.status).toBe(200);
                    expect(syncRes.body).toMatchObject({
                        id: userId,
                        hasCanvasToken: false,
                        canvasDomain: null,
                    });
                }
            });

            test('edited data is preserved between syncs', async () => {
                await request(app)
                    .post('/api/auth/signup')
                    .send(mockUserPayload);

                const db = mongoose.connection.db;

                if (db) {
                    const queryId = (await db.collection('users').findOne({ name: mockUserPayload.username })).userId;

                    console.log("Querying userId for sync test:", queryId);

                    await db.collection('users').updateOne(
                        { userId: queryId },
                        { $set: { hasCanvasToken: true, canvasDomain: 'canvas.boisestate.edu' } }
                    );

                    const repeatSyncRes = await request(app)
                        .get(`/api/auth/sync?userId=${queryId}`);

                    expect(repeatSyncRes.status).toBe(200);
                    expect(repeatSyncRes.body.hasCanvasToken).toBe(true);
                    expect(repeatSyncRes.body.canvasDomain).toBe('canvas.boisestate.edu');
                }
            });

            test('missing userId is rejected', async () => {
                const response = await request(app)
                    .get(`/api/auth/sync`);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
            });
        });
    });
});
const request = require('supertest');
const app = require('../app');
const { connectTestDb, clearTestDb, closeTestDb } = require('./setupDb');

beforeAll(async () => await connectTestDb());

afterEach(async () => await clearTestDb());

afterAll(async () => await closeTestDb());

describe('Backend API Endpoints', () => {
  test('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
  });
});
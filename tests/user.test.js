const request = require('supertest');
const app = require('../src/app');

describe('User Routes', () => {
  let adminToken, userToken;

  beforeAll(async () => {
    const [adminRes, userRes] = await Promise.all([
      request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'password123' }),
      request(app).post('/api/auth/login').send({ email: 'bob@example.com',   password: 'password123' }),
    ]);
    adminToken = adminRes.body.data.accessToken;
    userToken  = userRes.body.data.accessToken;
  });

  describe('GET /api/users', () => {
    it('should allow admin to list all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should deny non-admin users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      const res = await request(app)
        .get('/api/users/u1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toMatchObject({ id: 'u1', name: 'Alice Johnson' });
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app)
        .get('/api/users/not-a-real-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});

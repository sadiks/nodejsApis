const request = require('supertest');
const app = require('../src/app');

describe('Dashboard BFF Route', () => {
  let accessToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' });
    accessToken = res.body.data.accessToken;
  });

  describe('GET /api/dashboard/:userId', () => {
    it('should return aggregated dashboard data for a valid user', async () => {
      const res = await request(app)
        .get('/api/dashboard/u1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const { data } = res.body;
      // BFF shape: user + orders + notifications in one response
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('orders');
      expect(data).toHaveProperty('notifications');
      expect(data).toHaveProperty('meta');

      expect(data.user).toMatchObject({ id: 'u1', name: 'Alice Johnson' });
      expect(data.orders).toHaveProperty('total');
      expect(data.orders).toHaveProperty('pending');
      expect(data.notifications).toHaveProperty('unread');
    });

    it('should include meta timing information', async () => {
      const res = await request(app)
        .get('/api/dashboard/u2')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.body.data.meta).toHaveProperty('aggregatedAt');
      expect(res.body.data.meta).toHaveProperty('elapsed_ms');
    });

    it('should return 404 for unknown userId', async () => {
      const res = await request(app)
        .get('/api/dashboard/unknown-user')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/dashboard/u1');
      expect(res.statusCode).toBe(401);
    });
  });
});

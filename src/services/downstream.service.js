/**
 * Downstream Service — simulates calls to individual microservices.
 *
 * In production, replace the mock functions with real axios calls to your
 * internal services. The BFF pattern means this file is the ONLY place
 * in the frontend-facing layer that knows about backend service contracts.
 *
 * Example production call:
 *   const { data } = await axios.get(`${config.downstream.userServiceUrl}/users/${id}`);
 */

const logger = require('../utils/logger');

// ─── Simulated latency helper ─────────────────────────────────────────────────
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Mock data stores ─────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', status: 'active' },
  { id: 'u2', name: 'Bob Smith',     email: 'bob@example.com',   role: 'user',  status: 'active' },
  { id: 'u3', name: 'Carol White',   email: 'carol@example.com', role: 'user',  status: 'inactive' },
];

const MOCK_ORDERS = {
  u1: [
    { id: 'o101', status: 'delivered', amount: 250.00, currency: 'USD', date: '2024-12-01' },
    { id: 'o102', status: 'pending',   amount: 89.99,  currency: 'USD', date: '2025-01-10' },
  ],
  u2: [
    { id: 'o201', status: 'shipped',   amount: 120.00, currency: 'USD', date: '2025-01-08' },
  ],
  u3: [],
};

const MOCK_NOTIFICATIONS = {
  u1: [
    { id: 'n1', type: 'order_update', message: 'Your order #o102 is being processed.', read: false },
    { id: 'n2', type: 'system',       message: 'Scheduled maintenance on Jan 20.',     read: true },
  ],
  u2: [
    { id: 'n3', type: 'order_update', message: 'Your order #o201 has shipped!', read: false },
  ],
  u3: [],
};

// ─── User Service calls ───────────────────────────────────────────────────────
const getUserById = async (userId) => {
  await delay(20); // simulate network latency
  logger.debug('UserService.getUserById', { userId });
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

const getAllUsers = async () => {
  await delay(25);
  logger.debug('UserService.getAllUsers');
  return MOCK_USERS;
};

// ─── Order Service calls ──────────────────────────────────────────────────────
const getOrdersByUserId = async (userId) => {
  await delay(30);
  logger.debug('OrderService.getOrdersByUserId', { userId });
  return MOCK_ORDERS[userId] || [];
};

// ─── Notification Service calls ───────────────────────────────────────────────
const getNotificationsByUserId = async (userId) => {
  await delay(15);
  logger.debug('NotificationService.getNotificationsByUserId', { userId });
  return MOCK_NOTIFICATIONS[userId] || [];
};

module.exports = {
  getUserById,
  getAllUsers,
  getOrdersByUserId,
  getNotificationsByUserId,
};

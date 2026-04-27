/**
 * Aggregator Service — the heart of the BFF pattern.
 *
 * Instead of the React MFE making 3 separate API calls (users, orders,
 * notifications) and stitching the response in the browser, the BFF
 * calls all downstream services in parallel and returns a single
 * composed payload shaped for the dashboard UI.
 *
 * Benefits:
 *  - Reduces client-side network requests (3 → 1)
 *  - Hides internal service topology from the browser
 *  - Centralises data transformation and error handling
 *  - Enables server-side caching of aggregated results
 */

const downstream = require('./downstream.service');
const logger = require('../utils/logger');

/**
 * Assembles the complete dashboard payload for a given user.
 * All three downstream calls run concurrently via Promise.allSettled
 * so a single failing service doesn't block the entire response.
 */
const getDashboardData = async (userId) => {
  logger.info('Aggregating dashboard data', { userId });
  const startTime = Date.now();

  const [userResult, ordersResult, notificationsResult] = await Promise.allSettled([
    downstream.getUserById(userId),
    downstream.getOrdersByUserId(userId),
    downstream.getNotificationsByUserId(userId),
  ]);

  // Surface errors per-service without crashing the aggregated response
  const errors = {};

  const user = userResult.status === 'fulfilled'
    ? userResult.value
    : (errors.user = userResult.reason.message, null);

  const orders = ordersResult.status === 'fulfilled'
    ? ordersResult.value
    : (errors.orders = ordersResult.reason.message, []);

  const notifications = notificationsResult.status === 'fulfilled'
    ? notificationsResult.value
    : (errors.notifications = notificationsResult.reason.message, []);

  // If the user lookup itself failed, propagate the error
  if (!user) {
    const err = new Error(errors.user || 'User not found');
    err.statusCode = 404;
    throw err;
  }

  const elapsed = Date.now() - startTime;
  logger.info('Dashboard aggregation complete', { userId, elapsed_ms: elapsed });

  return {
    user,
    orders: {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      items: orders,
    },
    notifications: {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      items: notifications,
    },
    ...(Object.keys(errors).length && { partialErrors: errors }),
    meta: { aggregatedAt: new Date().toISOString(), elapsed_ms: elapsed },
  };
};

module.exports = { getDashboardData };

const aggregatorService = require('../services/aggregator.service');
const { success } = require('../utils/response');

/**
 * GET /api/dashboard/:userId
 *
 * BFF aggregation endpoint — returns a single composed payload for
 * the React dashboard MFE, combining user profile, recent orders,
 * and unread notifications in one network round trip.
 */
const getDashboard = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await aggregatorService.getDashboardData(userId);
    return success(res, data, 'Dashboard data aggregated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };

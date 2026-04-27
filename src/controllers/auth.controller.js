const authService = require('../services/auth.service');
const { success, badRequest } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return badRequest(res, 'Email and password are required');

    const result = await authService.login(email, password);
    return success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return badRequest(res, 'Refresh token is required');

    const tokens = authService.refreshAccessToken(refreshToken);
    return success(res, tokens, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

const me = (req, res) => {
  return success(res, req.user, 'Current user');
};

module.exports = { login, refresh, me };

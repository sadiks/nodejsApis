const downstreamService = require('../services/downstream.service');
const { success, notFound } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await downstreamService.getAllUsers();
    return success(res, users, `${users.length} users found`);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await downstreamService.getUserById(req.params.id);
    return success(res, user);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    next(err);
  }
};

module.exports = { getAllUsers, getUserById };

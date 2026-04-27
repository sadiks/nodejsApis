const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwt: jwtConfig } = require('../config');
const logger = require('../utils/logger');

// Mock user store — replace with DB in production
const USERS_DB = [
  {
    id: 'u1',
    email: 'alice@example.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'admin',
    name: 'Alice Johnson',
  },
  {
    id: 'u2',
    email: 'bob@example.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'user',
    name: 'Bob Smith',
  },
];

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name };

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  const refreshToken = jwt.sign({ id: user.id }, jwtConfig.secret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

const login = async (email, password) => {
  const user = USERS_DB.find(u => u.email === email);

  if (!user) {
    logger.warn('Login attempt with unknown email', { email });
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    logger.warn('Login attempt with wrong password', { email });
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const tokens = generateTokens(user);
  logger.info('User logged in', { userId: user.id });
  return { user: { id: user.id, email: user.email, role: user.role, name: user.name }, ...tokens };
};

const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, jwtConfig.secret);
    const user = USERS_DB.find(u => u.id === decoded.id);
    if (!user) throw new Error('User not found');
    return generateTokens(user);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }
};

module.exports = { login, refreshAccessToken };

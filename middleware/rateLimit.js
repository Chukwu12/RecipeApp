const rateLimit = require('express-rate-limit');

function buildLimiter(windowMs, max, message) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });
}

const readLimiter = buildLimiter(
  15 * 60 * 1000,
  300,
  'Too many requests. Please try again later.'
);

const authLimiter = buildLimiter(
  15 * 60 * 1000,
  20,
  'Too many authentication attempts. Please try again later.'
);

const mutationLimiter = buildLimiter(
  15 * 60 * 1000,
  60,
  'Too many write requests. Please try again later.'
);

module.exports = {
  readLimiter,
  authLimiter,
  mutationLimiter,
};
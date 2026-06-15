const logger = require('../config/logger');

function errorHandler(err, req, res, _next) {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;

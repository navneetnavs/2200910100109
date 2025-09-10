const { createLoggingMiddleware, ApiLog } = require('../../Logging Middleware');

// Create logging middleware instance for backend
const loggingMiddleware = createLoggingMiddleware({
  stack: 'backend',
  package: 'url-shortener-api',
  excludePaths: ['/health', '/favicon.ico', '/static']
});

module.exports = { loggingMiddleware, ApiLog };

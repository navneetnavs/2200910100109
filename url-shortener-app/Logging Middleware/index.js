const mongoose = require('mongoose');

// API Log Schema
const apiLogSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  responseBody: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  stack: {
    type: String,
    enum: ['backend', 'frontend'],
    required: true
  },
  level: {
    type: String,
    enum: ['debug', 'info', 'warn', 'error', 'fatal'],
    default: 'info'
  },
  package: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const ApiLog = mongoose.model('ApiLog', apiLogSchema);

/**
 * Logging Middleware Factory
 * Creates a reusable logging middleware for Express applications
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.stack - 'backend' or 'frontend'
 * @param {string} options.package - Package name for identification
 * @param {Array} options.excludePaths - Paths to exclude from logging
 * @returns {Function} Express middleware function
 */
function createLoggingMiddleware(options = {}) {
  const {
    stack = 'backend',
    package: packageName = 'unknown',
    excludePaths = ['/health', '/favicon.ico']
  } = options;

  return function loggingMiddleware(req, res, next) {
    const startTime = Date.now();
    
    // Skip logging for excluded paths
    if (excludePaths.some(path => req.url.startsWith(path))) {
      return next();
    }
    
    // Store original json method
    const originalJson = res.json;
    let responseBody = null;

    // Override res.json to capture response
    res.json = function(body) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // Continue to next middleware
    next();

    // Log after response is sent
    res.on('finish', async () => {
      try {
        const responseTime = Date.now() - startTime;
        
        const logData = {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          responseTime,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          userId: req.user ? req.user._id : null,
          stack,
          package: packageName,
          level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
          message: `${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`
        };

        // Only log request body for POST/PUT/PATCH (excluding sensitive data)
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          const sanitizedBody = { ...req.body };
          if (sanitizedBody.password) delete sanitizedBody.password;
          logData.requestBody = sanitizedBody;
        }

        // Log response body for errors or important operations
        if (res.statusCode >= 400 || req.url.includes('/shorten') || req.url.includes('/stats')) {
          logData.responseBody = responseBody;
        }

        // Log error if status code indicates error
        if (res.statusCode >= 400 && responseBody && responseBody.message) {
          logData.error = responseBody.message;
        }

        await ApiLog.create(logData);
      } catch (error) {
        console.error('Logging middleware error:', error);
      }
    });
  };
}

/**
 * Manual logging function for custom log entries
 * 
 * @param {Object} logData - Log entry data
 * @param {string} logData.stack - 'backend' or 'frontend'
 * @param {string} logData.level - Log level
 * @param {string} logData.package - Package name
 * @param {string} logData.message - Log message
 * @param {Object} logData.additionalData - Any additional data
 */
async function log(logData) {
  try {
    const {
      stack = 'backend',
      level = 'info',
      package: packageName = 'manual',
      message = 'Manual log entry',
      ...additionalData
    } = logData;

    const entry = {
      method: 'MANUAL',
      url: '/manual-log',
      statusCode: 200,
      responseTime: 0,
      ip: 'system',
      stack,
      level,
      package: packageName,
      message,
      ...additionalData
    };

    await ApiLog.create(entry);
  } catch (error) {
    console.error('Manual logging error:', error);
  }
}

module.exports = {
  createLoggingMiddleware,
  log,
  ApiLog
};

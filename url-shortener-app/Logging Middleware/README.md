# Logging Middleware

A reusable logging middleware package for Express.js applications that provides comprehensive API request/response tracking and monitoring capabilities.

## Features

- **Request/Response Logging**: Captures HTTP method, URL, status codes, response times
- **User Tracking**: Associates logs with authenticated users
- **Error Monitoring**: Automatically categorizes and tracks errors
- **Flexible Configuration**: Customizable logging levels and excluded paths
- **MongoDB Integration**: Stores logs in MongoDB with structured schema
- **Stack Identification**: Differentiates between backend and frontend logs
- **Package Tracking**: Identifies which package/component generated the log

## Installation

```bash
npm install
```

## Usage

### Basic Usage

```javascript
const { createLoggingMiddleware } = require('./index');

// Create middleware instance
const loggingMiddleware = createLoggingMiddleware({
  stack: 'backend',
  package: 'url-shortener-api',
  excludePaths: ['/health', '/favicon.ico']
});

// Use in Express app
app.use(loggingMiddleware);
```

### Configuration Options

```javascript
const options = {
  stack: 'backend',           // 'backend' or 'frontend'
  package: 'my-api',          // Package identifier
  excludePaths: ['/health']   // Paths to exclude from logging
};
```

### Manual Logging

```javascript
const { log } = require('./index');

// Manual log entry
await log({
  stack: 'backend',
  level: 'error',
  package: 'handler',
  message: 'Critical database connection failure',
  additionalData: { error: 'Connection timeout' }
});
```

## Log Schema

Each log entry contains:

- `method`: HTTP method or 'MANUAL'
- `url`: Request URL or '/manual-log'
- `statusCode`: HTTP status code
- `responseTime`: Response time in milliseconds
- `ip`: Client IP address
- `userAgent`: Client user agent
- `userId`: Associated user ID (if authenticated)
- `requestBody`: Sanitized request body (sensitive data removed)
- `responseBody`: Response body (for errors/important operations)
- `error`: Error message (if applicable)
- `stack`: 'backend' or 'frontend'
- `level`: 'debug', 'info', 'warn', 'error', 'fatal'
- `package`: Package/component identifier
- `message`: Descriptive log message
- `timestamps`: Created/updated timestamps

## Log Levels

- **debug**: Detailed debugging information
- **info**: General information (default)
- **warn**: Warning conditions (4xx status codes)
- **error**: Error conditions (5xx status codes)
- **fatal**: Critical errors requiring immediate attention

## Integration Example

```javascript
const express = require('express');
const { createLoggingMiddleware, log } = require('./logging-middleware');

const app = express();

// Apply logging middleware
app.use(createLoggingMiddleware({
  stack: 'backend',
  package: 'url-shortener',
  excludePaths: ['/health', '/metrics']
}));

// Your routes
app.post('/api/shorten', async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    // Manual error logging
    await log({
      stack: 'backend',
      level: 'error',
      package: 'url-shortener',
      message: 'URL shortening failed',
      error: error.message
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Dependencies

- `mongoose`: MongoDB object modeling
- `express`: Web framework (peer dependency)

## License

ISC

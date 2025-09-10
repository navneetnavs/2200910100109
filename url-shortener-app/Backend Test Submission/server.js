const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { logManually } = require('../Logging Middleware');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Routes
app.use('/api/auth', authRoutes);

// In-memory storage for URLs
const urlStorage = new Map();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// URL Shortening API
app.post('/api/urls/shorten', verifyToken, (req, res) => {
  try {
    const { originalUrl, customAlias } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }

    // Generate short ID
    const shortId = customAlias || Math.random().toString(36).substring(2, 8);
    
    // Check if custom alias already exists
    if (customAlias && urlStorage.has(shortId)) {
      return res.status(400).json({ message: 'Custom alias already exists' });
    }

    const shortUrl = `${process.env.BASE_URL}/${shortId}`;
    
    const urlData = {
      shortId,
      originalUrl,
      shortUrl,
      userId: req.user.clientID,
      clicks: 0,
      createdAt: new Date(),
      clickHistory: []
    };

    urlStorage.set(shortId, urlData);

    res.status(201).json({
      shortId,
      originalUrl,
      shortUrl,
      clicks: 0,
      createdAt: urlData.createdAt
    });
  } catch (error) {
    console.error('URL shortening error:', error);
    res.status(500).json({ message: 'Server error during URL shortening' });
  }
});

// Get user's URLs
app.get('/api/urls', verifyToken, (req, res) => {
  try {
    const userUrls = Array.from(urlStorage.values())
      .filter(url => url.userId === req.user.clientID)
      .map(url => ({
        shortId: url.shortId,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        clicks: url.clicks,
        createdAt: url.createdAt
      }));

    res.json({
      urls: userUrls,
      total: userUrls.length
    });
  } catch (error) {
    console.error('Get URLs error:', error);
    res.status(500).json({ message: 'Server error fetching URLs' });
  }
});

// Delete URL
app.delete('/api/urls/:shortId', verifyToken, (req, res) => {
  try {
    const { shortId } = req.params;
    const url = urlStorage.get(shortId);

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    if (url.userId !== req.user.clientID) {
      return res.status(403).json({ message: 'Not authorized to delete this URL' });
    }

    urlStorage.delete(shortId);
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ message: 'Server error deleting URL' });
  }
});

// URL redirect route (for shortened URLs)
app.get('/:shortId', (req, res) => {
  try {
    const url = urlStorage.get(req.params.shortId);
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Update click count and analytics
    url.clicks += 1;
    url.clickHistory.push({
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer') || ''
    });

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logging API endpoint
app.post('/api/logs', async (req, res) => {
  try {
    const { stack, level, package: packageName, message } = req.body;

    // Validation
    if (!stack || !level || !packageName || !message) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: stack, level, package, message' 
      });
    }

    // Validate stack
    const validStacks = ['backend', 'frontend'];
    if (!validStacks.includes(stack)) {
      return res.status(400).json({ 
        message: 'Stack must be either "backend" or "frontend"' 
      });
    }

    // Validate level
    const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ 
        message: 'Level must be one of: debug, info, warn, error, fatal' 
      });
    }

    // Log the message using the logging middleware
    await logManually(stack, level, packageName, message);

    res.status(200).json({
      login: "defaultUser-1508-4153-8b49-58ff5d7c403",
      message: "log created successfully"
    });
  } catch (error) {
    console.error('Logging API error:', error);
    res.status(500).json({ message: 'Server error during logging' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'URL Shortener API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

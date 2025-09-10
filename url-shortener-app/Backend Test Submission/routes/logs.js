const express = require('express');
const { ApiLog } = require('../middleware/logging');
const auth = require('../middleware/auth');

const router = express.Router();

// Get API logs (admin only or user's own logs)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    
    // If not admin, only show user's own logs
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    // Filter by status code if provided
    if (req.query.status) {
      query.statusCode = parseInt(req.query.status);
    }

    // Filter by method if provided
    if (req.query.method) {
      query.method = req.query.method.toUpperCase();
    }

    // Filter by date range if provided
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const logs = await ApiLog.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ApiLog.countDocuments(query);

    res.json({
      logs: logs.map(log => ({
        id: log._id,
        method: log.method,
        url: log.url,
        statusCode: log.statusCode,
        responseTime: log.responseTime,
        ip: log.ip,
        userAgent: log.userAgent,
        user: log.userId ? {
          id: log.userId._id,
          name: log.userId.name,
          email: log.userId.email
        } : null,
        error: log.error,
        createdAt: log.createdAt
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
});

// Get log statistics
router.get('/stats', auth, async (req, res) => {
  try {
    let matchQuery = {};
    
    // If not admin, only show user's own stats
    if (req.user.role !== 'admin') {
      matchQuery.userId = req.user._id;
    }

    const stats = await ApiLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
          },
          errorRequests: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    // Get requests by method
    const methodStats = await ApiLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get requests by status code
    const statusStats = await ApiLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$statusCode',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get daily request count for last 7 days
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = await ApiLog.aggregate([
      { 
        $match: { 
          ...matchQuery,
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalRequests: 0,
        successfulRequests: 0,
        errorRequests: 0,
        avgResponseTime: 0
      },
      methodStats,
      statusStats,
      dailyStats
    });
  } catch (error) {
    console.error('Get log stats error:', error);
    res.status(500).json({ message: 'Server error fetching log statistics' });
  }
});

// Get detailed log by ID
router.get('/:logId', auth, async (req, res) => {
  try {
    let query = { _id: req.params.logId };
    
    // If not admin, only allow access to user's own logs
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const log = await ApiLog.findOne(query).populate('userId', 'name email');

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json({
      id: log._id,
      method: log.method,
      url: log.url,
      statusCode: log.statusCode,
      responseTime: log.responseTime,
      ip: log.ip,
      userAgent: log.userAgent,
      user: log.userId ? {
        id: log.userId._id,
        name: log.userId.name,
        email: log.userId.email
      } : null,
      requestBody: log.requestBody,
      responseBody: log.responseBody,
      error: log.error,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt
    });
  } catch (error) {
    console.error('Get log detail error:', error);
    res.status(500).json({ message: 'Server error fetching log details' });
  }
});

module.exports = router;

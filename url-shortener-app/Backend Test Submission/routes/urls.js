const express = require('express');
const shortid = require('shortid');
const validUrl = require('valid-url');
const Url = require('../models/Url');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Shorten URL
router.post('/shorten', auth, async (req, res) => {
  try {
    const { originalUrl, customAlias, description, tags } = req.body;

    // Validate URL
    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ message: 'Invalid URL provided' });
    }

    // Check if custom alias is provided and available
    let shortId;
    if (customAlias) {
      const existingUrl = await Url.findOne({ shortId: customAlias });
      if (existingUrl) {
        return res.status(400).json({ message: 'Custom alias already exists' });
      }
      shortId = customAlias;
    } else {
      shortId = shortid.generate();
    }

    const shortUrl = `${process.env.BASE_URL}/${shortId}`;

    // Create new URL
    const url = new Url({
      originalUrl,
      shortId,
      shortUrl,
      userId: req.user._id,
      customAlias: customAlias || null,
      description: description || '',
      tags: tags || []
    });

    await url.save();

    // Update user URL count
    await User.findByIdAndUpdate(req.user._id, { $inc: { urlCount: 1 } });

    res.status(201).json({
      message: 'URL shortened successfully',
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        shortId: url.shortId,
        clicks: url.clicks,
        createdAt: url.createdAt,
        description: url.description,
        tags: url.tags
      }
    });
  } catch (error) {
    console.error('Shorten URL error:', error);
    res.status(500).json({ message: 'Server error creating short URL' });
  }
});

// Get user's URLs
router.get('/my-urls', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const urls = await Url.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Url.countDocuments({ userId: req.user._id });

    res.json({
      urls: urls.map(url => ({
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        shortId: url.shortId,
        clicks: url.clicks,
        createdAt: url.createdAt,
        description: url.description,
        tags: url.tags,
        isActive: url.isActive
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get URLs error:', error);
    res.status(500).json({ message: 'Server error fetching URLs' });
  }
});

// Get URL statistics
router.get('/stats/:shortId', auth, async (req, res) => {
  try {
    const url = await Url.findOne({ 
      shortId: req.params.shortId,
      userId: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const analytics = url.getAnalytics();

    res.json({
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        shortId: url.shortId,
        description: url.description,
        tags: url.tags,
        createdAt: url.createdAt
      },
      analytics
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// Update URL
router.put('/:shortId', auth, async (req, res) => {
  try {
    const { description, tags, isActive } = req.body;

    const url = await Url.findOne({ 
      shortId: req.params.shortId,
      userId: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Update fields
    if (description !== undefined) url.description = description;
    if (tags !== undefined) url.tags = tags;
    if (isActive !== undefined) url.isActive = isActive;

    await url.save();

    res.json({
      message: 'URL updated successfully',
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        shortId: url.shortId,
        clicks: url.clicks,
        description: url.description,
        tags: url.tags,
        isActive: url.isActive,
        createdAt: url.createdAt
      }
    });
  } catch (error) {
    console.error('Update URL error:', error);
    res.status(500).json({ message: 'Server error updating URL' });
  }
});

// Delete URL
router.delete('/:shortId', auth, async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ 
      shortId: req.params.shortId,
      userId: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Update user URL count
    await User.findByIdAndUpdate(req.user._id, { $inc: { urlCount: -1 } });

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ message: 'Server error deleting URL' });
  }
});

// Get overall statistics for user
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id });
    
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    const activeUrls = urls.filter(url => url.isActive).length;
    
    // Get recent activity (last 7 days)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUrls = urls.filter(url => url.createdAt >= last7Days).length;
    
    // Top performing URLs
    const topUrls = urls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map(url => ({
        shortId: url.shortId,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        createdAt: url.createdAt
      }));

    // Click history for chart (last 30 days)
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const clickData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      let dayClicks = 0;
      urls.forEach(url => {
        dayClicks += url.clickHistory.filter(click => 
          click.timestamp >= dayStart && click.timestamp <= dayEnd
        ).length;
      });
      
      clickData.push({
        date: dayStart.toISOString().split('T')[0],
        clicks: dayClicks
      });
    }

    res.json({
      totalUrls,
      totalClicks,
      activeUrls,
      recentUrls,
      topUrls,
      clickData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
});

module.exports = router;

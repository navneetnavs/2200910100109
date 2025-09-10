const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  shortUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  clickHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String,
    referrer: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  customAlias: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Index for faster queries
urlSchema.index({ shortId: 1 });
urlSchema.index({ userId: 1 });
urlSchema.index({ createdAt: -1 });

// Method to get click analytics
urlSchema.methods.getAnalytics = function() {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const clicksLast7Days = this.clickHistory.filter(click => click.timestamp >= last7Days).length;
  const clicksLast30Days = this.clickHistory.filter(click => click.timestamp >= last30Days).length;

  return {
    totalClicks: this.clicks,
    clicksLast7Days,
    clicksLast30Days,
    clickHistory: this.clickHistory.slice(-10), // Last 10 clicks
    createdAt: this.createdAt,
    isActive: this.isActive
  };
};

module.exports = mongoose.model('Url', urlSchema);

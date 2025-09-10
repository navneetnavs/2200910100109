const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobileNo: {
    type: String,
    required: true,
    trim: true
  },
  githubUsername: {
    type: String,
    required: true,
    trim: true
  },
  rollNo: {
    type: String,
    required: true,
    trim: true
  },
  accessCode: {
    type: String,
    required: true,
    trim: true
  },
  clientID: {
    type: String,
    unique: true,
    default: function() {
      return uuidv4();
    }
  },
  clientSecret: {
    type: String,
    default: function() {
      return uuidv4();
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  urlCount: {
    type: Number,
    default: 0
  },
  totalClicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to get user stats
userSchema.methods.getStats = async function() {
  const Url = require('./Url');
  const urls = await Url.find({ userId: this._id });
  
  return {
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, url) => sum + url.clicks, 0),
    recentUrls: urls.slice(-5).map(url => ({
      shortId: url.shortId,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt
    }))
  };
};

module.exports = mongoose.model('User', userSchema);

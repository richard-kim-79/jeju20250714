const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: '👤'
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['jobs', 'realestate', 'events', 'policy', 'news']
  },
  timestamp: {
    type: String,
    default: '방금 전'
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  retweets: {
    type: Number,
    default: 0
  },
  hasLink: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// 링크 감지 미들웨어
postSchema.pre('save', function(next) {
  this.hasLink = this.content.includes('http://') || this.content.includes('https://');
  next();
});

module.exports = mongoose.model('Post', postSchema); 
const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// API 키 생성 메서드
apiKeySchema.statics.generateKey = function(userId, userName) {
  const key = 'jeju_' + Math.random().toString(36).substr(2, 16);
  return this.create({
    key,
    userId,
    userName
  });
};

// API 키 검증 메서드
apiKeySchema.statics.validateKey = function(key) {
  return this.findOne({ key, isActive: true });
};

module.exports = mongoose.model('ApiKey', apiKeySchema); 
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config/environment');
const { logger } = require('./logger');

// Helmet 보안 헤더 설정
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate Limiting 설정
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent')
      });
      res.status(429).json({ error: message });
    }
  });
};

// 일반 API 요청 제한
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15분
  100, // 최대 100 요청
  '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
);

// 로그인 요청 제한
const loginLimiter = createRateLimit(
  15 * 60 * 1000, // 15분
  5, // 최대 5 요청
  '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
);

// 게시글 작성 제한
const postLimiter = createRateLimit(
  60 * 60 * 1000, // 1시간
  10, // 최대 10 게시글
  '게시글 작성이 너무 많습니다. 1시간 후 다시 시도해주세요.'
);

// 댓글 작성 제한
const commentLimiter = createRateLimit(
  10 * 60 * 1000, // 10분
  20, // 최대 20 댓글
  '댓글 작성이 너무 많습니다. 10분 후 다시 시도해주세요.'
);

// 입력 검증 미들웨어
const validateInput = (req, res, next) => {
  // XSS 방지를 위한 기본 검증
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      return dangerousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };
  
  if (checkValue(req.body) || checkValue(req.query)) {
    logger.warn('Dangerous input detected', {
      ip: req.ip,
      url: req.url,
      body: req.body,
      query: req.query
    });
    return res.status(400).json({ error: '유효하지 않은 입력입니다.' });
  }
  
  next();
};

// IP 차단 미들웨어 (추후 확장 가능)
const blockedIPs = new Set();

const ipBlocker = (req, res, next) => {
  const clientIP = req.ip;
  
  if (blockedIPs.has(clientIP)) {
    logger.warn('Blocked IP attempted access', { ip: clientIP });
    return res.status(403).json({ error: '접근이 차단되었습니다.' });
  }
  
  next();
};

// 사용자 인증 미들웨어
const authenticateUser = async (req, res, next) => {
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
  }
  
  try {
    // 데이터베이스에서 사용자 확인 (추후 구현)
    // const user = await userQueries.findById(userId);
    // if (!user) {
    //   return res.status(401).json({ error: '유효하지 않은 사용자입니다.' });
    // }
    // req.user = user;
    
    // 임시로 사용자 ID만 설정
    req.user = { id: userId };
    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message, userId });
    res.status(500).json({ error: '인증 처리 중 오류가 발생했습니다.' });
  }
};

// 관리자 권한 확인 미들웨어
const requireAdmin = (req, res, next) => {
  // 임시로 특정 사용자 ID를 관리자로 설정
  const adminUsers = ['admin', 'root', '1'];
  
  if (!adminUsers.includes(req.user.id)) {
    logger.warn('Unauthorized admin access attempt', {
      userId: req.user.id,
      ip: req.ip,
      url: req.url
    });
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }
  
  next();
};

module.exports = {
  helmetConfig,
  generalLimiter,
  loginLimiter,
  postLimiter,
  commentLimiter,
  validateInput,
  ipBlocker,
  authenticateUser,
  requireAdmin
};
const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const { logger } = require('./logger');

// JWT 토큰 생성
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.is_admin || false
  };
  
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'jeju-sns-platform'
  });
};

// JWT 토큰 검증
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    logger.warn('JWT verification failed', { error: error.message });
    return null;
  }
};

// 토큰에서 사용자 정보 추출
const extractUserFromToken = (token) => {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  return {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email,
    isAdmin: decoded.isAdmin
  };
};

// JWT 인증 미들웨어
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      error: '접근 토큰이 필요합니다.',
      code: 'TOKEN_REQUIRED'
    });
  }
  
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ 
        error: '유효하지 않은 토큰입니다.',
        code: 'INVALID_TOKEN'
      });
    }
    
    req.user = decoded;
    logger.debug('User authenticated via JWT', { userId: decoded.id, username: decoded.username });
    next();
  } catch (error) {
    logger.error('JWT authentication error', { error: error.message });
    return res.status(500).json({ 
      error: '인증 처리 중 오류가 발생했습니다.',
      code: 'AUTH_ERROR'
    });
  }
};

// 기존 user-id 헤더 방식과 JWT 방식 모두 지원하는 미들웨어
const authenticateUser = async (req, res, next) => {
  // 1. JWT 토큰 확인
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
        logger.debug('User authenticated via JWT', { userId: decoded.id });
        return next();
      }
    } catch (error) {
      logger.warn('JWT authentication failed, trying fallback', { error: error.message });
    }
  }
  
  // 2. 기존 user-id 헤더 방식 (호환성 유지)
  const userId = req.headers['user-id'];
  if (userId) {
    try {
      // 임시로 사용자 ID만 설정 (추후 DB 조회로 변경)
      req.user = { 
        id: userId,
        username: userId,
        isAdmin: ['admin', 'root', '1'].includes(userId)
      };
      logger.debug('User authenticated via user-id header', { userId });
      return next();
    } catch (error) {
      logger.error('User-id authentication error', { error: error.message, userId });
    }
  }
  
  // 3. 인증 실패
  return res.status(401).json({ 
    error: '사용자 인증이 필요합니다.',
    code: 'AUTHENTICATION_REQUIRED'
  });
};

// 관리자 권한 확인 미들웨어
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: '인증이 필요합니다.',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }
  
  if (!req.user.isAdmin) {
    logger.warn('Unauthorized admin access attempt', {
      userId: req.user.id,
      username: req.user.username,
      ip: req.ip,
      url: req.url
    });
    return res.status(403).json({ 
      error: '관리자 권한이 필요합니다.',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

// 토큰 갱신 미들웨어
const refreshToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: '토큰이 필요합니다.',
      code: 'TOKEN_REQUIRED'
    });
  }
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, { ignoreExpiration: true });
    
    // 토큰이 만료되었는지 확인
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp > now) {
      return res.status(400).json({ 
        error: '토큰이 아직 유효합니다.',
        code: 'TOKEN_STILL_VALID'
      });
    }
    
    // 새 토큰 생성
    const newToken = generateToken(decoded);
    
    res.json({
      message: '토큰이 갱신되었습니다.',
      token: newToken,
      expiresIn: '24h'
    });
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    return res.status(403).json({ 
      error: '토큰 갱신에 실패했습니다.',
      code: 'REFRESH_FAILED'
    });
  }
};

// 선택적 인증 미들웨어 (인증되지 않아도 접근 가능하지만, 인증된 경우 사용자 정보 제공)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const userId = req.headers['user-id'];
  
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    } catch (error) {
      // 선택적 인증이므로 에러 무시
    }
  } else if (userId) {
    req.user = { 
      id: userId,
      username: userId,
      isAdmin: ['admin', 'root', '1'].includes(userId)
    };
  }
  
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  extractUserFromToken,
  authenticateToken,
  authenticateUser,
  requireAdmin,
  refreshToken,
  optionalAuth
};
const winston = require('winston');
const config = require('../config/environment');

// 로그 포맷 설정
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 콘솔 로그 포맷 (개발 환경용)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// 로거 생성
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 모든 로그 파일
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 개발 환경에서는 콘솔 로그 추가
if (config.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Express 미들웨어
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 응답 완료 시 로그 기록
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.headers['user-id'] || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// 에러 로깅 미들웨어
const errorLogger = (err, req, res, next) => {
  logger.error('Application Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.headers['user-id'] || 'anonymous'
  });
  
  next(err);
};

module.exports = {
  logger,
  requestLogger,
  errorLogger
};
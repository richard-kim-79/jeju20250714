const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

// 설정 및 미들웨어 import
const config = require('./config/environment');
const { dbUtils } = require('./config/database');
const { logger, requestLogger, errorLogger } = require('./middleware/logger');
const { 
  helmetConfig, 
  generalLimiter, 
  loginLimiter, 
  postLimiter, 
  commentLimiter,
  validateInput,
  ipBlocker,
  authenticateUser,
  requireAdmin
} = require('./middleware/security');

// 기존 데이터베이스 쿼리 import (호환성 유지)
const { 
  userQueries, 
  postQueries, 
  commentQueries, 
  likeQueries,
  verifyPassword 
} = require('../database/db');

const app = express();
const PORT = config.PORT;

// 로그 디렉토리 생성
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 기본 미들웨어 설정
app.use(compression()); // Gzip 압축
app.use(helmetConfig); // 보안 헤더
app.use(ipBlocker); // IP 차단
app.use(requestLogger); // 요청 로깅

// CORS 설정
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'Accept', 'Origin', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 바디 파서 설정
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 입력 검증 미들웨어
app.use(validateInput);

// 일반 API 요청 제한
app.use('/api', generalLimiter);

// OPTIONS 요청 처리
app.options('*', (req, res) => {
  res.status(200).end();
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API 라우트 설정
// 사용자 관련 API
app.post('/api/users/register', loginLimiter, async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '사용자명과 비밀번호는 필수입니다.' });
    }
    
    const result = await userQueries.create({ username, password, email });
    logger.info('User registered', { username, userId: result.id });
    
    res.status(201).json({ 
      message: '회원가입이 완료되었습니다.',
      user: { id: result.id, username: result.username }
    });
  } catch (error) {
    logger.error('User registration error', { error: error.message, body: req.body });
    res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

app.post('/api/users/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '사용자명과 비밀번호를 입력해주세요.' });
    }
    
    const user = await userQueries.findByUsername(username);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: '사용자명 또는 비밀번호가 잘못되었습니다.' });
    }
    
    logger.info('User logged in', { username, userId: user.id });
    
    res.json({
      message: '로그인 성공',
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    logger.error('User login error', { error: error.message, body: req.body });
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

// 게시글 관련 API
app.get('/api/posts', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const posts = await postQueries.getAll({ category, search, page, limit });
    
    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length
      }
    });
  } catch (error) {
    logger.error('Get posts error', { error: error.message, query: req.query });
    res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
  }
});

app.post('/api/posts', authenticateUser, postLimiter, async (req, res) => {
  try {
    const { title, content, category, image } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
    }
    
    const postData = {
      title,
      content,
      category,
      image,
      userId: req.user.id
    };
    
    const post = await postQueries.create(postData);
    logger.info('Post created', { postId: post.id, userId: req.user.id });
    
    res.status(201).json({
      message: '게시글이 작성되었습니다.',
      post
    });
  } catch (error) {
    logger.error('Post creation error', { error: error.message, body: req.body });
    res.status(500).json({ error: '게시글 작성 중 오류가 발생했습니다.' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await postQueries.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    
    res.json({ post });
  } catch (error) {
    logger.error('Get post error', { error: error.message, postId: req.params.id });
    res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
  }
});

app.delete('/api/posts/:id', authenticateUser, async (req, res) => {
  try {
    const post = await postQueries.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    
    // 작성자 또는 관리자만 삭제 가능
    if (post.userId !== req.user.id && !['admin', 'root', '1'].includes(req.user.id)) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }
    
    await postQueries.delete(req.params.id);
    logger.info('Post deleted', { postId: req.params.id, userId: req.user.id });
    
    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    logger.error('Post deletion error', { error: error.message, postId: req.params.id });
    res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
  }
});

// 댓글 관련 API
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const comments = await commentQueries.getByPostId(req.params.postId);
    res.json({ comments });
  } catch (error) {
    logger.error('Get comments error', { error: error.message, postId: req.params.postId });
    res.status(500).json({ error: '댓글 조회 중 오류가 발생했습니다.' });
  }
});

app.post('/api/posts/:postId/comments', authenticateUser, commentLimiter, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
    }
    
    const commentData = {
      content,
      postId: req.params.postId,
      userId: req.user.id
    };
    
    const comment = await commentQueries.create(commentData);
    logger.info('Comment created', { commentId: comment.id, postId: req.params.postId, userId: req.user.id });
    
    res.status(201).json({
      message: '댓글이 작성되었습니다.',
      comment
    });
  } catch (error) {
    logger.error('Comment creation error', { error: error.message, body: req.body });
    res.status(500).json({ error: '댓글 작성 중 오류가 발생했습니다.' });
  }
});

// 좋아요 관련 API
app.post('/api/posts/:postId/like', authenticateUser, async (req, res) => {
  try {
    const result = await likeQueries.toggle(req.params.postId, req.user.id);
    logger.info('Like toggled', { postId: req.params.postId, userId: req.user.id, liked: result.liked });
    
    res.json({
      message: result.liked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.',
      liked: result.liked,
      likesCount: result.likesCount
    });
  } catch (error) {
    logger.error('Like toggle error', { error: error.message, postId: req.params.postId });
    res.status(500).json({ error: '좋아요 처리 중 오류가 발생했습니다.' });
  }
});

// 관리자 API
app.get('/api/admin/stats', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const users = await userQueries.getAll();
    const posts = await postQueries.getAll();
    const comments = await commentQueries.getAll();
    
    const stats = {
      users: users.length,
      posts: posts.length,
      comments: comments.length,
      timestamp: new Date().toISOString()
    };
    
    res.json({ stats });
  } catch (error) {
    logger.error('Admin stats error', { error: error.message });
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
  }
});

// 파일 업로드 API (추후 구현)
app.post('/api/upload', authenticateUser, (req, res) => {
  res.status(501).json({ error: '파일 업로드 기능은 아직 구현되지 않았습니다.' });
});

// 정적 파일 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/admin', authenticateUser, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../admin.html'));
});

// 404 에러 핸들러
app.use((req, res) => {
  logger.warn('404 Not Found', { url: req.url, method: req.method, ip: req.ip });
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

// 전역 에러 핸들러
app.use(errorLogger);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: config.NODE_ENV === 'development' ? err.message : '서버 오류가 발생했습니다.',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 초기화
    await dbUtils.initializeDatabase();
    
    // 서버 시작
    app.listen(PORT, () => {
      logger.info('Server started', {
        port: PORT,
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString()
      });
      console.log(`🚀 제주 SNS 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`🌍 환경: ${config.NODE_ENV}`);
      console.log(`📊 접속 URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Server startup error', { error: error.message });
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// 처리되지 않은 에러 핸들링
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

startServer();

module.exports = app;
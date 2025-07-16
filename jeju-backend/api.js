// 간단한 정적 API 서버
const express = require('express');
const cors = require('cors');

const app = express();

// CORS 설정 - 모든 도메인 허용
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Origin', 'Accept'],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));

// 인메모리 데이터 저장소
let users = [
  {
    id: 1,
    email: 'admin@jeju.sns',
    password: 'admin123',
    displayName: 'JeJu 관리자',
    username: '@jejuadmin',
    apiKey: 'jeju_admin_2024',
    isAdmin: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
];

let posts = [
  {
    id: 1,
    author: '제주시민',
    username: '@jejucitizen',
    avatar: '👤',
    content: '제주시청에서 청년 창업 지원금 신청 받고 있어요! 최대 500만원까지 지원합니다.',
    category: 'policy',
    timestamp: '2시간 전',
    likes: 24,
    comments: 8,
    retweets: 12,
    hasLink: true,
    image: null,
    userId: 1
  }
];

let apiKeys = [
  {
    key: 'jeju_admin_2024',
    userId: 1,
    userName: 'JeJu 관리자',
    isAdmin: true,
    createdAt: new Date().toISOString()
  }
];

// API 키 인증 미들웨어
function apiKeyAuth(req, res, next) {
  const key = req.query.key || req.headers['x-api-key'];
  if (!key) {
    return res.status(401).json({ error: '유효한 API 키가 필요합니다.' });
  }
  
  const apiKey = apiKeys.find(k => k.key === key);
  if (!apiKey) {
    return res.status(401).json({ error: '유효하지 않은 API 키입니다.' });
  }
  
  const user = users.find(u => u.id === apiKey.userId);
  if (!user) {
    return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
  }
  
  req.user = user;
  req.apiKey = apiKey;
  next();
}

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'JeJu SNS API 서버',
    version: '1.0.0',
    status: 'running'
  });
});

// API 기본 엔드포인트
app.get('/api', (req, res) => {
  res.json({
    message: 'JeJu SNS API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 서버 상태 확인
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    users: users.length,
    posts: posts.length,
    apiKeys: apiKeys.length
  });
});

// 사용자 등록 (회원가입)
app.post('/api/auth/register', (req, res) => {
  const { email, password, displayName } = req.body;
  
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: '이름, 이메일, 비밀번호를 모두 입력해주세요.' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '올바른 이메일 형식을 입력해주세요.' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
  }
  
  const newUser = {
    id: Date.now(),
    email,
    password,
    displayName,
    username: `@${displayName}`,
    apiKey: `jeju_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  const newApiKey = {
    key: newUser.apiKey,
    userId: newUser.id,
    userName: newUser.displayName,
    isAdmin: false,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  apiKeys.push(newApiKey);
  
  const { password: _, ...userInfo } = newUser;
  res.status(201).json({
    success: true,
    user: userInfo,
    message: '회원가입이 완료되었습니다.'
  });
});

// 사용자 인증 (로그인)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  }
  
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }
  
  user.lastLogin = new Date().toISOString();
  
  const { password: _, ...userInfo } = user;
  res.json({
    success: true,
    user: userInfo,
    message: '로그인되었습니다.'
  });
});

// 사용자 정보 조회
app.get('/api/auth/me', apiKeyAuth, (req, res) => {
  const { password: _, ...userInfo } = req.user;
  res.json({
    success: true,
    user: userInfo
  });
});

// 게시글 목록 조회
app.get('/api/posts', apiKeyAuth, (req, res) => {
  res.json(posts);
});

// 게시글 작성
app.post('/api/posts', apiKeyAuth, (req, res) => {
  const { content, category, image } = req.body;
  
  if (!content || !category) {
    return res.status(400).json({ error: '내용과 카테고리를 입력해주세요.' });
  }
  
  if (content.length > 1000) {
    return res.status(400).json({ error: '내용은 1000자 이내로 입력해주세요.' });
  }
  
  const newPost = {
    id: Date.now(),
    author: req.user.displayName,
    username: req.user.username,
    avatar: '👤',
    content,
    category,
    timestamp: '방금 전',
    likes: 0,
    comments: 0,
    retweets: 0,
    hasLink: content.includes('http://') || content.includes('https://'),
    image: image || null,
    userId: req.user.id
  };
  
  posts.unshift(newPost);
  res.status(201).json(newPost);
});

module.exports = app; 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// CORS 설정 - 모든 Vercel 도메인 허용
app.use(cors({
  origin: function(origin, callback) {
    // 개발 환경 또는 Vercel 도메인 허용
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('vercel.app') ||
        origin.includes('jeju20250714')) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Origin', 'Accept']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// 인메모리 데이터 저장소 (1000명 규모 서비스용)
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
    content: '제주시청에서 청년 창업 지원금 신청 받고 있어요! 최대 500만원까지 지원합니다. 자세한 내용은 https://jeju.go.kr/startup 확인해보세요.',
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

// 사용자 등록 (회원가입)
app.post('/api/auth/register', (req, res) => {
  const { email, password, displayName } = req.body;
  
  // 필수 정보 검증
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: '이름, 이메일, 비밀번호를 모두 입력해주세요.' });
  }
  
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '올바른 이메일 형식을 입력해주세요.' });
  }
  
  // 비밀번호 길이 검증
  if (password.length < 6) {
    return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
  }
  
  // 중복 이메일 체크
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
  }
  
  // 사용자 생성
  const newUser = {
    id: Date.now(),
    email,
    password, // 실제 서비스에서는 bcrypt로 해시
    displayName,
    username: `@${displayName}`,
    apiKey: `jeju_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  // API 키 생성
  const newApiKey = {
    key: newUser.apiKey,
    userId: newUser.id,
    userName: newUser.displayName,
    isAdmin: false,
    createdAt: new Date().toISOString()
  };
  
  // 데이터 저장
  users.push(newUser);
  apiKeys.push(newApiKey);
  
  // 응답 (비밀번호 제외)
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
  
  // 사용자 찾기
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }
  
  // 마지막 로그인 시간 업데이트
  user.lastLogin = new Date().toISOString();
  
  // 응답 (비밀번호 제외)
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

// 단일 게시글 조회
app.get('/api/posts/:id', apiKeyAuth, (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) {
    return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  }
  res.json(post);
});

// 게시글 삭제
app.delete('/api/posts/:id', apiKeyAuth, (req, res) => {
  const postIndex = posts.findIndex(p => p.id == req.params.id);
  if (postIndex === -1) {
    return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  }
  
  const post = posts[postIndex];
  // 본인 또는 관리자만 삭제 가능
  if (post.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: '삭제 권한이 없습니다.' });
  }
  
  posts.splice(postIndex, 1);
  res.json({ success: true, message: '게시글이 삭제되었습니다.' });
});

// API 키 목록 조회 (관리자용)
app.get('/api/keys', apiKeyAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }
  res.json(apiKeys);
});

// API 키 생성
app.post('/api/keys', apiKeyAuth, (req, res) => {
  const { name, email } = req.body;
  const newKey = {
    key: `jeju_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    email,
    createdAt: new Date().toISOString()
  };
  apiKeys.push(newKey);
  res.status(201).json(newKey);
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

app.listen(PORT, () => {
  console.log(`Jeju SNS API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`현재 등록된 사용자: ${users.length}명`);
  console.log(`현재 게시글: ${posts.length}개`);
}); 
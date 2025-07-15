const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// 메모리 기반 API 키 저장소
let apiKeys = new Map();
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
    createdAt: new Date(),
    reports: [] // 신고 배열
  }
];

// 차단 유저 목록 (메모리)
let blockedUsers = [];

// API 키 생성
function generateApiKey() {
  return 'jeju_' + Math.random().toString(36).substr(2, 16);
}

// API 키 인증 미들웨어
function apiKeyAuth(req, res, next) {
  const key = req.query.key || req.headers['x-api-key'];
  // 관리자 키 예외 허용
  if (key === 'jeju_admin') {
    req.user = { userId: 'admin', userName: '관리자' };
    return next();
  }
  if (!key) {
    return res.status(401).json({ error: 'API 키가 필요합니다.' });
  }
  if (!apiKeys.has(key)) {
    return res.status(401).json({ error: '유효하지 않은 API 키입니다.' });
  }
  const keyInfo = apiKeys.get(key);
  req.user = {
    userId: keyInfo.userId,
    userName: keyInfo.userName
  };
  next();
}

// API 키 생성 엔드포인트
app.post('/api/keys', (req, res) => {
  const { userId, userName } = req.body;
  
  if (!userId || !userName) {
    return res.status(400).json({ error: '사용자 ID와 이름이 필요합니다.' });
  }

  const key = generateApiKey();
  apiKeys.set(key, {
    userId,
    userName,
    createdAt: new Date(),
    usageCount: 0
  });

  res.status(201).json({
    key,
    message: 'API 키가 생성되었습니다.'
  });
});

// 게시글 목록 조회 (차단 유저 제외)
app.get('/api/posts', apiKeyAuth, (req, res) => {
  const filtered = posts.filter(p => !blockedUsers.includes(p.username.replace('@','')));
  // 모든 게시글에 comments 필드 보정
  filtered.forEach(p => {
    if (!Array.isArray(p.comments)) p.comments = [];
  });
  res.json(filtered);
});

// 게시글 작성
app.post('/api/posts', apiKeyAuth, (req, res) => {
  const { content, category, image } = req.body;
  
  if (!content || !category) {
    return res.status(400).json({ error: '내용과 카테고리가 필요합니다.' });
  }

  const post = {
    id: Date.now(),
    author: req.user.userName,
    username: `@${req.user.userId}`,
    avatar: '👤',
    content,
    category,
    timestamp: '방금 전',
    likes: 0,
    comments: [], // 댓글 배열
    likedUsers: [], // 좋아요 누른 사용자 ID 배열
    retweets: 0,
    hasLink: content.includes('http://') || content.includes('https://'),
    image: image || null,
    createdAt: new Date(),
    reports: [] // 신고 배열
  };

  posts.unshift(post);
  res.status(201).json(post);
});

// 댓글 추가
app.post('/api/posts/:id/comments', apiKeyAuth, (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: '댓글 내용을 입력하세요.' });
  const newComment = {
    id: Date.now(),
    author: req.user.userName,
    userId: req.user.userId,
    content: comment,
    createdAt: new Date()
  };
  post.comments.push(newComment);
  res.status(201).json(newComment);
});

// 댓글 목록 조회
app.get('/api/posts/:id/comments', apiKeyAuth, (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  res.json(post.comments || []);
});

// 좋아요 토글
app.post('/api/posts/:id/like', apiKeyAuth, (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  const userId = req.user.userId;
  if (!post.likedUsers) post.likedUsers = [];
  const idx = post.likedUsers.indexOf(userId);
  if (idx === -1) {
    post.likedUsers.push(userId);
  } else {
    post.likedUsers.splice(idx, 1);
  }
  post.likes = post.likedUsers.length;
  res.json({ likes: post.likes, liked: idx === -1 });
});

// 좋아요 상태 조회
app.get('/api/posts/:id/like', apiKeyAuth, (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  const userId = req.user.userId;
  const liked = post.likedUsers && post.likedUsers.includes(userId);
  res.json({ likes: post.likes || 0, liked });
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
  const index = posts.findIndex(p => p.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  }
  
  posts.splice(index, 1);
  res.json({ success: true, message: '게시글이 삭제되었습니다.' });
});

// 카테고리별 게시글 조회
app.get('/api/posts/category/:category', apiKeyAuth, (req, res) => {
  const categoryPosts = posts.filter(p => p.category === req.params.category);
  res.json(categoryPosts);
});

// 게시글 신고
app.post('/api/posts/:id/report', apiKeyAuth, (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  const { reason } = req.body;
  post.reports = post.reports || [];
  post.reports.push({ user: req.user.userId, reason, date: new Date() });
  res.json({ success: true });
});

// 게시글 신고 목록 조회 (관리자)
app.get('/api/reports/posts', apiKeyAuth, (req, res) => {
  // 관리자만 허용(임시: jeju_admin)
  const key = req.query.key || req.headers['x-api-key'];
  if (key !== 'jeju_admin') return res.status(403).json({ error: '관리자 권한 필요' });
  const reported = posts.filter(p => p.reports && p.reports.length > 0);
  res.json(reported);
});

// 유저 차단
app.post('/api/users/:userId/block', apiKeyAuth, (req, res) => {
  const key = req.query.key || req.headers['x-api-key'];
  if (key !== 'jeju_admin') return res.status(403).json({ error: '관리자 권한 필요' });
  if (!blockedUsers.includes(req.params.userId)) blockedUsers.push(req.params.userId);
  res.json({ success: true, blockedUsers });
});
// 유저 차단 해제
app.post('/api/users/:userId/unblock', apiKeyAuth, (req, res) => {
  const key = req.query.key || req.headers['x-api-key'];
  if (key !== 'jeju_admin') return res.status(403).json({ error: '관리자 권한 필요' });
  blockedUsers = blockedUsers.filter(u => u !== req.params.userId);
  res.json({ success: true, blockedUsers });
});
// 차단 유저 목록 조회
app.get('/api/users/blocked', apiKeyAuth, (req, res) => {
  const key = req.query.key || req.headers['x-api-key'];
  if (key !== 'jeju_admin') return res.status(403).json({ error: '관리자 권한 필요' });
  res.json(blockedUsers);
});

// 댓글 삭제
app.delete('/api/posts/:postId/comments/:commentId', apiKeyAuth, (req, res) => {
  const post = posts.find(p => p.id == req.params.postId);
  if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  const commentIdx = post.comments.findIndex(c => c.id == req.params.commentId);
  if (commentIdx === -1) return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
  const comment = post.comments[commentIdx];
  if (req.user.userId !== comment.userId && req.user.userId !== 'admin') {
    return res.status(403).json({ error: '댓글 삭제 권한이 없습니다.' });
  }
  post.comments.splice(commentIdx, 1);
  res.json({ success: true });
});

// API 키 목록 조회 (관리용)
app.get('/api/keys', (req, res) => {
  const keys = Array.from(apiKeys.entries()).map(([key, info]) => ({
    key: key.substring(0, 8) + '...',
    userId: info.userId,
    userName: info.userName,
    createdAt: info.createdAt
  }));
  res.json(keys);
});

app.listen(PORT, () => {
  console.log(`Jeju SNS API 서버 (테스트 버전)가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('MongoDB 없이 메모리 기반으로 동작합니다.');
}); 
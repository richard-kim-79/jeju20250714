const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// 메모리 저장소 (임시)
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
    image: null
  }
];

// API 키 인증 미들웨어 (샘플)
function apiKeyAuth(req, res, next) {
  const key = req.query.key || req.headers['x-api-key'];
  if (!key || !key.startsWith('jeju_')) {
    return res.status(401).json({ error: '유효한 API 키가 필요합니다.' });
  }
  next();
}

// 게시글 목록 조회
app.get('/api/posts', apiKeyAuth, (req, res) => {
  res.json(posts);
});

// 게시글 작성
app.post('/api/posts', apiKeyAuth, (req, res) => {
  const { author, username, avatar, content, category, image } = req.body;
  const newPost = {
    id: Date.now(),
    author,
    username,
    avatar,
    content,
    category,
    timestamp: '방금 전',
    likes: 0,
    comments: 0,
    retweets: 0,
    hasLink: content.includes('http://') || content.includes('https://'),
    image: image || null
  };
  posts.unshift(newPost);
  res.status(201).json(newPost);
});

// 단일 게시글 조회
app.get('/api/posts/:id', apiKeyAuth, (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  res.json(post);
});

// 게시글 삭제
app.delete('/api/posts/:id', apiKeyAuth, (req, res) => {
  posts = posts.filter(p => p.id != req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Jeju SNS API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 
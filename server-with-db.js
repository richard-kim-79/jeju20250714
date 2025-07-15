const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Post = require('./models/Post');
const ApiKey = require('./models/ApiKey');

const app = express();
const PORT = 3001;

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/jeju-sns', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 연결 오류:'));
db.once('open', () => {
  console.log('MongoDB에 성공적으로 연결되었습니다.');
  
  // 샘플 데이터 추가 (처음 실행 시)
  Post.countDocuments().then(count => {
    if (count === 0) {
      const samplePost = new Post({
        author: '제주시민',
        username: '@jejucitizen',
        avatar: '👤',
        content: '제주시청에서 청년 창업 지원금 신청 받고 있어요! 최대 500만원까지 지원합니다. 자세한 내용은 https://jeju.go.kr/startup 확인해보세요.',
        category: 'policy',
        timestamp: '2시간 전',
        likes: 24,
        comments: 8,
        retweets: 12
      });
      samplePost.save();
      console.log('샘플 게시글이 추가되었습니다.');
    }
  });
});

app.use(cors());
app.use(bodyParser.json());

// API 키 인증 미들웨어 (DB 기반)
async function apiKeyAuth(req, res, next) {
  const key = req.query.key || req.headers['x-api-key'];
  
  if (!key) {
    return res.status(401).json({ error: 'API 키가 필요합니다.' });
  }

  try {
    const apiKey = await ApiKey.validateKey(key);
    if (!apiKey) {
      return res.status(401).json({ error: '유효하지 않은 API 키입니다.' });
    }

    // 사용 통계 업데이트
    apiKey.usageCount += 1;
    apiKey.lastUsed = new Date();
    await apiKey.save();

    req.user = {
      userId: apiKey.userId,
      userName: apiKey.userName
    };
    
    next();
  } catch (error) {
    console.error('API 키 검증 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}

// API 키 생성
app.post('/api/keys', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({ error: '사용자 ID와 이름이 필요합니다.' });
    }

    const apiKey = await ApiKey.generateKey(userId, userName);
    res.status(201).json({
      key: apiKey.key,
      message: 'API 키가 생성되었습니다.'
    });
  } catch (error) {
    console.error('API 키 생성 오류:', error);
    res.status(500).json({ error: 'API 키 생성 중 오류가 발생했습니다.' });
  }
});

// 게시글 목록 조회
app.get('/api/posts', apiKeyAuth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
  }
});

// 게시글 작성
app.post('/api/posts', apiKeyAuth, async (req, res) => {
  try {
    const { content, category, image } = req.body;
    
    if (!content || !category) {
      return res.status(400).json({ error: '내용과 카테고리가 필요합니다.' });
    }

    const post = new Post({
      author: req.user.userName,
      username: `@${req.user.userId}`,
      avatar: '👤',
      content,
      category,
      image: image || null
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('게시글 작성 오류:', error);
    res.status(500).json({ error: '게시글 작성 중 오류가 발생했습니다.' });
  }
});

// 단일 게시글 조회
app.get('/api/posts/:id', apiKeyAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    res.json(post);
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
  }
});

// 게시글 삭제
app.delete('/api/posts/:id', apiKeyAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    res.json({ success: true, message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
  }
});

// 카테고리별 게시글 조회
app.get('/api/posts/category/:category', apiKeyAuth, async (req, res) => {
  try {
    const posts = await Post.find({ category: req.params.category }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('카테고리별 게시글 조회 오류:', error);
    res.status(500).json({ error: '카테고리별 게시글 조회 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`Jeju SNS API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 
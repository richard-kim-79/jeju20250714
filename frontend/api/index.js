const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 제공
app.use(express.static('.'));

// 인메모리 데이터 저장소
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
        comments: [],
        retweets: 12,
        hasLink: true,
        image: null
    },
    {
        id: 2,
        author: '제주부동산',
        username: '@jejurealty',
        avatar: '🏠',
        content: '서귀포시 중문동 투룸 전세 매물 나왔습니다. 보증금 8천만원, 바다 전망 좋은 곳이에요. 연락주세요!',
        category: 'realestate',
        timestamp: '4시간 전',
        likes: 15,
        comments: [],
        retweets: 6,
        hasLink: false,
        image: null
    }
];

let apiKeys = [
    {
        key: 'jeju_admin',
        userId: 'admin',
        userName: '관리자',
        isAdmin: true,
        createdAt: new Date().toISOString()
    }
];

// API 키 인증 미들웨어
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API 키가 필요합니다.' });
    }
    
    const keyData = apiKeys.find(k => k.key === apiKey);
    if (!keyData) {
        return res.status(401).json({ error: '유효하지 않은 API 키입니다.' });
    }
    
    req.user = keyData;
    next();
};

// 관리자 인증 미들웨어
const authenticateAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }
    next();
};

// 루트 경로
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../index.html');
});

// 관리자 페이지
app.get('/admin.html', (req, res) => {
    res.sendFile(__dirname + '/../admin.html');
});

// 게시글 목록 조회
app.get('/api/posts', authenticateApiKey, (req, res) => {
    const { category, search } = req.query;
    
    let filteredPosts = posts;
    
    if (category && category !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === category);
    }
    
    if (search) {
        const searchLower = search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
            post.content.toLowerCase().includes(searchLower) ||
            post.author.toLowerCase().includes(searchLower)
        );
    }
    
    res.json(filteredPosts);
});

// 게시글 작성
app.post('/api/posts', authenticateApiKey, (req, res) => {
    const { content, category, image } = req.body;
    
    if (!content || !category) {
        return res.status(400).json({ error: '내용과 카테고리는 필수입니다.' });
    }
    
    const newPost = {
        id: Date.now(),
        author: req.user.userName || '익명',
        username: `@${req.user.userId}`,
        avatar: '👤',
        content,
        category,
        timestamp: '방금 전',
        likes: 0,
        comments: [],
        retweets: 0,
        hasLink: content.includes('http'),
        image,
        likedUsers: []
    };
    
    posts.unshift(newPost);
    res.status(201).json(newPost);
});

// 좋아요 토글
app.post('/api/posts/:id/like', authenticateApiKey, (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    
    if (!post.likedUsers) {
        post.likedUsers = [];
    }
    
    const userId = req.user.userId;
    const likedIndex = post.likedUsers.indexOf(userId);
    
    if (likedIndex === -1) {
        post.likedUsers.push(userId);
        post.likes++;
    } else {
        post.likedUsers.splice(likedIndex, 1);
        post.likes--;
    }
    
    res.json({ likes: post.likes, liked: post.likedUsers.includes(userId) });
});

// 댓글 작성
app.post('/api/posts/:id/comments', authenticateApiKey, (req, res) => {
    const postId = parseInt(req.params.id);
    const { comment } = req.body;
    
    if (!comment) {
        return res.status(400).json({ error: '댓글 내용이 필요합니다.' });
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    
    const newComment = {
        id: Date.now(),
        author: req.user.userName || '익명',
        userId: req.user.userId,
        content: comment,
        timestamp: new Date().toISOString()
    };
    
    post.comments.push(newComment);
    res.status(201).json(newComment);
});

// 댓글 삭제
app.delete('/api/posts/:id/comments/:commentId', authenticateApiKey, (req, res) => {
    const postId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    
    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
        return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    
    // 댓글 작성자 또는 관리자만 삭제 가능
    if (comment.userId !== req.user.userId && !req.user.isAdmin) {
        return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }
    
    const commentIndex = post.comments.findIndex(c => c.id === commentId);
    post.comments.splice(commentIndex, 1);
    
    res.json({ message: '댓글이 삭제되었습니다.' });
});

// API 키 생성
app.post('/api/keys', (req, res) => {
    const { userId, userName } = req.body;
    
    if (!userId || !userName) {
        return res.status(400).json({ error: '사용자 ID와 이름이 필요합니다.' });
    }
    
    const newKey = {
        key: `jeju_${userId}_${Date.now()}`,
        userId,
        userName,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };
    
    apiKeys.push(newKey);
    res.status(201).json(newKey);
});

// 관리자 API
app.get('/api/admin/stats', authenticateApiKey, authenticateAdmin, (req, res) => {
    const stats = {
        posts: posts.length,
        comments: posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0),
        users: apiKeys.length,
        apiKeys: apiKeys.length
    };
    
    res.json(stats);
});

// 관리자 - 게시글 관리
app.get('/api/admin/posts', authenticateApiKey, authenticateAdmin, (req, res) => {
    res.json(posts);
});

app.delete('/api/admin/posts/:id', authenticateApiKey, authenticateAdmin, (req, res) => {
    const postId = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    
    posts.splice(postIndex, 1);
    res.json({ message: '게시글이 삭제되었습니다.' });
});

// 관리자 - API 키 관리
app.get('/api/admin/keys', authenticateApiKey, authenticateAdmin, (req, res) => {
    res.json(apiKeys);
});

app.delete('/api/admin/keys/:key', authenticateApiKey, authenticateAdmin, (req, res) => {
    const key = req.params.key;
    const keyIndex = apiKeys.findIndex(k => k.key === key);
    
    if (keyIndex === -1) {
        return res.status(404).json({ error: 'API 키를 찾을 수 없습니다.' });
    }
    
    apiKeys.splice(keyIndex, 1);
    res.json({ message: 'API 키가 삭제되었습니다.' });
});

// 서버리스 함수 핸들러
module.exports = app; 
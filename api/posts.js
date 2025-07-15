const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

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

// 게시글 목록 조회
app.get('/', authenticateApiKey, (req, res) => {
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
app.post('/', authenticateApiKey, (req, res) => {
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

// 서버리스 함수 핸들러
module.exports = app; 
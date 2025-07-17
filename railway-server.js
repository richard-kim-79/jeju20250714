const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const { 
    userQueries, 
    postQueries, 
    commentQueries, 
    likeQueries,
    verifyPassword 
} = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;
// Railway에서 포트가 5432로 설정된 경우를 대비한 안전장치
const SERVER_PORT = PORT === 5432 ? 3001 : PORT;

// 미들웨어 설정
app.use(compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
app.use(cors({
    origin: ['http://localhost:3000', 'https://jeju20250714-btyv976q8-bluewhale2025.vercel.app'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'Accept', 'Origin', 'X-Requested-With'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));
app.use(express.static('public'));

// 인증 미들웨어
const authenticateUser = async (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
    }
    
    try {
        const user = await userQueries.findById(userId);
        if (!user) {
            return res.status(401).json({ error: '유효하지 않은 사용자입니다.' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('인증 오류:', error);
        res.status(500).json({ error: '인증 처리 중 오류가 발생했습니다.' });
    }
};

// OPTIONS 요청 처리
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, user-id, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(204).end();
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'JeJu SNS API 서버가 정상 작동 중입니다.',
        timestamp: new Date().toISOString()
    });
});

// 정적 파일 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 사용자 관련 API
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, displayName, username, password } = req.body;
        
        if (!email || !displayName || !username || !password) {
            return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
        }
        
        // 이메일 중복 확인
        const existingUser = await userQueries.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: '이미 가입된 이메일입니다.' });
        }
        
        // 사용자명 중복 확인
        const existingUsername = await userQueries.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: '이미 사용 중인 사용자명입니다.' });
        }
        
        // 사용자 생성
        const newUser = await userQueries.createUser(email, displayName, username, password);
        
        res.status(201).json({
            message: '회원가입이 완료되었습니다.',
            user: {
                id: newUser.id,
                email: newUser.email,
                displayName: newUser.display_name,
                username: newUser.username
            }
        });
    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
        }
        
        // 사용자 찾기
        const user = await userQueries.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }
        
        // 비밀번호 검증
        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }
        
        res.json({
            message: '로그인되었습니다.',
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                username: user.username
            }
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
    }
});

// 게시글 관련 API
app.get('/api/posts', async (req, res) => {
    try {
        const { category, search, limit = 50, offset = 0 } = req.query;
        let posts;
        
        if (search) {
            posts = await postQueries.searchPosts(search, parseInt(limit), parseInt(offset));
        } else if (category && category !== 'all') {
            posts = await postQueries.getPostsByCategory(category, parseInt(limit), parseInt(offset));
        } else {
            posts = await postQueries.getAllPosts(parseInt(limit), parseInt(offset));
        }
        
        res.json(posts);
    } catch (error) {
        console.error('게시글 조회 오류:', error);
        res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
    }
});

app.post('/api/posts', authenticateUser, async (req, res) => {
    try {
        const { content, category, imageUrl } = req.body;
        
        if (!content || !category) {
            return res.status(400).json({ error: '내용과 카테고리를 입력해주세요.' });
        }
        
        const newPost = await postQueries.createPost(req.user.id, content, category, imageUrl);
        
        res.status(201).json({
            message: '게시글이 작성되었습니다.',
            post: newPost
        });
    } catch (error) {
        console.error('게시글 작성 오류:', error);
        res.status(500).json({ error: '게시글 작성 중 오류가 발생했습니다.' });
    }
});

app.delete('/api/posts/:id', authenticateUser, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const deletedPost = await postQueries.deletePost(postId, req.user.id);
        
        if (!deletedPost) {
            return res.status(404).json({ error: '게시글을 찾을 수 없거나 삭제 권한이 없습니다.' });
        }
        
        res.json({ message: '게시글이 삭제되었습니다.' });
    } catch (error) {
        console.error('게시글 삭제 오류:', error);
        res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
    }
});

// 댓글 관련 API
app.get('/api/posts/:id/comments', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const comments = await commentQueries.getCommentsByPostId(postId);
        res.json(comments);
    } catch (error) {
        console.error('댓글 조회 오류:', error);
        res.status(500).json({ error: '댓글 조회 중 오류가 발생했습니다.' });
    }
});

app.post('/api/posts/:id/comments', authenticateUser, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
        }
        
        const newComment = await commentQueries.createComment(postId, req.user.id, content);
        
        res.status(201).json({
            message: '댓글이 작성되었습니다.',
            comment: newComment
        });
    } catch (error) {
        console.error('댓글 작성 오류:', error);
        res.status(500).json({ error: '댓글 작성 중 오류가 발생했습니다.' });
    }
});

app.delete('/api/comments/:id', authenticateUser, async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const deletedComment = await commentQueries.deleteComment(commentId, req.user.id);
        
        if (!deletedComment) {
            return res.status(404).json({ error: '댓글을 찾을 수 없거나 삭제 권한이 없습니다.' });
        }
        
        res.json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
        console.error('댓글 삭제 오류:', error);
        res.status(500).json({ error: '댓글 삭제 중 오류가 발생했습니다.' });
    }
});

// 좋아요 관련 API
app.post('/api/posts/:id/like', authenticateUser, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const like = await likeQueries.addLike(postId, req.user.id);
        
        if (like) {
            res.json({ message: '좋아요가 추가되었습니다.' });
        } else {
            res.json({ message: '이미 좋아요를 누른 게시글입니다.' });
        }
    } catch (error) {
        console.error('좋아요 추가 오류:', error);
        res.status(500).json({ error: '좋아요 처리 중 오류가 발생했습니다.' });
    }
});

app.delete('/api/posts/:id/like', authenticateUser, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const like = await likeQueries.removeLike(postId, req.user.id);
        
        if (like) {
            res.json({ message: '좋아요가 제거되었습니다.' });
        } else {
            res.json({ message: '좋아요를 누르지 않은 게시글입니다.' });
        }
    } catch (error) {
        console.error('좋아요 제거 오류:', error);
        res.status(500).json({ error: '좋아요 처리 중 오류가 발생했습니다.' });
    }
});

// 사용자 정보 관련 API
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await userQueries.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({ error: '사용자 정보 조회 중 오류가 발생했습니다.' });
    }
});

app.put('/api/users/:id', authenticateUser, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { displayName, username, email } = req.body;
        
        if (userId !== req.user.id) {
            return res.status(403).json({ error: '자신의 정보만 수정할 수 있습니다.' });
        }
        
        const updatedUser = await userQueries.updateUser(userId, displayName, username, email);
        
        res.json({
            message: '사용자 정보가 업데이트되었습니다.',
            user: updatedUser
        });
    } catch (error) {
        console.error('사용자 정보 업데이트 오류:', error);
        res.status(500).json({ error: '사용자 정보 업데이트 중 오류가 발생했습니다.' });
    }
});

// 서버 시작
app.listen(SERVER_PORT, '0.0.0.0', () => {
    console.log(`=== JeJu SNS PostgreSQL 서버 시작 ===`);
    console.log(`JeJu SNS 서버가 포트 ${SERVER_PORT}에서 실행 중입니다.`);
    console.log(`외부 접속 주소: http://0.0.0.0:${SERVER_PORT}`);
    console.log(`로컬 접속 주소: http://localhost:${SERVER_PORT}`);
    console.log(`환경 변수 확인:`);
    console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '설정됨' : '설정되지 않음'}`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`- PORT: ${PORT} (실제 사용: ${SERVER_PORT})`);
    console.log(`=== PostgreSQL 서버 준비 완료 ===`);
}); 
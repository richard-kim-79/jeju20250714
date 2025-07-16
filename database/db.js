const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// PostgreSQL 연결 풀 생성
const pool = new Pool({
    // Railway DATABASE_URL 우선 사용
    connectionString: process.env.DATABASE_URL,
    // 개별 환경 변수는 폴백으로 사용
    user: process.env.PGUSER || process.env.DB_USER || 'seoyeonju',
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    database: process.env.PGDATABASE || process.env.DB_NAME || 'jeju_sns',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
    port: process.env.PGPORT || process.env.DB_PORT || 5432,
    max: 20, // 최대 연결 수
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // 연결 타임아웃 증가
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 연결 상태 확인
console.log('데이터베이스 연결 설정:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '설정되지 않음');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- SSL:', process.env.NODE_ENV === 'production' ? '활성화' : '비활성화');

// 데이터베이스 연결 테스트
pool.on('connect', () => {
    console.log('PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
    console.error('PostgreSQL 연결 오류:', err);
});

// 비밀번호 해싱
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// 비밀번호 검증
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// 사용자 관련 함수들
const userQueries = {
    // 사용자 생성
    createUser: async (email, displayName, username, password) => {
        const passwordHash = await hashPassword(password);
        const query = `
            INSERT INTO users (email, display_name, username, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, display_name, username, created_at
        `;
        const values = [email, displayName, username, passwordHash];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // 이메일로 사용자 찾기
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },

    // ID로 사용자 찾기
    findById: async (id) => {
        const query = 'SELECT id, email, display_name, username, created_at FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // 사용자명으로 사용자 찾기
    findByUsername: async (username) => {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        return result.rows[0];
    },

    // 사용자 정보 업데이트
    updateUser: async (id, displayName, username, email) => {
        const query = `
            UPDATE users 
            SET display_name = $2, username = $3, email = $4
            WHERE id = $1
            RETURNING id, email, display_name, username, created_at
        `;
        const values = [id, displayName, username, email];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
};

// 게시글 관련 함수들
const postQueries = {
    // 게시글 생성
    createPost: async (userId, content, category, imageUrl = null) => {
        const query = `
            INSERT INTO posts (user_id, content, category, image_url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [userId, content, category, imageUrl];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // 모든 게시글 조회 (최신순)
    getAllPosts: async (limit = 50, offset = 0) => {
        const query = `
            SELECT 
                p.*,
                u.display_name,
                u.username,
                COUNT(c.id) as comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN comments c ON p.id = c.post_id
            GROUP BY p.id, u.display_name, u.username
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    },

    // 카테고리별 게시글 조회
    getPostsByCategory: async (category, limit = 50, offset = 0) => {
        const query = `
            SELECT 
                p.*,
                u.display_name,
                u.username,
                COUNT(c.id) as comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN comments c ON p.id = c.post_id
            WHERE p.category = $1
            GROUP BY p.id, u.display_name, u.username
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [category, limit, offset]);
        return result.rows;
    },

    // 검색으로 게시글 조회
    searchPosts: async (searchTerm, limit = 50, offset = 0) => {
        const query = `
            SELECT 
                p.*,
                u.display_name,
                u.username,
                COUNT(c.id) as comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN comments c ON p.id = c.post_id
            WHERE p.content ILIKE $1 OR u.display_name ILIKE $1
            GROUP BY p.id, u.display_name, u.username
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const searchPattern = `%${searchTerm}%`;
        const result = await pool.query(query, [searchPattern, limit, offset]);
        return result.rows;
    },

    // 게시글 삭제
    deletePost: async (postId, userId) => {
        const query = 'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *';
        const result = await pool.query(query, [postId, userId]);
        return result.rows[0];
    },

    // 게시글 조회
    getPostById: async (postId) => {
        const query = `
            SELECT 
                p.*,
                u.display_name,
                u.username
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [postId]);
        return result.rows[0];
    }
};

// 댓글 관련 함수들
const commentQueries = {
    // 댓글 생성
    createComment: async (postId, userId, content) => {
        const query = `
            INSERT INTO comments (post_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [postId, userId, content];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // 게시글의 댓글 조회
    getCommentsByPostId: async (postId) => {
        const query = `
            SELECT 
                c.*,
                u.display_name,
                u.username
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `;
        const result = await pool.query(query, [postId]);
        return result.rows;
    },

    // 댓글 삭제
    deleteComment: async (commentId, userId) => {
        const query = 'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *';
        const result = await pool.query(query, [commentId, userId]);
        return result.rows[0];
    }
};

// 좋아요 관련 함수들
const likeQueries = {
    // 좋아요 추가
    addLike: async (postId, userId) => {
        const query = `
            INSERT INTO likes (post_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT (post_id, user_id) DO NOTHING
            RETURNING *
        `;
        const result = await pool.query(query, [postId, userId]);
        
        if (result.rows.length > 0) {
            // 좋아요 수 업데이트
            await pool.query(
                'UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1',
                [postId]
            );
        }
        
        return result.rows[0];
    },

    // 좋아요 제거
    removeLike: async (postId, userId) => {
        const query = 'DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING *';
        const result = await pool.query(query, [postId, userId]);
        
        if (result.rows.length > 0) {
            // 좋아요 수 업데이트
            await pool.query(
                'UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1',
                [postId]
            );
        }
        
        return result.rows[0];
    },

    // 사용자가 게시글에 좋아요 했는지 확인
    hasLiked: async (postId, userId) => {
        const query = 'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2';
        const result = await pool.query(query, [postId, userId]);
        return result.rows.length > 0;
    }
};

module.exports = {
    pool,
    hashPassword,
    verifyPassword,
    userQueries,
    postQueries,
    commentQueries,
    likeQueries
}; 
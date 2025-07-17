const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 환경 변수에서 DATABASE_URL 가져오기
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/jeju_sns';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 기존 JSON 데이터 파일 경로
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

// JSON 파일 읽기 함수
const readJsonFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`파일 읽기 오류 (${filePath}):`, error);
    return [];
  }
};

// 테이블 생성 함수
const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('📊 PostgreSQL 테이블 생성 중...');
    
    // 사용자 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        api_key VARCHAR(255) UNIQUE,
        profile_image TEXT,
        bio TEXT,
        is_active BOOLEAN DEFAULT true,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 게시글 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50),
        image_url TEXT,
        likes_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 댓글 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 좋아요 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      )
    `);
    
    // 인덱스 생성
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
      CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
    `);
    
    console.log('✅ 테이블 생성 완료');
    
  } catch (error) {
    console.error('❌ 테이블 생성 오류:', error);
    throw error;
  } finally {
    client.release();
  }
};

// 사용자 데이터 마이그레이션
const migrateUsers = async () => {
  const users = readJsonFile(USERS_FILE);
  if (users.length === 0) {
    console.log('📝 사용자 데이터가 없습니다.');
    return;
  }
  
  const client = await pool.connect();
  
  try {
    console.log(`👥 ${users.length}명의 사용자 데이터 마이그레이션 중...`);
    
    for (const user of users) {
      await client.query(`
        INSERT INTO users (username, email, password_hash, api_key, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO NOTHING
      `, [
        user.username,
        user.email || null,
        user.password || user.passwordHash,
        user.apiKey || user.api_key,
        user.createdAt || user.created_at || new Date()
      ]);
    }
    
    console.log('✅ 사용자 데이터 마이그레이션 완료');
    
  } catch (error) {
    console.error('❌ 사용자 데이터 마이그레이션 오류:', error);
    throw error;
  } finally {
    client.release();
  }
};

// 게시글 데이터 마이그레이션
const migratePosts = async () => {
  const posts = readJsonFile(POSTS_FILE);
  if (posts.length === 0) {
    console.log('📝 게시글 데이터가 없습니다.');
    return;
  }
  
  const client = await pool.connect();
  
  try {
    console.log(`📄 ${posts.length}개의 게시글 데이터 마이그레이션 중...`);
    
    for (const post of posts) {
      // 사용자 ID 찾기
      const userResult = await client.query(
        'SELECT id FROM users WHERE username = $1',
        [post.author || post.username]
      );
      
      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        await client.query(`
          INSERT INTO posts (user_id, title, content, category, image_url, likes_count, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          userId,
          post.title,
          post.content,
          post.category || '일반',
          post.image || post.imageUrl,
          post.likes || post.likesCount || 0,
          post.timestamp || post.createdAt || new Date()
        ]);
      }
    }
    
    console.log('✅ 게시글 데이터 마이그레이션 완료');
    
  } catch (error) {
    console.error('❌ 게시글 데이터 마이그레이션 오류:', error);
    throw error;
  } finally {
    client.release();
  }
};

// 댓글 데이터 마이그레이션
const migrateComments = async () => {
  const comments = readJsonFile(COMMENTS_FILE);
  if (comments.length === 0) {
    console.log('📝 댓글 데이터가 없습니다.');
    return;
  }
  
  const client = await pool.connect();
  
  try {
    console.log(`💬 ${comments.length}개의 댓글 데이터 마이그레이션 중...`);
    
    for (const comment of comments) {
      // 사용자 ID 찾기
      const userResult = await client.query(
        'SELECT id FROM users WHERE username = $1',
        [comment.author || comment.username]
      );
      
      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        await client.query(`
          INSERT INTO comments (post_id, user_id, content, created_at)
          VALUES ($1, $2, $3, $4)
        `, [
          comment.postId || comment.post_id,
          userId,
          comment.content,
          comment.timestamp || comment.createdAt || new Date()
        ]);
      }
    }
    
    console.log('✅ 댓글 데이터 마이그레이션 완료');
    
  } catch (error) {
    console.error('❌ 댓글 데이터 마이그레이션 오류:', error);
    throw error;
  } finally {
    client.release();
  }
};

// 데이터 검증 함수
const validateData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔍 데이터 무결성 검증 중...');
    
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const postCount = await client.query('SELECT COUNT(*) FROM posts');
    const commentCount = await client.query('SELECT COUNT(*) FROM comments');
    
    console.log(`📊 마이그레이션 결과:`);
    console.log(`   👥 사용자: ${userCount.rows[0].count}명`);
    console.log(`   📄 게시글: ${postCount.rows[0].count}개`);
    console.log(`   💬 댓글: ${commentCount.rows[0].count}개`);
    
    // 외래키 제약 조건 확인
    const orphanPosts = await client.query(`
      SELECT COUNT(*) FROM posts p 
      LEFT JOIN users u ON p.user_id = u.id 
      WHERE u.id IS NULL
    `);
    
    const orphanComments = await client.query(`
      SELECT COUNT(*) FROM comments c 
      LEFT JOIN posts p ON c.post_id = p.id 
      WHERE p.id IS NULL
    `);
    
    if (orphanPosts.rows[0].count > 0) {
      console.log(`⚠️  고아 게시글: ${orphanPosts.rows[0].count}개`);
    }
    
    if (orphanComments.rows[0].count > 0) {
      console.log(`⚠️  고아 댓글: ${orphanComments.rows[0].count}개`);
    }
    
    console.log('✅ 데이터 검증 완료');
    
  } catch (error) {
    console.error('❌ 데이터 검증 오류:', error);
    throw error;
  } finally {
    client.release();
  }
};

// 메인 마이그레이션 함수
const runMigration = async () => {
  try {
    console.log('🚀 데이터베이스 마이그레이션 시작...');
    
    await createTables();
    await migrateUsers();
    await migratePosts();
    await migrateComments();
    await validateData();
    
    console.log('🎉 마이그레이션 완료!');
    
  } catch (error) {
    console.error('💥 마이그레이션 실패:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// 스크립트 실행
if (require.main === module) {
  runMigration();
}

module.exports = {
  createTables,
  migrateUsers,
  migratePosts,
  migrateComments,
  validateData,
  runMigration
};
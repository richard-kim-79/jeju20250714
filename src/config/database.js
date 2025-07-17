const { Pool } = require('pg');
const config = require('./environment');

// PostgreSQL 연결 풀 설정
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 타임아웃
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
});

// 파일 기반 데이터베이스 (기존 시스템과 호환성 유지)
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

// 데이터 디렉토리 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 초기 데이터 파일 생성
const initializeFile = (filePath, defaultData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

initializeFile(USERS_FILE);
initializeFile(POSTS_FILE);
initializeFile(COMMENTS_FILE);

// 파일 기반 데이터 읽기/쓰기 함수
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`파일 읽기 오류 (${filePath}):`, error);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`파일 쓰기 오류 (${filePath}):`, error);
    return false;
  }
};

// 데이터베이스 유틸리티 함수
const dbUtils = {
  // PostgreSQL 사용 여부 확인
  isPostgresEnabled: () => {
    return config.DATABASE_URL && config.DATABASE_URL.startsWith('postgresql://');
  },
  
  // 파일 기반 데이터 조회
  getFileData: (type) => {
    const files = {
      users: USERS_FILE,
      posts: POSTS_FILE,
      comments: COMMENTS_FILE
    };
    return readJsonFile(files[type]);
  },
  
  // 파일 기반 데이터 저장
  saveFileData: (type, data) => {
    const files = {
      users: USERS_FILE,
      posts: POSTS_FILE,
      comments: COMMENTS_FILE
    };
    return writeJsonFile(files[type], data);
  },
  
  // PostgreSQL 쿼리 실행
  query: async (text, params) => {
    if (!dbUtils.isPostgresEnabled()) {
      throw new Error('PostgreSQL이 설정되지 않았습니다.');
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },
  
  // 데이터베이스 초기화 (테이블 생성)
  initializeDatabase: async () => {
    if (!dbUtils.isPostgresEnabled()) {
      console.log('📁 파일 기반 데이터베이스를 사용합니다.');
      return;
    }
    
    try {
      // 사용자 테이블
      await dbUtils.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE,
          password_hash VARCHAR(255),
          api_key VARCHAR(255) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 게시글 테이블
      await dbUtils.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          title VARCHAR(200) NOT NULL,
          content TEXT NOT NULL,
          category VARCHAR(50),
          image_url TEXT,
          likes_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 댓글 테이블
      await dbUtils.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          post_id INTEGER REFERENCES posts(id),
          user_id INTEGER REFERENCES users(id),
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 좋아요 테이블
      await dbUtils.query(`
        CREATE TABLE IF NOT EXISTS likes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          post_id INTEGER REFERENCES posts(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, post_id)
        )
      `);
      
      console.log('✅ PostgreSQL 테이블이 초기화되었습니다.');
    } catch (error) {
      console.error('❌ 데이터베이스 초기화 오류:', error);
    }
  }
};

module.exports = {
  pool,
  dbUtils,
  // 기존 호환성을 위한 export
  USERS_FILE,
  POSTS_FILE,
  COMMENTS_FILE,
  readJsonFile,
  writeJsonFile
};
const config = {
  development: {
    NODE_ENV: 'development',
    PORT: process.env.PORT || 3001,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/jeju_sns_dev',
    CORS_ORIGIN: ['http://localhost:3000', 'http://localhost:3001'],
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
    UPLOAD_PATH: './uploads',
    LOG_LEVEL: 'debug'
  },
  
  beta: {
    NODE_ENV: 'beta',
    PORT: process.env.PORT || 3001,
    DATABASE_URL: process.env.DATABASE_URL,
    CORS_ORIGIN: [
      'https://beta.jeju-sns.com',
      'https://jeju20250714-btyv976q8-bluewhale2025.vercel.app'
    ],
    JWT_SECRET: process.env.JWT_SECRET,
    UPLOAD_PATH: './uploads',
    LOG_LEVEL: 'info'
  },
  
  production: {
    NODE_ENV: 'production',
    PORT: process.env.PORT || 3001,
    DATABASE_URL: process.env.DATABASE_URL,
    CORS_ORIGIN: [
      'https://jeju-sns.com',
      'https://www.jeju-sns.com'
    ],
    JWT_SECRET: process.env.JWT_SECRET,
    UPLOAD_PATH: './uploads',
    LOG_LEVEL: 'error'
  }
};

const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

if (!currentConfig) {
  throw new Error(`Invalid NODE_ENV: ${env}`);
}

// 필수 환경 변수 검증
if (env !== 'development') {
  if (!currentConfig.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for non-development environments');
  }
  if (!currentConfig.JWT_SECRET) {
    throw new Error('JWT_SECRET is required for non-development environments');
  }
}

module.exports = currentConfig;
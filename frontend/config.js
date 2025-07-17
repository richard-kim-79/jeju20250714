// Frontend Configuration
const config = {
  // API 엔드포인트 설정
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://jeju-sns-backend-2024-479e4b8e48f6.herokuapp.com',
  
  // 앱 정보
  APP_NAME: 'JeJu SNS',
  APP_VERSION: '1.0.0',
  
  // 기능 플래그
  features: {
    enablePWA: true,
    enableAnalytics: false,
    enableNotifications: true
  }
};

// API 엔드포인트 헬퍼
const API = {
  auth: {
    login: `${config.API_BASE_URL}/api/auth/login`,
    register: `${config.API_BASE_URL}/api/auth/register`,
    logout: `${config.API_BASE_URL}/api/auth/logout`
  },
  posts: {
    list: `${config.API_BASE_URL}/api/posts`,
    create: `${config.API_BASE_URL}/api/posts`,
    detail: (id) => `${config.API_BASE_URL}/api/posts/${id}`,
    update: (id) => `${config.API_BASE_URL}/api/posts/${id}`,
    delete: (id) => `${config.API_BASE_URL}/api/posts/${id}`,
    like: (id) => `${config.API_BASE_URL}/api/posts/${id}/like`,
    unlike: (id) => `${config.API_BASE_URL}/api/posts/${id}/unlike`
  },
  comments: {
    list: (postId) => `${config.API_BASE_URL}/api/posts/${postId}/comments`,
    create: (postId) => `${config.API_BASE_URL}/api/posts/${postId}/comments`,
    delete: (postId, commentId) => `${config.API_BASE_URL}/api/posts/${postId}/comments/${commentId}`
  },
  health: `${config.API_BASE_URL}/api/health`
};

// Export for use in other scripts
window.appConfig = config;
window.API = API;
const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, refreshToken, authenticateUser } = require('../middleware/auth');
const { logger } = require('../middleware/logger');
const { loginLimiter } = require('../middleware/security');

const router = express.Router();

// 임시 사용자 데이터 (추후 데이터베이스 연동)
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@jeju-sns.com',
    password: '$2b$12$7Bpai4Y5cPWOWdbQrTvK9uWD6z1QqX9YJW.lVPSKObZaIy9FIg/7S', // 'admin123'
    is_admin: true
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@jeju-sns.com',
    password: '$2b$12$1u5QVS.rQM60O2fUgIhghO6ykP1upYyv3upb3xNMXX/y3LF0hlGOG', // 'user123'
    is_admin: false
  }
];

// 로그인 API
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: '사용자명과 비밀번호를 입력해주세요.',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    // 사용자 찾기 (임시 데이터에서)
    const user = users.find(u => u.username === username);
    
    if (!user) {
      logger.warn('Login attempt with non-existent user', { username, ip: req.ip });
      return res.status(401).json({ 
        error: '사용자명 또는 비밀번호가 잘못되었습니다.',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', { username, ip: req.ip });
      return res.status(401).json({ 
        error: '사용자명 또는 비밀번호가 잘못되었습니다.',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // JWT 토큰 생성
    const token = generateToken(user);
    
    logger.info('User logged in successfully', { 
      userId: user.id, 
      username: user.username,
      ip: req.ip 
    });
    
    res.json({
      message: '로그인 성공',
      token,
      expiresIn: '24h',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, body: req.body });
    res.status(500).json({ 
      error: '로그인 처리 중 오류가 발생했습니다.',
      code: 'LOGIN_ERROR'
    });
  }
});

// 회원가입 API
router.post('/register', loginLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: '사용자명과 비밀번호는 필수입니다.',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // 사용자명 중복 확인
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ 
        error: '이미 존재하는 사용자명입니다.',
        code: 'USERNAME_EXISTS'
      });
    }
    
    // 이메일 중복 확인
    if (email) {
      const existingEmail = users.find(u => u.email === email);
      if (existingEmail) {
        return res.status(409).json({ 
          error: '이미 존재하는 이메일입니다.',
          code: 'EMAIL_EXISTS'
        });
      }
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 새 사용자 생성
    const newUser = {
      id: users.length + 1,
      username,
      email: email || null,
      password: hashedPassword,
      is_admin: false
    };
    
    users.push(newUser);
    
    // JWT 토큰 생성
    const token = generateToken(newUser);
    
    logger.info('User registered successfully', { 
      userId: newUser.id, 
      username: newUser.username,
      ip: req.ip 
    });
    
    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      expiresIn: '24h',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.is_admin
      }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, body: req.body });
    res.status(500).json({ 
      error: '회원가입 처리 중 오류가 발생했습니다.',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// 토큰 갱신 API
router.post('/refresh', refreshToken);

// 로그아웃 API (클라이언트에서 토큰 삭제)
router.post('/logout', authenticateUser, (req, res) => {
  logger.info('User logged out', { 
    userId: req.user.id, 
    username: req.user.username,
    ip: req.ip 
  });
  
  res.json({
    message: '로그아웃되었습니다.'
  });
});

// 사용자 정보 조회 API
router.get('/me', authenticateUser, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  });
});

// 비밀번호 변경 API
router.put('/password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: '현재 비밀번호와 새 비밀번호를 입력해주세요.',
        code: 'MISSING_PASSWORDS'
      });
    }
    
    // 현재 사용자 찾기
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ 
        error: '사용자를 찾을 수 없습니다.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // 현재 비밀번호 확인
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: '현재 비밀번호가 올바르지 않습니다.',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }
    
    // 새 비밀번호 해싱
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    
    logger.info('Password changed successfully', { 
      userId: user.id, 
      username: user.username,
      ip: req.ip 
    });
    
    res.json({
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    logger.error('Password change error', { error: error.message, userId: req.user.id });
    res.status(500).json({ 
      error: '비밀번호 변경 중 오류가 발생했습니다.',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

module.exports = router;
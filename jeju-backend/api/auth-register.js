export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, Accept');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 인메모리 데이터 (임시, 실제 서비스는 DB 사용)
  if (!global.users) {
    global.users = [
      {
        id: 1,
        email: 'admin@jeju.sns',
        password: 'admin123',
        displayName: 'JeJu 관리자',
        username: '@jejuadmin',
        apiKey: 'jeju_admin_2024',
        isAdmin: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    ];
  }
  if (!global.apiKeys) {
    global.apiKeys = [
      {
        key: 'jeju_admin_2024',
        userId: 1,
        userName: 'JeJu 관리자',
        isAdmin: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  const users = global.users;
  const apiKeys = global.apiKeys;

  if (req.method === 'POST') {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: '이름, 이메일, 비밀번호를 모두 입력해주세요.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '올바른 이메일 형식을 입력해주세요.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
    }
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
    }
    const newUser = {
      id: Date.now(),
      email,
      password,
      displayName,
      username: `@${displayName}`,
      apiKey: `jeju_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    const newApiKey = {
      key: newUser.apiKey,
      userId: newUser.id,
      userName: newUser.displayName,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    apiKeys.push(newApiKey);
    const { password: _, ...userInfo } = newUser;
    return res.status(201).json({
      success: true,
      user: userInfo,
      message: '회원가입이 완료되었습니다.'
    });
  }
  res.status(405).json({ error: '허용되지 않은 메서드입니다.' });
} 
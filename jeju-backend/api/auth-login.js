export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, Accept');
  if (req.method === 'OPTIONS') return res.status(200).end();

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
  const users = global.users;

  if (req.method === 'POST') {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    user.lastLogin = new Date().toISOString();
    const { password: _, ...userInfo } = user;
    return res.json({
      success: true,
      user: userInfo,
      message: '로그인되었습니다.'
    });
  }
  res.status(405).json({ error: '허용되지 않은 메서드입니다.' });
} 
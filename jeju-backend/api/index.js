export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, Accept');
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json({
    message: 'JeJu SNS Vercel 서버리스 API',
    endpoints: [
      '/auth-register',
      '/auth-login',
      '/health'
    ]
  });
} 
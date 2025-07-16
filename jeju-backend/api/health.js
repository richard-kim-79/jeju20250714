export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, Accept');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!global.users) global.users = [];
  if (!global.posts) global.posts = [];
  if (!global.apiKeys) global.apiKeys = [];

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    users: global.users.length,
    posts: global.posts.length,
    apiKeys: global.apiKeys.length
  });
} 
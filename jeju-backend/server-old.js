const app = require('./api');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Jeju SNS API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 
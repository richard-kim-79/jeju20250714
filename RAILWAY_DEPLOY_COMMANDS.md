# 🚂 Railway 배포 명령어

## GitHub 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/jeju-sns-platform.git
git push -u origin main

## 배포 확인
# 1. Railway.app 접속 → GitHub 로그인
# 2. New Project → Deploy from GitHub repo
# 3. jeju-sns-platform 저장소 선택
# 4. 환경 변수 설정:
#    NODE_ENV=production
#    JWT_SECRET=jeju-sns-super-secret-jwt-key-2025-production
#    LOG_LEVEL=info

## 배포 완료 후 테스트
curl https://your-domain.up.railway.app/health


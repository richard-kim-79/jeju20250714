# 🚀 Heroku 빠른 배포 가이드

## 📋 현재 상태
- ✅ Heroku CLI 설치 완료 (v10.12.0)
- ✅ 프로젝트 준비 완료
- ✅ Procfile 설정 완료
- ✅ app.json 설정 완료

## 🔧 즉시 배포 방법

### 옵션 1: Heroku Deploy Button (가장 쉬움)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/richard-kim-79/jeju20250714/tree/cursor/initiate-code-deployment-d10e)

위 버튼을 클릭하면:
1. Heroku 로그인
2. 앱 이름 입력 (예: jeju-sns-backend)
3. Deploy App 클릭
4. 자동으로 PostgreSQL 추가 및 스키마 설정

### 옵션 2: Heroku CLI 사용

#### 1. Heroku 로그인
```bash
heroku login
# 브라우저가 열리면 로그인
```

#### 2. Heroku 앱 생성 및 배포
```bash
# 앱 생성
heroku create jeju-sns-backend

# PostgreSQL 추가
heroku addons:create heroku-postgresql:mini

# 배포
git push heroku cursor/initiate-code-deployment-d10e:main

# 데이터베이스 초기화
heroku run "psql \$DATABASE_URL -f database/schema.sql"
heroku run "psql \$DATABASE_URL -f database/add_indexes.sql"
```

#### 3. 환경 변수 설정
```bash
heroku config:set NODE_ENV=production
```

## 🔍 배포 확인

### 앱 상태 확인
```bash
heroku open
# 또는
curl https://jeju-sns-backend.herokuapp.com/api/health
```

### 로그 확인
```bash
heroku logs --tail
```

## 💰 비용
- **Eco Dyno**: $5/월
- **Mini Database**: $5/월
- **총 비용**: $10/월

## 🔗 Vercel 프론트엔드 연결

`frontend/config.js` 수정:
```javascript
API_BASE_URL: 'https://jeju-sns-backend.herokuapp.com'
```

또는 `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://jeju-sns-backend.herokuapp.com/api/:path*"
    }
  ]
}
```

## ⚡ 빠른 명령어 모음

```bash
# 상태 확인
heroku ps
heroku config

# 재시작
heroku restart

# 데이터베이스 접속
heroku pg:psql

# 스케일링
heroku ps:scale web=1
```

## 🚨 문제 해결

### 배포 실패 시
```bash
heroku logs --tail
heroku buildpacks:set heroku/nodejs
```

### 데이터베이스 연결 실패
```bash
heroku config:get DATABASE_URL
heroku pg:info
```

---
**준비 완료!** 위의 Deploy Button을 클릭하거나 CLI 명령어를 실행하세요.
# 🚀 JeJu SNS Heroku 백엔드 배포 가이드

## 📋 사전 준비
- Heroku 계정 (https://heroku.com)
- Heroku CLI 설치
- 신용카드 등록 (무료 PostgreSQL addon 사용 시 필요)

## 🛠 Heroku CLI 설치

### macOS
```bash
brew tap heroku/brew && brew install heroku
```

### Windows/Linux
https://devcenter.heroku.com/articles/heroku-cli 에서 다운로드

## 📦 배포 단계

### 1단계: Heroku 로그인
```bash
heroku login
# 브라우저가 열리면 로그인
```

### 2단계: Heroku 앱 생성
```bash
# 프로젝트 루트에서 실행
heroku create jeju-sns-backend
# 또는 자동 이름 생성
heroku create
```

### 3단계: PostgreSQL 추가
```bash
# 무료 플랜 (10,000행 제한)
heroku addons:create heroku-postgresql:mini

# 유료 플랜 (필요시)
# heroku addons:create heroku-postgresql:essential-0
```

### 4단계: 환경 변수 설정
```bash
heroku config:set NODE_ENV=production
heroku config:set NPM_CONFIG_PRODUCTION=false

# 확인
heroku config
```

### 5단계: 배포
```bash
# Git remote 추가 (자동으로 되어있을 수 있음)
heroku git:remote -a jeju-sns-backend

# 배포
git push heroku cursor/initiate-code-deployment-d10e:main
# 또는 main 브랜치에서
git push heroku main
```

### 6단계: 데이터베이스 초기화
```bash
# 스키마 적용
heroku run "psql \$DATABASE_URL -f database/schema.sql"

# 인덱스 추가
heroku run "psql \$DATABASE_URL -f database/add_indexes.sql"

# 시드 데이터 (선택사항)
heroku run node database/seed.js
```

## 🔍 배포 확인

### 로그 확인
```bash
heroku logs --tail
```

### 앱 열기
```bash
heroku open
# 또는 직접 접속: https://jeju-sns-backend.herokuapp.com
```

### API 테스트
```bash
curl https://jeju-sns-backend.herokuapp.com/api/health
```

## ⚙️ 추가 설정

### 커스텀 도메인
```bash
heroku domains:add api.jejusns.com
# DNS CNAME 설정 필요
```

### SSL 인증서 (자동)
Heroku는 모든 앱에 자동으로 SSL 제공

### 스케일링
```bash
# Dyno 수 조정
heroku ps:scale web=1

# Dyno 타입 변경 (유료)
heroku ps:type web=standard-1x
```

## 📊 모니터링

### 기본 메트릭
```bash
heroku ps
heroku releases
```

### 상세 모니터링 (Heroku Dashboard)
- 메모리 사용량
- 응답 시간
- 처리량
- 오류율

## 🔧 유용한 명령어

### 앱 정보
```bash
heroku info
heroku apps:info
```

### 데이터베이스 접속
```bash
heroku pg:psql
```

### 백업
```bash
# 수동 백업
heroku pg:backups:capture

# 백업 목록
heroku pg:backups

# 백업 다운로드
heroku pg:backups:download
```

### 재시작
```bash
heroku restart
```

## 💰 비용 관리

### Eco Dyno ($5/월)
- 1000 dyno hours/월
- 30분 비활성 후 sleep
- 512MB RAM

### Basic Database ($9/월)
- 10,000,000 행
- 10GB 저장공간
- 자동 백업

### 비용 확인
```bash
heroku ps:type
heroku addons
```

## 🚨 주의사항

1. **Procfile**: 반드시 루트에 있어야 함
2. **Port**: `process.env.PORT` 사용 필수
3. **SSL**: Production에서 `rejectUnauthorized: false` 설정
4. **Build**: `package.json`의 scripts에 build 명령 확인
5. **Node 버전**: `package.json`에 engines 필드 추가 권장

## 📝 Vercel 프론트엔드 연결

Vercel의 `config.js` 수정:
```javascript
API_BASE_URL: window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://jeju-sns-backend.herokuapp.com',
```

## 🔄 GitHub Actions 자동 배포

`.github/workflows/heroku-deploy.yml`:
```yaml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "jeju-sns-backend"
          heroku_email: "your-email@example.com"
```

## 📞 지원
- Heroku 문서: https://devcenter.heroku.com
- Heroku Status: https://status.heroku.com
- Support: https://help.heroku.com

---
**작성일**: 2025-07-17  
**프로젝트**: JeJu SNS Backend  
**현재 설정**: Railway (무료 크레딧 사용 중)
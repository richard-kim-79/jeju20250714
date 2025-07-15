# JeJu SNS 플랫폼 배포 가이드

## 🚀 배포 준비 완료

### 현재 상태
- ✅ Node.js v24.4.0 설치됨
- ✅ npm v11.4.2 설치됨
- ✅ 서버 실행 중 (포트 3002)
- ✅ 모든 핵심 기능 구현 완료

### 배포 옵션

## 1. 로컬 배포 (개발/테스트용)

### 현재 실행 중인 서버
```bash
# 서버 상태 확인
ps aux | grep node

# 서버 재시작 (필요시)
pkill -f "node server.js"
node server.js
```

### 접속 방법
- **메인 앱**: http://localhost:3002
- **관리자 대시보드**: http://localhost:3002/admin.html

## 2. 클라우드 배포 (프로덕션용)

### A. Heroku 배포 (추천)

#### 1단계: Heroku CLI 설치
```bash
# macOS
brew install heroku/brew/heroku

# 또는 공식 사이트에서 다운로드
# https://devcenter.heroku.com/articles/heroku-cli
```

#### 2단계: Heroku 앱 생성
```bash
# 로그인
heroku login

# 앱 생성
heroku create jeju-sns-platform

# 환경 변수 설정
heroku config:set NODE_ENV=production
```

#### 3단계: 배포
```bash
# Git 초기화 (아직 안 했다면)
git init
git add .
git commit -m "Initial deployment"

# Heroku에 배포
git push heroku main
```

### B. Vercel 배포

#### 1단계: Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2단계: 배포
```bash
vercel --prod
```

### C. Railway 배포

#### 1단계: Railway CLI 설치
```bash
npm install -g @railway/cli
```

#### 2단계: 배포
```bash
railway login
railway init
railway up
```

## 3. 도메인 설정

### 커스텀 도메인 연결
```bash
# Heroku의 경우
heroku domains:add www.jeju-sns.com
heroku domains:add jeju-sns.com
```

## 4. 환경 변수 설정

### 프로덕션 환경 변수
```bash
# Heroku
heroku config:set NODE_ENV=production
heroku config:set PORT=3002

# Vercel
vercel env add NODE_ENV production
vercel env add PORT 3002
```

## 5. SSL 인증서 설정

### 자동 SSL (대부분의 클라우드 플랫폼에서 자동 제공)
- Heroku: 자동 제공
- Vercel: 자동 제공
- Railway: 자동 제공

## 6. 모니터링 설정

### 로그 확인
```bash
# Heroku
heroku logs --tail

# Vercel
vercel logs

# Railway
railway logs
```

## 7. 데이터베이스 설정 (향후 확장)

### MongoDB Atlas 연결
```bash
# 환경 변수 설정
heroku config:set MONGODB_URI="your-mongodb-atlas-uri"
```

## 8. 백업 전략

### 현재 데이터 백업
```bash
# 로컬 데이터 백업
cp -r data/ backup/
```

## 🎯 배포 우선순위

### 1단계: 로컬 테스트 완료 ✅
- [x] 모든 기능 테스트
- [x] 서버 안정성 확인
- [x] API 응답 확인

### 2단계: 클라우드 배포
- [ ] Heroku/Vercel/Railway 중 선택
- [ ] 환경 변수 설정
- [ ] 도메인 연결
- [ ] SSL 인증서 설정

### 3단계: 모니터링 설정
- [ ] 로그 모니터링
- [ ] 성능 모니터링
- [ ] 오류 알림 설정

### 4단계: 확장 준비
- [ ] 데이터베이스 연결
- [ ] 사용자 인증 시스템
- [ ] 파일 업로드 서비스

## 📊 배포 체크리스트

### 필수 확인사항
- [x] 모든 핵심 기능 구현 완료
- [x] 서버 안정성 테스트
- [x] API 응답 확인
- [x] 프론트엔드 UI 완성
- [x] 관리자 대시보드 완성
- [x] 보안 설정 완료
- [x] 문서화 완료

### 배포 후 확인사항
- [ ] 도메인 접속 확인
- [ ] API 응답 확인
- [ ] 관리자 대시보드 접속 확인
- [ ] 파일 업로드 기능 확인
- [ ] 사용자 인증 확인

## 🚨 주의사항

1. **환경 변수**: 프로덕션 환경에서는 민감한 정보를 환경 변수로 관리
2. **로그 관리**: 프로덕션에서는 적절한 로그 레벨 설정
3. **백업**: 정기적인 데이터 백업 설정
4. **모니터링**: 서비스 상태 지속적 모니터링
5. **보안**: 정기적인 보안 업데이트 및 점검

## 📞 지원

배포 중 문제가 발생하면:
1. 로그 확인
2. 환경 변수 재확인
3. 포트 설정 확인
4. 의존성 패키지 확인

---

**JeJu SNS 플랫폼 배포 준비 완료! 🍊** 
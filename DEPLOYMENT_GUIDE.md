# 🚀 **제주 SNS 플랫폼 배포 가이드**

## 📋 **배포 준비 완료 상태**

### ✅ **모든 시스템 준비 완료**
- **JWT 인증 시스템**: 완료 ✅
- **파일 업로드 시스템**: 완료 ✅  
- **관리자 대시보드**: 완료 ✅
- **보안 미들웨어**: 완료 ✅
- **로깅 시스템**: 완료 ✅
- **데이터베이스 이중화**: 완료 ✅

### 🎯 **배포 옵션 3가지**

---

## 🚂 **1. Railway 배포 (추천)**

### **장점**
- 무료 티어 제공 (월 5달러 이후)
- 자동 SSL 인증서
- PostgreSQL 데이터베이스 자동 설정
- 간편한 환경 변수 관리

### **배포 단계**

#### 1단계: Railway 계정 생성
```bash
# Railway 웹사이트에서 계정 생성
https://railway.app/
```

#### 2단계: GitHub 연결 배포
```bash
# 1. GitHub에 저장소 푸시
git remote add origin https://github.com/YOUR_USERNAME/jeju-sns-platform.git
git push -u origin main

# 2. Railway 대시보드에서 GitHub 저장소 연결
# 3. 자동 배포 설정 완료
```

#### 3단계: 환경 변수 설정
```bash
NODE_ENV=production
JWT_SECRET=jeju-sns-super-secret-jwt-key-2025-production
LOG_LEVEL=info
```

#### 4단계: PostgreSQL 추가
```bash
# Railway 대시보드에서 PostgreSQL 서비스 추가
# 자동으로 DATABASE_URL 환경 변수 설정됨
```

---

## 🟢 **2. Vercel 배포**

### **장점**
- 무료 티어 제공
- 글로벌 CDN
- 자동 SSL
- 빠른 배포

### **배포 단계**

#### 1단계: Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2단계: 배포 실행
```bash
vercel --prod
```

#### 3단계: 환경 변수 설정
```bash
vercel env add NODE_ENV production
vercel env add JWT_SECRET jeju-sns-super-secret-jwt-key-2025-production
vercel env add LOG_LEVEL info
```

---

## 🟣 **3. Heroku 배포**

### **장점**
- 안정적인 서비스
- 다양한 애드온 지원
- 확장성 좋음

### **배포 단계**

#### 1단계: Heroku CLI 설치
```bash
# Heroku CLI 설치 후
heroku login
```

#### 2단계: 앱 생성 및 배포
```bash
heroku create jeju-sns-platform
git push heroku main
```

#### 3단계: 환경 변수 설정
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=jeju-sns-super-secret-jwt-key-2025-production
heroku config:set LOG_LEVEL=info
```

#### 4단계: PostgreSQL 추가
```bash
heroku addons:create heroku-postgresql:mini
```

---

## 🎨 **배포 후 확인사항**

### **필수 테스트 페이지**
1. **메인 페이지**: `https://your-domain.com/`
2. **새 로그인 페이지**: `https://your-domain.com/auth.html`
3. **관리자 대시보드**: `https://your-domain.com/admin-dashboard.html`
4. **헬스체크**: `https://your-domain.com/health`

### **API 엔드포인트 테스트**
```bash
# 헬스체크
curl https://your-domain.com/health

# 회원가입
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# 로그인
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### **기능 테스트**
- [ ] 회원가입/로그인 (JWT 토큰)
- [ ] 파일 업로드 (이미지 최적화)
- [ ] 관리자 대시보드 (실시간 차트)
- [ ] 게시물 CRUD
- [ ] 댓글 시스템
- [ ] 카테고리 필터링

---

## 🔧 **환경 변수 설정**

### **필수 환경 변수**
```env
NODE_ENV=production
JWT_SECRET=jeju-sns-super-secret-jwt-key-2025-production
LOG_LEVEL=info
PORT=3001
```

### **선택적 환경 변수**
```env
DATABASE_URL=postgresql://username:password@host:port/database
UPLOAD_MAX_SIZE=5242880
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

---

## 📊 **성능 최적화**

### **이미 적용된 최적화**
- ✅ Gzip 압축
- ✅ 정적 파일 캐싱
- ✅ 이미지 자동 최적화
- ✅ JWT 토큰 최적화
- ✅ 데이터베이스 인덱싱
- ✅ Rate Limiting

### **추가 최적화 권장사항**
- CDN 설정 (Cloudflare)
- Redis 캐싱 (고트래픽 시)
- 로드 밸런싱 (확장 시)

---

## 🛡️ **보안 설정**

### **이미 적용된 보안**
- ✅ Helmet.js (보안 헤더)
- ✅ CORS 설정
- ✅ Rate Limiting
- ✅ 입력 검증
- ✅ JWT 토큰 보안
- ✅ 파일 업로드 보안

### **추가 보안 권장사항**
- SSL 인증서 (자동 적용)
- 방화벽 설정
- 모니터링 시스템

---

## 🎯 **배포 성공 기준**

### **서버 상태**
- ✅ 서버 정상 시작 (로그 확인)
- ✅ 헬스체크 응답 200 OK
- ✅ 모든 페이지 접속 가능

### **기능 동작**
- ✅ JWT 인증 시스템 작동
- ✅ 파일 업로드 기능 작동
- ✅ 관리자 대시보드 차트 표시
- ✅ 실시간 통계 업데이트

---

## 🍊 **배포 완료!**

**모든 시스템이 프로덕션 준비 완료되었습니다.**

### **테스트 계정**
- **관리자**: `admin` / `admin123`
- **일반 사용자**: `user1` / `user123`

### **예상 URL 형식**
- **Railway**: `https://jeju-sns-platform-production.up.railway.app`
- **Vercel**: `https://jeju-sns-platform.vercel.app`
- **Heroku**: `https://jeju-sns-platform.herokuapp.com`

---

**🚀 이제 위의 3가지 방법 중 하나를 선택하여 배포하시면 됩니다!** 
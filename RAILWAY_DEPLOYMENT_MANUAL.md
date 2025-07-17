# 🚂 **Railway 배포 매뉴얼**

## 🎯 **현재 상태**
- ✅ 모든 시스템 프로덕션 준비 완료
- ✅ Git 저장소 초기화 완료
- ✅ 모든 파일 커밋 완료
- ✅ Railway 설정 파일 준비 완료

## 🚀 **Railway 배포 단계**

### **1단계: Railway 계정 생성**
1. https://railway.app/ 접속
2. "Start a New Project" 클릭
3. GitHub 계정으로 로그인
4. Railway 계정 생성 완료

### **2단계: GitHub 저장소 생성**
```bash
# 현재 상태: 로컬 Git 저장소 준비 완료
# 다음 명령어로 GitHub에 푸시 준비
```

1. GitHub에서 새 저장소 생성:
   - 저장소 이름: `jeju-sns-platform`
   - Public 또는 Private 선택
   - README, .gitignore 추가하지 않음 (이미 있음)

2. 로컬에서 GitHub 저장소 연결:
```bash
git remote add origin https://github.com/YOUR_USERNAME/jeju-sns-platform.git
git branch -M main
git push -u origin main
```

### **3단계: Railway 프로젝트 생성**
1. Railway 대시보드에서 "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. `jeju-sns-platform` 저장소 선택
4. 자동 배포 시작

### **4단계: 환경 변수 설정**
Railway 대시보드에서 Variables 탭으로 이동하여 다음 환경 변수 설정:

```env
NODE_ENV=production
JWT_SECRET=jeju-sns-super-secret-jwt-key-2025-production
LOG_LEVEL=info
PORT=3001
```

### **5단계: PostgreSQL 데이터베이스 추가**
1. Railway 대시보드에서 "Add Service" 클릭
2. "PostgreSQL" 선택
3. 자동으로 DATABASE_URL 환경 변수 생성됨

### **6단계: 도메인 설정**
1. Railway 대시보드에서 "Settings" 탭
2. "Domains" 섹션에서 "Generate Domain" 클릭
3. 생성된 도메인 확인 (예: `jeju-sns-platform-production.up.railway.app`)

## 📊 **배포 확인**

### **헬스체크 테스트**
```bash
curl https://your-railway-domain.up.railway.app/health
```

### **API 테스트**
```bash
# 회원가입 테스트
curl -X POST https://your-railway-domain.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# 로그인 테스트
curl -X POST https://your-railway-domain.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### **웹 페이지 테스트**
1. **메인 페이지**: `https://your-railway-domain.up.railway.app/`
2. **로그인 페이지**: `https://your-railway-domain.up.railway.app/auth.html`
3. **관리자 대시보드**: `https://your-railway-domain.up.railway.app/admin-dashboard.html`

## 🔧 **배포 설정 파일**

### **railway.json** (이미 준비됨)
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **package.json** (이미 준비됨)
```json
{
  "scripts": {
    "start": "NODE_ENV=production node src/server.js",
    "railway": "NODE_ENV=production node src/server.js"
  }
}
```

### **Dockerfile** (이미 준비됨)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📈 **모니터링**

### **Railway 대시보드에서 확인**
1. **Deployments**: 배포 상태 확인
2. **Logs**: 실시간 로그 확인
3. **Metrics**: CPU, 메모리 사용량 확인
4. **Variables**: 환경 변수 관리

### **로그 확인**
```bash
# Railway CLI 설치 후 (선택사항)
railway logs
```

## 🛡️ **보안 설정**

### **이미 적용된 보안 기능**
- ✅ JWT 토큰 인증
- ✅ 비밀번호 암호화 (bcrypt)
- ✅ Rate Limiting
- ✅ CORS 설정
- ✅ Helmet.js 보안 헤더
- ✅ 입력 검증

### **추가 보안 권장사항**
1. **Custom Domain**: 커스텀 도메인 연결
2. **SSL Certificate**: 자동 적용됨
3. **Environment Variables**: 민감 정보 환경 변수 관리

## 🎯 **배포 성공 기준**

### **필수 확인사항**
- [ ] 서버 정상 시작 (Railway 로그 확인)
- [ ] 헬스체크 응답 200 OK
- [ ] 메인 페이지 접속 가능
- [ ] 로그인 페이지 정상 작동
- [ ] 관리자 대시보드 차트 표시
- [ ] JWT 인증 시스템 작동
- [ ] 파일 업로드 기능 작동

### **성능 확인**
- [ ] 페이지 로딩 시간 < 3초
- [ ] API 응답 시간 < 500ms
- [ ] 이미지 최적화 작동

## 🚨 **문제 해결**

### **일반적인 문제**
1. **빌드 실패**: package.json 의존성 확인
2. **서버 시작 실패**: 환경 변수 설정 확인
3. **데이터베이스 연결 실패**: PostgreSQL 서비스 확인
4. **도메인 접속 불가**: 배포 상태 및 로그 확인

### **디버깅 방법**
1. Railway 대시보드에서 로그 확인
2. 환경 변수 설정 재확인
3. 빌드 로그 상세 확인
4. 헬스체크 엔드포인트 테스트

## 📞 **지원**

### **Railway 공식 문서**
- https://docs.railway.app/
- https://railway.app/help

### **프로젝트 문서**
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [README.md](README.md)

---

## 🎉 **배포 완료 후 예상 결과**

### **예상 Railway URL**
```
https://jeju-sns-platform-production.up.railway.app
```

### **테스트 계정**
- **관리자**: `admin` / `admin123`
- **일반 사용자**: `user1` / `user123`

### **주요 기능**
- 🔐 JWT 인증 시스템
- 📁 파일 업로드 (이미지 최적화)
- 📊 실시간 관리자 대시보드
- 🛡️ 보안 시스템
- 📱 반응형 웹 디자인

---

**🚂 Railway 배포 준비 완료! 위의 단계를 따라 진행하시면 됩니다.**
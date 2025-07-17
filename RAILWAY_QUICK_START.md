# 🚂 **Railway 빠른 시작 가이드**

## 🎯 **즉시 배포 가능한 상태**

모든 설정이 완료되어 있습니다! 아래 단계만 따라하시면 됩니다.

---

## 📋 **필요한 것**
- GitHub 계정
- Railway 계정 (무료)
- 5분의 시간

---

## 🚀 **3단계 빠른 배포**

### **1단계: GitHub 저장소 생성 (2분)**

1. **GitHub.com 접속** → 새 저장소 생성
   - 저장소 이름: `jeju-sns-platform`
   - Public 선택 (또는 Private)
   - ⚠️ README, .gitignore 추가하지 않음

2. **로컬에서 GitHub 연결**
   ```bash
   # 터미널에서 실행
   cd /workspace
   git remote add origin https://github.com/YOUR_USERNAME/jeju-sns-platform.git
   git push -u origin main
   ```

### **2단계: Railway 배포 (2분)**

1. **Railway.app 접속** → GitHub 로그인
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. **`jeju-sns-platform`** 저장소 선택
5. **자동 배포 시작** ✅

### **3단계: 환경 변수 설정 (1분)**

Railway 대시보드에서 **Variables** 탭으로 이동하여 추가:

```env
NODE_ENV=production
JWT_SECRET=jeju-sns-super-secret-jwt-key-2025-production
LOG_LEVEL=info
```

---

## 🎉 **배포 완료!**

### **예상 URL**
```
https://jeju-sns-platform-production.up.railway.app
```

### **테스트 페이지**
- 🏠 **메인**: `https://your-domain.up.railway.app/`
- 🔐 **로그인**: `https://your-domain.up.railway.app/auth.html`
- 📊 **관리자**: `https://your-domain.up.railway.app/admin-dashboard.html`

### **테스트 계정**
- **관리자**: `admin` / `admin123`
- **일반 사용자**: `user1` / `user123`

---

## 🔧 **선택사항: PostgreSQL 추가**

더 안정적인 데이터베이스를 원한다면:

1. Railway 대시보드에서 **"Add Service"** 클릭
2. **"PostgreSQL"** 선택
3. 자동으로 DATABASE_URL 환경 변수 생성됨

---

## 📊 **배포 확인 방법**

### **헬스체크**
```bash
curl https://your-domain.up.railway.app/health
```

### **API 테스트**
```bash
# 회원가입
curl -X POST https://your-domain.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

---

## 🛡️ **이미 적용된 기능**

- ✅ JWT 인증 시스템
- ✅ 파일 업로드 (이미지 최적화)
- ✅ 실시간 관리자 대시보드
- ✅ 보안 시스템 (Rate Limiting, CORS, Helmet)
- ✅ 자동 SSL 인증서
- ✅ 헬스체크 엔드포인트

---

## 🚨 **문제 해결**

### **배포 실패 시**
1. Railway 대시보드에서 **Logs** 확인
2. 환경 변수 설정 재확인
3. GitHub 저장소 연결 상태 확인

### **접속 불가 시**
1. 배포 상태 확인 (Railway 대시보드)
2. 헬스체크 엔드포인트 테스트
3. 로그에서 에러 메시지 확인

---

## 📞 **지원**

- **상세 가이드**: [RAILWAY_DEPLOYMENT_MANUAL.md](RAILWAY_DEPLOYMENT_MANUAL.md)
- **프로젝트 문서**: [README.md](README.md)
- **Railway 공식 문서**: https://docs.railway.app/

---

**🍊 5분 만에 제주 SNS 플랫폼을 전 세계에 배포하세요!**
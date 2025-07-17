# 🚀 JeJu SNS 프론트엔드 Vercel 배포 단계별 가이드

## 📍 현재 상태
- ✅ 프론트엔드 파일 준비 완료 (`/frontend` 디렉토리)
- ✅ Vercel 설정 파일 생성 완료
- ✅ GitHub에 푸시 완료

## 🔧 Vercel 웹 대시보드 배포 단계

### 1️⃣ Vercel 로그인
1. https://vercel.com 접속
2. GitHub 계정으로 로그인 (권장)

### 2️⃣ 새 프로젝트 생성
1. 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 선택

### 3️⃣ GitHub 저장소 연결
1. **"Add GitHub Account"** 클릭 (처음인 경우)
2. 저장소 검색: `jeju20250714`
3. **"Import"** 버튼 클릭

### 4️⃣ 프로젝트 설정 (중요!)
```
Project Name: jeju-sns-frontend
Framework Preset: Other
Root Directory: frontend ← ⚠️ 반드시 설정!
```

**Build and Output Settings:**
- Build Command: (비워두기)
- Output Directory: .
- Install Command: (비워두기)

### 5️⃣ 환경 변수
환경 변수는 필요 없습니다. Skip 하세요.

### 6️⃣ 배포
**"Deploy"** 버튼 클릭

## 📊 배포 진행 상황
- 빌드 시작 → 1-2분 소요
- 도메인 할당: `https://jeju-sns-frontend.vercel.app`
- 상태: ✅ Ready

## 🔍 배포 후 확인

### 1. 기본 페이지 테스트
```bash
# 메인 페이지
https://jeju-sns-frontend.vercel.app/

# 관리자 페이지
https://jeju-sns-frontend.vercel.app/admin.html

# API 프록시 테스트
https://jeju-sns-frontend.vercel.app/api/health
```

### 2. 브라우저 콘솔에서 API 테스트
```javascript
// F12 → Console에서 실행
fetch('/api/health')
  .then(res => res.json())
  .then(data => console.log('API 연결 성공:', data))
  .catch(err => console.error('API 연결 실패:', err));
```

## ⚠️ 중요: Railway 백엔드 CORS 업데이트

Vercel 배포 후 생성된 URL을 Railway 백엔드에 추가해야 합니다.

1. Railway 대시보드 → Variables
2. 새 변수 추가:
   ```
   ALLOWED_ORIGINS=https://jeju-sns-frontend.vercel.app,https://jejusns.com
   ```

또는 `railway-server.js` 수정:
```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://jeju-sns-frontend.vercel.app', // ← 추가!
        'https://jejusns.com'
    ],
    credentials: true
}));
```

## 🎯 최종 확인 체크리스트

- [ ] 메인 페이지 로드 확인
- [ ] CSS 스타일 적용 확인
- [ ] JavaScript 동작 확인
- [ ] API 연결 확인 (/api/health)
- [ ] PWA 설치 프롬프트 확인
- [ ] 오프라인 페이지 동작 확인

## 🌐 커스텀 도메인 설정 (선택)

1. Vercel 프로젝트 → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: jejusns.com)
4. DNS 설정:
   - A 레코드: 76.76.21.21
   - 또는 CNAME: cname.vercel-dns.com

## 📞 문제 발생 시

### API 연결 오류
- Railway 백엔드 상태 확인
- CORS 설정 확인
- vercel.json의 rewrites 설정 확인

### 404 오류
- Root Directory가 `frontend`로 설정되었는지 확인
- 파일명 대소문자 확인

---
**배포 URL**: https://jeju-sns-frontend.vercel.app  
**백엔드 API**: https://jeju-sns.railway.app  
**GitHub**: https://github.com/richard-kim-79/jeju20250714
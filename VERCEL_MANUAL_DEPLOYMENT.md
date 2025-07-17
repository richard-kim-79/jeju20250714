# 🚀 Vercel 수동 배포 가이드

## 📋 즉시 배포 방법 (가장 빠름)

### 방법 1: Vercel 웹사이트에서 직접 배포 (권장)

1. **Vercel 접속**: https://vercel.com
2. **로그인**: GitHub 계정으로 로그인
3. **새 프로젝트**:
   - "Add New..." → "Project" 클릭
   - "Import Git Repository" 선택
4. **저장소 연결**:
   - 저장소 검색: `richard-kim-79/jeju20250714`
   - "Import" 클릭
5. **⚠️ 중요 설정**:
   ```
   Project Name: jeju-sns-frontend
   Framework Preset: Other
   Root Directory: frontend  ← 반드시 설정!
   Build Command: (비워두기)
   Output Directory: .
   ```
6. **Deploy 클릭**: 1-2분 내 완료!

### 방법 2: Vercel Import URL 사용 (더 빠름)

아래 링크를 클릭하면 바로 import 페이지로 이동합니다:

👉 [https://vercel.com/new/clone?repository-url=https://github.com/richard-kim-79/jeju20250714&root-directory=frontend](https://vercel.com/new/clone?repository-url=https://github.com/richard-kim-79/jeju20250714&root-directory=frontend)

설정만 확인하고 Deploy!

## 🔧 CLI를 통한 배포 (개발자용)

### 1. Vercel CLI 로그인
```bash
vercel login
# 이메일 입력 후 인증 메일 확인
```

### 2. 프로젝트 배포
```bash
cd frontend
vercel --prod
```

### 3. 프롬프트 응답
```
? Set up and deploy "frontend"? Yes
? Which scope do you want to deploy to? (개인 계정 선택)
? Link to existing project? No
? What's your project's name? jeju-sns-frontend
? In which directory is your code located? ./
```

## 📱 배포 후 확인

### 1. 생성된 URL
- 프로덕션: `https://jeju-sns-frontend.vercel.app`
- 프리뷰: `https://jeju-sns-frontend-[hash].vercel.app`

### 2. 테스트 항목
- [ ] 메인 페이지 로드
- [ ] CSS 스타일 적용
- [ ] JavaScript 동작
- [ ] API 프록시 (`/api/health`)

### 3. 브라우저 콘솔 테스트
```javascript
// F12 → Console
fetch('/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ API 연결 성공:', data))
  .catch(err => console.error('❌ API 연결 실패:', err));
```

## ⚙️ 프로젝트 설정 확인

### vercel.json 내용
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://jeju-sns.railway.app/api/:path*"
    }
  ]
}
```

### 파일 구조
```
frontend/
├── index.html          # 메인 페이지
├── admin.html          # 관리자
├── config.js           # API 설정
├── vercel.json         # Vercel 설정
├── package.json        # 프로젝트 정보
└── .vercelignore       # 제외 파일
```

## 🔐 GitHub Actions 자동 배포 설정

### 1. Vercel 토큰 생성
1. Vercel 대시보드 → Account Settings
2. Tokens → Create Token
3. 토큰 복사

### 2. GitHub Secrets 추가
저장소 → Settings → Secrets → Actions:
- `VERCEL_TOKEN`: 위에서 복사한 토큰
- `VERCEL_ORG_ID`: Vercel 팀 ID (개인은 생략 가능)
- `VERCEL_PROJECT_ID`: 프로젝트 배포 후 생성됨

### 3. 자동 배포 활성화
`.github/workflows/deploy-frontend.yml` 파일이 이미 준비됨

## 🚨 문제 해결

### "Root Directory not found" 오류
- Root Directory를 `frontend`로 설정했는지 확인

### API 연결 실패
- Railway 백엔드 CORS에 Vercel URL 추가 필요:
  ```javascript
  origin: ['https://jeju-sns-frontend.vercel.app']
  ```

### 404 오류
- vercel.json의 rewrites 설정 확인
- 파일명 대소문자 확인

## 📞 추가 도움
- Vercel 문서: https://vercel.com/docs
- 프로젝트 이슈: GitHub Issues
- Railway 백엔드: https://jeju-sns.railway.app

---
**최종 업데이트**: 2025-07-17  
**브랜치**: cursor/initiate-code-deployment-d10e
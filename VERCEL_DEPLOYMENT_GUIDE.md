# 🚀 JeJu SNS Vercel 프론트엔드 배포 가이드

## 📋 사전 준비 사항
- GitHub 계정
- Vercel 계정 (https://vercel.com)
- Railway에 백엔드가 이미 배포되어 있어야 함

## 🔧 Vercel 웹 대시보드를 통한 배포

### 1단계: Vercel 프로젝트 생성
1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. **"Add New Project"** 클릭
3. **"Import Git Repository"** 선택
4. GitHub 계정 연동 (처음인 경우)
5. `richard-kim-79/jeju20250714` 저장소 선택

### 2단계: 프로젝트 설정
1. **Framework Preset**: `Other` 선택
2. **Root Directory**: `frontend` 입력 (중요!)
3. **Build Settings**:
   - Build Command: 비워두기 (정적 파일이므로)
   - Output Directory: `.` (현재 디렉토리)
   - Install Command: 비워두기

### 3단계: 환경 변수
이 프로젝트는 환경 변수가 필요 없습니다. 모든 설정은 `config.js`에서 관리됩니다.

### 4단계: 배포
1. **"Deploy"** 버튼 클릭
2. 배포가 완료되면 자동으로 URL 생성
3. 예시: `https://jeju-sns-frontend.vercel.app`

## 🔄 백엔드 API 연결 확인

### vercel.json 설정
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

이 설정으로 프론트엔드의 `/api/*` 요청이 Railway 백엔드로 프록시됩니다.

## 🌐 커스텀 도메인 설정

### 1. Vercel 대시보드에서
1. Project Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: `jejusns.com`)

### 2. DNS 설정
도메인 제공업체에서:
- A 레코드: `76.76.21.21`
- 또는 CNAME: `cname.vercel-dns.com`

## 🛠 배포 후 확인사항

### 1. 페이지 접속 테스트
- 메인 페이지: `https://[your-app].vercel.app/`
- 관리자 페이지: `https://[your-app].vercel.app/admin.html`
- 오프라인 페이지: `https://[your-app].vercel.app/offline.html`

### 2. API 연결 테스트
브라우저 콘솔에서:
```javascript
fetch('/api/health')
  .then(res => res.json())
  .then(console.log)
```

### 3. PWA 기능 확인
- Chrome DevTools → Application → Service Workers
- Manifest 확인
- 오프라인 모드 테스트

## 📝 주의사항

### CORS 설정
Railway 백엔드에서 Vercel 도메인을 CORS 허용 목록에 추가해야 합니다:
```javascript
// railway-server.js
app.use(cors({
    origin: [
        'https://jeju-sns-frontend.vercel.app',
        'https://jejusns.com'
    ]
}));
```

### 정적 파일 캐싱
Vercel은 자동으로 정적 파일을 CDN에 캐싱합니다. 
Service Worker 업데이트 시 캐시 무효화에 주의하세요.

## 🚨 트러블슈팅

### API 요청 실패
1. `config.js`의 API_BASE_URL 확인
2. Railway 백엔드 상태 확인
3. CORS 설정 확인

### 빌드 실패
1. Root Directory가 `frontend`로 설정되었는지 확인
2. 파일 경로 대소문자 확인 (Linux 환경)

### 404 에러
1. `vercel.json`의 rewrites 설정 확인
2. 파일명과 경로 확인

## 🔐 보안 고려사항

1. **API 키 관리**: 프론트엔드에 민감한 정보 포함 금지
2. **HTTPS 강제**: Vercel은 자동으로 HTTPS 제공
3. **CSP 헤더**: 필요시 `vercel.json`에 추가

## 📊 성능 최적화

### Vercel의 자동 최적화
- 이미지 최적화
- 정적 파일 압축
- 글로벌 CDN 배포

### 추가 최적화
1. 이미지를 WebP 형식으로 변환
2. JavaScript 번들 크기 최소화
3. Critical CSS 인라인화

## 📞 지원
- Vercel 문서: https://vercel.com/docs
- Vercel 지원: https://vercel.com/support
- JeJu SNS 이슈: GitHub Issues

---
**작성일**: 2025-07-17  
**프로젝트**: JeJu SNS Frontend  
**백엔드**: Railway (https://jeju-sns.railway.app)  
**프론트엔드**: Vercel
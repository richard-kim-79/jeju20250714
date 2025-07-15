# 🍊 제주 - 지역 정보 공유 SNS

제주 지역의 다양한 정보를 공유하는 소셜 네트워킹 서비스입니다.

## ✨ 주요 기능

### 🔐 간편한 로그인
- 이메일 로그인
- Google 로그인
- 네이버 로그인
- 카카오 로그인

### 📝 정보 공유
- **구인구직** 💼 - 취업 정보, 일자리 공고
- **부동산** 🏠 - 매물 정보, 임대/매매
- **지역행사** 🎉 - 축제, 문화행사, 이벤트
- **정책지원** 📋 - 정부 지원사업, 혜택 정보
- **지역뉴스** 📰 - 제주 관련 뉴스, 소식

### 🔍 검색 기능
- 의미 기반 검색
- 카테고리별 필터링
- 실시간 검색 결과

### 📸 미디어 지원
- 이미지 업로드
- 링크 자동 감지 및 클릭 가능
- 반응형 이미지 표시

### 🔑 API 접근
- API 키 생성
- 데이터 접근 권한
- 개발자 친화적 API

### 📱 반응형 디자인
- 모바일 최적화
- 태블릿 지원
- 데스크톱 완벽 지원

## 🚀 시작하기

### 현재 버전 (프로토타입)

#### 1. 파일 다운로드
```bash
# 프로젝트 파일들을 다운로드
index.html
styles.css
script.js
```

#### 2. 브라우저에서 실행
```bash
# 로컬 서버 실행 (선택사항)
python -m http.server 8000
# 또는
npx serve .
```

#### 3. 브라우저에서 열기
```
http://localhost:8000
# 또는
file:///path/to/index.html
```

### 향후 개발 환경 설정

#### 필수 요구사항
- **Node.js** 18.0.0 이상
- **npm** 8.0.0 이상
- **Git** 2.30.0 이상

#### 개발 환경 구축
```bash
# 1. 저장소 클론
git clone https://github.com/your-username/jeju-sns.git
cd jeju-sns

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드
npm run build

# 5. 테스트 실행
npm run test
```

#### 환경 변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
DATABASE_URL=mongodb://localhost:27017/jeju-sns
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
NAVER_CLIENT_ID=your-naver-client-id
KAKAO_CLIENT_ID=your-kakao-client-id
```

#### Docker 개발 환경
```bash
# Docker Compose로 전체 스택 실행
docker-compose up -d

# 개별 서비스 실행
docker-compose up backend
docker-compose up frontend
docker-compose up database
```

## 📁 프로젝트 구조

### 현재 구조 (프로토타입)
```
jeju-sns/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일
├── script.js           # JavaScript 로직
└── README.md          # 프로젝트 설명서
```

### 향후 확장 구조
```
jeju-sns/
├── frontend/                 # React/Next.js 프론트엔드
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── hooks/              # 커스텀 훅
│   ├── utils/              # 유틸리티 함수
│   ├── styles/             # 스타일 파일
│   └── public/             # 정적 파일
├── backend/                 # Node.js/Express 백엔드
│   ├── controllers/        # 컨트롤러
│   ├── models/             # 데이터 모델
│   ├── routes/             # API 라우트
│   ├── middleware/         # 미들웨어
│   ├── services/           # 비즈니스 로직
│   └── config/             # 설정 파일
├── mobile/                  # React Native 모바일 앱
│   ├── src/
│   ├── android/
│   └── ios/
├── shared/                  # 공유 타입 및 유틸리티
│   ├── types/
│   └── constants/
├── docs/                    # 문서
│   ├── api/
│   ├── deployment/
│   └── architecture/
└── infrastructure/          # 인프라 설정
    ├── docker/
    ├── kubernetes/
    └── terraform/
```

## 🛠️ 기술 스택

### 현재 구현 (프로토타입)
- **HTML5** - 시맨틱 마크업
- **CSS3** - Tailwind CSS 프레임워크
- **JavaScript (ES6+)** - 바닐라 JS
- **Lucide Icons** - 아이콘 라이브러리
- **LocalStorage** - 데이터 저장

### 향후 확장 계획
#### Frontend
- **React.js** - 사용자 인터페이스
- **Next.js** - SSR 및 SEO 최적화
- **TypeScript** - 타입 안정성
- **Redux Toolkit** - 상태 관리
- **React Query** - 서버 상태 관리

#### Backend
- **Node.js** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **MongoDB** - NoSQL 데이터베이스
- **PostgreSQL** - 관계형 데이터베이스 (대안)
- **Redis** - 캐싱 및 세션 관리

#### DevOps & Infrastructure
- **Docker** - 컨테이너화
- **AWS/Vercel** - 클라우드 호스팅
- **Nginx** - 리버스 프록시
- **GitHub Actions** - CI/CD 파이프라인
- **Sentry** - 에러 모니터링

#### 실시간 기능
- **Socket.io** - WebSocket 통신
- **Firebase** - 푸시 알림
- **AWS S3** - 이미지 저장소

#### AI & 검색
- **TensorFlow.js** - 클라이언트 사이드 ML
- **Elasticsearch** - 고급 검색 엔진
- **OpenAI API** - 콘텐츠 추천

## 🎨 디자인 특징

### 색상 테마
- **주 색상**: 오렌지 (#ea580c) - 제주 감귤을 상징
- **보조 색상**: 파란색 (#1d4ed8) - 바다를 상징
- **배경**: 회색 계열 - 깔끔하고 읽기 쉬운 디자인

### UI/UX 원칙
- **직관성**: 복잡한 기능 제거, 핵심 기능에 집중
- **접근성**: 모든 사용자가 쉽게 사용 가능
- **반응성**: 모든 디바이스에서 최적화된 경험
- **성능**: 빠른 로딩과 부드러운 애니메이션

## 🔧 커스터마이징

### 색상 변경
```css
/* styles.css에서 색상 변수 수정 */
:root {
  --primary-color: #ea580c;
  --secondary-color: #1d4ed8;
}
```

### 카테고리 추가
```javascript
// script.js에서 카테고리 배열 수정
this.categories = [
  { id: 'new-category', name: '새 카테고리', icon: '🎯' }
];
```

## 📊 데이터 구조

### 게시글 형식
```javascript
{
  id: Number,
  author: String,
  username: String,
  avatar: String,
  content: String,
  category: String,
  timestamp: String,
  likes: Number,
  comments: Number,
  retweets: Number,
  hasLink: Boolean,
  image: String | null
}
```

## 🔐 보안 고려사항

- 실제 배포 시 OAuth 인증 구현 필요
- API 키 보안 강화 필요
- HTTPS 사용 권장
- 데이터 검증 및 sanitization 추가

## 🚀 향후 개발 계획

### 🔥 높은 우선순위 (1-3개월)
- [ ] **백엔드 API 연동** - Node.js/Express 서버 구축
  - 사용자 인증 시스템 (JWT)
  - 게시글 CRUD API
  - 이미지 업로드 서버
  - 데이터베이스 연동 (MongoDB/PostgreSQL)
- [ ] **실시간 알림 기능** - WebSocket 구현
  - 새 게시글 알림
  - 댓글/좋아요 알림
  - 실시간 채팅 기능
- [ ] **광고 시스템 통합**
  - Google AdSense 연동
  - 지역 광고주 타겟팅
  - 수익화 모델 구축

### 🟡 중간 우선순위 (3-6개월)
- [ ] **모바일 앱 개발** - React Native
  - iOS/Android 네이티브 앱
  - 푸시 알림 기능
  - 오프라인 모드 지원
- [ ] **AI 기반 추천 시스템**
  - 사용자 선호도 분석
  - 개인화된 콘텐츠 추천
  - 머신러닝 모델 구축
- [ ] **고급 검색 기능**
  - Elasticsearch 연동
  - 위치 기반 검색
  - 해시태그 시스템

### 🟢 낮은 우선순위 (6개월 이상)
- [ ] **다국어 지원** - i18n 시스템
  - 영어, 중국어, 일본어 지원
  - 지역별 콘텐츠 현지화
- [ ] **고급 분석 도구**
  - 사용자 행동 분석
  - 콘텐츠 성과 측정
  - 대시보드 구축
- [ ] **커뮤니티 기능 확장**
  - 그룹/채널 기능
  - 이벤트 관리 시스템
  - 전문가 인증 시스템

### 📊 개발 로드맵

```
Phase 1 (1-3개월): 핵심 인프라 구축
├── 백엔드 API 개발
├── 데이터베이스 설계
├── 인증 시스템 구축
└── 기본 실시간 기능

Phase 2 (3-6개월): 사용자 경험 향상
├── 모바일 앱 개발
├── AI 추천 시스템
├── 고급 검색 기능
└── 광고 시스템 완성

Phase 3 (6개월+): 확장 및 최적화
├── 다국어 지원
├── 고급 분석 도구
├── 커뮤니티 기능
└── 성능 최적화
```

### 🎯 성공 지표 (KPI)

#### 사용자 관련
- **일일 활성 사용자 (DAU)**: 1,000명 목표
- **월간 활성 사용자 (MAU)**: 10,000명 목표
- **사용자 유지율**: 30일 후 40% 유지
- **평균 세션 시간**: 5분 이상

#### 콘텐츠 관련
- **일일 게시글 수**: 100개 목표
- **댓글 참여율**: 게시글당 평균 3개 댓글
- **이미지 업로드율**: 전체 게시글의 30%

#### 기술 관련
- **페이지 로딩 시간**: 3초 이내
- **API 응답 시간**: 500ms 이내
- **시스템 가용성**: 99.9% 이상

### 💰 수익화 전략

#### 1단계: 광고 수익
- Google AdSense 연동
- 지역 광고주 타겟팅
- 스폰서드 콘텐츠

#### 2단계: 프리미엄 서비스
- 광고 없는 프리미엄 계정
- 고급 분석 도구
- 우선 지원 서비스

#### 3단계: B2B 서비스
- 지역 기업 마케팅 도구
- 데이터 인사이트 제공
- API 서비스 판매

## 📚 API 문서

### 인증 API
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### 게시글 API
```http
GET    /api/posts              # 게시글 목록 조회
POST   /api/posts              # 게시글 작성
GET    /api/posts/:id          # 게시글 상세 조회
PUT    /api/posts/:id          # 게시글 수정
DELETE /api/posts/:id          # 게시글 삭제
POST   /api/posts/:id/like     # 좋아요
POST   /api/posts/:id/comment  # 댓글 작성
```

### 사용자 API
```http
GET    /api/users              # 사용자 목록
GET    /api/users/:id          # 사용자 프로필
PUT    /api/users/:id          # 프로필 수정
GET    /api/users/:id/posts    # 사용자 게시글
```

### 검색 API
```http
GET /api/search?q=keyword      # 키워드 검색
GET /api/search/category       # 카테고리별 검색
GET /api/search/location       # 위치 기반 검색
```

### 실시간 API (WebSocket)
```javascript
// 연결
socket.connect()

// 이벤트 리스닝
socket.on('new_post', (post) => {})
socket.on('new_comment', (comment) => {})
socket.on('new_like', (like) => {})

// 이벤트 발생
socket.emit('join_room', 'category')
socket.emit('leave_room', 'category')
```

## 🧪 테스트

### 단위 테스트
```bash
# 프론트엔드 테스트
npm run test:frontend

# 백엔드 테스트
npm run test:backend

# 전체 테스트
npm run test
```

### E2E 테스트
```bash
# Cypress 테스트
npm run test:e2e

# Playwright 테스트
npm run test:playwright
```

### 성능 테스트
```bash
# Lighthouse 테스트
npm run test:lighthouse

# Load 테스트
npm run test:load
```

## 📊 모니터링

### 로그 관리
- **Application Logs**: Winston + ELK Stack
- **Error Tracking**: Sentry
- **Performance**: New Relic / DataDog

### 메트릭 수집
- **사용자 행동**: Google Analytics
- **서버 성능**: Prometheus + Grafana
- **비즈니스 지표**: Mixpanel

## 🔒 보안

### 인증 & 권한
- **JWT 토큰**: 액세스 토큰 + 리프레시 토큰
- **OAuth 2.0**: Google, Naver, Kakao 연동
- **RBAC**: 역할 기반 접근 제어

### 데이터 보호
- **HTTPS**: 모든 통신 암호화
- **CORS**: 크로스 오리진 정책
- **Rate Limiting**: API 요청 제한
- **Input Validation**: 입력 데이터 검증

## 📞 문의

프로젝트에 대한 문의사항이나 개선 제안이 있으시면 언제든 연락주세요.

### 연락처
- **이메일**: contact@jeju-sns.com
- **GitHub**: https://github.com/jeju-sns
- **문서**: https://docs.jeju-sns.com

---

**제주 SNS** - 제주 지역 정보 공유의 새로운 시작 🍊 

## ✅ 1단계: 백엔드 API 연동 (분석 및 피드백)

### 완료 내역
- Express 기반 Jeju SNS API 서버 구축
- 게시글 목록 조회, 작성, 단일 조회, 삭제 API 구현
- API 키 인증 미들웨어 적용 (샘플)
- 메모리 기반 데이터 저장 (향후 DB 연동 예정)

### 테스트 결과
- 서버 정상 기동: `http://localhost:3001`에서 API 응답 확인
- API 키 인증 성공 시 게시글 목록 반환
- 예시:
  ```bash
  curl -H "x-api-key: jeju_testapikey1234" http://localhost:3001/api/posts
  ```
- 정상적으로 JSON 데이터 반환됨

### 피드백 및 개선점
- 현재는 메모리 저장소이므로 서버 재시작 시 데이터 초기화됨 → DB 연동 필요
- API 키 인증은 단순 prefix 체크로, 실제 서비스에서는 사용자별 발급 및 관리 필요
- 게시글 작성 시 입력값 검증, 에러 처리 등 추가 필요
- 추후 JWT 기반 인증, 파일 업로드, 댓글/좋아요 등 기능 확장 예정

### 다음 단계 제안
1. **DB 연동(MongoDB)**: 영속적 데이터 저장
2. **API 키 관리/발급 시스템**: 사용자별 키 발급 및 관리
3. **입력값 검증 및 에러 처리 강화**
4. **프론트엔드와의 연동 테스트**

--- 
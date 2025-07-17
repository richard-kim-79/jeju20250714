# 제주 SNS 플랫폼 배포 실행 가이드

## 🚀 새로운 배포 전략 실행 단계

### 1단계: 개발 환경 설정

#### 1.1 의존성 설치
```bash
# 새로운 의존성 설치
npm install

# 개발 의존성 설치
npm install --save-dev
```

#### 1.2 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# 환경 변수 편집
nano .env
```

#### 1.3 로컬 개발 서버 실행
```bash
# 개발 모드로 실행
npm run dev

# 또는 Docker Compose로 실행
docker-compose up -d
```

### 2단계: Railway 배포 준비

#### 2.1 Railway CLI 설치
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login
```

#### 2.2 Railway 프로젝트 생성
```bash
# 새 프로젝트 생성
railway init jeju-sns-platform

# 또는 기존 프로젝트 연결
railway link [PROJECT_ID]
```

#### 2.3 환경 변수 설정
```bash
# Railway 환경 변수 설정
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-production-jwt-secret
railway variables set LOG_LEVEL=info

# PostgreSQL 데이터베이스 추가
railway add postgresql
```

#### 2.4 배포 실행
```bash
# 배포
railway up

# 또는 npm 스크립트 사용
npm run deploy:railway
```

### 3단계: 데이터베이스 마이그레이션

#### 3.1 PostgreSQL 연결 확인
```bash
# 데이터베이스 연결 테스트
railway run node -e "require('./src/config/database').dbUtils.initializeDatabase()"
```

#### 3.2 기존 데이터 마이그레이션
```bash
# 마이그레이션 스크립트 실행 (추후 구현)
npm run migrate

# 샘플 데이터 시드
npm run seed
```

### 4단계: 도메인 및 SSL 설정

#### 4.1 커스텀 도메인 연결
```bash
# Railway에서 도메인 설정
railway domain add jeju-sns.com
railway domain add beta.jeju-sns.com
```

#### 4.2 SSL 인증서 (자동 제공)
Railway에서 자동으로 SSL 인증서를 제공합니다.

### 5단계: 모니터링 설정

#### 5.1 로그 확인
```bash
# Railway 로그 확인
railway logs

# 로컬 로그 확인
npm run logs
npm run logs:error
```

#### 5.2 헬스체크 확인
```bash
# 헬스체크 엔드포인트 테스트
curl https://your-app.railway.app/health
```

## 🔧 환경별 배포 명령어

### 개발 환경
```bash
npm run dev
```

### 베타 환경
```bash
npm run beta
```

### 프로덕션 환경
```bash
npm start
```

## 📊 배포 후 체크리스트

### 기본 기능 테스트
- [ ] 메인 페이지 접속 확인
- [ ] API 엔드포인트 응답 확인
- [ ] 사용자 등록/로그인 기능
- [ ] 게시글 작성/조회 기능
- [ ] 댓글 작성/조회 기능
- [ ] 관리자 대시보드 접속

### 성능 테스트
- [ ] 응답 시간 확인 (< 2초)
- [ ] 동시 사용자 처리 확인
- [ ] 메모리 사용량 확인
- [ ] CPU 사용량 확인

### 보안 테스트
- [ ] HTTPS 접속 확인
- [ ] CORS 설정 확인
- [ ] Rate Limiting 동작 확인
- [ ] 입력 검증 확인

### 로그 및 모니터링
- [ ] 로그 파일 생성 확인
- [ ] 에러 로그 확인
- [ ] 성능 메트릭 확인
- [ ] 알림 설정 확인

## 🚨 문제 해결 가이드

### 일반적인 문제들

#### 1. 서버 시작 실패
```bash
# 로그 확인
npm run logs:error

# 환경 변수 확인
railway variables

# 의존성 재설치
npm ci
```

#### 2. 데이터베이스 연결 실패
```bash
# 데이터베이스 상태 확인
railway status

# 연결 문자열 확인
railway variables get DATABASE_URL
```

#### 3. 배포 실패
```bash
# 빌드 로그 확인
railway logs --deployment [DEPLOYMENT_ID]

# 재배포
railway up --detach
```

### 성능 문제

#### 1. 응답 시간 느림
- 데이터베이스 쿼리 최적화
- 캐싱 구현 (Redis)
- CDN 설정

#### 2. 메모리 사용량 높음
- 메모리 누수 확인
- 가비지 컬렉션 튜닝
- 프로세스 재시작

## 📈 확장 계획

### 1000명 → 10000명 확장

#### 1. 데이터베이스 확장
```bash
# 연결 풀 설정 조정
# src/config/database.js에서 max 값 증가

# 읽기 전용 복제본 추가
# 마스터-슬레이브 구성
```

#### 2. 캐싱 시스템 추가
```bash
# Redis 설치
npm install redis

# 캐싱 미들웨어 구현
# src/middleware/cache.js
```

#### 3. 로드 밸런싱
```bash
# 다중 인스턴스 배포
railway scale --replicas 3

# 또는 AWS ALB 사용
```

#### 4. CDN 설정
```bash
# CloudFlare 설정
# 정적 파일 캐싱
# 이미지 최적화
```

## 🔐 보안 강화

### 1. JWT 토큰 구현
```bash
# JWT 미들웨어 구현
# src/middleware/auth.js
```

### 2. OAuth 소셜 로그인
```bash
# Passport.js 설치
npm install passport passport-google-oauth20
```

### 3. 2FA 구현
```bash
# OTP 라이브러리 설치
npm install otplib qrcode
```

## 📞 지원 및 문의

### 배포 관련 문의
- **이메일**: devops@jeju-sns.com
- **Slack**: #deployment-support
- **GitHub Issues**: https://github.com/richard-kim-79/jeju20250714/issues

### 긴급 상황 대응
1. **서비스 중단**: Railway 대시보드에서 즉시 재시작
2. **데이터 손실**: 백업에서 복구
3. **보안 사고**: 즉시 서비스 중단 후 조사

---

**제주 SNS 플랫폼 - 새로운 배포 전략으로 안정적이고 확장 가능한 서비스를 구축하세요! 🍊**
# Railway 배포 가이드

## 🚀 Railway 배포 단계별 실행

### 1단계: Railway 로그인 및 프로젝트 초기화

```bash
# Railway 로그인 (브라우저가 열림)
railway login

# 프로젝트 초기화
railway init jeju-sns-platform

# 현재 프로젝트 상태 확인
railway status
```

### 2단계: PostgreSQL 데이터베이스 추가

```bash
# PostgreSQL 서비스 추가
railway add postgresql

# 데이터베이스 URL 확인
railway variables
```

### 3단계: 환경 변수 설정

```bash
# 프로덕션 환경 변수 설정
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=jeju-sns-super-secret-jwt-key-2025-production
railway variables set LOG_LEVEL=info
railway variables set PORT=3001

# 환경 변수 확인
railway variables
```

### 4단계: 배포 실행

```bash
# 첫 번째 배포
railway up

# 배포 상태 확인
railway status

# 로그 확인
railway logs
```

### 5단계: 도메인 설정 (선택사항)

```bash
# 커스텀 도메인 추가
railway domain add jeju-sns.com

# 도메인 상태 확인
railway domain
```

## 🔧 배포 후 확인사항

### 헬스체크 테스트
```bash
# Railway 제공 URL로 헬스체크
curl https://jeju-sns-platform-production.up.railway.app/health

# 예상 응답:
# {"status":"healthy","timestamp":"2025-01-17T02:30:00.000Z","environment":"production","version":"2.0.0"}
```

### API 엔드포인트 테스트
```bash
# 게시글 목록 조회
curl https://jeju-sns-platform-production.up.railway.app/api/posts

# 관리자 통계 (인증 필요)
curl -H "user-id: admin" https://jeju-sns-platform-production.up.railway.app/api/admin/stats
```

## 🚨 문제 해결

### 배포 실패 시
```bash
# 로그 확인
railway logs

# 재배포
railway up --detach

# 환경 변수 재확인
railway variables
```

### 데이터베이스 연결 실패 시
```bash
# 데이터베이스 상태 확인
railway status

# 데이터베이스 재시작
railway restart
```

## 📊 배포 성공 기준

- [ ] Railway URL 접속 가능
- [ ] 헬스체크 엔드포인트 응답
- [ ] 모든 API 엔드포인트 정상 작동
- [ ] 데이터베이스 연결 성공
- [ ] 로그 시스템 정상 작동

## 🔄 지속적 배포 설정

GitHub Actions를 통한 자동 배포는 이미 `.github/workflows/deploy.yml`에 설정되어 있습니다.

Railway 토큰을 GitHub Secrets에 추가하면 자동 배포가 활성화됩니다:
- `RAILWAY_TOKEN`: Railway 프로젝트 토큰

---

**Railway 배포 완료 후 다음 단계로 진행하세요! 🍊**
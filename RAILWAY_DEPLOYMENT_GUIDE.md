# 🚀 JeJu SNS Railway 배포 가이드

## 📋 사전 준비 사항
- GitHub 계정
- Railway 계정 (https://railway.app)
- 현재 프로젝트가 GitHub에 푸시되어 있어야 함

## 🔧 Railway 웹 대시보드를 통한 배포

### 1단계: Railway 프로젝트 생성
1. [Railway 대시보드](https://railway.app/dashboard) 접속
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. GitHub 계정 연동 (처음인 경우)
5. JeJu SNS 저장소 선택

### 2단계: PostgreSQL 데이터베이스 추가
1. 프로젝트 대시보드에서 **"New"** 클릭
2. **"Database"** → **"Add PostgreSQL"** 선택
3. PostgreSQL이 자동으로 프로비저닝됨
4. `DATABASE_URL` 환경변수가 자동으로 설정됨

### 3단계: 환경 변수 설정
프로젝트 설정에서 다음 환경 변수 추가:

```
NODE_ENV=production
PORT=3001
```

### 4단계: 배포 설정
1. **Settings** 탭으로 이동
2. **Deploy** 섹션에서:
   - Root Directory: `/` (기본값)
   - Build Command: `npm install`
   - Start Command: `node railway-server.js`

### 5단계: 데이터베이스 초기화
Railway CLI를 사용하거나 웹 콘솔에서:

```bash
# Railway CLI 사용 시
railway link [project-id]
railway run psql -f database/schema.sql
railway run psql -f database/add_indexes.sql

# 또는 Railway 웹 콘솔에서 PostgreSQL 플러그인 클릭 → "Connect" → "psql" 선택
```

### 6단계: 배포 확인
1. 배포가 완료되면 Railway가 자동으로 URL 생성
2. 제공된 URL로 접속하여 확인:
   - `https://[your-app].railway.app/`
   - `https://[your-app].railway.app/api/health`
   - `https://[your-app].railway.app/admin.html`

## 🔄 자동 배포 설정
- GitHub 저장소에 push하면 자동으로 재배포됨
- main 브랜치 또는 선택한 브랜치에 대해 자동 배포 활성화

## 🛠 추가 설정 (선택사항)

### 커스텀 도메인 연결
1. Settings → Domains
2. "Add Domain" 클릭
3. 도메인 DNS 설정:
   - CNAME 레코드: `[your-app].railway.app`
   - 또는 Railway가 제공하는 A 레코드 사용

### 환경별 설정
```javascript
// railway-server.js에 이미 구현됨
const isDevelopment = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3001;
```

### 모니터링
- Railway 대시보드에서 실시간 로그 확인
- 메트릭스 탭에서 CPU, 메모리 사용량 모니터링
- 알림 설정 가능

## 📝 주의사항
1. **무료 티어 제한**:
   - 월 $5 크레딧
   - 500시간 실행 시간
   - 100GB 아웃바운드 트래픽

2. **데이터베이스 백업**:
   - Railway는 자동 백업 제공
   - 추가로 수동 백업 권장

3. **환경 변수**:
   - 민감한 정보는 반드시 환경 변수로 관리
   - `.env` 파일은 git에 포함하지 않음

## 🚨 트러블슈팅

### 빌드 실패 시
- package.json의 engines 필드 확인
- node_modules 캐시 클리어: Settings → Clear build cache

### 데이터베이스 연결 실패 시
- DATABASE_URL 환경 변수 확인
- PostgreSQL 플러그인 상태 확인
- SSL 설정 확인 (production에서는 필수)

### 포트 관련 오류
- Railway는 자동으로 PORT 환경변수 할당
- 코드에서 `process.env.PORT` 사용 확인

## 📞 지원
- Railway 문서: https://docs.railway.app
- Railway 커뮤니티: https://discord.gg/railway
- JeJu SNS 이슈: GitHub Issues 활용

---
**작성일**: 2025-07-17  
**프로젝트**: JeJu SNS Platform  
**배포 방식**: Railway (PaaS)
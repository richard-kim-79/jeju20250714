# 🌐 **JeJu SNS 접속 정보**

## ✅ **서버 상태: 정상 운영 중**

### 🔗 **접속 주소**

#### 1. 로컬 접속 (같은 시스템 내)
- **URL**: http://localhost:3001/
- **API 헬스 체크**: http://localhost:3001/api/health
- **상태**: ✅ 정상 동작

#### 2. 네트워크 접속 (외부에서)
- **IP 주소**: 172.17.0.2
- **URL**: http://172.17.0.2:3001/
- **API 헬스 체크**: http://172.17.0.2:3001/api/health
- **상태**: ✅ 정상 동작

#### 3. 모든 인터페이스 바인딩
- **바인딩**: 0.0.0.0:3001 (모든 네트워크 인터페이스)
- **프로토콜**: HTTP
- **포트**: 3001

### 📱 **주요 페이지**

#### 메인 서비스
- **홈페이지**: http://localhost:3001/ 또는 http://172.17.0.2:3001/
- **제목**: JeJu - 제주 부동산·구인구직·여행정보 커뮤니티 SNS

#### API 엔드포인트
- **헬스 체크**: `/api/health`
- **사용자 인증**: `/api/auth/register`, `/api/auth/login`
- **게시물**: `/api/posts`
- **댓글**: `/api/posts/:id/comments`
- **좋아요**: `/api/posts/:id/like`

#### SEO 파일
- **사이트맵**: `/sitemap.xml`
- **robots.txt**: `/robots.txt`
- **서비스 워커**: `/service-worker.js`
- **오프라인 페이지**: `/offline.html`

### 🔧 **서버 설정**

#### 환경 변수
- **NODE_ENV**: production
- **PORT**: 3001
- **DATABASE_URL**: postgresql://postgres:@localhost:5432/jeju_sns

#### 프로세스 정보
- **실행 명령**: `node railway-server.js`
- **바인딩 주소**: 0.0.0.0:3001
- **상태**: 실행 중

### 🌐 **네트워크 접근 방법**

#### 1. 웹 브라우저에서 접속
```
http://localhost:3001/
또는
http://172.17.0.2:3001/
```

#### 2. API 테스트 (curl)
```bash
# 헬스 체크
curl http://localhost:3001/api/health

# 메인 페이지
curl http://localhost:3001/

# 사이트맵
curl http://localhost:3001/sitemap.xml
```

#### 3. 모바일/외부 기기에서 접속
- 같은 네트워크에 있는 경우: http://172.17.0.2:3001/
- 다른 네트워크에서는 포트 포워딩 또는 공개 도메인 필요

### 🚨 **접속 문제 해결**

#### 접속이 안 될 때 확인사항
1. **서버 상태 확인**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **프로세스 확인**
   ```bash
   ps aux | grep railway-server
   ```

3. **포트 확인**
   - 포트 3001이 사용 중인지 확인
   - 방화벽 설정 확인

4. **서버 재시작**
   ```bash
   # 기존 프로세스 종료
   pkill -f railway-server
   
   # 서버 재시작
   DATABASE_URL=postgresql://postgres:@localhost:5432/jeju_sns NODE_ENV=production PORT=3001 node railway-server.js
   ```

### 📊 **성능 정보**
- **페이지 로드 시간**: ~2ms
- **API 응답 시간**: ~1ms
- **페이지 크기**: 28.8KB
- **압축**: Gzip 적용

### 🎯 **주요 기능**
- ✅ 제주 부동산 정보 공유
- ✅ 구인구직 정보
- ✅ 여행 및 액티비티 정보
- ✅ 뉴스 및 행사 정보
- ✅ 사용자 커뮤니티
- ✅ 모바일 반응형 디자인
- ✅ 오프라인 지원 (서비스 워커)

---

## 🎉 **접속 준비 완료!**

**JeJu SNS에 정상적으로 접속할 수 있습니다.**

브라우저에서 `http://localhost:3001/` 또는 `http://172.17.0.2:3001/`로 접속하세요!

---

*최종 업데이트: 2024년 12월 17일*
*서버 상태: 정상 운영 중*
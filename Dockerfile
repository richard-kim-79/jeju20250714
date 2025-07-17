# Node.js 18 Alpine 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apk update && apk add --no-cache \
    postgresql-client \
    curl \
    && rm -rf /var/cache/apk/*

# 보안을 위한 non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production && npm cache clean --force

# 소스 코드 복사
COPY . .

# 필요한 디렉토리 생성
RUN mkdir -p logs uploads data && \
    chown -R nextjs:nodejs /app

# 포트 노출
EXPOSE 3001

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# 사용자 변경
USER nextjs

# 애플리케이션 시작
CMD ["npm", "start"]
// API 키 헬퍼 스크립트
// 브라우저 콘솔에서 실행하세요

// API 키 설정
function setApiKey(key) {
    localStorage.setItem('jejuApiKey', key);
    location.reload();
}

// 테스트용 API 키 설정
setApiKey('jeju_mmnz4ppugro');

console.log('API 키가 설정되었습니다. 페이지가 새로고침됩니다.'); 
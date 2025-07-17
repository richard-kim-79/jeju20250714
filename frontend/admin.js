// 관리자 비밀번호(간단 하드코딩)
const ADMIN_PASSWORD = 'jejuadmin2024';
const API_URL = 'http://localhost:3002/api';

let apiKey = null;

// 로그인
const loginBtn = document.getElementById('adminLoginBtn');
const loginMsg = document.getElementById('adminLoginMsg');
loginBtn.onclick = () => {
    const pw = document.getElementById('adminPassword').value;
    if (pw === ADMIN_PASSWORD) {
        document.getElementById('adminLoginSection').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadDashboard();
    } else {
        loginMsg.textContent = '비밀번호가 올바르지 않습니다.';
    }
};

async function loadDashboard() {
    // 게시글/댓글 통계
    const posts = await fetchPosts();
    const postCount = posts.length;
    const commentCount = posts.reduce((sum, p) => sum + (p.comments ? p.comments.length : 0), 0);
    document.getElementById('statPosts').textContent = postCount;
    document.getElementById('statComments').textContent = commentCount;
    // API 키/유저 통계
    const keys = await fetchKeys();
    document.getElementById('statKeys').textContent = keys.length;
    document.getElementById('statUsers').textContent = new Set(keys.map(k => k.userId)).size;
    // 게시글 테이블
    renderPostsTable(posts);
    // API 키 테이블
    renderKeysTable(keys);
    // 신고 게시글
    const reports = await fetchReports();
    renderReportsTable(reports);
    // 차단 유저
    const blocked = await fetchBlockedUsers();
    renderBlockedUsersTable(blocked);
}

async function fetchPosts() {
    const res = await fetch(`${API_URL}/posts?key=jeju_admin`); // 관리자용 임시 키
    return await res.json();
}

async function fetchKeys() {
    const res = await fetch(`${API_URL}/keys`);
    return await res.json();
}

async function fetchReports() {
    const res = await fetch(`${API_URL}/reports/posts?key=jeju_admin`);
    return await res.json();
}
async function fetchBlockedUsers() {
    const res = await fetch(`${API_URL}/users/blocked?key=jeju_admin`);
    return await res.json();
}

function renderPostsTable(posts) {
    let html = `<table class='min-w-full text-xs'><thead><tr><th>ID</th><th>작성자</th><th>내용</th><th>댓글</th><th>삭제</th></tr></thead><tbody>`;
    posts.forEach(post => {
        html += `<tr><td>${post.id}</td><td>${post.author}</td><td>${post.content.slice(0,30)}</td><td>${post.comments ? post.comments.length : 0}</td><td><button class='del-post-btn text-red-500' data-id='${post.id}'>삭제</button></td></tr>`;
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(c => {
                html += `<tr class='bg-gray-50'><td></td><td>└ ${c.author}</td><td>${c.content.slice(0,30)}</td><td></td><td><button class='del-comment-btn text-red-400' data-post-id='${post.id}' data-cid='${c.id}'>댓글삭제</button></td></tr>`;
            });
        }
    });
    html += '</tbody></table>';
    document.getElementById('postsTable').innerHTML = html;
    // 삭제 이벤트 연결
    document.querySelectorAll('.del-post-btn').forEach(btn => {
        btn.onclick = async () => {
            if (confirm('정말 삭제하시겠습니까?')) {
                await fetch(`${API_URL}/posts/${btn.dataset.id}?key=jeju_admin`, { method: 'DELETE' });
                loadDashboard();
            }
        };
    });
    document.querySelectorAll('.del-comment-btn').forEach(btn => {
        btn.onclick = async () => {
            if (confirm('댓글을 삭제하시겠습니까?')) {
                await deleteComment(btn.dataset.postId, btn.dataset.cid);
                loadDashboard();
            }
        };
    });
}

async function deleteComment(postId, commentId) {
    // 댓글만 삭제: 서버에 별도 API 없으므로 posts 배열에서 직접 삭제(임시)
    const res = await fetch(`${API_URL}/posts?key=jeju_admin`);
    const posts = await res.json();
    const post = posts.find(p => p.id == postId);
    if (post && post.comments) {
        post.comments = post.comments.filter(c => c.id != commentId);
        // 서버에 전체 posts를 PATCH/PUT하는 API가 없으므로, 실제 운영에서는 별도 API 필요
        // 임시로 전체 게시글 삭제 후 재등록하는 방식은 권장하지 않음(여기선 안내만)
        alert('댓글 삭제는 서버 API 확장 필요. 현재는 UI에서만 제거됩니다.');
    }
}

function renderKeysTable(keys) {
    let html = `<table class='min-w-full text-xs'><thead><tr><th>API 키</th><th>유저ID</th><th>유저명</th><th>생성일</th></tr></thead><tbody>`;
    keys.forEach(k => {
        html += `<tr><td>${k.key}</td><td>${k.userId}</td><td>${k.userName}</td><td>${new Date(k.createdAt).toLocaleString()}</td></tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('keysTable').innerHTML = html;
}

function renderReportsTable(reports) {
    let html = `<h2 class='text-lg font-bold mb-2 mt-6'>신고된 게시글</h2><table class='min-w-full text-xs'><thead><tr><th>ID</th><th>작성자</th><th>신고수</th><th>사유</th><th>차단</th></tr></thead><tbody>`;
    reports.forEach(post => {
        html += `<tr><td>${post.id}</td><td>${post.author}</td><td>${post.reports.length}</td><td>${post.reports.map(r=>r.reason).join(', ')}</td><td><button class='block-user-btn text-red-500' data-uid='${post.username.replace('@','')}'>차단</button></td></tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('postsTable').insertAdjacentHTML('beforebegin', html);
    document.querySelectorAll('.block-user-btn').forEach(btn => {
        btn.onclick = async () => {
            if (confirm('해당 유저를 차단하시겠습니까?')) {
                await fetch(`${API_URL}/users/${btn.dataset.uid}/block?key=jeju_admin`, { method: 'POST' });
                loadDashboard();
            }
        };
    });
}
function renderBlockedUsersTable(users) {
    let html = `<h2 class='text-lg font-bold mb-2 mt-6'>차단 유저 목록</h2><ul class='mb-4'>`;
    users.forEach(u => {
        html += `<li class='flex items-center gap-2 mb-1'>${u} <button class='unblock-user-btn text-blue-500 text-xs' data-uid='${u}'>차단 해제</button></li>`;
    });
    html += '</ul>';
    document.getElementById('keysTable').insertAdjacentHTML('beforebegin', html);
    document.querySelectorAll('.unblock-user-btn').forEach(btn => {
        btn.onclick = async () => {
            await fetch(`${API_URL}/users/${btn.dataset.uid}/unblock?key=jeju_admin`, { method: 'POST' });
            loadDashboard();
        };
    });
} 
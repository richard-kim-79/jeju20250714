// 제주 SNS 앱 메인 스크립트
class JejuSNS {
    constructor() {
        this.user = null;
        this.posts = [];
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.apiKey = '';
        this.apiUrl = 'https://jeju20250714-67y4h2vkh-bluewhale2025.vercel.app/api'; // API 서버 주소
        this.isLoading = false;
        
        // 카테고리 정의
        this.categories = [
            { id: 'all', name: '전체', icon: '🌴' },
            { id: 'jobs', name: '구인구직', icon: '💼' },
            { id: 'realestate', name: '부동산', icon: '🏠' },
            { id: 'events', name: '지역행사', icon: '🎉' },
            { id: 'policy', name: '정책지원', icon: '📋' },
            { id: 'news', name: '지역뉴스', icon: '📰' },
            { id: 'debate', name: '난상토론', icon: '💬' }
        ];

        // 샘플 데이터
        this.samplePosts = [
            {
                id: 1,
                author: '제주시민',
                username: '@jejucitizen',
                avatar: '👤',
                content: '제주시청에서 청년 창업 지원금 신청 받고 있어요! 최대 500만원까지 지원합니다. 자세한 내용은 https://jeju.go.kr/startup 확인해보세요.',
                category: 'policy',
                timestamp: '2시간 전',
                likes: 24,
                comments: 8,
                retweets: 12,
                hasLink: true,
                image: null
            },
            {
                id: 2,
                author: '제주부동산',
                username: '@jejurealty',
                avatar: '🏠',
                content: '서귀포시 중문동 투룸 전세 매물 나왔습니다. 보증금 8천만원, 바다 전망 좋은 곳이에요. 연락주세요!',
                category: 'realestate',
                timestamp: '4시간 전',
                likes: 15,
                comments: 23,
                retweets: 6,
                hasLink: false,
                image: null
            },
            {
                id: 3,
                author: '제주여행사',
                username: '@jejutour',
                avatar: '✈️',
                content: '이번 주말 한라산 등반 가이드 구합니다. 경력 3년 이상, 안전교육 이수자 우대. 일당 15만원입니다.',
                category: 'jobs',
                timestamp: '6시간 전',
                likes: 31,
                comments: 17,
                retweets: 9,
                hasLink: false,
                image: null
            },
            {
                id: 4,
                author: '제주문화원',
                username: '@jejuculture',
                avatar: '🎭',
                content: '제주 전통 해녀 문화 체험 행사가 다음 주 토요일 성산일출봉에서 열립니다. 참가비 무료, 사전 신청 필수!',
                category: 'events',
                timestamp: '8시간 전',
                likes: 67,
                comments: 34,
                retweets: 28,
                hasLink: false,
                image: null
            }
        ];

        this.selectedCategories = new Set(['all']); // 다중 선택 지원
        this.init();
    }

    async init() {
        this.loadUserFromStorage();
        this.setupEventListeners();
        await this.loadApiKeyFromStorage();
        
        // 자동 로그인은 API 키가 있을 때만 실행
        if (!this.user && this.apiKey) {
            this.handleLogin('email');
        }
        
        await this.fetchPosts();
        this.renderPosts();
        
        // UI 업데이트 (로그인 버튼 표시를 위해)
        this.updateUserInterface();
    }

    setupEventListeners() {
        // 로그인 버튼
        // loginBtn 이벤트 연결 제거 (updateUserInterface에서만 연결)

        // 로그인 모달 닫기
        document.getElementById('closeLoginModal').addEventListener('click', () => {
            this.hideLoginModal();
        });

        // 로그인 옵션들
        document.getElementById('emailLogin').addEventListener('click', () => this.handleLogin('email'));
        document.getElementById('googleLogin').addEventListener('click', () => this.handleLogin('google'));
        document.getElementById('naverLogin').addEventListener('click', () => this.handleLogin('naver'));
        document.getElementById('kakaoLogin').addEventListener('click', () => this.handleLogin('kakao'));

        // API 모달 관련
        document.getElementById('closeApiModal').addEventListener('click', () => {
            this.hideApiModal();
        });

        document.getElementById('generateApiKey').addEventListener('click', () => {
            this.generateApiKey();
        });

        // API 키 입력 반영
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                this.apiKey = e.target.value;
                localStorage.setItem('jejuApiKey', this.apiKey);
            });
        }

        // 카테고리 버튼들
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cat = e.target.closest('.category-btn').dataset.category;
                if (cat === 'all') {
                    this.selectedCategories = new Set(['all']);
                } else {
                    if (this.selectedCategories.has('all')) this.selectedCategories.delete('all');
                    if (this.selectedCategories.has(cat)) {
                        this.selectedCategories.delete(cat);
                        if (this.selectedCategories.size === 0) this.selectedCategories.add('all');
                    } else {
                        this.selectedCategories.add(cat);
                    }
                }
                this.updateCategoryButtons();
                this.renderPosts();
            });
        });

        // 검색
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderPosts();
        });

        // 게시글 작성
        document.getElementById('submitPost').addEventListener('click', () => {
            this.submitPost();
        });

        // 이미지 업로드
        document.getElementById('imageUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // 이미지 제거
        document.getElementById('removeImage').addEventListener('click', () => {
            this.removeImage();
        });

        // 모달 외부 클릭 시 닫기
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') {
                this.hideLoginModal();
            }
        });

        document.getElementById('apiModal').addEventListener('click', (e) => {
            if (e.target.id === 'apiModal') {
                this.hideApiModal();
            }
        });

        // 개인정보 모달 관련 이벤트
        document.getElementById('closeProfileModal').addEventListener('click', () => {
            this.hideProfileModal();
        });

        document.getElementById('saveProfile').addEventListener('click', () => {
            this.saveProfile();
        });

        document.getElementById('cancelProfile').addEventListener('click', () => {
            this.hideProfileModal();
        });

        document.getElementById('profileModal').addEventListener('click', (e) => {
            if (e.target.id === 'profileModal') {
                this.hideProfileModal();
            }
        });
    }

    async loadApiKeyFromStorage() {
        const savedKey = localStorage.getItem('jejuApiKey');
        if (savedKey) {
            this.apiKey = savedKey;
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) apiKeyInput.value = savedKey;
        } else {
            // API 키가 없으면 모달 자동 안내
            setTimeout(() => this.showApiModal(), 1000);
        }
    }

    async fetchPosts(scrollToTop = false) {
        if (!this.apiKey) {
            this.posts = [];
            this.renderPosts();
            this.showNotification('API 키를 입력하거나 생성하세요.','error');
            return;
        }
        this.isLoading = true;
        this.renderPosts();
        try {
            const res = await fetch(`${this.apiUrl}/posts`, {
                headers: { 'x-api-key': this.apiKey }
            });
            if (!res.ok) throw new Error('API 오류: ' + res.status);
            this.posts = await res.json();
        } catch (e) {
            this.posts = [];
            this.showNotification('게시글 불러오기 실패: ' + e.message, 'error');
        }
        this.isLoading = false;
        this.renderPosts();
        if (scrollToTop) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    loadPosts() {
        const savedPosts = localStorage.getItem('jejuPosts');
        if (savedPosts) {
            this.posts = JSON.parse(savedPosts);
        } else {
            this.posts = [...this.samplePosts];
            this.savePosts();
        }
    }

    savePosts() {
        localStorage.setItem('jejuPosts', JSON.stringify(this.posts));
    }

    loadUserFromStorage() {
        const savedUser = localStorage.getItem('jejuUser');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            this.updateUserInterface();
        }
    }

    saveUserToStorage() {
        if (this.user) {
            localStorage.setItem('jejuUser', JSON.stringify(this.user));
        } else {
            localStorage.removeItem('jejuUser');
        }
    }

    showLoginModal() {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('loginModal').classList.add('modal-enter');
    }

    hideLoginModal() {
        document.getElementById('loginModal').classList.add('hidden');
    }

    showApiModal() {
        document.getElementById('apiModal').classList.remove('hidden');
        document.getElementById('apiModal').classList.add('modal-enter');
        // 복사 버튼 동적 추가
        setTimeout(() => {
            let copyBtn = document.getElementById('copyApiKeyBtn');
            if (!copyBtn) {
                const input = document.getElementById('apiKeyInput');
                const btn = document.createElement('button');
                btn.id = 'copyApiKeyBtn';
                btn.textContent = '복사';
                btn.className = 'px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 ml-2';
                btn.onclick = () => {
                    navigator.clipboard.writeText(input.value);
                    this.showNotification('API 키가 복사되었습니다!');
                };
                input.parentNode.appendChild(btn);
            }
        }, 200);
    }

    hideApiModal() {
        document.getElementById('apiModal').classList.add('hidden');
    }

    showProfileModal() {
        if (!this.user) return;
        
        console.log('개인정보 모달 열기 시도');
        
        // 현재 사용자 정보로 모달 필드 채우기
        document.getElementById('profileAvatar').textContent = this.user.avatar;
        document.getElementById('profileName').textContent = this.user.name;
        document.getElementById('profileUsername').textContent = this.user.username;
        document.getElementById('profileDisplayName').value = this.user.name;
        document.getElementById('profileUsernameInput').value = this.user.username.replace('@', '');
        document.getElementById('profileEmail').value = this.user.email || '';
        
        const modal = document.getElementById('profileModal');
        modal.classList.remove('hidden');
        console.log('개인정보 모달 열림:', modal.classList.contains('hidden'));
        
        // 버튼이 보이는지 확인
        const saveBtn = document.getElementById('saveProfile');
        const cancelBtn = document.getElementById('cancelProfile');
        console.log('저장 버튼:', saveBtn);
        console.log('취소 버튼:', cancelBtn);
    }

    hideProfileModal() {
        document.getElementById('profileModal').classList.add('hidden');
    }

    async saveProfile() {
        if (!this.user) return;
        
        const displayName = document.getElementById('profileDisplayName').value.trim();
        const username = document.getElementById('profileUsernameInput').value.trim();
        const email = document.getElementById('profileEmail').value.trim();
        
        if (!displayName || !username) {
            this.showNotification('표시 이름과 사용자명은 필수입니다.', 'error');
            return;
        }
        
        // 사용자 정보 업데이트
        this.user.name = displayName;
        this.user.username = `@${username}`;
        this.user.email = email;
        
        // 로컬 스토리지에 저장
        this.saveUserToStorage();
        
        // UI 업데이트
        this.updateUserInterface();
        
        this.hideProfileModal();
        this.showNotification('개인정보가 저장되었습니다.');
    }

    handleLogin(provider) {
        // 실제 구현에서는 OAuth 인증을 사용해야 합니다
        this.user = {
            name: '제주도민',
            username: '@jejuuser',
            userId: 'jejuuser', // userId 추가
            avatar: '👤',
            email: 'user@jeju.com',
            provider: provider
        };
        
        this.saveUserToStorage();
        this.updateUserInterface();
        this.hideLoginModal();
        
        // 환영 메시지
        this.showNotification('JeJu SNS에 오신 것을 환영합니다! 🍊');
    }

    handleLogout() {
        this.user = null;
        this.apiKey = '';
        this.saveUserToStorage();
        this.updateUserInterface();
        this.showNotification('로그아웃되었습니다.');
    }

    updateUserInterface() {
        const userSection = document.getElementById('userSection');
        const postForm = document.getElementById('postForm');

        if (this.user) {
            userSection.innerHTML = `
                <div class="flex items-center space-x-4">
                    <button
                        onclick="jejuSNS.showApiModal()"
                        class="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                        <i data-lucide="key" class="w-4 h-4"></i>
                        <span>API</span>
                    </button>
                    <div class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-full px-2 py-1 transition-colors" onclick="jejuSNS.showProfileModal()">
                        <span class="text-lg">${this.user.avatar}</span>
                    </div>
                    <button
                        onclick="jejuSNS.handleLogout()"
                        class="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <i data-lucide="log-out" class="w-4 h-4"></i>
                        <span>로그아웃</span>
                    </button>
                </div>
            `;
            postForm.classList.remove('hidden');
        } else {
            userSection.innerHTML = `
                <button
                    id="loginBtn"
                    class="bg-orange-600 text-white text-sm px-4 py-2 rounded-full hover:bg-orange-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                    로그인
                </button>
            `;
            postForm.classList.add('hidden');
            // 로그인 버튼 이벤트 다시 연결 (여기서만!)
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    this.showLoginModal();
                });
            }
        }
        lucide.createIcons();
    }

    async generateApiKey() {
        try {
            const userId = this.user ? this.user.username.replace('@','') : 'guest';
            const userName = this.user ? this.user.name : '게스트';
            const res = await fetch(`${this.apiUrl}/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, userName })
            });
            if (!res.ok) throw new Error('API 오류: ' + res.status);
            const data = await res.json();
            this.apiKey = data.key;
            document.getElementById('apiKeyInput').value = data.key;
            document.getElementById('apiExample').textContent = `GET /api/posts?key=${data.key}`;
            localStorage.setItem('jejuApiKey', data.key);
            this.showNotification('API 키가 생성되었습니다!');
        } catch (e) {
            this.showNotification('API 키 생성 실패: ' + e.message);
        }
    }

    selectCategory(category) {
        this.selectedCategory = category;
        
        // 모든 카테고리 버튼에서 active 클래스 제거
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-orange-100', 'text-orange-600', 'border-orange-300');
            btn.classList.add('hover:bg-gray-100', 'border-transparent');
        });
        
        // 선택된 버튼에 active 클래스 추가
        const selectedBtn = document.querySelector(`[data-category="${category}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active', 'bg-orange-100', 'text-orange-600', 'border-orange-300');
            selectedBtn.classList.remove('hover:bg-gray-100', 'border-transparent');
        }
        
        this.renderPosts();
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        // 폭넓은 확장자/타입 허용 (스마트폰 촬영 이미지 포함)
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
            'image/heic', 'image/heif', 'image/jpg', 'image/x-icon', 'image/svg+xml'
        ];
        const allowedExt = [
            '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic', '.heif', '.ico', '.svg'
        ];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowedTypes.includes(file.type) && !allowedExt.includes(fileExt)) {
            this.showNotification('이미지 파일(jpg, jpeg, png, gif, webp, bmp, heic, heif, ico, svg)만 업로드할 수 있습니다.','error');
            event.target.value = '';
            this.removeImage();
            return;
        }
        // 10MB 제한
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('이미지 용량은 10MB 이하만 가능합니다.','error');
            event.target.value = '';
            this.removeImage();
            return;
        }
        // 업로드 진행 표시
        const preview = document.getElementById('imagePreview');
        preview.classList.remove('hidden');
        preview.innerHTML = '<div class="flex items-center justify-center h-32 text-orange-500">이미지 미리보기를 준비 중...</div>';
        const reader = new FileReader();
        reader.onloadstart = () => {
            preview.innerHTML = '<div class="flex items-center justify-center h-32 text-orange-500 animate-pulse">이미지 미리보기를 준비 중...</div>';
        };
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                preview.innerHTML = `<div class='flex flex-col items-center justify-center h-32 text-orange-500'><span>업로드 준비 중... ${percent}%</span><div class='w-32 bg-gray-200 rounded-full h-2 mt-2'><div class='bg-orange-400 h-2 rounded-full' style='width:${percent}%;'></div></div></div>`;
            }
        };
        reader.onload = (e) => {
            preview.innerHTML = `<img id="previewImg" src="${e.target.result}" alt="업로드된 이미지" class="max-w-full h-auto rounded-lg border max-h-60">` +
                `<button id="removeImage" class="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"><i data-lucide="x" class="w-4 h-4"></i></button>`;
            document.getElementById('removeImage').addEventListener('click', () => {
                this.removeImage();
            });
        };
        reader.onerror = () => {
            this.showNotification('이미지 미리보기 실패','error');
            this.removeImage();
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        const preview = document.getElementById('imagePreview');
        preview.classList.add('hidden');
        preview.innerHTML = '';
        document.getElementById('imageUpload').value = '';
    }

    async submitPost() {
        const content = document.getElementById('postContent').value.trim();
        const category = document.getElementById('postCategory').value;
        const imagePreview = document.getElementById('imagePreview');
        const image = imagePreview.classList.contains('hidden') ? null : document.getElementById('previewImg').src;
        if (!content) {
            this.showNotification('내용을 입력하세요.', 'error');
            return;
        }
        if (content.length > 1000) {
            this.showNotification('내용은 1000자 이내로 입력하세요.', 'error');
            return;
        }
        if (!category) {
            this.showNotification('카테고리를 선택하세요.', 'error');
            return;
        }
        if (!this.apiKey) {
            this.showNotification('API 키가 필요합니다.', 'error');
            return;
        }
        try {
            const res = await fetch(`${this.apiUrl}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify({
                    content,
                    category,
                    image
                })
            });
            if (!res.ok) throw new Error('API 오류: ' + res.status);
            await this.fetchPosts(true); // 작성 후 자동 스크롤
            document.getElementById('postContent').value = '';
            this.removeImage();
            this.showNotification('게시글이 작성되었습니다!', 'success');
        } catch (e) {
            this.showNotification('게시글 작성 실패: ' + e.message, 'error');
        }
    }

    handleLinkClick(content) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex);
        if (urls) {
            window.open(urls[0], '_blank');
        }
    }

    updateCategoryButtons() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            const cat = btn.dataset.category;
            if (this.selectedCategories.has(cat)) {
                btn.classList.add('active', 'bg-orange-100', 'text-orange-600', 'border-orange-300');
                btn.classList.remove('hover:bg-gray-100', 'border-transparent');
            } else {
                btn.classList.remove('active', 'bg-orange-100', 'text-orange-600', 'border-orange-300');
                btn.classList.add('hover:bg-gray-100', 'border-transparent');
            }
        });
    }

    async renderPosts() {
        const feed = document.getElementById('feed');
        if (this.isLoading) {
            feed.innerHTML = '<div class="p-6 text-center text-gray-500"><span class="loading-spinner inline-block"></span> 불러오는 중...</div>';
            return;
        }
        // 새로고침 버튼 추가
        feed.innerHTML = `<div class='flex justify-end p-2'><button id='refreshFeedBtn' class='text-gray-400 hover:text-gray-600 px-2 py-1 text-xs rounded transition-colors flex items-center gap-1'><span>🔄</span> 새로고침</button></div>`;
        // 고급 검색 UI 추가
        feed.innerHTML += `<div class='flex flex-wrap gap-2 items-center p-2 mb-2'>
            <span class='text-xs text-gray-500'>카테고리 다중 선택 가능</span>
            <input id='advancedSearchInput' type='text' placeholder='키워드로 추가 검색...' class='border px-2 py-1 rounded text-sm ml-2' style='min-width:160px;'/>
        </div>`;
        // 필터링된 게시글 가져오기
        const keyword = (document.getElementById('advancedSearchInput')?.value || '').toLowerCase();
        const filteredPosts = this.posts.filter(post => {
            const matchesCategory = this.selectedCategories.has('all') || this.selectedCategories.has(post.category);
            const matchesSearch = (this.searchQuery === '' || post.content.toLowerCase().includes(this.searchQuery.toLowerCase()) || post.author.toLowerCase().includes(this.searchQuery.toLowerCase()));
            const matchesAdvanced = !keyword || post.content.toLowerCase().includes(keyword) || post.author.toLowerCase().includes(keyword);
            return matchesCategory && matchesSearch && matchesAdvanced;
        });

        if (filteredPosts.length === 0) {
            feed.innerHTML += `
                <div class="p-6 text-center text-gray-500">
                    <i data-lucide="map-pin" class="w-10 h-10 mx-auto mb-3 text-gray-300"></i>
                    <p class="text-base">아직 게시글이 없습니다.</p>
                    <p class="text-xs mt-1">첫 번째 JeJu 정보를 공유해보세요!<br>🍊 JeJu에서만 볼 수 있는 꿀팁, 소식, 일자리, 부동산, 행사 등 무엇이든 환영합니다.</p>
                </div>
            `;
        } else {
            feed.innerHTML += filteredPosts.map(post => this.renderPost(post)).join('');
        }
        // 새로고침 버튼 이벤트 연결
        const refreshBtn = document.getElementById('refreshFeedBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.fetchPosts(true));
        }
        // 고급 검색 입력 이벤트 연결
        const advInput = document.getElementById('advancedSearchInput');
        if (advInput) {
            advInput.addEventListener('input', () => this.renderPosts());
        }
        lucide.createIcons();
        // 댓글/좋아요 버튼 이벤트 연결
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = btn.dataset.postId;
                await this.toggleLike(postId, btn);
            });
        });
        document.querySelectorAll('.comment-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = btn.dataset.postId;
                const commentBox = document.getElementById(`commentBox-${postId}`);
                if (commentBox) {
                    commentBox.classList.toggle('hidden');
                }
            });
        });
        document.querySelectorAll('.comment-submit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = btn.dataset.postId;
                const input = document.getElementById(`commentInput-${postId}`);
                const comment = input.value.trim();
                if (!comment) return;
                await this.submitComment(postId, comment);
                input.value = '';
            });
        });
        document.querySelectorAll('.comment-delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = btn.dataset.postId;
                const commentId = btn.dataset.commentId;
                if (confirm('댓글을 삭제하시겠습니까?')) {
                    await this.deleteComment(postId, commentId);
                }
            });
        });
    }

    renderPost(post) {
        const category = this.categories.find(cat => cat.id === post.category);
        const categoryDisplay = category ? `${category.icon} ${category.name}` : '';
        
        const contentWithLinks = post.hasLink ? 
            post.content.replace(/(https?:\/\/[^\s]+)/g, '<span class="link-text" onclick="jejuSNS.handleLinkClick(\'' + post.content + '\')">$1</span>') :
            post.content;

        // 댓글 목록 렌더링 (삭제 버튼 포함)
        const commentsHtml = (post.comments && post.comments.length > 0) ?
            `<div class='mt-2 bg-gray-50 rounded p-2 text-xs'>${post.comments.map(c => `<div class='mb-1 flex items-center justify-between'><span><b>${c.author}</b>: ${c.content}</span>${(this.user && (this.user.userId === c.userId || this.user.userId === 'admin')) ? `<button class='comment-delete-btn text-red-400 ml-2' data-post-id='${post.id}' data-comment-id='${c.id}'>삭제</button>` : ''}</div>`).join('')}</div>` : '';
        // 댓글 입력창
        const commentInputHtml = `<div class='flex mt-2 gap-2'><input id='commentInput-${post.id}' type='text' placeholder='댓글을 입력하세요' class='flex-1 border rounded px-2 py-1 text-xs'/><button class='comment-submit-btn text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded' data-post-id='${post.id}'>등록</button></div>`;
        // 좋아요 버튼
        const liked = post.likedUsers && this.user && post.likedUsers.includes(this.user.userId);
        // 댓글 토글 박스
        const commentBoxHtml = `<div id='commentBox-${post.id}' class='hidden'>${commentsHtml}${commentInputHtml}</div>`;
        return `
            <div class="post-card bg-white border-b border-gray-200 p-3 hover:bg-gray-50 transition-colors fade-in" style="animation: fadeIn 0.5s;">
                <div class="flex space-x-2">
                    <div class="text-lg">${post.avatar}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-1 mb-1">
                            <span class="text-sm font-bold text-gray-900">${post.author}</span>
                            <span class="text-xs text-gray-500">${post.username}</span>
                            <span class="text-xs text-gray-500">·</span>
                            <span class="text-xs text-gray-500">${post.timestamp}</span>
                            <span class="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                ${categoryDisplay}
                            </span>
                        </div>
                        
                        <div class="text-sm text-gray-900 mb-2">
                            ${contentWithLinks}
                        </div>

                        ${post.image ? `
                            <div class="mb-2">
                                <img 
                                    src="${post.image}" 
                                    alt="게시글 이미지" 
                                    class="max-w-full h-auto rounded-lg border max-h-48"
                                >
                            </div>
                        ` : ''}

                        <div class="flex items-center space-x-6 text-gray-500 text-sm">
                            <button class="like-btn flex items-center space-x-1 hover:text-red-600 transition-colors ${liked ? 'text-red-600' : ''}" data-post-id="${post.id}">
                                <i data-lucide="heart" class="w-4 h-4"></i>
                                <span class="text-xs">${post.likes || 0}</span>
                            </button>
                            <button class="comment-toggle-btn flex items-center space-x-1 hover:text-blue-600 transition-colors" data-post-id="${post.id}">
                                <i data-lucide="message-circle" class="w-4 h-4"></i>
                                <span class="text-xs">댓글</span>
                            </button>
                        </div>
                        ${commentBoxHtml}
                    </div>
                </div>
            </div>
        `;
    }

    async toggleLike(postId, btn) {
        if (!this.apiKey) {
            this.showNotification('API 키가 필요합니다.', 'error');
            return;
        }
        try {
            const res = await fetch(`${this.apiUrl}/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey }
            });
            if (!res.ok) throw new Error('API 오류: ' + res.status);
            await this.fetchPosts();
        } catch (e) {
            this.showNotification('좋아요 처리 실패: ' + e.message, 'error');
        }
    }

    async submitComment(postId, comment) {
        if (!this.apiKey) {
            this.showNotification('API 키가 필요합니다.', 'error');
            return;
        }
        try {
            const res = await fetch(`${this.apiUrl}/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
                body: JSON.stringify({ comment })
            });
            if (!res.ok) throw new Error('API 오류: ' + res.status);
            await this.fetchPosts();
        } catch (e) {
            this.showNotification('댓글 작성 실패: ' + e.message, 'error');
        }
    }

    async deleteComment(postId, commentId) {
        if (!this.apiKey) {
            this.showNotification('API 키가 필요합니다.', 'error');
            return;
        }
        try {
            const res = await fetch(`${this.apiUrl}/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey }
            });
            if (!res.ok) throw new Error('API 오류: ' + res.status);
            await this.fetchPosts();
        } catch (e) {
            this.showNotification('댓글 삭제 실패: ' + e.message, 'error');
        }
    }

    showNotification(message, type = 'success') {
        // 간단한 알림 표시
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 fade-in ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    goToHome() {
        // 모든 카테고리 선택 해제하고 '전체'로 설정
        this.selectedCategories = new Set(['all']);
        this.searchQuery = '';
        
        // 검색 입력창 초기화
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 고급 검색 입력창 초기화
        const advancedSearchInput = document.getElementById('advancedSearchInput');
        if (advancedSearchInput) {
            advancedSearchInput.value = '';
        }
        
        // 카테고리 버튼 상태 업데이트
        this.updateCategoryButtons();
        
        // 게시글 다시 렌더링
        this.renderPosts();
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // 홈으로 이동 알림
        this.showNotification('홈으로 이동했습니다 🏠');
    }
}

// 앱 초기화
let jejuSNS;
document.addEventListener('DOMContentLoaded', () => {
    jejuSNS = new JejuSNS();
}); 
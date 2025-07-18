// 제주 SNS 앱 메인 스크립트
class JejuSNS {
    constructor() {
        this.user = null;
        this.apiKey = '';
        this.posts = [];
        this.users = [];
        this.comments = [];
        this.likes = [];
        this.isLoading = false;
        
        // Railway 백엔드 URL
        this.apiBaseUrl = 'https://web-production-1d58.up.railway.app';
        
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

        this.selectedCategories = new Set(['all']); // 다중 선택 지원
        this.init();
    }

    async init() {
        this.loadDataFromStorage();
        this.setupEventListeners();
        
        // Railway 백엔드에서 데이터 로드 시도
        try {
            await this.loadDataFromAPI();
        } catch (error) {
            console.log('API 연결 실패, localStorage 사용:', error);
            // API 연결 실패시 localStorage 사용
            if (this.posts.length === 0) {
                this.createSampleData();
            }
        }
        
        this.renderPosts();
        this.updateUserInterface();
        
        // 디버그: 필수 요소들이 존재하는지 확인
        this.debugElements();
    }

    debugElements() {
        const requiredElements = [
            'postsContainer',
            'loginBtn',
            'userInfo',
            'searchInput',
            'postContent',
            'submitPost',
            'loginModal',
            'emailLoginModal',
            'emailRegisterModal',
            'profileModal'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.warn('Missing elements:', missingElements);
        } else {
            console.log('All required elements found');
        }
    }

    // localStorage에서 데이터 로드
    loadDataFromStorage() {
        try {
            this.user = JSON.parse(localStorage.getItem('jejuUser')) || null;
            this.apiKey = localStorage.getItem('jejuApiKey') || '';
            this.posts = JSON.parse(localStorage.getItem('jejuPosts')) || [];
            this.users = JSON.parse(localStorage.getItem('jejuUsers')) || [];
            this.comments = JSON.parse(localStorage.getItem('jejuComments')) || [];
            this.likes = JSON.parse(localStorage.getItem('jejuLikes')) || [];
        } catch (error) {
            console.error('데이터 로드 실패:', error);
        }
    }

    // localStorage에 데이터 저장
    saveDataToStorage() {
        try {
            localStorage.setItem('jejuUser', JSON.stringify(this.user));
            localStorage.setItem('jejuApiKey', this.apiKey);
            localStorage.setItem('jejuPosts', JSON.stringify(this.posts));
            localStorage.setItem('jejuUsers', JSON.stringify(this.users));
            localStorage.setItem('jejuComments', JSON.stringify(this.comments));
            localStorage.setItem('jejuLikes', JSON.stringify(this.likes));
        } catch (error) {
            console.error('데이터 저장 실패:', error);
        }
    }

    // API 호출 헬퍼 메서드
    async apiCall(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // 사용자 ID 헤더 추가 (서버 인증용)
        if (this.user && this.user.id) {
            headers['user-id'] = this.user.id;
        }

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API 호출 실패:', error);
            throw error;
        }
    }

    // API에서 데이터 로드
    async loadDataFromAPI() {
        try {
            // 게시글 로드
            const postsResponse = await this.apiCall('/api/posts');
            this.posts = postsResponse.posts || [];

            // 사용자 로드
            const usersResponse = await this.apiCall('/api/users');
            this.users = usersResponse.users || [];

            // 댓글 로드
            const commentsResponse = await this.apiCall('/api/comments');
            this.comments = commentsResponse.comments || [];

            // 좋아요 로드
            const likesResponse = await this.apiCall('/api/likes');
            this.likes = likesResponse.likes || [];

            console.log('API에서 데이터 로드 완료');
        } catch (error) {
            console.error('API 데이터 로드 실패:', error);
            throw error;
        }
    }

    // 샘플 데이터 생성
    createSampleData() {
        // 기본 관리자 사용자
        const adminUser = {
            id: 1,
            email: 'admin@jeju.sns',
            password: 'admin123',
            displayName: 'JeJu 관리자',
            username: '@jejuadmin',
            apiKey: 'jeju_admin_2024',
            isAdmin: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // 샘플 게시글
        const samplePosts = [
            {
                id: 1,
                author: '제주시민',
                username: '@jejucitizen',
                avatar: '👤',
                content: '제주시청에서 청년 창업 지원금 신청 받고 있어요! 최대 500만원까지 지원합니다.',
                category: 'policy',
                timestamp: '2시간 전',
                likes: 24,
                comments: 8,
                retweets: 12,
                hasLink: true,
                image: null,
                userId: 1
            },
            {
                id: 2,
                author: '제주부동산',
                username: '@jejurealty',
                avatar: '🏠',
                content: '서귀포시 중문동 투룸 전세 매물 나왔습니다. 보증금 8천만원, 바다 전망 좋은 곳이에요.',
                category: 'realestate',
                timestamp: '4시간 전',
                likes: 15,
                comments: 23,
                retweets: 6,
                hasLink: false,
                image: null,
                userId: 2
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
                image: null,
                userId: 3
            }
        ];

        this.users = [adminUser];
        this.posts = samplePosts;
        this.saveDataToStorage();
    }

    setupEventListeners() {
        // 로그인 모달 닫기
        const closeLoginModal = document.getElementById('closeLoginModal');
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => {
                this.hideLoginModal();
            });
        }

        // 로그인 옵션들
        const emailLogin = document.getElementById('emailLogin');
        const googleLogin = document.getElementById('googleLogin');
        const naverLogin = document.getElementById('naverLogin');
        const kakaoLogin = document.getElementById('kakaoLogin');

        if (emailLogin) emailLogin.addEventListener('click', () => this.handleLogin('email'));
        if (googleLogin) googleLogin.addEventListener('click', () => this.handleLogin('google'));
        if (naverLogin) naverLogin.addEventListener('click', () => this.handleLogin('naver'));
        if (kakaoLogin) kakaoLogin.addEventListener('click', () => this.handleLogin('kakao'));

        // API 모달 관련
        const closeApiModal = document.getElementById('closeApiModal');
        const generateApiKey = document.getElementById('generateApiKey');
        
        if (closeApiModal) {
            closeApiModal.addEventListener('click', () => {
                this.hideApiModal();
            });
        }

        if (generateApiKey) {
            generateApiKey.addEventListener('click', () => {
                this.generateApiKey();
            });
        }

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
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderPosts();
            });
        }

        // 게시글 작성
        const submitPost = document.getElementById('submitPost');
        if (submitPost) {
            submitPost.addEventListener('click', () => {
                this.submitPost();
            });
        }

        // 이미지 업로드
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }

        // 이미지 제거
        const removeImage = document.getElementById('removeImage');
        if (removeImage) {
            removeImage.addEventListener('click', () => {
                this.removeImage();
            });
        }

        // 모달 외부 클릭 시 닫기
        const loginModal = document.getElementById('loginModal');
        const apiModal = document.getElementById('apiModal');
        const profileModal = document.getElementById('profileModal');

        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target.id === 'loginModal') {
                    this.hideLoginModal();
                }
            });
        }

        if (apiModal) {
            apiModal.addEventListener('click', (e) => {
                if (e.target.id === 'apiModal') {
                    this.hideApiModal();
                }
            });
        }

        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target.id === 'profileModal') {
                    this.hideProfileModal();
                }
            });
        }

        // 이메일 로그인 폼 제출
        const emailLoginForm = document.getElementById('emailLoginForm');
        if (emailLoginForm) {
            emailLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.processEmailLogin();
            });
        }

        // 이메일 회원가입 폼 제출
        const emailRegisterForm = document.getElementById('emailRegisterForm');
        if (emailRegisterForm) {
            emailRegisterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.processEmailRegister();
            });
        }

        // 프로필 모달 버튼들
        const saveProfileBtn = document.getElementById('saveProfile');
        const cancelProfileBtn = document.getElementById('cancelProfile');
        const closeProfileModal = document.getElementById('closeProfileModal');

        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }

        if (cancelProfileBtn) {
            cancelProfileBtn.addEventListener('click', () => {
                this.hideProfileModal();
            });
        }

        if (closeProfileModal) {
            closeProfileModal.addEventListener('click', () => {
                this.hideProfileModal();
            });
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) modal.style.display = 'flex';
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) modal.style.display = 'none';
    }

    showApiModal() {
        const modal = document.getElementById('apiModal');
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.value = this.apiKey;
        }
        if (modal) modal.style.display = 'flex';
    }

    hideApiModal() {
        const modal = document.getElementById('apiModal');
        if (modal) modal.style.display = 'none';
    }

    showProfileModal() {
        const modal = document.getElementById('profileModal');
        if (this.user && modal) {
            const displayName = document.getElementById('profileDisplayName');
            const username = document.getElementById('profileUsername');
            const email = document.getElementById('profileEmail');
            
            if (displayName) displayName.value = this.user.displayName || '';
            if (username) username.value = this.user.username || '';
            if (email) email.value = this.user.email || '';
        }
        if (modal) modal.style.display = 'flex';
    }

    hideProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) modal.style.display = 'none';
    }

    async saveProfile() {
        const displayNameInput = document.getElementById('profileDisplayName');
        const usernameInput = document.getElementById('profileUsername');
        const emailInput = document.getElementById('profileEmail');
        
        if (!displayNameInput || !usernameInput || !emailInput) {
            console.error('프로필 요소를 찾을 수 없습니다.');
            return;
        }
        
        const displayName = displayNameInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();

        if (!displayName || !username || !email) {
            this.showNotification('모든 필드를 입력해주세요.', 'error');
            return;
        }

        if (this.user) {
            this.user.displayName = displayName;
            this.user.username = username;
            this.user.email = email;
            this.saveDataToStorage();
            this.updateUserInterface();
            this.hideProfileModal();
            this.showNotification('프로필이 업데이트되었습니다.');
        }
    }

    async handleLogin(provider) {
        if (provider === 'email') {
            this.showEmailLoginModal();
        } else {
            this.showNotification(`${provider} 로그인은 준비 중입니다.`, 'info');
        }
    }

    showEmailLoginModal() {
        const modal = document.getElementById('emailLoginModal');
        const form = document.getElementById('emailLoginForm');
        const error = document.getElementById('emailLoginError');
        
        if (modal) modal.style.display = 'flex';
        if (form) form.reset();
        if (error) error.textContent = '';
    }

    hideEmailLoginModal() {
        const modal = document.getElementById('emailLoginModal');
        if (modal) modal.style.display = 'none';
    }

    async processEmailLogin() {
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const errorElement = document.getElementById('emailLoginError');
        
        if (!emailInput || !passwordInput || !errorElement) {
            console.error('이메일 로그인 요소를 찾을 수 없습니다.');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            errorElement.textContent = '이메일과 비밀번호를 입력해주세요.';
            return;
        }

        // 사용자 찾기
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            errorElement.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.';
            return;
        }

        // 로그인 성공
        this.user = user;
        user.lastLogin = new Date().toISOString();
        this.saveDataToStorage();
        
        this.hideEmailLoginModal();
        this.updateUserInterface();
        this.showNotification('로그인되었습니다.');
    }

    showEmailRegisterModal() {
        const modal = document.getElementById('emailRegisterModal');
        const form = document.getElementById('emailRegisterForm');
        const error = document.getElementById('emailRegisterError');
        
        if (modal) modal.style.display = 'flex';
        if (form) form.reset();
        if (error) error.textContent = '';
    }

    hideEmailRegisterModal() {
        const modal = document.getElementById('emailRegisterModal');
        if (modal) modal.style.display = 'none';
    }

    async processEmailRegister() {
        const nameInput = document.getElementById('registerName');
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');
        const errorElement = document.getElementById('emailRegisterError');
        
        if (!nameInput || !emailInput || !passwordInput || !errorElement) {
            console.error('회원가입 요소를 찾을 수 없습니다.');
            return;
        }
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!name || !email || !password) {
            errorElement.textContent = '이름, 이메일, 비밀번호를 모두 입력해주세요.';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorElement.textContent = '올바른 이메일 형식을 입력해주세요.';
            return;
        }

        if (password.length < 6) {
            errorElement.textContent = '비밀번호는 6자 이상이어야 합니다.';
            return;
        }

        if (this.users.find(u => u.email === email)) {
            errorElement.textContent = '이미 가입된 이메일입니다.';
            return;
        }

        // 새 사용자 생성
        const newUser = {
            id: Date.now(),
            email,
            password,
            displayName: name,
            username: `@${name}`,
            apiKey: `jeju_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isAdmin: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        this.users.push(newUser);
        this.user = newUser;
        this.saveDataToStorage();

        this.hideEmailRegisterModal();
        this.updateUserInterface();
        this.showNotification('회원가입이 완료되었습니다.');
    }

    handleLogout() {
        this.user = null;
        this.apiKey = '';
        localStorage.removeItem('jejuUser');
        localStorage.removeItem('jejuApiKey');
        this.updateUserInterface();
        this.showNotification('로그아웃되었습니다.');
    }

    updateUserInterface() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const apiBtn = document.getElementById('apiBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const postForm = document.getElementById('postForm');

        if (!loginBtn || !userInfo || !logoutBtn) {
            console.error('사용자 인터페이스 요소를 찾을 수 없습니다.');
            return;
        }

        if (this.user) {
            // 로그인된 상태 - 홈 화면 + 게시글 작성 기능
            loginBtn.style.display = 'none';
            userInfo.style.display = 'flex';
            
            // 게시글 작성 폼 표시 (로그인한 사용자만)
            if (postForm) {
                postForm.classList.remove('hidden');
            }
            
            const userDisplayName = document.getElementById('userDisplayName');
            const userAvatar = document.getElementById('userAvatar');
            const userAvatarInForm = document.getElementById('userAvatarInForm');
            
            if (userDisplayName) userDisplayName.textContent = this.user.displayName;
            if (userAvatar) userAvatar.textContent = this.user.avatar || '👤';
            if (userAvatarInForm) userAvatarInForm.textContent = this.user.avatar || '👤';
        } else {
            // 로그인되지 않은 상태 - 홈 화면만 (게시글 목록 중심)
            loginBtn.style.display = 'inline-block';
            userInfo.style.display = 'none';
            
            // 게시글 작성 폼 숨김 (로그인 필요)
            if (postForm) {
                postForm.classList.add('hidden');
            }
        }

        // 버튼 이벤트 연결
        if (loginBtn) loginBtn.onclick = () => this.showLoginModal();
        if (logoutBtn) logoutBtn.onclick = () => this.handleLogout();
        if (apiBtn) apiBtn.onclick = () => this.showApiModal();
    }

    async generateApiKey() {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'error');
            return;
        }

        const newApiKey = `jeju_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.apiKey = newApiKey;
        this.user.apiKey = newApiKey;
        this.saveDataToStorage();
        
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) apiKeyInput.value = newApiKey;
        this.showNotification('새로운 API 키가 생성되었습니다.');
    }

    selectCategory(category) {
        if (category === 'all') {
            this.selectedCategories = new Set(['all']);
        } else {
            if (this.selectedCategories.has('all')) this.selectedCategories.delete('all');
            if (this.selectedCategories.has(category)) {
                this.selectedCategories.delete(category);
                if (this.selectedCategories.size === 0) this.selectedCategories.add('all');
            } else {
                this.selectedCategories.add(category);
            }
        }
        this.updateCategoryButtons();
        this.renderPosts();
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 파일 크기 체크 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('파일 크기는 10MB 이하여야 합니다.', 'error');
            return;
        }

        // 파일 타입 체크
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.selectedImage = e.target.result;
            const imagePreview = document.getElementById('imagePreview');
            const removeImage = document.getElementById('removeImage');
            
            if (imagePreview) {
                imagePreview.style.display = 'block';
                imagePreview.src = this.selectedImage;
            }
            if (removeImage) {
                removeImage.style.display = 'inline-block';
            }
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.selectedImage = null;
        const imagePreview = document.getElementById('imagePreview');
        const removeImage = document.getElementById('removeImage');
        const imageUpload = document.getElementById('imageUpload');
        
        if (imagePreview) imagePreview.style.display = 'none';
        if (removeImage) removeImage.style.display = 'none';
        if (imageUpload) imageUpload.value = '';
    }

    async submitPost() {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'error');
            return;
        }

        const postContent = document.getElementById('postContent');
        const postCategory = document.getElementById('postCategory');
        
        if (!postContent || !postCategory) {
            console.error('게시글 작성 요소를 찾을 수 없습니다.');
            return;
        }
        
        const content = postContent.value.trim();
        const category = postCategory.value;

        if (!content) {
            this.showNotification('게시글 내용을 입력해주세요.', 'error');
            return;
        }

        if (content.length > 1000) {
            this.showNotification('게시글은 1000자 이내로 작성해주세요.', 'error');
            return;
        }

        try {
            const postData = {
                content,
                category,
                image: this.selectedImage || null,
                author: this.user.displayName,
                username: this.user.username,
                avatar: '👤',
                userId: this.user.id
            };

            // API 호출 시도
            try {
                const response = await this.apiCall('/api/posts', {
                    method: 'POST',
                    body: JSON.stringify(postData)
                });

                if (response.success) {
                    this.posts.unshift(response.post);
                    this.saveDataToStorage();
                    this.renderPosts();
                    this.showNotification('게시글이 등록되었습니다!');
                    
                    // 폼 초기화
                    postContent.value = '';
                    postCategory.value = 'all';
                    this.removeImage();
                }
            } catch (apiError) {
                console.log('API 호출 실패, localStorage 사용:', apiError);
                // API 실패시 localStorage 사용
                this.createLocalPost(content, category);
            }
        } catch (error) {
            console.error('게시글 생성 실패:', error);
            this.showNotification('게시글 등록에 실패했습니다.', 'error');
        }
    }

    createLocalPost(content, category) {
        const newPost = {
            id: Date.now(),
            author: this.user.displayName,
            username: this.user.username,
            avatar: '👤',
            content,
            category,
            timestamp: '방금 전',
            likes: 0,
            comments: 0,
            retweets: 0,
            hasLink: content.includes('http://') || content.includes('https://'),
            image: this.selectedImage || null,
            userId: this.user.id
        };

        this.posts.unshift(newPost);
        this.saveDataToStorage();
        this.renderPosts();
        this.showNotification('게시글이 작성되었습니다.');
        
        // 폼 초기화
        const postContent = document.getElementById('postContent');
        const postCategory = document.getElementById('postCategory');
        if (postContent) postContent.value = '';
        if (postCategory) postCategory.value = 'all';
        this.removeImage();
    }

    handleLinkClick(content) {
        const urlMatch = content.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            window.open(urlMatch[0], '_blank');
        }
    }

    updateCategoryButtons() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            const category = btn.dataset.category;
            if (this.selectedCategories.has(category)) {
                btn.classList.add('active');
                btn.classList.remove('hover:bg-gray-100');
                btn.classList.add('bg-orange-100', 'text-orange-600');
            } else {
                btn.classList.remove('active');
                btn.classList.remove('bg-orange-100', 'text-orange-600');
                btn.classList.add('hover:bg-gray-100');
            }
        });
    }

    async renderPosts() {
        const postsContainer = document.getElementById('postsContainer');
        const searchInput = document.getElementById('searchInput');
        
        if (!postsContainer) {
            console.error('postsContainer 요소를 찾을 수 없습니다.');
            return;
        }
        
        const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';

        // 필터링된 게시글
        let filteredPosts = this.posts.filter(post => {
            const matchesCategory = this.selectedCategories.has('all') || this.selectedCategories.has(post.category);
            const matchesSearch = !searchQuery || 
                post.content.toLowerCase().includes(searchQuery) ||
                post.author.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        // 게시글이 없을 때
        if (filteredPosts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <p>게시글이 없습니다.</p>
                    ${!this.user ? '<p>로그인하여 첫 게시글을 작성해보세요!</p>' : ''}
                </div>
            `;
            return;
        }

        // 게시글 렌더링
        try {
            postsContainer.innerHTML = filteredPosts.map(post => this.renderPost(post)).join('');
        } catch (error) {
            console.error('게시글 렌더링 중 오류 발생:', error);
            postsContainer.innerHTML = '<div class="no-posts"><p>게시글을 불러오는 중 오류가 발생했습니다.</p></div>';
        }
    }

    renderPost(post) {
        const isLiked = this.likes.some(like => like.postId === post.id && like.userId === (this.user?.id || 0));
        const postComments = this.comments.filter(comment => comment.postId === post.id);
        
        return `
            <div class="bg-white border-b border-gray-200 p-3 hover:bg-gray-50 transition-colors" data-post-id="${post.id}">
                <div class="flex space-x-2">
                    <div class="text-lg">${post.avatar}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-1 mb-1">
                            <span class="text-sm font-bold text-gray-900">${post.author}</span>
                            <span class="text-xs text-gray-500">${post.username}</span>
                            <span class="text-xs text-gray-500">·</span>
                            <span class="text-xs text-gray-500">${post.timestamp}</span>
                            <span class="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                ${this.categories.find(cat => cat.id === post.category)?.icon || '📝'}
                                ${this.categories.find(cat => cat.id === post.category)?.name || post.category}
                            </span>
                        </div>
                        
                        <div class="text-sm text-gray-900 mb-2">
                            ${post.hasLink ? 
                                `<span class="cursor-pointer hover:text-blue-600" onclick="jejuSNS.handleLinkClick('${post.content}')">${this.formatContent(post.content)}</span>` : 
                                this.formatContent(post.content)
                            }
                        </div>

                        ${post.image ? `
                            <div class="mb-2">
                                <img src="${post.image}" alt="게시글 이미지" class="max-w-full h-auto rounded-lg border max-h-48">
                            </div>
                        ` : ''}

                        <div class="flex items-center space-x-6 text-gray-500 text-sm">
                            <button class="flex items-center space-x-1 hover:text-blue-600 transition-colors" onclick="jejuSNS.toggleComments(${post.id})">
                                <i data-lucide="message-circle" class="w-4 h-4"></i>
                                <span class="text-xs">${postComments.length}</span>
                            </button>
                            <button class="flex items-center space-x-1 hover:text-green-600 transition-colors">
                                <i data-lucide="repeat-2" class="w-4 h-4"></i>
                                <span class="text-xs">${post.retweets}</span>
                            </button>
                            <button class="flex items-center space-x-1 hover:text-red-600 transition-colors ${isLiked ? 'text-red-600' : ''}" onclick="jejuSNS.toggleLike(${post.id}, this)">
                                <i data-lucide="heart" class="w-4 h-4 ${isLiked ? 'fill-current' : ''}"></i>
                                <span class="text-xs">${post.likes}</span>
                            </button>
                            <button class="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                                <i data-lucide="share" class="w-4 h-4"></i>
                            </button>
                            ${this.user && (this.user.id === post.userId || this.user.isAdmin) ? 
                                `<button class="flex items-center space-x-1 hover:text-red-600 transition-colors" onclick="jejuSNS.deletePost(${post.id})">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>` : ''
                            }
                        </div>
                    </div>
                </div>
                
                <div class="comments-section mt-3 border-t border-gray-100 pt-3" id="comments-${post.id}" style="display: none;">
                    <div class="comments-list space-y-2">
                        ${postComments.map(comment => `
                            <div class="comment bg-gray-50 rounded-lg p-2" data-comment-id="${comment.id}">
                                <div class="flex items-center space-x-2 mb-1">
                                    <span class="text-sm">👤</span>
                                    <span class="text-sm font-medium">${comment.author}</span>
                                    <span class="text-xs text-gray-500">${comment.timestamp}</span>
                                    ${this.user && (this.user.id === comment.userId || this.user.isAdmin) ? 
                                        `<button class="text-xs text-red-600 hover:text-red-700" onclick="jejuSNS.deleteComment(${post.id}, ${comment.id})">삭제</button>` : ''
                                    }
                                </div>
                                <div class="text-sm text-gray-700">${comment.content}</div>
                            </div>
                        `).join('')}
                    </div>
                    ${this.user ? `
                        <div class="comment-form mt-3 flex space-x-2">
                            <input type="text" placeholder="댓글을 입력하세요..." id="comment-input-${post.id}" class="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                            <button onclick="jejuSNS.submitComment(${post.id})" class="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">댓글</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatContent(content) {
        // 링크를 클릭 가능하게 만들기
        return content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" onclick="jejuSNS.handleLinkClick(\'$1\')">$1</a>');
    }

    async toggleLike(postId, btn) {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'error');
            return;
        }

        const existingLike = this.likes.find(like => like.postId === postId && like.userId === this.user.id);
        const post = this.posts.find(p => p.id === postId);

        try {
            if (existingLike) {
                // 좋아요 취소 - API 호출 시도
                try {
                    await this.apiCall(`/api/likes/${existingLike.id}`, {
                        method: 'DELETE'
                    });
                } catch (apiError) {
                    console.log('API 호출 실패, localStorage 사용:', apiError);
                }
                
                // localStorage 업데이트
                this.likes = this.likes.filter(like => like.id !== existingLike.id);
                post.likes--;
                btn.classList.remove('liked');
                btn.querySelector('.icon').textContent = '🤍';
            } else {
                // 좋아요 추가 - API 호출 시도
                const likeData = {
                    postId,
                    userId: this.user.id
                };
                
                try {
                    const response = await this.apiCall('/api/likes', {
                        method: 'POST',
                        body: JSON.stringify(likeData)
                    });
                    
                    if (response.success) {
                        this.likes.push(response.like);
                    }
                } catch (apiError) {
                    console.log('API 호출 실패, localStorage 사용:', apiError);
                    // localStorage에 추가
                    const newLike = {
                        id: Date.now(),
                        postId,
                        userId: this.user.id,
                        timestamp: new Date().toISOString()
                    };
                    this.likes.push(newLike);
                }
                
                post.likes++;
                btn.classList.add('liked');
                btn.querySelector('.icon').textContent = '❤️';
            }

            btn.querySelector('.count').textContent = post.likes;
            this.saveDataToStorage();
        } catch (error) {
            console.error('좋아요 처리 실패:', error);
            this.showNotification('좋아요 처리에 실패했습니다.', 'error');
        }
    }

    toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        if (commentsSection.style.display === 'none') {
            commentsSection.style.display = 'block';
        } else {
            commentsSection.style.display = 'none';
        }
    }

    async submitComment(postId) {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'error');
            return;
        }

        const commentInput = document.getElementById(`comment-input-${postId}`);
        const content = commentInput.value.trim();

        if (!content) {
            this.showNotification('댓글 내용을 입력해주세요.', 'error');
            return;
        }

        try {
            const commentData = {
                postId,
                userId: this.user.id,
                author: this.user.displayName,
                content
            };

            // API 호출 시도
            try {
                const response = await this.apiCall('/api/comments', {
                    method: 'POST',
                    body: JSON.stringify(commentData)
                });

                if (response.success) {
                    this.comments.push(response.comment);
                }
            } catch (apiError) {
                console.log('API 호출 실패, localStorage 사용:', apiError);
                // localStorage에 추가
                const newComment = {
                    id: Date.now(),
                    postId,
                    userId: this.user.id,
                    author: this.user.displayName,
                    content,
                    timestamp: '방금 전'
                };
                this.comments.push(newComment);
            }

            const post = this.posts.find(p => p.id === postId);
            if (post) post.comments++;

            this.saveDataToStorage();
            this.renderPosts();
            commentInput.value = '';
            this.showNotification('댓글이 작성되었습니다.');
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            this.showNotification('댓글 작성에 실패했습니다.', 'error');
        }
    }

    async deleteComment(postId, commentId) {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'error');
            return;
        }

        const comment = this.comments.find(c => c.id === commentId);
        if (!comment) return;

        if (comment.userId !== this.user.id && !this.user.isAdmin) {
            this.showNotification('댓글을 삭제할 권한이 없습니다.', 'error');
            return;
        }

        this.comments = this.comments.filter(c => c.id !== commentId);
        const post = this.posts.find(p => p.id === postId);
        if (post) post.comments--;

        this.saveDataToStorage();
        this.renderPosts();
        this.showNotification('댓글이 삭제되었습니다.');
    }

    async deletePost(postId) {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'error');
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        if (post.userId !== this.user.id && !this.user.isAdmin) {
            this.showNotification('게시글을 삭제할 권한이 없습니다.', 'error');
            return;
        }

        this.posts = this.posts.filter(p => p.id !== postId);
        this.comments = this.comments.filter(c => c.postId !== postId);
        this.likes = this.likes.filter(l => l.postId !== postId);

        this.saveDataToStorage();
        this.renderPosts();
        this.showNotification('게시글이 삭제되었습니다.');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    goToHome() {
        window.location.href = '/';
    }
}

// 앱 초기화 - DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // DOM이 완전히 준비될 때까지 대기
    const initApp = () => {
        const jejuSNS = new JejuSNS();
        // 전역 변수로 설정하여 모달에서 접근 가능하게 함
        window.jejuSNS = jejuSNS;
    };
    
    // 약간의 지연을 두어 DOM이 완전히 준비되도록 함
    setTimeout(initApp, 100);
}); 
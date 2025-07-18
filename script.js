// 제주 SNS 앱 메인 스크립트
class JejuSNS {
    constructor() {
        this.user = null;
        this.posts = [];
        this.selectedCategories = new Set(['all']); // 다중 선택 지원
        this.selectedPostCategory = 'news'; // 게시글 작성용 카테고리
        this.selectedImage = null;
        this.apiKey = '';
        this.currentView = 'home'; // 현재 보기: home, search, region, likes, profile
        this.categories = [
            { id: 'all', name: '전체', icon: '🌴' },
            { id: 'jobs', name: '구인구직', icon: '💼' },
            { id: 'realestate', name: '부동산', icon: '🏠' },
            { id: 'events', name: '지역행사', icon: '🎉' },
            { id: 'policy', name: '정책지원', icon: '📋' },
            { id: 'news', name: '지역뉴스', icon: '📰' }
        ];
        
        this.init();
    }

    init() {
        this.loadDataFromStorage();
        this.setupEventListeners();
        this.updateUserInterface();
        this.renderPosts();
        this.loadLucideIcons();
    }

    loadLucideIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    setupEventListeners() {
        // 로그인 버튼
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showLoginModal();
            });
        }

        // 모바일 로그인 버튼
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', () => {
                this.showLoginModal();
            });
        }

        // 로그아웃 버튼
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // API 버튼
        const apiBtn = document.getElementById('apiBtn');
        if (apiBtn) {
            apiBtn.addEventListener('click', () => {
                this.showApiModal();
            });
        }

        // 모달 닫기 버튼들
        const closeLoginModal = document.getElementById('closeLoginModal');
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => {
                this.hideLoginModal();
            });
        }

        const closeApiModal = document.getElementById('closeApiModal');
        if (closeApiModal) {
            closeApiModal.addEventListener('click', () => {
                this.hideApiModal();
            });
        }

        // 로그인 옵션들
        const emailLogin = document.querySelector('.email-login');
        if (emailLogin) {
            emailLogin.addEventListener('click', () => {
                this.handleLogin('email');
            });
        }

        const googleLogin = document.querySelector('.google-login');
        if (googleLogin) {
            googleLogin.addEventListener('click', () => {
                this.handleLogin('google');
            });
        }

        const naverLogin = document.querySelector('.naver-login');
        if (naverLogin) {
            naverLogin.addEventListener('click', () => {
                this.handleLogin('naver');
            });
        }

        const kakaoLogin = document.querySelector('.kakao-login');
        if (kakaoLogin) {
            kakaoLogin.addEventListener('click', () => {
                this.handleLogin('kakao');
            });
        }

        // API 키 생성
        const generateApiKey = document.getElementById('generateApiKey');
        if (generateApiKey) {
            generateApiKey.addEventListener('click', () => {
                this.generateApiKey();
            });
        }

        // 검색
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // 스토리 아이템들 (카테고리)
        const storyItems = document.querySelectorAll('.story-item');
        storyItems.forEach((item, index) => {
            if (index > 0) { // 첫 번째는 "새 글" 버튼이므로 제외
                item.addEventListener('click', () => {
                    const category = this.categories[index - 1].id;
                    this.selectCategory(category);
                });
            }
        });

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

        // 글쓰기 영역
        const postContent = document.getElementById('postContent');
        const submitPost = document.getElementById('submitPost');
        
        if (postContent) {
            postContent.addEventListener('input', (e) => {
                this.adjustTextareaHeight(e.target);
                this.updatePostButton(e.target.value);
            });
            
            // Enter 키로 포스트 (Shift+Enter는 줄바꿈)
            postContent.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!submitPost.disabled) {
                        this.submitPost();
                    }
                }
            });
        }

        if (submitPost) {
            submitPost.addEventListener('click', () => {
                this.submitPost();
            });
        }

        // 외부 클릭 시 모달 닫기
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideLoginModal();
                this.hideApiModal();
            }
        });

        // 네비게이션 아이템들
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(index);
            });
        });

        // 카테고리 선택 드롭다운
        const postCategory = document.getElementById('postCategory');
        if (postCategory) {
            postCategory.addEventListener('change', (e) => {
                this.selectedPostCategory = e.target.value;
            });
        }
    }

    // 네비게이션 처리
    handleNavigation(index) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        navItems[index].classList.add('active');

        const views = ['home', 'search', 'region', 'likes', 'profile'];
        this.currentView = views[index];
        
        // 뷰에 따른 UI 업데이트
        this.updateViewForNavigation();
    }

    // 네비게이션에 따른 뷰 업데이트
    updateViewForNavigation() {
        const searchInput = document.getElementById('searchInput');
        const postForm = document.getElementById('postForm');
        
        switch (this.currentView) {
            case 'home':
                // 홈 뷰: 모든 기능 활성화
                if (searchInput) searchInput.placeholder = "제주 정보 검색...";
                if (postForm) postForm.style.display = 'block';
                this.selectedCategories.clear();
                this.selectedCategories.add('all');
                break;
                
            case 'search':
                // 검색 뷰: 검색에 집중
                if (searchInput) {
                    searchInput.placeholder = "검색어를 입력하세요...";
                    searchInput.focus();
                }
                if (postForm) postForm.style.display = 'none';
                break;
                
            case 'region':
                // 지역 뷰: 지역 관련 카테고리만
                if (searchInput) searchInput.placeholder = "지역 정보 검색...";
                if (postForm) postForm.style.display = 'block';
                this.selectedCategories.clear();
                this.selectedCategories.add('events');
                this.selectedCategories.add('policy');
                break;
                
            case 'likes':
                // 좋아요 뷰: 좋아요한 게시글만
                if (searchInput) searchInput.placeholder = "좋아요한 게시글 검색...";
                if (postForm) postForm.style.display = 'none';
                this.filterLikedPosts();
                break;
                
            case 'profile':
                // 프로필 뷰: 내 게시글만
                if (searchInput) searchInput.placeholder = "내 게시글 검색...";
                if (postForm) postForm.style.display = 'block';
                this.filterMyPosts();
                break;
        }
        
        this.renderPosts();
    }

    // 좋아요한 게시글 필터링
    filterLikedPosts() {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'warning');
            return;
        }
        
        const likedPosts = this.posts.filter(post => 
            post.likedBy && post.likedBy.includes(this.user.id)
        );
        
        this.renderFilteredPosts(likedPosts);
    }

    // 내 게시글 필터링
    filterMyPosts() {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'warning');
            return;
        }
        
        const myPosts = this.posts.filter(post => 
            post.userId === this.user.id
        );
        
        this.renderFilteredPosts(myPosts);
    }

    // 카테고리 선택
    selectCategory(category) {
        this.selectedCategories.clear();
        this.selectedCategories.add(category);
        this.renderPosts();
        
        // 스토리 아이템 활성화 상태 업데이트
        const storyItems = document.querySelectorAll('.story-item');
        storyItems.forEach((item, index) => {
            if (index > 0) {
                const itemCategory = this.categories[index - 1].id;
                if (itemCategory === category) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });
        
        this.showNotification(`${this.getCategoryName(category)} 카테고리를 선택했습니다.`);
    }

    // 카테고리 이름 가져오기
    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : '전체';
    }

    // 검색 처리
    handleSearch(query) {
        if (query.trim() === '') {
            this.renderPosts();
            return;
        }
        
        const filteredPosts = this.posts.filter(post => 
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.category.toLowerCase().includes(query.toLowerCase()) ||
            (post.user && post.user.name && post.user.name.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.renderFilteredPosts(filteredPosts);
    }

    // 필터링된 게시글 렌더링
    renderFilteredPosts(posts) {
        const container = document.getElementById('postsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (posts.length === 0) {
            container.innerHTML = '<div class="no-posts">검색 결과가 없습니다.</div>';
            return;
        }
        
        posts.forEach(post => {
            const postElement = this.renderPost(post);
            container.appendChild(postElement);
        });
    }

    // 이미지 업로드 처리
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.selectedImage = e.target.result;
                this.showImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // 이미지 미리보기 표시
    showImagePreview(imageSrc) {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        if (preview && previewImg) {
            previewImg.src = imageSrc;
            preview.classList.remove('hidden');
        }
    }

    // 이미지 제거
    removeImage() {
        this.selectedImage = null;
        const preview = document.getElementById('imagePreview');
        const imageUpload = document.getElementById('imageUpload');
        
        if (preview) {
            preview.classList.add('hidden');
        }
        
        if (imageUpload) {
            imageUpload.value = '';
        }
    }

    // 텍스트 영역 높이 자동 조정
    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // 게시하기 버튼 상태 업데이트
    updatePostButton(content) {
        const submitPost = document.getElementById('submitPost');
        if (submitPost) {
            const hasContent = content.trim().length > 0;
            submitPost.disabled = !hasContent;
        }
    }

    // 로그인 처리
    handleLogin(provider) {
        const userData = {
            id: Date.now(),
            displayName: '제주도민',
            username: '@jejuuser',
            avatar: '👤',
            email: 'user@jeju.com',
            provider: provider
        };

        this.user = userData;
        localStorage.setItem('jejuUser', JSON.stringify(userData));
        
        this.hideLoginModal();
        this.showNotification(`${provider} 로그인이 완료되었습니다.`);
        this.updateUserInterface();
        this.activatePostForm();
    }

    // 로그아웃 처리
    handleLogout() {
        this.user = null;
        this.apiKey = '';
        localStorage.removeItem('jejuUser');
        localStorage.removeItem('jejuApiKey');
        this.updateUserInterface();
        this.updatePostFormForGuest();
        this.showNotification('로그아웃되었습니다.');
    }

    // API 키 생성
    generateApiKey() {
        const key = 'jeju_' + Math.random().toString(36).substr(2, 16);
        this.apiKey = key;
        localStorage.setItem('jejuApiKey', key);
        
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKeyExample = document.getElementById('apiKeyExample');
        
        if (apiKeyInput) {
            apiKeyInput.value = key;
        }
        
        if (apiKeyExample) {
            apiKeyExample.textContent = key;
        }
        
        this.showNotification('API 키가 생성되었습니다.');
    }

    // 게시글 작성
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
        const category = this.selectedPostCategory || 'news';

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
                userId: this.user.id
            };

            // 서버에 게시글 전송
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                const newPost = await response.json();
                this.createLocalPost(content, category);
            } else {
                // 서버 오류 시 로컬에만 저장
                this.createLocalPost(content, category);
            }
        } catch (error) {
            console.error('게시글 작성 오류:', error);
            // 네트워크 오류 시 로컬에만 저장
            this.createLocalPost(content, category);
        }
    }

    // 로컬 게시글 생성
    createLocalPost(content, category) {
        const hasLink = content.includes('http://') || content.includes('https://');
        const newPost = {
            id: Date.now(),
            author: this.user.displayName,
            username: this.user.username,
            avatar: this.user.avatar,
            content,
            category,
            timestamp: '방금 전',
            likes: 0,
            comments: 0,
            retweets: 0,
            hasLink,
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
        if (postContent) {
            postContent.value = '';
            postContent.style.height = 'auto';
        }
        if (postCategory) {
            postCategory.value = 'news';
        }
        
        this.selectedImage = null;
        this.removeImage();
        this.updatePostButton('');
    }

    // 게시글 렌더링
    renderPosts() {
        const container = document.getElementById('postsContainer');
        if (!container) return;

        const filteredPosts = this.getFilteredPosts();
        
        if (filteredPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📷</div>
                    <h3 class="empty-title">아직 게시글이 없습니다</h3>
                    <p class="empty-subtitle">첫 번째 JeJu 정보를 공유해보세요!</p>
                </div>
            `;
            return;
        }

        const postsHTML = filteredPosts.map(post => this.renderPost(post)).join('');
        container.innerHTML = postsHTML;
        this.loadLucideIcons();
    }

    // 게시글 필터링
    getFilteredPosts() {
        const selectedCategory = Array.from(this.selectedCategories)[0];
        const searchQuery = document.getElementById('searchInput')?.value || '';

        return this.posts.filter(post => {
            const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
            const matchesSearch = !searchQuery || 
                post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.author.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }

    // 개별 게시글 렌더링 (인스타그램 스타일)
    renderPost(post) {
        const category = this.categories.find(cat => cat.id === post.category);
        const isLiked = post.likedBy && post.likedBy.includes(this.user?.id);
        const commentCount = post.comments ? post.comments.length : 0;
        
        return `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-user-info">
                        <div class="post-username">${post.author}</div>
                        <div class="post-user-handle">${post.username}</div>
                    </div>
                    <div class="post-category">${category?.icon} ${category?.name}</div>
                </div>
                
                ${post.image ? `
                    <img src="${post.image}" alt="게시글 이미지" class="post-image">
                ` : ''}
                
                <div class="post-content">
                    <div class="post-text">
                        ${post.hasLink ? 
                            `<a href="#" onclick="jejuSNS.handleLinkClick('${post.content}')">${post.content}</a>` : 
                            post.content
                        }
                    </div>
                    
                    <div class="post-actions">
                        <div class="action-row">
                            <div class="left-actions">
                                <button class="action-button ${isLiked ? 'liked' : ''}" onclick="jejuSNS.handleLike(${post.id})">
                                    <i data-lucide="${isLiked ? 'heart' : 'heart'}" class="w-6 h-6"></i>
                                </button>
                                <button class="action-button" onclick="jejuSNS.handleComment(${post.id})">
                                    <i data-lucide="message-circle" class="w-6 h-6"></i>
                                </button>
                                <button class="action-button" onclick="jejuSNS.handleShare(${post.id})">
                                    <i data-lucide="send" class="w-6 h-6"></i>
                                </button>
                                ${this.user && (this.user.id === post.userId || this.user.isAdmin) ? `
                                    <button class="action-button" onclick="jejuSNS.deletePost(${post.id})">
                                        <i data-lucide="trash-2" class="w-6 h-6"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="post-stats">
                            좋아요 ${post.likes}개
                            ${commentCount > 0 ? ` • 댓글 ${commentCount}개` : ''}
                        </div>
                        <div class="post-timestamp">${post.timestamp}</div>
                        
                        ${post.comments && post.comments.length > 0 ? `
                            <div class="post-comments">
                                ${post.comments.slice(0, 2).map(comment => `
                                    <div class="comment">
                                        <span class="comment-author">${comment.author}</span>
                                        <span class="comment-content">${comment.content}</span>
                                    </div>
                                `).join('')}
                                ${post.comments.length > 2 ? `
                                    <div class="comment-more">댓글 ${post.comments.length - 2}개 더 보기</div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // 좋아요 처리
    handleLike(postId) {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'error');
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        if (!post.likedBy) {
            post.likedBy = [];
        }

        const userLiked = post.likedBy.includes(this.user.id);
        
        if (userLiked) {
            post.likedBy = post.likedBy.filter(id => id !== this.user.id);
            post.likes--;
            this.showNotification('좋아요를 취소했습니다.');
        } else {
            post.likedBy.push(this.user.id);
            post.likes++;
            this.showNotification('좋아요를 눌렀습니다!');
        }

        this.saveDataToStorage();
        this.renderPosts();
    }

    // 댓글 처리
    handleComment(postId) {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'error');
            return;
        }
        
        const comment = prompt('댓글을 입력하세요:');
        if (comment && comment.trim()) {
            const post = this.posts.find(p => p.id === postId);
            if (post) {
                if (!post.comments) {
                    post.comments = [];
                }
                
                post.comments.push({
                    id: Date.now(),
                    author: this.user.displayName,
                    content: comment.trim(),
                    timestamp: '방금 전',
                    userId: this.user.id
                });
                
                this.saveDataToStorage();
                this.renderPosts();
                this.showNotification('댓글이 작성되었습니다.');
            }
        }
    }

    // 공유 처리
    handleShare(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const shareText = `🍊 제주 정보 공유\n\n${post.content}\n\n#제주 #지역정보`;
            
            if (navigator.share) {
                navigator.share({
                    title: '제주 정보 공유',
                    text: shareText,
                    url: window.location.href
                }).catch(() => {
                    this.copyToClipboard(shareText);
                });
            } else {
                this.copyToClipboard(shareText);
            }
        }
    }

    // 클립보드 복사
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('게시글이 클립보드에 복사되었습니다.');
        }).catch(() => {
            // 폴백: 텍스트 영역 생성 후 복사
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('게시글이 클립보드에 복사되었습니다.');
        });
    }

    // 링크 클릭 처리
    handleLinkClick(content) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex);
        if (urls) {
            window.open(urls[0], '_blank');
        }
    }

    // 게시글 삭제
    deletePost(postId) {
        if (!this.user) {
            this.showNotification('로그인이 필요합니다.', 'error');
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        if (post.userId !== this.user.id && !this.user.isAdmin) {
            this.showNotification('삭제 권한이 없습니다.', 'error');
            return;
        }

        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.saveDataToStorage();
            this.renderPosts();
            this.showNotification('게시글이 삭제되었습니다.');
        }
    }

    // 사용자 인터페이스 업데이트
    updateUserInterface() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        
        if (this.user) {
            // 로그인된 상태
            if (loginBtn) loginBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = `
                    <i data-lucide="user" class="w-4 h-4"></i>
                    <span>${this.user.displayName}</span>
                `;
                mobileLoginBtn.onclick = () => this.handleLogout();
            }
            
            // 사용자 정보 업데이트
            const userDisplayName = document.getElementById('userDisplayName');
            const userUsername = document.getElementById('userUsername');
            const userAvatar = document.getElementById('userAvatar');
            const userAvatarInForm = document.getElementById('userAvatarInForm');
            
            if (userDisplayName) userDisplayName.textContent = this.user.displayName;
            if (userUsername) userUsername.textContent = `@${this.user.username}`;
            if (userAvatar) userAvatar.textContent = this.user.avatar;
            if (userAvatarInForm) userAvatarInForm.textContent = this.user.avatar;
            
            this.activatePostForm();
        } else {
            // 로그아웃된 상태
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = `
                    <i data-lucide="log-in" class="w-4 h-4"></i>
                    <span>로그인</span>
                `;
                mobileLoginBtn.onclick = () => this.showLoginModal();
            }
            
            this.updatePostFormForGuest();
        }
        
        // Lucide 아이콘 다시 로드
        this.loadLucideIcons();
    }

    // 글쓰기 폼 활성화
    activatePostForm() {
        const postForm = document.getElementById('postForm');
        const postContent = document.getElementById('postContent');
        
        if (postForm && postContent) {
            postForm.classList.remove('hidden');
            postContent.placeholder = '제주 지역 정보를 공유해보세요...';
            postContent.disabled = false;
        }
    }

    // 게스트용 글쓰기 폼
    updatePostFormForGuest() {
        const postContent = document.getElementById('postContent');
        const submitPost = document.getElementById('submitPost');
        
        if (postContent) {
            postContent.placeholder = '로그인하여 제주 지역 정보를 공유해보세요...';
            postContent.disabled = true;
        }
        
        if (submitPost) {
            submitPost.disabled = true;
        }
    }

    // 모달 표시/숨김
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showApiModal() {
        const modal = document.getElementById('apiModal');
        if (modal) {
            modal.classList.remove('hidden');
            
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                apiKeyInput.value = this.apiKey || '';
            }
        }
    }

    hideApiModal() {
        const modal = document.getElementById('apiModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 알림 표시
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    // 데이터 저장/로드
    saveDataToStorage() {
        localStorage.setItem('jejuPosts', JSON.stringify(this.posts));
    }

    loadDataFromStorage() {
        const savedUser = localStorage.getItem('jejuUser');
        const savedPosts = localStorage.getItem('jejuPosts');
        const savedApiKey = localStorage.getItem('jejuApiKey');

        if (savedUser) {
            this.user = JSON.parse(savedUser);
        }

        if (savedPosts) {
            this.posts = JSON.parse(savedPosts);
        } else {
            // 샘플 데이터
            this.posts = [
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
        }

        if (savedApiKey) {
            this.apiKey = savedApiKey;
        }
    }
}

// 앱 초기화
const jejuSNS = new JejuSNS(); 
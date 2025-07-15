import React, { useState, useEffect } from 'react';
import { Search, Plus, Image, Link, MapPin, Briefcase, Home, Calendar, FileText, Bell, Settings, Key, User, LogOut, Heart, MessageCircle, Repeat2, Share, MoreHorizontal, X } from 'lucide-react';

const JejuSNS = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // 카테고리 정의
  const categories = [
    { id: 'all', name: '전체', icon: '🌴' },
    { id: 'jobs', name: '구인구직', icon: '💼' },
    { id: 'realestate', name: '부동산', icon: '🏠' },
    { id: 'events', name: '지역행사', icon: '🎉' },
    { id: 'policy', name: '정책지원', icon: '📋' },
    { id: 'news', name: '지역뉴스', icon: '📰' }
  ];

  // 샘플 데이터
  const samplePosts = [
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

  useEffect(() => {
    setPosts(samplePosts);
  }, []);

  // 로그인 처리
  const handleLogin = (provider) => {
    setUser({
      name: '제주도민',
      username: '@jejuuser',
      avatar: '👤',
      email: 'user@jeju.com'
    });
    setShowLoginModal(false);
  };

  // 로그아웃
  const handleLogout = () => {
    setUser(null);
    setApiKey('');
  };

  // API 키 생성
  const generateApiKey = () => {
    const key = 'jeju_' + Math.random().toString(36).substr(2, 16);
    setApiKey(key);
  };

  // 게시글 작성
  const handlePost = () => {
    if (!newPost.trim()) return;

    const hasLink = newPost.includes('http://') || newPost.includes('https://');
    const post = {
      id: posts.length + 1,
      author: user.name,
      username: user.username,
      avatar: user.avatar,
      content: newPost,
      category: selectedCategory === 'all' ? 'news' : selectedCategory,
      timestamp: '방금 전',
      likes: 0,
      comments: 0,
      retweets: 0,
      hasLink,
      image: selectedImage
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setSelectedImage(null);
    setShowImageUpload(false);
  };

  // 이미지 업로드
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 링크 클릭 처리
  const handleLinkClick = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    if (urls) {
      window.open(urls[0], '_blank');
    }
  };

  // 검색 필터링
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 게시글 렌더링
  const renderPost = (post) => {
    return (
      <div key={post.id} className="bg-white border-b border-gray-200 p-3 hover:bg-gray-50 transition-colors">
        <div className="flex space-x-2">
          <div className="text-lg">{post.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-sm font-bold text-gray-900">{post.author}</span>
              <span className="text-xs text-gray-500">{post.username}</span>
              <span className="text-xs text-gray-500">·</span>
              <span className="text-xs text-gray-500">{post.timestamp}</span>
              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                {categories.find(cat => cat.id === post.category)?.icon}
                {categories.find(cat => cat.id === post.category)?.name}
              </span>
            </div>
            
            <div className="text-sm text-gray-900 mb-2">
              {post.hasLink ? (
                <span 
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => handleLinkClick(post.content)}
                >
                  {post.content}
                </span>
              ) : (
                post.content
              )}
            </div>

            {post.image && (
              <div className="mb-2">
                <img 
                  src={post.image} 
                  alt="게시글 이미지" 
                  className="max-w-full h-auto rounded-lg border max-h-48"
                />
              </div>
            )}

            <div className="flex items-center space-x-6 text-gray-500 text-sm">
              <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <MessageCircle size={16} />
                <span className="text-xs">{post.comments}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                <Repeat2 size={16} />
                <span className="text-xs">{post.retweets}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                <Heart size={16} />
                <span className="text-xs">{post.likes}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <Share size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-orange-600">🍊 제주</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="제주 정보 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowApiModal(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Key size={16} />
                    <span>API</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{user.avatar}</span>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <LogOut size={16} />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-orange-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-orange-700 transition-colors"
                >
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 가로형 카테고리 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex-shrink-0 text-sm ${
                  selectedCategory === category.id
                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-300'
                    : 'hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <span className="text-base">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 글쓰기 영역 */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex space-x-2">
              <div className="text-lg">{user.avatar}</div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="제주 지역 정보를 공유해보세요..."
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows="3"
                />
                
                {selectedImage && (
                  <div className="mt-3 relative">
                    <img 
                      src={selectedImage} 
                      alt="업로드된 이미지" 
                      className="max-w-full h-auto rounded-lg border max-h-60"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Image size={20} />
                      <span>사진</span>
                    </label>
                    <select
                      value={selectedCategory === 'all' ? 'news' : selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {categories.filter(cat => cat.id !== 'all').map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim()}
                    className="bg-orange-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    게시하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 피드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MapPin size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">아직 게시글이 없습니다.</p>
              <p className="text-xs mt-1">첫 번째 제주 정보를 공유해보세요!</p>
            </div>
          ) : (
            filteredPosts.map(renderPost)
          )}
        </div>
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">제주 로그인</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => handleLogin('email')}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>📧</span>
                <span>이메일로 로그인</span>
              </button>
              
              <button
                onClick={() => handleLogin('google')}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>🔍</span>
                <span>Google로 로그인</span>
              </button>
              
              <button
                onClick={() => handleLogin('naver')}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>🟢</span>
                <span>네이버로 로그인</span>
              </button>
              
              <button
                onClick={() => handleLogin('kakao')}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                <span>💬</span>
                <span>카카오로 로그인</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API 키 모달 */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">API 키 관리</h2>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API 키
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={apiKey}
                    readOnly
                    placeholder="API 키를 생성하세요"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={generateApiKey}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    생성
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">API 사용 예시:</h3>
                <code className="text-xs text-gray-600">
                  GET /api/posts?key={apiKey || 'YOUR_API_KEY'}
                </code>
              </div>
              
              <div className="text-xs text-gray-600">
                <p>이 API 키를 사용하여 제주 지역 정보 데이터에 접근할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JejuSNS;
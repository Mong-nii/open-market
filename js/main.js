const baseUrl = 'https://api.wenivops.co.kr/services/open-market/';

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 사용자 로그인 상태 확인 및 네비게이션 업데이트
    updateNavigation();
    
    // 상품 목록 로드
    loadProducts();
    
    // 검색 기능 설정
    setupSearch();
    
    // 배너 슬라이드 기능 설정
    setupBannerSlider();
});

// 네비게이션 업데이트 (로그인 상태에 따라)
function updateNavigation() {
    const accessToken = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');
    const navIcons = document.querySelector('.nav-icons');
    
    if (accessToken && userInfo) {
        // 로그인된 상태
        const user = JSON.parse(userInfo);
        navIcons.innerHTML = `
            <a href="cart.html" class="icon-btn">
                <img src="img/icon-shopping-cart.svg" alt="" />
                <span class="icon-text">장바구니</span>
            </a>
            <div class="user-menu">
                <button class="icon-btn" id="user-menu-btn">
                    <img src="img/icon-user.svg" alt="" />
                    <span class="icon-text">마이페이지</span>
                </button>
                <div class="dropdown-menu" id="dropdown-menu">
                    <a href="mypage.html">마이페이지</a>
                    <button onclick="logout()">로그아웃</button>
                </div>
            </div>
        `;
        
        // 드롭다운 메뉴 기능
        setupDropdownMenu();
    } else {
        // 비로그인 상태
        navIcons.innerHTML = `
            <a href="cart.html" class="icon-btn">
                <img src="img/icon-shopping-cart.svg" alt="" />
                <span class="icon-text">장바구니</span>
            </a>
            <a href="login.html" class="icon-btn">
                <img src="img/icon-user.svg" alt="" />
                <span class="icon-text">로그인</span>
            </a>
        `;
    }
}

// 드롭다운 메뉴 설정
function setupDropdownMenu() {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (userMenuBtn && dropdownMenu) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
        });
        
        // 드롭다운 메뉴 내부 클릭 시 이벤트 전파 방지
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// 로그아웃 함수
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_type');
    
    alert('로그아웃되었습니다.');
    updateNavigation();
}

// 상품 목록 로드
async function loadProducts(searchKeyword = '') {
    const productsGrid = document.getElementById('products-grid');
    
    try {
        // 로딩 상태 표시
        showLoadingState(productsGrid);
        
        let url = `${baseUrl}products/`;
        if (searchKeyword) {
            url += `?search=${encodeURIComponent(searchKeyword)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('상품 목록을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        
        // 상품 목록 렌더링
        renderProducts(data.results);
        
    } catch (error) {
        console.error('상품 목록 로드 오류:', error);
        productsGrid.innerHTML = `
            <div class="error-message">
                <p>상품 목록을 불러오는데 실패했습니다.</p>
                <button onclick="loadProducts()" class="retry-btn">다시 시도</button>
            </div>
        `;
    }
}

// 로딩 상태 표시
function showLoadingState(container) {
    container.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const loadingCard = document.createElement('div');
        loadingCard.className = 'product-card loading';
        loadingCard.innerHTML = `
            <div class="product-image">
                <div style="width: 100%; height: 100%; background: #f0f0f0;"></div>
            </div>
            <div class="product-info">
                <div style="width: 60%; height: 16px; background: #f0f0f0; margin-bottom: 10px;"></div>
                <div style="width: 80%; height: 18px; background: #f0f0f0; margin-bottom: 10px;"></div>
                <div style="width: 40%; height: 24px; background: #f0f0f0;"></div>
            </div>
        `;
        container.appendChild(loadingCard);
    }
}

// 상품 목록 렌더링
function renderProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <p>상품이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// 상품 카드 생성
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    // 가격 포맷팅 (천 단위 콤마)
    const formattedPrice = Number(product.price).toLocaleString();
    
    productCard.innerHTML = `
        <a href="detail.html?id=${product.id}" class="product-link">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" class="product-img" 
                    onerror="this.src='img/default-product.png'">
            </div>
            <div class="product-info">
                <p class="product-seller">${product.seller || '판매자'}</p>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    <span class="price-amount">${formattedPrice}</span>
                    <span class="price-unit">원</span>
                </div>
            </div>
        </a>
    `;
    
    // 상품 카드 클릭 이벤트 (분석용)
    productCard.addEventListener('click', function() {
        console.log('상품 클릭:', product.name, product.id);
    });
    
    return productCard;
}

// 검색 기능 설정
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        // 검색 버튼 클릭
        searchBtn.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            performSearch(keyword);
        });
        
        // 엔터키 검색
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const keyword = this.value.trim();
                performSearch(keyword);
            }
        });
        
        // 검색어 입력 시 실시간 반응 (선택사항)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const keyword = this.value.trim();
            
            // 500ms 후에 검색 (너무 자주 API 호출 방지)
            searchTimeout = setTimeout(() => {
                if (keyword.length >= 2) {
                    performSearch(keyword);
                } else if (keyword.length === 0) {
                    loadProducts(); // 검색어가 없으면 전체 상품 로드
                }
            }, 500);
        });
    }
}

// 검색 실행
function performSearch(keyword) {
    if (keyword === '') {
        loadProducts();
    } else {
        loadProducts(keyword);
        console.log('검색 실행:', keyword);
    }
}

// 배너 슬라이드 기능 설정
function setupBannerSlider() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const indicators = document.querySelectorAll('.indicator');
    const bannerContent = document.querySelector('.banner-content');
    
    let currentSlide = 0;
    const totalSlides = indicators.length;
    
    // 배너 이미지 배열 (실제 프로젝트에서는 동적으로 로드)
    const bannerImages = [
        'img/banner-1.jpg',
        'img/banner-2.jpg',
        'img/banner-3.jpg',
        'img/banner-4.jpg',
        'img/banner-5.jpg'
    ];
    
    // 이전 버튼
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateBanner();
        });
    }
    
    // 다음 버튼
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateBanner();
        });
    }
    
    // 인디케이터 클릭
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            currentSlide = index;
            updateBanner();
        });
    });
    
    // 배너 업데이트
    function updateBanner() {
        // 배너 이미지 변경
        if (bannerContent && bannerImages[currentSlide]) {
            bannerContent.innerHTML = `
                <a href="index.html" class="banner-link">
                    <img src="${bannerImages[currentSlide]}" alt="배너 ${currentSlide + 1}" />
                </a>
            `;
        }
        
        // 인디케이터 업데이트
        indicators.forEach((indicator, index) => {
            if (index === currentSlide) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-selected', 'true');
            } else {
                indicator.classList.remove('active');
                indicator.setAttribute('aria-selected', 'false');
            }
        });
    }
    
    // 자동 슬라이드 (5초마다)
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateBanner();
    }, 5000);
}

// 페이지 스크롤 시 헤더 스타일 변경 (선택사항)
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
});

// 상품 이미지 로드 에러 처리
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' && e.target.classList.contains('product-img')) {
        e.target.src = 'img/default-product.png';
    }
}, true);
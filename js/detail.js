const baseUrl = 'https://api.wenivops.co.kr/services/open-market/';

// 전역 변수
let currentProduct = null;
let currentQuantity = 1;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // URL에서 상품 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        alert('상품 정보를 찾을 수 없습니다.');
        window.location.href = 'index.html';
        return;
    }
    
    // 상품 상세 정보 로드
    loadProductDetail(productId);
    
    // 수량 조절 기능 설정
    setupQuantityControls();
    
    // 탭 기능 설정
    setupTabs();
    
    // 버튼 이벤트 설정
    setupButtons();
    
    // 네비게이션 업데이트
    updateNavigation();
});

// 상품 상세 정보 로드
async function loadProductDetail(productId) {
    try {
        const response = await fetch(`${baseUrl}products/${productId}/`);
        
        if (!response.ok) {
            throw new Error('상품 정보를 불러오는데 실패했습니다.');
        }
        
        const product = await response.json();
        currentProduct = product;
        
        // 상품 정보 표시
        displayProductInfo(product);
        
    } catch (error) {
        console.error('상품 상세 정보 로드 오류:', error);
        alert('상품 정보를 불러오는데 실패했습니다.');
        window.location.href = 'index.html';
    }
}

// 상품 정보 표시
function displayProductInfo(product) {
    // 상품 이미지
    const productImage = document.getElementById('productImage');
    productImage.src = product.image;
    productImage.alt = product.name;
    productImage.onerror = function() {
        this.src = 'img/default-product.png';
    };
    
    // 판매자명
    const sellerName = document.getElementById('sellerName');
    sellerName.textContent = product.seller || '판매자';
    
    // 상품명
    const productTitle = document.getElementById('productTitle');
    productTitle.textContent = product.name;
    
    // 가격
    const productPrice = document.getElementById('productPrice');
    const formattedPrice = Number(product.price).toLocaleString();
    productPrice.textContent = formattedPrice;
    
    // 배송비
    const shippingFee = document.getElementById('shippingFee');
    if (product.shipping_fee === 0) {
        shippingFee.textContent = '무료배송';
    } else {
        shippingFee.textContent = `배송비 ${Number(product.shipping_fee).toLocaleString()}원`;
    }
    
    // 상품 설명
    const productDescription = document.getElementById('productDescription');
    productDescription.innerHTML = product.info || '<p>상품 설명이 없습니다.</p>';
    
    // 총 가격 계산
    updateTotalPrice();
    
    // 페이지 제목 업데이트
    document.title = `${product.name} - HODU`;
}

// 수량 조절 기능 설정
function setupQuantityControls() {
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const quantityInput = document.getElementById('quantityInput');
    
    // 마이너스 버튼
    minusBtn.addEventListener('click', function() {
        if (currentQuantity > 1) {
            currentQuantity--;
            quantityInput.value = currentQuantity;
            updateTotalPrice();
        }
    });
    
    // 플러스 버튼
    plusBtn.addEventListener('click', function() {
        // 재고 확인 (현재는 최대 99개로 제한)
        if (currentQuantity < 99) {
            currentQuantity++;
            quantityInput.value = currentQuantity;
            updateTotalPrice();
        } else {
            alert('최대 99개까지 주문 가능합니다.');
        }
    });
    
    // 수량 직접 입력
    quantityInput.addEventListener('input', function() {
        let value = parseInt(this.value);
        
        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > 99) {
            value = 99;
            alert('최대 99개까지 주문 가능합니다.');
        }
        
        currentQuantity = value;
        this.value = value;
        updateTotalPrice();
    });
    
    // 포커스 아웃 시 값 확인
    quantityInput.addEventListener('blur', function() {
        if (this.value === '' || parseInt(this.value) < 1) {
            this.value = 1;
            currentQuantity = 1;
            updateTotalPrice();
        }
    });
}

// 총 가격 업데이트
function updateTotalPrice() {
    if (!currentProduct) return;
    
    const totalQuantityElement = document.getElementById('totalQuantity');
    const totalPriceElement = document.getElementById('totalPrice');
    
    const totalPrice = currentProduct.price * currentQuantity;
    
    totalQuantityElement.textContent = `총 수량 ${currentQuantity}개`;
    totalPriceElement.textContent = Number(totalPrice).toLocaleString();
}

// 탭 기능 설정
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // 모든 탭 버튼 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // 모든 탭 패널 숨기기
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // 선택된 탭 활성화
            this.classList.add('active');
            document.getElementById(`${tabName}-panel`).classList.add('active');
        });
    });
}

// 버튼 이벤트 설정
function setupButtons() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const buyNowBtn = document.getElementById('buyNowBtn');
    
    // 장바구니 추가
    addToCartBtn.addEventListener('click', function() {
        addToCart();
    });
    
    // 바로 구매
    buyNowBtn.addEventListener('click', function() {
        buyNow();
    });
}

// 장바구니 추가
function addToCart() {
    if (!currentProduct) return;
    
    // 로그인 확인
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        if (confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // 장바구니 데이터 구성
    const cartItem = {
        product_id: currentProduct.id,
        quantity: currentQuantity,
        check: true
    };
    
    // localStorage에서 기존 장바구니 가져오기
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // 이미 장바구니에 있는 상품인지 확인
    const existingItemIndex = cart.findIndex(item => item.product_id === currentProduct.id);
    
    if (existingItemIndex !== -1) {
        // 이미 있는 상품이면 수량 증가
        cart[existingItemIndex].quantity += currentQuantity;
        alert('장바구니에 상품이 추가되었습니다. (기존 수량에 추가됨)');
    } else {
        // 새로운 상품이면 추가
        cart.push(cartItem);
        alert('장바구니에 상품이 추가되었습니다.');
    }
    
    // localStorage에 저장
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // 장바구니 페이지로 이동할지 확인
    if (confirm('장바구니로 이동하시겠습니까?')) {
        window.location.href = 'cart.html';
    }
}

// 바로 구매
function buyNow() {
    if (!currentProduct) return;
    
    // 로그인 확인
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        if (confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // 구매 데이터를 localStorage에 임시 저장
    const purchaseData = {
        products: [{
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            seller: currentProduct.seller,
            quantity: currentQuantity,
            shipping_fee: currentProduct.shipping_fee
        }]
    };
    
    localStorage.setItem('purchase_data', JSON.stringify(purchaseData));
    
    // 주문 페이지로 이동
    window.location.href = 'order.html';
}

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
                <img src="img/icon-shopping-cart.svg" alt="장바구니" />
                <span class="icon-text">장바구니</span>
            </a>
            <div class="user-menu">
                <button class="icon-btn" id="user-menu-btn">
                    <img src="img/icon-user.svg" alt="마이페이지" />
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
                <img src="img/icon-shopping-cart.svg" alt="장바구니" />
                <span class="icon-text">장바구니</span>
            </a>
            <a href="login.html" class="icon-btn">
                <img src="img/icon-user.svg" alt="로그인" />
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

// 검색 기능 (네비게이션 바에서)
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            if (keyword) {
                window.location.href = `index.html?search=${encodeURIComponent(keyword)}`;
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const keyword = this.value.trim();
                if (keyword) {
                    window.location.href = `index.html?search=${encodeURIComponent(keyword)}`;
                }
            }
        });
    }
});

// 뒤로가기 시 새로고침 방지
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        window.location.reload();
    }
});
const baseUrl = 'https://api.wenivops.co.kr/services/open-market/';

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 이미 로그인된 사용자인지 확인
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        alert('이미 로그인되어 있습니다.');
        window.location.href = 'index.html';
        return;
    }

    // 탭 전환 기능
    const tabButtons = document.querySelectorAll('.tab-button');
    const loginForms = document.querySelectorAll('.login-form');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // 모든 탭 버튼 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // 모든 폼 숨기기
            loginForms.forEach(form => form.classList.remove('active'));
            
            // 선택된 탭 활성화
            this.classList.add('active');
            document.getElementById(`${tab}-form`).classList.add('active');
        });
    });

    // 구매회원 로그인 폼 처리
    const buyerForm = document.getElementById('buyer-form');
    if (buyerForm) {
        buyerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = this.querySelector('input[name="username"]').value;
            const password = this.querySelector('input[name="password"]').value;
            
            if (!username || !password) {
                alert('아이디와 비밀번호를 입력해주세요.');
                return;
            }

            try {
                const response = await fetch(`${baseUrl}accounts/login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        login_type: 'BUYER'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // 로그인 성공
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('user_info', JSON.stringify(data.user));
                    localStorage.setItem('user_type', 'buyer');
                    
                    alert('로그인 성공! 메인 페이지로 이동합니다.');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || '로그인에 실패했습니다.');
                }
            } catch (error) {
                console.error('로그인 요청 중 오류 발생:', error);
                alert('서버 연결에 실패했습니다.');
            }
        });
    }

    // 판매회원 로그인 폼 처리
    const sellerForm = document.getElementById('seller-form');
    if (sellerForm) {
        sellerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = this.querySelector('input[name="username"]').value;
            const password = this.querySelector('input[name="password"]').value;
            
            if (!username || !password) {
                alert('아이디와 비밀번호를 입력해주세요.');
                return;
            }

            try {
                const response = await fetch(`${baseUrl}accounts/login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        login_type: 'SELLER'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // 로그인 성공
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('user_info', JSON.stringify(data.user));
                    localStorage.setItem('user_type', 'seller');
                    
                    alert('로그인 성공! 메인 페이지로 이동합니다.');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || '로그인에 실패했습니다.');
                }
            } catch (error) {
                console.error('로그인 요청 중 오류 발생:', error);
                alert('서버 연결에 실패했습니다.');
            }
        });
    }

    // 입력 필드 포커스 이벤트 처리
    const inputFields = document.querySelectorAll('.input-field');
    inputFields.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderBottomColor = '#21bf48';
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.style.borderBottomColor = '#c4c4c4';
            }
        });
    });
});
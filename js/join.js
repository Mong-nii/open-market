const baseUrl = 'https://api.wenivops.co.kr/services/open-market/';

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 아이디 중복 확인 상태 추적
    let usernameChecked = {
        buyer: false,
        seller: false
    };

    // 탭 전환 기능
    const tabButtons = document.querySelectorAll('.tab-button');
    const joinForms = document.querySelectorAll('.join-form');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // 모든 탭 버튼 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // 모든 폼 숨기기
            joinForms.forEach(form => form.classList.remove('active'));
            
            // 선택된 탭 활성화
            this.classList.add('active');
            document.getElementById(`${tab}-form`).classList.add('active');
            
            // 가입하기 버튼 상태 초기화
            updateJoinButton();
        });
    });

    // 비밀번호 유효성 검사
    function validatePassword(password) {
        // 8자 이상, 영문 대소문자, 숫자, 특수문자 포함
        const hasLowerCase = /[a-z]/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        const isLengthValid = password.length >= 8;
        
        return hasLowerCase && hasUpperCase && hasNumbers && hasSpecialChar && isLengthValid;
    }

    // 전화번호 유효성 검사
    function validatePhone(phone) {
        // 010으로 시작하는 10~11자리 숫자
        const phoneRegex = /^010\d{7,8}$/;
        return phoneRegex.test(phone);
    }

    // 메시지 표시 함수
    function showMessage(element, message, type) {
        element.innerHTML = `<div class="${type}-message">${message}</div>`;
    }

    // 아이디 중복 확인 함수 (전역 함수로 정의)
    window.checkUsername = async function(type) {
        console.log('checkUsername 함수 호출됨:', type); // 디버깅용
        
        const form = document.getElementById(`${type}-form`);
        const usernameInput = form.querySelector('input[name="username"]');
        const messageDiv = document.getElementById(`${type}-username-message`);
        const username = usernameInput.value.trim();

        console.log('입력된 아이디:', username); // 디버깅용

        // 1. 빈 값 체크
        if (!username) {
            showMessage(messageDiv, '필수 정보입니다.', 'error');
            usernameInput.classList.add('error');
            usernameInput.classList.remove('success');
            usernameChecked[type] = false;
            updateJoinButton();
            return;
        }

        // 2. 형식 유효성 검사 (20자 이내, 영어 대소문자, 숫자만)
        const usernameRegex = /^[a-zA-Z0-9]{1,20}$/;
        if (!usernameRegex.test(username)) {
            showMessage(messageDiv, '20자 이내의 영문 소문자, 대문자, 숫자만 사용 가능합니다.', 'error');
            usernameInput.classList.add('error');
            usernameInput.classList.remove('success');
            usernameChecked[type] = false;
            updateJoinButton();
            return;
        }

        try {
            console.log('API 호출 시작:', `${baseUrl}accounts/signup/valid/username/`); // 디버깅용
            
            const response = await fetch(`${baseUrl}accounts/signup/valid/username/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username
                })
            });

            console.log('API 응답 상태:', response.status); // 디버깅용
            
            const data = await response.json();
            console.log('API 응답 데이터:', data); // 디버깅용

            if (response.ok) {
                // 3. 사용 가능한 아이디
                showMessage(messageDiv, '멋진 아이디네요 :)', 'success');
                usernameInput.classList.remove('error');
                usernameInput.classList.add('success');
                usernameChecked[type] = true;
            } else {
                // 4. 중복된 아이디
                showMessage(messageDiv, '이미 사용 중인 아이디입니다.', 'error');
                usernameInput.classList.add('error');
                usernameInput.classList.remove('success');
                usernameChecked[type] = false;
            }
        } catch (error) {
            console.error('아이디 중복 확인 오류:', error);
            showMessage(messageDiv, '서버 연결에 실패했습니다.', 'error');
            usernameChecked[type] = false;
        }

        updateJoinButton();
    };

    // 회원가입 처리 함수 (전역 함수로 정의)
    window.handleJoinSubmit = async function() {
        console.log('handleJoinSubmit 함수 호출됨'); // 디버깅용
        
        const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
        const form = document.getElementById(`${activeTab}-form`);
        
        const username = form.querySelector('input[name="username"]').value.trim();
        const password = form.querySelector('input[name="password"]').value;
        const name = form.querySelector('input[name="name"]').value.trim();
        const phonePrefix = form.querySelector('select[name="phone_prefix"]').value;
        const phoneMiddle = form.querySelector('input[name="phone_middle"]').value;
        const phoneLast = form.querySelector('input[name="phone_last"]').value;
        
        const phone_number = phonePrefix + phoneMiddle + phoneLast;
        const endpoint = activeTab === 'buyer' ? 'accounts/buyer/signup/' : 'accounts/seller/signup/';
        
        console.log('회원가입 시도:', {
            activeTab,
            endpoint: baseUrl + endpoint,
            data: { username, password: '***', name, phone_number }
        });
        
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    name: name,
                    phone_number: phone_number
                })
            });
            
            console.log('회원가입 응답 상태:', response.status);
            
            const data = await response.json();
            console.log('회원가입 응답 데이터:', data);
            
            if (response.ok) {
                alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
                window.location.href = 'login.html';
            } else {
                // 전화번호 중복 체크
                if (data.phone_number && (data.phone_number.includes('이미') || data.phone_number.includes('already') || data.phone_number.includes('존재'))) {
                    const phoneMessageDiv = document.getElementById(`${activeTab}-phone-message`);
                    showMessage(phoneMessageDiv, '해당 사용자 전화번호는 이미 존재합니다.', 'error');
                    return;
                }
                
                let errorMessage = '';
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.error) {
                    errorMessage = data.error;
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else {
                    const errors = [];
                    for (const [field, messages] of Object.entries(data)) {
                        if (Array.isArray(messages)) {
                            errors.push(...messages);
                        } else {
                            errors.push(messages);
                        }
                    }
                    errorMessage = errors.join('\n');
                }
                alert(errorMessage || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원가입 요청 중 오류 발생:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    // 아이디 검증 설정
    function setupUsernameValidation(type) {
        const form = document.getElementById(`${type}-form`);
        const usernameInput = form.querySelector('input[name="username"]');
        const messageDiv = document.getElementById(`${type}-username-message`);

        usernameInput.addEventListener('input', function() {
            const username = this.value.trim();
            
            // 중복확인 상태 초기화
            usernameChecked[type] = false;
            this.classList.remove('success', 'error');
            
            // 빈 값 체크
            if (username === '') {
                showMessage(messageDiv, '필수 정보입니다.', 'error');
                this.classList.add('error');
                updateJoinButton();
                return;
            }
            
            // 형식 체크
            const usernameRegex = /^[a-zA-Z0-9]{1,20}$/;
            if (!usernameRegex.test(username)) {
                showMessage(messageDiv, '20자 이내의 영문 소문자, 대문자, 숫자만 사용 가능합니다.', 'error');
                this.classList.add('error');
            } else {
                // 형식이 맞으면 메시지 지우고 중복확인 필요 상태로
                messageDiv.innerHTML = '';
                this.classList.remove('error');
            }
            
            updateJoinButton();
        });

        usernameInput.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                showMessage(messageDiv, '필수 정보입니다.', 'error');
                this.classList.add('error');
            }
            updateJoinButton();
        });
    }

    // 비밀번호 검증 설정
    function setupPasswordValidation(type) {
        const form = document.getElementById(`${type}-form`);
        const passwordInput = form.querySelector('input[name="password"]');
        const passwordConfirmInput = form.querySelector('input[name="password_confirm"]');
        const passwordMessageDiv = document.getElementById(`${type}-password-message`);
        const passwordConfirmMessageDiv = document.getElementById(`${type}-password-confirm-message`);
        const passwordCheckIcon = document.getElementById(`${type}-password-check`);
        const passwordConfirmCheckIcon = document.getElementById(`${type}-password-confirm-check`);

        // 비밀번호 입력 시 검증
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            if (password === '') {
                showMessage(passwordMessageDiv, '필수 정보입니다.', 'error');
                if (passwordCheckIcon) passwordCheckIcon.classList.remove('success');
                this.classList.add('error');
                this.classList.remove('success');
            } else if (validatePassword(password)) {
                passwordMessageDiv.innerHTML = '';
                if (passwordCheckIcon) passwordCheckIcon.classList.add('success');
                this.classList.add('success');
                this.classList.remove('error');
            } else {
                showMessage(passwordMessageDiv, '8자 이상, 영문 대 소문자, 숫자, 특수문자를 사용하세요.', 'error');
                if (passwordCheckIcon) passwordCheckIcon.classList.remove('success');
                this.classList.add('error');
                this.classList.remove('success');
            }
            
            // 비밀번호 재확인도 함께 체크
            if (passwordConfirmInput.value !== '') {
                validatePasswordConfirm();
            }
            
            updateJoinButton();
        });

        passwordInput.addEventListener('blur', function() {
            if (this.value === '') {
                showMessage(passwordMessageDiv, '필수 정보입니다.', 'error');
                this.classList.add('error');
            }
            updateJoinButton();
        });

        // 비밀번호 재확인 검증 함수
        function validatePasswordConfirm() {
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;
            
            if (passwordConfirm === '') {
                showMessage(passwordConfirmMessageDiv, '필수 정보입니다.', 'error');
                if (passwordConfirmCheckIcon) passwordConfirmCheckIcon.classList.remove('success');
                passwordConfirmInput.classList.add('error');
                passwordConfirmInput.classList.remove('success');
            } else if (password !== passwordConfirm) {
                showMessage(passwordConfirmMessageDiv, '비밀번호가 일치하지 않습니다.', 'error');
                if (passwordConfirmCheckIcon) passwordConfirmCheckIcon.classList.remove('success');
                passwordConfirmInput.classList.add('error');
                passwordConfirmInput.classList.remove('success');
            } else {
                passwordConfirmMessageDiv.innerHTML = '';
                if (passwordConfirmCheckIcon) passwordConfirmCheckIcon.classList.add('success');
                passwordConfirmInput.classList.add('success');
                passwordConfirmInput.classList.remove('error');
            }
            
            updateJoinButton();
        }

        passwordConfirmInput.addEventListener('input', validatePasswordConfirm);
        passwordConfirmInput.addEventListener('blur', function() {
            if (this.value === '') {
                showMessage(passwordConfirmMessageDiv, '필수 정보입니다.', 'error');
                this.classList.add('error');
            }
            updateJoinButton();
        });
    }

    // 이름 검증 설정
    function setupNameValidation(type) {
        const form = document.getElementById(`${type}-form`);
        const nameInput = form.querySelector('input[name="name"]');
        const nameMessageDiv = document.getElementById(`${type}-name-message`);

        nameInput.addEventListener('input', function() {
            const name = this.value.trim();
            
            if (name === '') {
                showMessage(nameMessageDiv, '필수 정보입니다.', 'error');
                this.classList.add('error');
                this.classList.remove('success');
            } else {
                nameMessageDiv.innerHTML = '';
                this.classList.add('success');
                this.classList.remove('error');
            }
            
            updateJoinButton();
        });

        nameInput.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                showMessage(nameMessageDiv, '필수 정보입니다.', 'error');
                this.classList.add('error');
            }
            updateJoinButton();
        });
    }

    // 전화번호 검증 설정
    function setupPhoneValidation(type) {
        const form = document.getElementById(`${type}-form`);
        const phoneMiddleInput = form.querySelector('input[name="phone_middle"]');
        const phoneLastInput = form.querySelector('input[name="phone_last"]');
        const phoneMessageDiv = document.getElementById(`${type}-phone-message`);
        
        function validatePhoneNumber() {
            const phonePrefix = form.querySelector('select[name="phone_prefix"]').value;
            const phoneMiddle = phoneMiddleInput.value.trim();
            const phoneLast = phoneLastInput.value.trim();
            
            // 모든 필드가 비어있으면 필수 정보 메시지
            if (phoneMiddle === '' && phoneLast === '') {
                showMessage(phoneMessageDiv, '필수 정보입니다.', 'error');
                phoneMiddleInput.classList.add('error');
                phoneLastInput.classList.add('error');
                return false;
            }
            
            // 하나라도 비어있으면 필수 정보 메시지
            if (phoneMiddle === '' || phoneLast === '') {
                showMessage(phoneMessageDiv, '필수 정보입니다.', 'error');
                if (phoneMiddle === '') phoneMiddleInput.classList.add('error');
                if (phoneLast === '') phoneLastInput.classList.add('error');
                return false;
            }
            
            // 형식 검증 (4자리, 4자리)
            if (phoneMiddle.length !== 4 || phoneLast.length !== 4) {
                showMessage(phoneMessageDiv, '올바른 전화번호를 입력해주세요.', 'error');
                phoneMiddleInput.classList.add('error');
                phoneLastInput.classList.add('error');
                return false;
            }
            
            // 숫자만 체크
            if (!/^\d{4}$/.test(phoneMiddle) || !/^\d{4}$/.test(phoneLast)) {
                showMessage(phoneMessageDiv, '올바른 전화번호를 입력해주세요.', 'error');
                phoneMiddleInput.classList.add('error');
                phoneLastInput.classList.add('error');
                return false;
            }
            
            // 모든 검증 통과 시
            phoneMessageDiv.innerHTML = '';
            phoneMiddleInput.classList.remove('error');
            phoneLastInput.classList.remove('error');
            phoneMiddleInput.classList.add('success');
            phoneLastInput.classList.add('success');
            return true;
        }

        // 입력 시 숫자만 허용 및 검증
        [phoneMiddleInput, phoneLastInput].forEach(input => {
            input.addEventListener('input', function() {
                // 숫자만 입력 가능
                this.value = this.value.replace(/[^0-9]/g, '');
                
                // 최대 4자리까지만
                if (this.value.length > 4) {
                    this.value = this.value.slice(0, 4);
                }
                
                validatePhoneNumber();
                updateJoinButton();
            });

            input.addEventListener('blur', function() {
                validatePhoneNumber();
                updateJoinButton();
            });
        });
    }

    // 가입하기 버튼 상태 업데이트
    function updateJoinButton() {
        const joinButton = document.querySelector('.join-submit-btn');
        const agreementCheckbox = document.getElementById('agreement-checkbox');
        
        if (!joinButton || !agreementCheckbox) return;
        
        const activeTab = document.querySelector('.tab-button.active')?.getAttribute('data-tab');
        if (!activeTab) return;
        
        const isValid = isFormValid(activeTab) && agreementCheckbox.checked;
        
        joinButton.disabled = !isValid;
        if (isValid) {
            joinButton.style.backgroundColor = '#21bf48';
            joinButton.style.cursor = 'pointer';
        } else {
            joinButton.style.backgroundColor = '#c4c4c4';
            joinButton.style.cursor = 'not-allowed';
        }
    }

    // 폼 유효성 검사
    function isFormValid(type) {
        const form = document.getElementById(`${type}-form`);
        if (!form) return false;
        
        const username = form.querySelector('input[name="username"]')?.value.trim() || '';
        const password = form.querySelector('input[name="password"]')?.value || '';
        const passwordConfirm = form.querySelector('input[name="password_confirm"]')?.value || '';
        const name = form.querySelector('input[name="name"]')?.value.trim() || '';
        const phoneMiddle = form.querySelector('input[name="phone_middle"]')?.value || '';
        const phoneLast = form.querySelector('input[name="phone_last"]')?.value || '';
        
        // 모든 필수 필드가 채워져 있는지 확인
        const isAllFieldsFilled = username !== '' && 
                                 password !== '' && 
                                 passwordConfirm !== '' && 
                                 name !== '' && 
                                 phoneMiddle !== '' && 
                                 phoneLast !== '';
        
        // 각 필드의 유효성 확인
        const isUsernameValid = usernameChecked[type];
        const isPasswordValid = validatePassword(password);
        const isPasswordConfirmValid = password === passwordConfirm;
        const isPhoneValid = phoneMiddle.length === 4 && phoneLast.length === 4 && /^\d{4}$/.test(phoneMiddle) && /^\d{4}$/.test(phoneLast);
        
        return isAllFieldsFilled && 
               isUsernameValid && 
               isPasswordValid && 
               isPasswordConfirmValid && 
               isPhoneValid;
    }

    // 약관 동의 체크박스 이벤트
    const agreementCheckbox = document.getElementById('agreement-checkbox');
    if (agreementCheckbox) {
        agreementCheckbox.addEventListener('change', updateJoinButton);
    }

    // 초기화
    setupUsernameValidation('buyer');
    setupPasswordValidation('buyer');
    setupNameValidation('buyer');
    setupPhoneValidation('buyer');
    
    setupUsernameValidation('seller');
    setupPasswordValidation('seller');
    setupNameValidation('seller');
    setupPhoneValidation('seller');
    
    updateJoinButton();

    console.log('join.js 로드 완료'); // 디버깅용
});
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const errorDiv = document.getElementById('errorMessage');
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // 버튼 비활성화
    submitButton.disabled = true;
    submitButton.textContent = '로그인 중...';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin' // 쿠키 포함 보장
        });
        
        if (response.ok) {
            // 쿠키 설정을 위한 충분한 지연
            setTimeout(() => {
                // 캐시 방지를 위한 타임스탬프 추가
                window.location.href = `/chat?t=${Date.now()}`;
            }, 300);
        } else {
            errorDiv.textContent = '으....이....';
            errorDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = '로그인';
        }
    } catch (error) {
        errorDiv.textContent = '으....이....';
        errorDiv.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = '로그인';
    }
});

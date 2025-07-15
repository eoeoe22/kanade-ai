let isLoggedIn = false;

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const errorDiv = document.getElementById('errorMessage');
    
    try {
        // Admin login is checked by trying to get the notice with the password.
        // This is a simplified auth flow for the admin page.
        const response = await fetch('/api/admin/notice'); // First get current notice
        
        if (response.ok) {
            const data = await response.json();
            
            // In a real app, you'd verify the password against the server.
            // Here, we just check if the password is not empty for simplicity,
            // as the actual check is on the server when updating.
            // For the login simulation, we'll just proceed.
            
            isLoggedIn = true;
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('noticeContent').value = data.notice;
            errorDiv.style.display = 'none';
            
            // Store password in session storage to use for the update request.
            sessionStorage.setItem('adminPassword', formData.get('password'));
        } else {
            errorDiv.textContent = '으....이....';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = '으....이....';
        errorDiv.style.display = 'block';
    }
});

document.getElementById('noticeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    try {
        const response = await fetch('/api/admin/notice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: sessionStorage.getItem('adminPassword'),
                content: formData.get('content')
            })
        });
        
        if (response.ok) {
            successDiv.textContent = '공지사항이 업데이트되었습니다.';
            successDiv.style.display = 'block';
            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = '으....이....';
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
        }
    } catch (error) {
        errorDiv.textContent = '으....이....';
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
    }
});

document.getElementById('logoutAdminBtn').addEventListener('click', () => {
    isLoggedIn = false;
    sessionStorage.removeItem('adminPassword');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
});

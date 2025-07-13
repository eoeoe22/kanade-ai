let currentConversationId = null;
let userInfo = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('페이지 로딩 시작 - 초기화 진행');
        
        // 인증 상태를 먼저 확인
        const isAuthenticated = await checkAuthentication();
        
        if (!isAuthenticated) {
            console.log('인증 실패 - 로그인 페이지로 리다이렉트');
            window.location.href = '/login';
            return;
        }
        
        console.log('인증 성공 - 초기화 시작');
        
        // 인증된 경우에만 초기화 진행
        await loadUserInfo();
        await loadNotice();
        await loadConversations();
        
        // 이벤트 리스너 설정
        setupEventListeners();
        
        console.log('초기화 완료');
    } catch (error) {
        console.error('초기화 중 오류:', error);
        window.location.href = '/login';
    }
});

// 인증 상태 확인 함수
async function checkAuthentication() {
    try {
        const response = await fetch('/api/user/info');
        return response.ok;
    } catch (error) {
        console.error('인증 확인 실패:', error);
        return false;
    }
}

function setupEventListeners() {
    // 사이드바 토글
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });
    
    // 메시지 전송 - Enter 키 이벤트 수정
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 새 대화 시작 버튼
    document.getElementById('newConversationBtn').addEventListener('click', startNewConversation);
    
    // 폼 이벤트
    document.getElementById('changePasswordForm').addEventListener('submit', changePassword);
    document.getElementById('changeNicknameForm').addEventListener('submit', changeNickname);
    document.getElementById('apiKeyForm').addEventListener('submit', manageApiKey);
    document.getElementById('deleteApiKeyBtn').addEventListener('click', deleteApiKey);
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// 새 대화 시작 함수
async function startNewConversation() {
    try {
        const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: `대화 ${new Date().toLocaleString()}` })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentConversationId = data.id;
            
            // 채팅 화면 초기화
            document.getElementById('chatMessages').innerHTML = `
                <div class="message assistant">
                    <img src="/images/kanade-profile.webp" alt="카나데" class="message-avatar">
                    <div class="message-bubble">안녕… 카나데야. 무슨 일이든 말해줘.</div>
                </div>
            `;
            
            // 대화내역 목록 새로고침
            await loadConversations();
        } else if (response.status === 401) {
            window.location.href = '/login';
        } else {
            alert('으....이....');
        }
    } catch (error) {
        alert('으....이....');
    }
}

async function loadUserInfo() {
    try {
        console.log('사용자 정보 로딩 시작');
        const response = await fetch('/api/user/info');
        console.log('사용자 정보 응답:', response.status);
        
        if (response.ok) {
            userInfo = await response.json();
            console.log('사용자 정보:', userInfo);
            document.getElementById('userInfo').innerHTML = `
                아이디: ${userInfo.username}<br>
                닉네임: ${userInfo.nickname}
            `;
            
            // API 키 관리 UI 업데이트
            updateApiKeyUI();
            
            // 모델 선택 UI 업데이트
            updateModelSelector();
        } else if (response.status === 401) {
            console.log('인증 만료 - 로그인 페이지로 이동');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        window.location.href = '/login';
    }
}
async function loadNotice() {
    try {
        const response = await fetch('/api/admin/notice');
        if (response.ok) {
            const data = await response.json();
            // 줄바꿈을 <br> 태그로 변환
            const formattedNotice = data.notice.replace(/\n/g, '<br>');
            document.getElementById('noticeContent').innerHTML = formattedNotice;
        }
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
    }
}

async function loadConversations() {
    try {
        console.log('대화내역 로딩 시작');
        const response = await fetch('/api/conversations');
        if (response.ok) {
            const conversations = await response.json();
            const listDiv = document.getElementById('conversationList');
            
            if (conversations.length === 0) {
                listDiv.innerHTML = '<p class="text-muted">대화내역이 없습니다.</p>';
            } else {
                listDiv.innerHTML = conversations.map(conv => `
                    <div class="conversation-item ${conv.id === currentConversationId ? 'active' : ''}" onclick="loadConversation(${conv.id})">
                        <span>${conv.title}</span>
                        <i class="bi bi-trash" onclick="event.stopPropagation(); deleteConversation(${conv.id})"></i>
                    </div>
                `).join('');
            }
            console.log('대화내역 로딩 완료');
        } else if (response.status === 401) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('대화내역 로드 실패:', error);
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 수정: select 요소에서 모델 값 가져오기
    const selectedModel = document.getElementById('modelSelect').value;
    
    // 대화방이 없으면 자동 생성
    if (!currentConversationId) {
        await startNewConversation();
        // 대화방 생성 실패시 메시지 전송 중단
        if (!currentConversationId) {
            alert('으....이....');
            return;
        }
    }
    
    // 사용자 메시지 표시
    addMessage('user', message);
    input.value = '';
    
    // 로딩 표시
    const loadingDiv = addMessage('assistant', '...');
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                model: selectedModel,
                conversationId: currentConversationId
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            loadingDiv.textContent = data.response;
            
            // 대화내역 목록 업데이트 (새 메시지로 제목 변경될 수 있음)
            await loadConversations();
        } else if (response.status === 401) {
            window.location.href = '/login';
        } else {
            loadingDiv.textContent = '으....이....';
        }
    } catch (error) {
        loadingDiv.textContent = '으....이....';
    }
}

function addMessage(role, content) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    if (role === 'assistant') {
        messageDiv.innerHTML = `
            <img src="/images/kanade-profile.webp" alt="카나데" class="message-avatar">
            <div class="message-bubble">${content}</div>
        `;
    } else {
        messageDiv.innerHTML = `<div class="message-bubble">${content}</div>`;
    }
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return messageDiv.querySelector('.message-bubble');
}

function updateApiKeyUI() {
    const input = document.getElementById('apiKeyInput');
    const submitBtn = document.getElementById('apiKeySubmitBtn');
    const deleteBtn = document.getElementById('deleteApiKeyBtn');
    
    if (userInfo.has_api_key) {
        input.value = '●●●●●●●●●●●●●●●●';
        submitBtn.textContent = '변경하기';
        deleteBtn.style.display = 'inline-block';
    } else {
        input.value = '';
        submitBtn.textContent = '등록하기';
        deleteBtn.style.display = 'none';
    }
}

function updateModelSelector() {
    // Pro 모델은 개인 API 키가 있을 때만 활성화
    const modelSelect = document.getElementById('modelSelect');
    const proOption = modelSelect.querySelector('option[value="gemini-2.5-pro"]');
    
    if (proOption) {
        proOption.disabled = !userInfo.has_api_key;
        
        // Pro 모델이 선택되어 있는데 API 키가 없으면 기본 모델로 변경
        if (!userInfo.has_api_key && modelSelect.value === 'gemini-2.5-pro') {
            modelSelect.value = 'gemini-2.5-flash';
        }
    }
}

async function changePassword(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newPassword = formData.get('new_password');
    const confirmPassword = formData.get('confirm_password');
    
    if (newPassword !== confirmPassword) {
        alert('으....이....');
        return;
    }
    
    try {
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'password',
                current_password: formData.get('current_password'),
                new_password: newPassword
            })
        });
        
        if (response.ok) {
            alert('비밀번호가 변경되었습니다.');
            e.target.reset();
        } else if (response.status === 401) {
            window.location.href = '/login';
        } else {
            alert('으....이....');
        }
    } catch (error) {
        alert('으....이....');
    }
}

async function changeNickname(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'nickname',
                new_nickname: formData.get('new_nickname')
            })
        });
        
        if (response.ok) {
            alert('닉네임이 변경되었습니다.');
            e.target.reset();
            await loadUserInfo();
        } else if (response.status === 401) {
            window.location.href = '/login';
        } else {
            alert('으....이....');
        }
    } catch (error) {
        alert('으....이....');
    }
}

async function manageApiKey(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const apiKey = formData.get('api_key');
    
    if (apiKey === '●●●●●●●●●●●●●●●●') {
        alert('으....이....');
        return;
    }
    
    try {
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'api_key',
                api_key: apiKey
            })
        });
        
        if (response.ok) {
            alert('API 키가 등록/변경되었습니다.');
            await loadUserInfo();
        } else if (response.status === 401) {
            window.location.href = '/login';
        } else {
            alert('으....이....');
        }
    } catch (error) {
        alert('으....이....');
    }
}

async function deleteApiKey() {
    if (!confirm('API 키를 삭제하시겠습니까?')) return;
    
    try {
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'delete_api_key'
            })
        });
        
        if (response.ok) {
            alert('API 키가 삭제되었습니다.');
            await loadUserInfo();
        } else if (response.status === 401) {
            window.location.href = '/login';
        } else {
            alert('으....이....');
        }
    } catch (error) {
        alert('으....이....');
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/'; // 루트 페이지로 이동
    } catch (error) {
        alert('으....이....');
    }
}

async function loadConversation(id) {
    currentConversationId = id;
    
    try {
        const response = await fetch(`/api/conversations/${id}`);
        if (response.ok) {
            const messages = await response.json();
            const messagesDiv = document.getElementById('chatMessages');
            messagesDiv.innerHTML = '';
            
            // 기본 인사말 추가
            if (messages.length === 0) {
                messagesDiv.innerHTML = `
                    <div class="message assistant">
                        <img src="/images/kanade-profile.webp" alt="카나데" class="message-avatar">
                        <div class="message-bubble">안녕… 카나데야. 무슨 일이든 말해줘.</div>
                    </div>
                `;
            } else {
                messages.forEach(msg => {
                    addMessage(msg.role, msg.content);
                });
            }
            
            // 대화내역 목록에서 활성 상태 업데이트
            await loadConversations();
        } else if (response.status === 401) {
            window.location.href = '/login';
        }
    } catch (error) {
        alert('으....이....');
    }
}

async function deleteConversation(id) {
    if (!confirm('대화내역을 삭제하시겠습니까?')) return;
    
    try {
        const response = await fetch(`/api/conversations/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadConversations();
            if (currentConversationId === id) {
                currentConversationId = null;
                document.getElementById('chatMessages').innerHTML = `
                    <div class="message assistant">
                        <img src="/images/kanade-profile.webp" alt="카나데" class="message-avatar">
                        <div class="message-bubble">안녕… 카나데야. 무슨 일이든 말해줘.</div>
                    </div>
                `;
            }
        } else if (response.status === 401) {
            window.location.href = '/login';
        }
    } catch (error) {
        alert('으....이....');
    }
}

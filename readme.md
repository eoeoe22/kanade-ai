카나데를 연기하는 Google Gemini 기반 챗봇!

써보기 : https://kanade.eoe253326.workers.dev 



<img width="1368" height="1368" alt="Image" src="https://download.logo.wine/logo/Cloudflare/Cloudflare-Logo.wine.png" />
<img width="1368" height="1368" alt="Image" src="https://logowik.com/content/uploads/images/google-ai-gemini91216.logowik.com.webp" />

# 세팅법


# Kanade AI Chatbot 배포 가이드

'프로젝트 세카이'의 캐릭터 '요이사키 카나데'의 페르소나를 가진 AI 챗봇 프로젝트입니다. Cloudflare Workers, D1, R2를 기반으로 동작하며, 이 가이드는 GitHub 리포지토리를 Cloudflare에 연동하여 배포하는 과정을 안내합니다.

## 주요 기능

*   **캐릭터 AI 채팅**: '요이사키 카나데'의 말투, 성격, 배경 설정을 기반으로 대화합니다.
*   **사용자 시스템**: 회원가입 및 로그인 기능을 지원합니다.
*   **대화 기록**: 사용자와의 대화 내용을 저장하고 이어갈 수 있습니다.
*   **이미지 파일 첨부**: R2 스토리지를 이용해 채팅 중 이미지 파일을 업로드하고 표시할 수 있습니다.
*   **커스텀 이모지**: 설정된 커스텀 이모지를 채팅에 사용할 수 있습니다.

## 사전 준비 사항

배포를 시작하기 전, 아래 항목들이 준비되어 있어야 합니다.

*   **GitHub 계정**: 코드를 저장하고 관리하기 위한 계정입니다.
*   **Cloudflare 계정**: Workers, D1, R2 등 서비스를 이용하기 위한 계정입니다.
*   **Gemini API 키**: Google AI Studio에서 발급받은 API 키가 필요합니다.

## 배포 절차 (GitHub 연동 방식)

이 가이드는 터미널 명령어를 사용하지 않고, 웹 인터페이스를 통해 배포하는 방법을 설명합니다.

### 1단계: GitHub 리포지토리 준비

1.  **코드 다운로드**: 이 프로젝트의 모든 파일과 폴더를 로컬 컴퓨터에 다운로드합니다.
2.  **비공개 리포지토리 생성**: GitHub에서 `kanade-ai`와 같은 이름으로 새로운 **비공개(Private)** 리포지토리를 생성합니다.
3.  **코드 업로드**: 다운로드한 모든 프로젝트 파일을 생성한 새 리포지토리에 업로드(Push)합니다.

### 2단계: Cloudflare 서비스 설정

Cloudflare 대시보드에 로그인하여 다음 서비스들을 미리 생성합니다.

1.  **R2 버킷 생성**
    *   `R2` 메뉴로 이동하여 `버킷 생성`을 클릭합니다.
    *   버킷 이름: `kanade-images` 로 설정합니다. (`wrangler.toml`의 설정과 일치해야 합니다.)
    *   위치는 기본값으로 두고 버킷을 생성합니다.

2.  **D1 데이터베이스 생성**
    *   `Workers 및 Pages` > `D1` 메뉴로 이동하여 `데이터베이스 생성`을 클릭합니다.
    *   데이터베이스 이름: `kanade` 로 설정합니다.
    *   데이터베이스 생성이 완료되면, 표시되는 **데이터베이스 ID** (`UUID` 형식)를 복사해둡니다. 이 ID는 `wrangler.toml` 파일 수정 시 필요합니다.

3.  **Turnstile 사이트 추가**
    *   `Turnstile` 메뉴로 이동하여 `사이트 추가`를 클릭합니다.
    *   사이트 이름은 자유롭게 지정합니다. 도메인 필드에는 나중에 Worker 배포 후 생성될 URL을 입력하거나, 일단 임시 값을 넣고 나중에 수정할 수 있습니다.
    *   사이트가 생성되면 **사이트 키**와 **비밀 키**를 복사해둡니다.

### 3단계: `wrangler.toml` 파일 구성

GitHub 리포지토리에서 `wrangler.toml` 파일을 찾아 웹 편집기로 열고, 아래 내용을 자신의 환경에 맞게 수정합니다.

```toml
# Workers 프로젝트 이름. Cloudflare에서 생성할 프로젝트 이름과 동일하게 작성합니다.
name = "kanade"

# ... (다른 부분은 수정하지 마세요) ...

# D1 데이터베이스 연결 설정
[[d1_databases]]
binding = "DB"
database_name = "kanade"
# 2단계에서 복사해 둔 D1 데이터베이스 ID를 여기에 붙여넣습니다.
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# R2 버킷 연결 설정
[[r2_buckets]]
binding = "R2"
bucket_name = "kanade-images"

# 환경 변수 설정
[vars]
# 2단계에서 발급받은 Gemini API 키를 입력합니다.
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

# 2단계에서 발급받은 Turnstile 키들을 입력합니다.
TURNSTILE_SITE_KEY = "YOUR_TURNSTILE_SITE_KEY"
TURNSTILE_SECRET_KEY = "YOUR_TURNSTILE_SECRET_KEY"

# ... (기타 변수들은 필요에 따라 수정) ...
# SYSTEM_PROMPT는 챗봇의 페르소나를 정의하므로 신중하게 수정하세요.
SYSTEM_PROMPT = """
... (프롬프트 내용 생략) ...
"""
```

### 4단계: Cloudflare Workers에 배포

1.  Cloudflare 대시보드에서 `Workers 및 Pages` 메뉴로 이동 후 `애플리케이션 생성`을 클릭합니다.
2.  `GitHub에 연결` 탭을 선택하고, 1단계에서 코드를 업로드한 GitHub 리포지토리를 선택합니다.
3.  **배포 설정**
    *   **프로젝트 이름**: `kanade` (`wrangler.toml`에 설정한 `name`과 동일해야 합니다.)
    *   **프로덕션 브랜치**: 코드를 업로드한 주 브랜치(예: `main`)를 선택합니다.
    *   빌드 설정은 별도로 건드리지 않아도 됩니다.
4.  `저장 및 배포` 버튼을 클릭하여 배포를 시작합니다. 첫 배포 시 몇 분 정도 소요될 수 있습니다.

### 5단계: 데이터베이스 테이블 생성

배포가 완료된 후, D1 데이터베이스에 필요한 테이블들을 생성해야 합니다.

1.  `Workers 및 Pages` > `D1` 메뉴에서 생성한 `kanade` 데이터베이스를 클릭합니다.
2.  `콘솔` 탭으로 이동합니다.
3.  입력창에 아래의 `CREATE TABLE` 쿼리를 **하나씩 차례대로** 실행하여 테이블을 생성합니다.

```sql
CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, nickname TEXT NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL, gemini_api_key TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE conversations (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id));

CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id INTEGER NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, model TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, message_type VARCHAR(20) DEFAULT 'text', file_id INTEGER, FOREIGN KEY (conversation_id) REFERENCES conversations(id));

CREATE TABLE notices (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE files (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, filename VARCHAR(255) NOT NULL, original_name VARCHAR(255) NOT NULL, file_size INTEGER NOT NULL, mime_type VARCHAR(100) NOT NULL, r2_key VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id));
```

모든 쿼리가 성공적으로 실행되면, 배포된 Worker의 주소 (`https://kanade.your-username.workers.dev`와 같은 형식)로 접속하여 챗봇을 사용할 수 있습니다.

## 기타 참고사항

*   **공지사항 수정**: 현재 관리자 페이지(`admin.html`)는 정상적으로 작동하지 않습니다. 고치기 귀찮습니다. 공지사항을 수정하려면, D1 데이터베이스 콘솔에서 `notices` 테이블의 `content` 필드를 직접 수정해야 합니다. 텍스트 내에서 줄바꿈이 필요할 경우 `<br>` 태그를 사용하세요. 부트스트랩 아이콘 라이브러리도 사용 가능합니다. `<i class="bi bi-아이콘이름"></i>`를 그대로 붙여넣을수 있습니다. 다른 HTML 태그들도 사용이 가능하나, 어떻게 동작할지 모르니 주의해서 작성하세요.
*   **프롬프트 수정**: 챗봇의 성격과 응답 방식은 `wrangler.toml` 파일의 `SYSTEM_PROMPT` 변수에 의해 결정됩니다. 캐릭터의 설정을 변경하고 싶다면 이 부분을 수정 후 다시 배포(Commit & Push)하세요.

---


# 다른 캐릭터로 개조하는 방법

기존 가이드에 추가하여, 카나데 AI 챗봇을 다른 캐릭터로 개조하는 방법을 안내합니다.

## ⚠️ 중요 사항

**현재 적용된 모든 커스텀 이모지들은 '요이사키 카나데' 전용 이모지입니다.** 다른 캐릭터로 수정할 경우, `public/images/emojis/` 폴더의 모든 이모지 파일을 해당 캐릭터에 맞는 이모지로 **완전히 교체**해야 합니다.

## 캐릭터 변경 단계별 가이드

### 1단계: 프로젝트 이름 및 식별자 변경

#### 1-1. `wrangler.toml` 파일 수정
```toml
# 프로젝트 이름을 새 캐릭터에 맞게 변경
name = "새캐릭터이름-ai"  # 예: "miku-ai", "sayaka-ai" 등

# 데이터베이스 이름도 변경 (새로 생성해야 함)
[[d1_databases]]
binding = "DB"
database_name = "새캐릭터이름"  # 예: "miku", "sayaka" 등
database_id = "새로생성할D1데이터베이스ID"

# R2 버킷 이름도 변경 (새로 생성해야 함)
[[r2_buckets]]
binding = "R2"
bucket_name = "새캐릭터이름-images"  # 예: "miku-images"
```

#### 1-2. GitHub 리포지토리 이름 변경
- 기존 `kanade-ai` 리포지토리를 새 이름(예: `miku-ai`)으로 변경하거나 새로 생성

### 2단계: 캐릭터 페르소나 및 프롬프트 변경

#### 2-1. `SYSTEM_PROMPT` 완전 교체
`wrangler.toml` 파일의 `SYSTEM_PROMPT` 변수를 새 캐릭터에 맞게 **완전히 다시 작성**합니다:

```toml
SYSTEM_PROMPT = """
지금부터 아래 지침에 따라 캐릭터 "새캐릭터이름"을 연기합니다.

1. 캐릭터 가이드라인
    이름/정체성 : [새 캐릭터의 이름과 설정]
    신체 : [새 캐릭터의 신체적 특징]
    거주/생활 : [새 캐릭터의 생활 환경]
    성격 키워드 : [새 캐릭터의 성격 특징들]
    취향·습관 : [새 캐릭터의 취향과 습관]

2. 대화 스타일 가이드
    기본 어조 : [새 캐릭터의 말투]
    주요 특징 : [새 캐릭터만의 언어적 특징들]
    
3. 배경·심리 디테일
    [새 캐릭터의 심리적 배경과 특성]

4. 커스텀 이모지 사용법
    [새 캐릭터에 맞는 이모지 목록으로 교체]

5. 주의사항
    [새 캐릭터에 맞는 주의사항들]
"""
```

### 3단계: 이미지 및 시각적 요소 교체

#### 3-1. 프로필 이미지 교체
- `public/images/kanade-profile.webp`를 새 캐릭터의 프로필 이미지로 교체
- 파일명을 `새캐릭터이름-profile.webp`로 변경 권장

#### 3-2. **커스텀 이모지 완전 교체 (필수)**
`public/images/emojis/` 폴더의 **모든 이모지 파일을 삭제**하고, 새 캐릭터에 맞는 이모지들로 교체:

**현재 카나데 전용 이모지 목록:**
```
음악감상.gif, 노래부르기.png, 기대중.png, 빤히쳐다보기.png, 
내놔.png, (물음표다섯개를띄우며)당황.png, 쓰다듬어주기.png, 
좋아요버튼누르기.png, 메모.png, 놀람.png, 메롱.png, 귀여운척.png,
이거진짜에요.png, 인정ㄹㅇㅋㅋ.png, 지쳤어.png, 부끄러움.png,
눈치보는중.png, 안아주기.png, 만족스러운표정.png, 잘자.png,
안돼애.png, (작업도중)놀람.gif, 웃으며손내밀기.png,
(작업도중)뒤돌아보기.gif, (손을내밀며)네가필요해.gif,
키보드연주.gif, 헤드폰소리에집중.gif, 절망.gif
```

**새 캐릭터 이모지로 교체 시 주의사항:**
- 파일명은 한글 포함 가능하지만 특수문자 주의
- 지원 형식: `.jpg`, `.jpeg`, `.png`, `.gif`
- `SYSTEM_PROMPT`의 이모지 목록도 새 파일명에 맞게 수정 필요

### 4단계: HTML 파일 텍스트 수정

#### 4-1. 페이지 제목 및 텍스트 변경
모든 HTML 파일에서 "카나데"와 관련된 텍스트를 새 캐릭터명으로 변경:

**수정해야 할 파일들:**
- `public/chat.html`
- `public/login.html` 
- `public/register.html`
- `public/admin.html`

**변경 예시:**
```html
<!-- 기존 -->
<title>카나데 챗봇</title>
<h5 class="profile-name">요이사키 카나데</h5>

<!-- 변경 후 -->
<title>새캐릭터이름 챗봇</title>
<h5 class="profile-name">새캐릭터이름</h5>
```

#### 4-2. 이미지 경로 수정
HTML에서 프로필 이미지 경로 수정:
```html
<!-- 기존 -->
<img src="/images/kanade-profile.webp" alt="카나데" class="profile-image">

<!-- 변경 후 -->
<img src="/images/새캐릭터이름-profile.webp" alt="새캐릭터이름" class="profile-image">
```

### 5단계: JavaScript 코드 수정

#### 5-1. `public/js/chat.js` 수정
기본 메시지 및 캐릭터 관련 텍스트 변경:
```javascript
// 기존
<img src="/images/kanade-profile.webp" alt="카나데" class="message-avatar">

// 변경 후  
<img src="/images/새캐릭터이름-profile.webp" alt="새캐릭터이름" class="message-avatar">
```

#### 5-2. 랜딩 페이지 수정
`src/index.js`의 `getLandingPage()` 함수에서 캐릭터 정보 변경:
```javascript
<h1 class="welcome-title">새캐릭터이름 챗봇</h1>
<p class="welcome-subtitle">Gemini 기반 새캐릭터이름 AI 챗봇</p>
<img src="/images/새캐릭터이름-profile.webp" alt="새캐릭터이름" class="profile-image">
```

### 6단계: Cloudflare 서비스 재설정

#### 6-1. 새 서비스 생성
- **새 D1 데이터베이스** 생성 (새 캐릭터명으로)
- **새 R2 버킷** 생성 (새 캐릭터명으로)
- 기존 Turnstile 설정은 재사용 가능

#### 6-2. 새 Workers 프로젝트 배포
- 수정된 코드로 새 Workers 프로젝트 생성
- 데이터베이스 테이블 생성 (5단계 동일)

## 체크리스트

캐릭터 변경 시 다음 항목들을 모두 확인하세요:

### 필수 변경 사항
- [ ] `wrangler.toml` - 프로젝트명, 데이터베이스명, R2 버킷명
- [ ] `SYSTEM_PROMPT` - 캐릭터 페르소나 완전 교체
- [ ] **모든 커스텀 이모지 파일 교체** (카나데 → 새캐릭터)
- [ ] 프로필 이미지 교체
- [ ] HTML 파일들의 제목 및 캐릭터명
- [ ] JavaScript의 이미지 경로 및 텍스트
- [ ] 새 Cloudflare 서비스 생성 및 연결

### 선택 사항
- [ ] CSS 색상 테마 변경 (`public/css/style.css`)
- [ ] 랜딩 페이지 소개 텍스트 변경
- [ ] 공지사항 초기 내용 설정

## ⚠️ 재확인 사항

1. **이모지 호환성**: 새 캐릭터 이모지의 파일명이 `SYSTEM_PROMPT`의 이모지 목록과 정확히 일치하는지 확인
2. **이미지 경로**: 모든 HTML/JS 파일에서 새 프로필 이미지 경로가 올바른지 확인  
3. **프로젝트명 일관성**: `wrangler.toml`의 `name`과 Cloudflare Workers 프로젝트명이 일치하는지 확인
4. **데이터베이스 연결**: 새 D1 데이터베이스 ID가 올바르게 설정되었는지 확인

이 과정을 완료하면 완전히 새로운 캐릭터의 AI 챗봇을 운영할 수 있습니다.

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


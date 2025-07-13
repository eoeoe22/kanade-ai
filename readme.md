<img width="1368" height="1368" alt="Image" src="https://download.logo.wine/logo/Cloudflare/Cloudflare-Logo.wine.png" />
<img width="1368" height="1368" alt="Image" src="https://logowik.com/content/uploads/images/google-ai-gemini91216.logowik.com.webp" />

# 세팅법
---

## 1. 준비하기

우선, 감사의 마음을 가득 담아서 클라우드플레어와 구글의 본사가 있는 미국 캘리포니아로 큰절을 한번 한다.

필요한 준비물 목록

- **구글 계정** (Gemini API 키 발급용)
- **깃허브 계정** (소스코드 저장용)
- **클라우드플레어 계정** (배포 및 관리용)
- **메모장** (설정값 기록용)

---

## 2. Cloudflare와 GitHub 가입

1. **Cloudflare(클라우드플레어) 계정 만들기**  
   - [Cloudflare 회원가입 페이지](https://dash.cloudflare.com/sign-up)에서 계정을 만든다.
2. **GitHub(깃허브) 계정 만들기**  
   - [GitHub 회원가입 페이지](https://github.com/signup)에서 계정을 만든다.

---

## 3. 소스코드 다운로드 및 압축 해제

- **소스코드 다운로드**
  - [카나데 챗봇 깃허브 페이지](https://github.com/eoeoe22/kanade-ai-chatbot)에서 "Code" 버튼 → "Download ZIP" 클릭한다.
  - **다운로드 버튼 찾기 귀찮으면**  
    - [이 주소](https://github.com/eoeoe22/kanade-ai-chatbot/archive/refs/heads/main.zip)로 바로 다운받을 수 있다.
- **압축 해제**
  - 다운받은 파일을 원하는 폴더에 압축을 푼다.

---

## 4. GitHub에 비공개 레포지토리 생성 및 업로드

1. **GitHub에 새 레포지토리 만들기**
   - 깃허브 메인 → "New" 버튼 → "Repository" 클릭
   - 레포지토리 이름 입력 (예: `kanade-ai-chatbot`)
   - **비공개(Private)**로 설정
   - "Create repository" 클릭

2. **소스코드 업로드**
   - 압축 해제한 폴더의 모든 파일을 새로 만든 레포지토리에 업로드한다.
   - (Git 명령어를 모르면, "Upload files" 버튼을 활용한다.)

---

## 5. Gemini API 키 발급

1. **Google AI Studio 접속**
   - [Google AI Studio](https://aistudio.google.com)에 접속한다.
2. **API 키 발급**
   - 로그인 후, "Get API Key" 메뉴에서 새 API 키를 발급받는다.
   - 발급받은 키를 메모장에 복사해둔다.

---

## 6. wrangler.toml 파일 수정

- **압축 해제한 폴더에서 `wrangler.toml` 파일을 찾는다.**
- **아래 내용을 참고해서 알맞게 수정한다.**
  - **주석(#) 부분은 참고용이니, 실제로는 주석을 지우지 않아도 된다.**

---

## 7. Cloudflare Workers 프로젝트 생성

1. **Cloudflare 대시보드 접속**
   - [Cloudflare Workers 대시보드](https://dash.cloudflare.com/?to=/:account/workers)로 이동한다.
2. **프로젝트 만들기**
   - "Create application" → "Workers" 클릭
   - "Deploy with GitHub" 선택
   - 앞서 만든 비공개 레포지토리를 연결한다.
   - "Deploy" 클릭

---

## 8. 프로젝트 주소 확인

- **배포가 완료되면, 프로젝트 주소가 생성된다.**
  - 예시: `kanade.깃허브아이디.workers.dev`
- **이 주소를 메모장에 복사해둔다.**

---

## 9. Cloudflare Turnstile 설정

1. **Cloudflare Turnstile 접속**
   - [Cloudflare Turnstile 대시보드](https://dash.cloudflare.com/?to=/:account/turnstile)로 이동한다.
2. **사이트 추가**
   - "Add Site" 클릭
   - 앞서 확인한 프로젝트 주소를 입력한다.
   - "Create" 클릭
3. **키 발급**
   - 생성된 사이트키와 시크릿키를 복사한다.
4. **wrangler.toml에 키 입력**
   - `TURNSTILE_SITE_KEY`와 `TURNSTILE_SECRET_KEY`에 복사한 키를 입력한다.
   - 파일을 저장하고, GitHub에 다시 업로드한다.

---

## 10. D1 데이터베이스 연결

1. **Cloudflare Workers 대시보드에서 D1 데이터베이스 추가**
   - "Workers" → "D1" 탭에서 새 데이터베이스 생성
   - 데이터베이스 이름과 ID를 확인
2. **wrangler.toml에 입력**
   - `database_name`과 `database_id`를 알맞게 입력한다.
   - 파일을 저장하고, GitHub에 다시 업로드한다.

## 11. (선택) 다른 캐릭터로 개조하기

- **public/images 폴더의 `kanade-profile.webp` 파일을 원하는 캐릭터 이미지로 교체한다.**
- **src/gemini.js 파일의 시스템 프롬프트를 원하는 캐릭터 정보로 수정한다.**
- **html, js 파일의 내용도 필요하면 수정한다.**

---

## 12. 배포 완료 및 접속

- **모든 설정이 끝나면, Cloudflare Workers에서 자동으로 배포가 완료된다.**
- **프로젝트 주소로 접속해서 챗봇이 잘 동작하는지 확인한다.**
- **로그인, 회원가입, 채팅 등 모든 기능이 정상적으로 동작해야 한다.**

---

## 13. 관리자 비밀번호 및 공지사항

- **관리자 비밀번호는 wrangler.toml의 `ADMIN_PASSWORD`에 적힌 값이다.**
- **공지사항은 DB의 `notices` 테이블에서 직접 수정한다.**
  - 줄바꿈은 `<br>` 태그를 사용한다.

---

## 14. 기타 팁

- **Gemini API 키는 [Google AI Studio](https://aistudio.google.com)에서 무료로 발급받을 수 있다.**
- **Turnstile 키를 꼭 입력해야 로그인/회원가입이 정상적으로 동작한다.**
- **D1 데이터베이스 연결도 꼭 확인한다.**
- **wrangler.toml 파일은 꼭 저장 후 GitHub에 다시 업로드한다.**
- **문제가 생기면 Cloudflare Workers 로그를 확인한다.**

---


---
categories: [Chrome Extension]
title: Chrome 확장 프로그램에 Google 로그인 추가하기
description: Manifest V3에서 Chrome Identity로 Google 토큰을 받고 Firebase Auth에 로그인하는 최소 예제입니다.
created: 2025-11-21
tags: [Chrome Extension|blue, Firebase|orange, Google 로그인|blue, MV3|teal]
platform: Chrome Extension MV3
readingTime: 5
---

Chrome 확장 프로그램에서 Google 로그인만 필요하다면 `chrome.identity.getAuthToken()`으로 Google 액세스 토큰을 받을 수 있습니다. 이 토큰을 Firebase의 `signInWithCredential()`에 넘기면 확장 프로그램에 Firebase 로그인 상태가 만들어집니다.

예제는 Google Chrome 105 이상을 기준으로 합니다. 확장 아이콘을 누르면 로그인 페이지가 새 탭에서 열립니다. 툴바 팝업 대신 탭을 사용하므로 인증 창으로 포커스가 이동해도 로그인 페이지가 닫히지 않습니다.

## 1. 프로젝트와 매니페스트 준비

Node.js와 npm을 설치한 환경에서 실행합니다. Firebase SDK는 Chrome이 확장 패키지 안에서 읽을 수 있도록 esbuild로 번들링합니다.

```bash
mkdir mv3-firebase-login
cd mv3-firebase-login
npm init -y
npm install firebase@12
npm install -D esbuild
mkdir extension
```

`extension/manifest.json`에 아래 내용을 넣습니다. `oauth2.client_id`는 확장 ID를 확인한 뒤 실제 값으로 바꿉니다.

```json
{
  "manifest_version": 3,
  "name": "Firebase Google 로그인 예제",
  "version": "1.0.0",
  "minimum_chrome_version": "105",
  "permissions": ["identity"],
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  },
  "action": { "default_title": "로그인 페이지 열기" },
  "background": { "service_worker": "background.js" }
}
```

`extension/background.js`는 탭만 엽니다. 로그인 로직은 열린 탭에서 실행합니다.

```js
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("login.html") });
});
```

## 2. Firebase와 Google OAuth 설정

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 웹 앱을 등록하고 SDK 구성 값을 복사합니다. Authentication의 로그인 제공업체에서 Google을 활성화합니다.
2. `chrome://extensions`에서 개발자 모드를 켜고 **압축해제된 확장 프로그램을 로드합니다**를 눌러 `extension` 폴더를 선택합니다. 목록에 표시되는 확장 ID를 복사합니다. 아직 로그인 페이지는 열지 않습니다.
3. 같은 프로젝트의 [Google Auth Platform → Clients](https://console.cloud.google.com/auth/clients)에서 유형이 **Chrome Extension**인 OAuth 클라이언트를 만들고, 복사한 ID를 Item ID에 입력합니다. 발급된 클라이언트 ID로 매니페스트의 `oauth2.client_id`를 교체합니다.

OAuth 앱을 외부 사용자용 테스트 상태로 운영 중이라면, 테스트에 사용할 Google 계정을 Audience의 테스트 사용자로 등록합니다. 개발 폴더를 옮기거나 스토어에 등록한 뒤 확장 ID가 달라지면 기존 OAuth 설정과 맞지 않을 수 있습니다. 스토어에서 할당한 ID를 개발 중에도 쓰려면 [Chrome의 확장 ID 고정 방법](https://developer.chrome.com/docs/extensions/how-to/integrate/oauth#keep-consistent-id)을 참고합니다.

## 3. 로그인 페이지 만들기

`extension/login.html`을 작성합니다. 로그인 중에는 버튼을 비활성화하고, 결과나 오류는 페이지에 표시합니다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <title>Google 로그인</title>
  </head>
  <body>
    <h1>Google 로그인</h1>
    <button id="auth-button" type="button" disabled>Google로 로그인</button>
    <p id="status" role="status">로그인 상태를 확인하는 중입니다.</p>
    <script src="login.bundle.js" defer></script>
  </body>
</html>
```

프로젝트 루트에 `login.js`를 만듭니다. `firebaseConfig`는 Firebase 콘솔에서 복사한 웹 앱 구성으로 교체합니다. 확장 프로그램에서는 `firebase/auth/web-extension`을 사용합니다.

```js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth/web-extension";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID",
};

const auth = getAuth(initializeApp(firebaseConfig));
const button = document.querySelector("#auth-button");
const status = document.querySelector("#status");

onAuthStateChanged(auth, (user) => {
  button.disabled = false;
  button.textContent = user ? "로그아웃" : "Google로 로그인";
  status.textContent = user
    ? `로그인됨: ${user.displayName || user.email || user.uid}`
    : "로그인되지 않았습니다.";
});

button.addEventListener("click", async () => {
  button.disabled = true;
  try {
    if (auth.currentUser) {
      await signOut(auth);
      return;
    }

    const { token } = await chrome.identity.getAuthToken({ interactive: true });
    if (!token) throw new Error("Google 액세스 토큰을 받지 못했습니다.");

    const credential = GoogleAuthProvider.credential(null, token);
    await signInWithCredential(auth, credential);
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    button.disabled = false;
  }
});
```

`getAuthToken()`은 Chrome 프로필의 Google 계정으로 토큰을 요청합니다. Firebase의 `credential()`에는 첫 번째 인자로 ID 토큰, 두 번째 인자로 액세스 토큰을 전달합니다. 이 예제에서 받은 값은 액세스 토큰이므로 첫 번째 인자는 `null`입니다.

## 4. 빌드하고 로그인 확인하기

프로젝트 루트에서 실행합니다.

```bash
npx esbuild login.js --bundle --platform=browser --outfile=extension/login.bundle.js
```

1. `chrome://extensions`에서 확장 프로그램을 새로고침한 뒤 툴바의 확장 아이콘을 클릭합니다.
2. **Google로 로그인**을 누릅니다. 로그인이 끝나면 페이지에 사용자 이름이나 이메일이 표시되고, Firebase 콘솔의 Authentication 사용자 목록에서도 확인할 수 있습니다.
3. 페이지를 새로고침해도 로그인 상태가 유지되는지 확인합니다. **로그아웃**을 누르면 Firebase 세션이 종료됩니다. Chrome 자체의 Google 로그인이나 토큰 캐시는 지우지 않으므로 다시 로그인할 때 동의 화면이 생략될 수 있습니다.

토큰을 받는 단계에서 실패하면 Chrome 프로필의 로그인 상태, OAuth 클라이언트 유형, 등록된 확장 ID부터 확인합니다. 토큰을 받았는데 Firebase 로그인에서 실패하면 웹 앱 구성과 Google 제공업체 설정을 확인합니다.

이 방식에는 별도 호스팅 페이지가 필요하지 않습니다. 웹앱의 `signInWithPopup()`을 그대로 사용해야 한다면 [Firebase의 Offscreen Document 안내](https://firebase.google.com/docs/auth/web/chrome-extension#use_offscreen_documents)를 참고합니다.

공식 문서: [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/api/identity#method-getAuthToken), [Chrome 확장 프로그램의 OAuth 설정](https://developer.chrome.com/docs/extensions/how-to/integrate/oauth), [Firebase 확장 프로그램 인증](https://firebase.google.com/docs/auth/web/chrome-extension)

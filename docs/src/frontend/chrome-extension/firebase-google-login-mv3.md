---
categories: [Chrome Extension]
title: Chrome Extension(MV3)에서 Firebase Google 로그인 구현하기 — React 연동 완벽 가이드
description: MV3에서 Firebase Google 로그인이 막히는 이유와 chrome.identity / Offscreen Document 두 가지 구현 방법을 React 환경 기준으로 정리합니다.
created: 2025-11-21
tags: [Chrome Extension|blue, Firebase|orange, Google 로그인|blue, MV3|teal, React|cyan]
platform: Chrome Extension MV3
readingTime: 10
---

# Chrome Extension(MV3)에서 Firebase Google 로그인 구현하기 — React 연동 완벽 가이드

크롬 확장 프로그램에 "구글로 로그인" 버튼 하나 붙이는 건 웹앱에선 5분이면 끝나는 일이다. `signInWithPopup` 한 줄이면 되니까. 그런데 Manifest V3(MV3) 확장 프로그램에서 똑같이 하면 콘솔에 빨간 에러만 잔뜩 뜨고 팝업은 열리지 않는다.

이 글에서는 MV3에서 왜 기존 방식이 막히는지, 그리고 실제로 동작하는 두 가지 구현 방법을 React 환경 기준으로 정리한다.

---

## 왜 MV3에서는 기존 방식이 안 되는가

MV3는 보안 모델이 크게 바뀌면서 세 가지 제약이 생겼다.

1. **백그라운드가 서비스 워커다.** MV2의 백그라운드 페이지와 달리 서비스 워커에는 `window`, `document`, DOM이 없다. 팝업을 띄우거나 iframe을 만드는 동작 자체가 불가능하다.
2. **원격 코드 실행이 금지된다.** `signInWithPopup`은 구글 로그인 페이지를 외부에서 불러와 실행한다. MV3의 CSP(Content Security Policy)는 확장 패키지 외부에서 코드를 로드하는 것을 차단한다.
3. **팝업 UI(action popup)는 수명이 짧다.** 사용자가 다른 곳을 클릭하면 팝업이 닫히면서 그 안의 로그인 흐름도 같이 사라진다.

결론적으로 웹앱용 `firebase/auth`를 그대로 쓰면 안 되고, **확장 환경 전용 진입점과 우회 전략**이 필요하다.

---

## 두 가지 구현 방법

MV3에서 Firebase Google 로그인을 붙이는 현실적인 방법은 크게 두 가지다.

| 구분 | 방법 1: `chrome.identity` | 방법 2: Offscreen Document |
| --- | --- | --- |
| 핵심 API | `chrome.identity.getAuthToken` / `launchWebAuthFlow` | `chrome.offscreen` + 호스팅된 iframe |
| 외부 호스팅 페이지 | 불필요 | **필요** (별도 웹페이지 배포) |
| 구현 난이도 | 낮음 | 높음 |
| 브라우저 호환 | `getAuthToken`은 크롬 전용 / `launchWebAuthFlow`는 크로미엄 계열 | 크로미엄 계열 전반 |
| 얻는 결과 | 토큰 → `signInWithCredential` | 완전한 Firebase 인증 상태 |
| 공식 권장 여부 | 간편하지만 일부 비공식 | Firebase 공식 문서 방식 |

처음 붙이는 거라면 **방법 1**로 시작하길 권한다. 더 풍부한 Firebase 기능(다양한 프로바이더, 리다이렉트 등)이 필요해지면 **방법 2**로 확장하면 된다.

> **핵심 전제:** 확장 프로그램 쪽 코드(서비스 워커, 팝업, 콘텐츠 스크립트)에서는 반드시 `firebase/auth/web-extension` 진입점을 사용한다. 이 진입점은 Web SDK **v10.8.0 이상**에서 지원되며, 확장 환경에 맞게 인증 상태 저장(persistence)을 처리해 준다.

---

## 사전 준비

### 1. Firebase 프로젝트 설정

Firebase 콘솔에서 프로젝트를 만들고 **Authentication → Sign-in method → Google**을 활성화한다.

### 2. 승인된 도메인에 확장 ID 추가

Google 같은 페더레이션 로그인을 쓰려면 확장 프로그램 ID를 승인된 도메인 목록에 넣어야 한다.

- Firebase 콘솔 → **Authentication → Settings → Authorized domains**
- 다음 형식으로 추가:

```
chrome-extension://여러분의_확장_ID
```

### 3. 패키지 설치

```bash
npm install firebase
```

### 4. manifest.json 기본 골격

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html"
  },
  "permissions": ["identity", "storage"],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

페더레이션 로그인을 위해 CSP 허용 목록에 다음 도메인을 추가해야 하는 경우가 있다(특히 Offscreen 방식).

```
https://apis.google.com
https://www.gstatic.com
https://www.googleapis.com
https://securetoken.googleapis.com
```

---

## Firebase 초기화 (공통)

확장 코드 전역에서 쓸 Firebase 인스턴스를 만든다. 진입점이 `firebase/auth/web-extension`이라는 점이 핵심이다.

```js
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/web-extension"; // ← 일반 firebase/auth 아님!

const firebaseConfig = {
  apiKey: "...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  appId: "...",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

---

## 방법 1: chrome.identity 방식 (간단·추천)

`chrome.identity` API로 구글 토큰을 직접 받아서 Firebase에 `signInWithCredential`로 전달하는 방식이다. 외부 페이지 호스팅이 필요 없어 가장 간단하다.

### 1-A. getAuthToken (크롬 전용, 가장 간단)

manifest에 OAuth 클라이언트를 명시한다. 이때 클라이언트 ID는 Google Cloud 콘솔에서 **Chrome 확장 프로그램용** OAuth 클라이언트로 발급받은 것이어야 한다.

```json
{
  "oauth2": {
    "client_id": "여러분의ID.apps.googleusercontent.com",
    "scopes": ["openid", "email", "profile"]
  },
  "key": "확장_고정ID용_공개키"
}
```

로그인 로직:

```js
// src/auth/signInWithChromeIdentity.js
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth/web-extension";
import { auth } from "../firebase";

export function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError ?? new Error("토큰을 받지 못했습니다"));
        return;
      }
      try {
        // 두 번째 인자가 access token
        const credential = GoogleAuthProvider.credential(null, token);
        const result = await signInWithCredential(auth, credential);
        resolve(result.user);
      } catch (e) {
        reject(e);
      }
    });
  });
}
```

`getAuthToken`은 구현이 가장 깔끔하지만 **크롬에서만** 동작한다. Edge 등 다른 크로미엄 브라우저까지 지원하려면 아래 방식을 쓴다.

### 1-B. launchWebAuthFlow (크로미엄 계열 호환)

`launchWebAuthFlow`는 OAuth 흐름을 직접 구성한다. 리다이렉트 URI는 `https://<확장ID>.chromiumapp.org/` 형태를 사용한다. 이 방식에선 ID 토큰을 받아서 넘긴다.

```js
// src/auth/signInWithWebAuthFlow.js
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth/web-extension";
import { auth } from "../firebase";

const CLIENT_ID = "여러분의ID.apps.googleusercontent.com";

export function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
    const nonce = crypto.randomUUID();

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", CLIENT_ID);
    authUrl.searchParams.set("response_type", "id_token");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("nonce", nonce);

    chrome.identity.launchWebAuthFlow(
      { url: authUrl.href, interactive: true },
      async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          reject(chrome.runtime.lastError ?? new Error("인증 취소됨"));
          return;
        }
        // 응답은 URL 해시(#)에 담겨 돌아온다
        const params = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
        const idToken = params.get("id_token");

        try {
          const credential = GoogleAuthProvider.credential(idToken);
          const result = await signInWithCredential(auth, credential);
          resolve(result.user);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}
```

> Google Cloud 콘솔에서 **웹 애플리케이션** 유형 OAuth 클라이언트를 만들고, 승인된 리디렉션 URI에 `https://<확장ID>.chromiumapp.org/`를 등록해야 한다.

---

## 방법 2: Offscreen Document 방식 (공식 권장)

Firebase 공식 문서가 안내하는 방식이다. 서비스 워커에 DOM이 없으니, **오프스크린 문서** 안에 iframe을 띄우고 그 iframe에서 일반 웹앱처럼 `signInWithPopup`을 실행한 뒤 결과를 `postMessage`로 다시 확장 쪽에 전달한다.

구조는 다음과 같다.

```
서비스 워커 → offscreen.html(프록시) → iframe(호스팅된 웹페이지에서 signInWithPopup)
            ←──────── 결과를 postMessage로 역방향 전달 ────────
```

### 1단계: 호스팅용 웹페이지 만들기

웹에 공개적으로 접근 가능한 페이지가 필요하다(Firebase Hosting 등 아무 호스트나 가능).

```html
<!-- 호스팅 페이지: signInWithPopup.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>signInWithPopup</title>
    <script type="module" src="signInWithPopup.js"></script>
  </head>
  <body><h1>signInWithPopup</h1></body>
</html>
```

```js
// 호스팅 페이지: signInWithPopup.js
// ⚠️ 이 코드는 일반 웹페이지 컨텍스트라서 firebase/auth 를 쓴다 (web-extension 아님)
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import firebaseConfig from "./firebaseConfig.js";

initializeApp(firebaseConfig);
const auth = getAuth();
const PROVIDER = new GoogleAuthProvider();

// 부모 프레임(오프스크린 문서) 참조 → postMessage targetOrigin 으로 사용
const PARENT_FRAME = document.location.ancestorOrigins[0];

function sendResponse(result) {
  globalThis.parent.self.postMessage(JSON.stringify(result), PARENT_FRAME);
}

globalThis.addEventListener("message", function ({ data }) {
  if (data.initAuth) {
    signInWithPopup(auth, PROVIDER).then(sendResponse).catch(sendResponse);
  }
});
```

### 2단계: 확장 매니페스트에 offscreen 권한 추가

```json
{
  "permissions": ["offscreen", "storage"]
}
```

### 3단계: 확장 내 오프스크린 문서

```html
<!-- offscreen.html -->
<!DOCTYPE html>
<script src="./offscreen.js"></script>
```

```js
// offscreen.js — 호스팅 페이지와 확장 사이의 프록시
const _URL = "https://your-site.web.app/signInWithPopup.html"; // 1단계에서 배포한 주소
const iframe = document.createElement("iframe");
iframe.src = _URL;
document.documentElement.appendChild(iframe);

chrome.runtime.onMessage.addListener(handleChromeMessages);

function handleChromeMessages(message, sender, sendResponse) {
  if (message.target !== "offscreen") return false;

  function handleIframeMessage({ data }) {
    try {
      if (typeof data === "string" && data.startsWith("!_{")) {
        // Firebase 내부 메시지는 무시
        return;
      }
      const parsed = JSON.parse(data);
      globalThis.removeEventListener("message", handleIframeMessage);
      sendResponse(parsed);
    } catch (e) {
      console.error(`JSON parse 실패 - ${e.message}`);
    }
  }

  globalThis.addEventListener("message", handleIframeMessage, false);
  iframe.contentWindow.postMessage({ initAuth: true }, new URL(_URL).origin);
  return true; // 비동기 응답을 위해 필수
}
```

### 4단계: 서비스 워커에서 오프스크린 문서 생성·호출

```js
// background.js
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth/web-extension";
import { auth } from "./firebase";

const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";
let creating; // 동시 생성 방지용 프로미스

async function hasDocument() {
  const matchedClients = await clients.matchAll();
  return matchedClients.some(
    (c) => c.url === chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)
  );
}

async function setupOffscreenDocument(path) {
  if (await hasDocument()) return;
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
      justification: "Firebase 인증",
    });
    await creating;
    creating = null;
  }
}

async function closeOffscreenDocument() {
  if (await hasDocument()) await chrome.offscreen.closeDocument();
}

export async function firebaseAuth() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

  const response = await chrome.runtime.sendMessage({
    type: "firebase-auth",
    target: "offscreen",
  });

  await closeOffscreenDocument();

  if (response?.user) {
    // 오프스크린에서 받은 credential 로 서비스 워커 컨텍스트에서도 로그인 상태 동기화
    const credential = GoogleAuthProvider.credentialFromResult(response);
    if (credential) await signInWithCredential(auth, credential);
  }
  return response;
}
```

이 방식은 설정이 번거롭지만, Firebase 인증 상태를 온전히 활용할 수 있고 크로미엄 계열 브라우저에서 폭넓게 동작한다.

---

## React 연동: AuthContext + useAuth 훅

어떤 방식으로 로그인하든, React 쪽에서는 인증 상태를 전역에서 공유하는 패턴이 깔끔하다. `onAuthStateChanged`로 상태를 구독하고 Context로 내려준다.

```jsx
// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth/web-extension";
import { auth } from "../firebase";
import { signInWithGoogle } from "./signInWithChromeIdentity"; // 방법 1 기준

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = 로딩, null = 미로그인

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u && u.uid ? u : null);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("로그인 실패:", e);
      throw e;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

팝업 UI 컴포넌트:

```jsx
// src/popup/App.jsx
import { useAuth } from "../auth/AuthContext";

export default function App() {
  const { user, login, logout } = useAuth();

  if (user === undefined) return <p>로딩 중…</p>;

  if (user) {
    return (
      <div>
        <p>{user.displayName}님 환영합니다 👋</p>
        <button onClick={logout}>로그아웃</button>
      </div>
    );
  }

  return <button onClick={login}>Google로 로그인</button>;
}
```

엔트리에서 Provider로 감싸 준다.

```jsx
// src/popup/main.jsx
import { createRoot } from "react-dom/client";
import { AuthProvider } from "../auth/AuthContext";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

---

## 자주 만나는 에러와 해결법

**`auth/operation-not-supported-in-this-environment`**
일반 `firebase/auth`를 확장 코드에서 import했을 때 발생한다. 확장 쪽 코드는 반드시 `firebase/auth/web-extension`을 쓴다.

**`auth/unauthorized-domain`**
Firebase 콘솔의 승인된 도메인에 `chrome-extension://<확장ID>`를 추가하지 않은 경우다.

**`getAuthToken`이 토큰을 반환하지 않음**
manifest의 `oauth2.client_id`가 Chrome 확장 전용 OAuth 클라이언트가 아니거나, 확장 ID가 등록된 ID와 다를 때 발생한다. 개발 중 ID가 바뀌지 않도록 manifest에 `key`를 넣어 ID를 고정하자.

**팝업이 닫히면서 로그인이 끊김**
action popup은 수명이 짧다. 인증 흐름은 서비스 워커 또는 오프스크린 문서에서 처리하고, 팝업은 결과만 받아 표시하도록 분리한다.

**서비스 워커에서 `window is not defined`**
서비스 워커에는 DOM이 없다. 팝업/iframe이 필요한 동작은 오프스크린 문서로 옮긴다.

---

## 마무리

정리하면 선택 기준은 단순하다. 빠르게 붙이고 싶고 크롬만 지원해도 된다면 `chrome.identity.getAuthToken` 방식이 가장 간단하다. 크로미엄 계열 전반을 지원하면서도 외부 호스팅을 피하고 싶다면 `launchWebAuthFlow`가 좋은 절충안이다. Firebase의 다양한 프로바이더와 완전한 인증 상태가 필요하다면 공식 권장인 Offscreen Document 방식으로 간다.

어느 쪽이든 두 가지만 기억하면 된다. 확장 코드에서는 `firebase/auth/web-extension`을 쓰고, DOM이 필요한 작업은 서비스 워커 밖(오프스크린·팝업)으로 빼는 것. 이 두 원칙이 MV3 인증 구현의 핵심이다.

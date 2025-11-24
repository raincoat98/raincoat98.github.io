# Chrome Extension MV3에서 Google 로그인 구현기

— 스크립트 추가 실패에서 시작한 새 탭 기반 Firebase OAuth 구현

Chrome Extension을 처음 개발하면서 웹 개발하던 감각 그대로 Firebase Google 로그인을 붙이려 했다.

웹에서는

```html
<script src="firebase.js"></script>
<script>
  signInWithPopup();
</script>
```

이런 식으로 Firebase SDK를 `<script>`로 불러오고 `signInWithPopup()`을 호출하면 문제없이 동작한다.

그래서 나도 확장 프로그램에서도 똑같이 하면 되겠지 하고 시작했다.

그런데…

## 1. 처음부터 막혀버렸다: 스크립트가 실행되지 않는다

처음에 `popup.html`에 Firebase SDK `<script>`를 추가했는데 아무 반응이 없었다.

콘솔을 열어보니 이런 에러가 수십 개…

```
Refused to load the script because it violates Content Security Policy
Refused to execute inline script
Content Security Policy of your extension does not allow this script
```

처음엔

- 경로가 틀렸나?
- Firebase CDN 주소가 바뀌었나?
- 팝업 파일 구조가 잘못됐나?

같은 단순한 문제라고 생각했다.

하지만 그게 아니었다.

## 2. 문제는 내 코드가 아니라 Manifest V3 구조였다

관련 문서, 이슈, 레퍼런스를 찾아보다가 핵심을 한 줄로 요약하면 이랬다.

> "아, 내가 하려던 방식은 사실상 MV2까지나 가능했고, MV3에서는 구조와 정책이 완전히 바뀌어버렸구나."

나는 MV2를 써본 적은 없지만, 검색해보니 MV2 시절에는 popup/background 페이지가 웹 페이지처럼 동작해서 외부 `<script>`도 꽤 자유롭게 로딩할 수 있었다고 한다.

하지만 MV3부터 Chrome Extension은 보안 정책(CSP)이 완전히 달라졌다.

## MV3에서 Firebase Auth가 바로 안 되는 이유

### 1) `<script>` inline 코드 완전 금지

```html
<script>
  // 이건 MV3에서 절대 안 됨
</script>
```

### 2) 외부 스크립트 로딩도 CSP에서 대부분 차단

`https://www.gstatic.com/firebasejs/...` 같은 SDK 스크립트조차 기본적으로 MV3에서는 차단된다.

### 3) Background가 Service Worker로 변경됨

- DOM 없음
- window 없음
- 팝업 직접 호출 불가
- 상태 유지 어려움

즉, Firebase SDK를 Extension 내부에서 로딩하고 `signInWithPopup()`을 호출하는 방식 자체가 MV3에선 구조적으로 불가능하다.

이걸 깨닫는 순간, 아예 다른 방향의 아키텍처를 고민하게 됐다.

## 3. 결론: OAuth는 "확장 프로그램 외부 페이지"에서 수행하고

Extension은 결과만 메시지로 받아오는 구조로 설계하자

생각을 완전히 바꿨다.

- Firebase SDK 로딩
- Google OAuth 팝업
- `signInWithPopup` 호출

이 모든 로직을 확장 프로그램 밖의 일반 웹 페이지에서 실행하고, 확장 프로그램은 단지 "요청 → 결과 수신"만 하는 방식으로 아키텍처를 재설계했다.

그때 등장한 핵심 기술이:

- 새 탭 열기 (`chrome.tabs.create`)
- Content Script를 통한 웹 페이지와의 통신
- `window.postMessage`를 통한 이벤트 기반 데이터 전달
- chrome.runtime.sendMessage
- Firebase Hosting에 올린 로그인 페이지

였다.

## 4. 최종 설계된 전체 흐름

아래는 내가 실제로 구현한 Firebase Google 로그인 전체 플로우다.

```
[Popup]
    ↓ sendMessage("LOGIN_GOOGLE")

[Background SW]
    ↓ chrome.tabs.create() → 새 탭 열기
    ↓ https://your-domain.com/signin-popup?extension=true

[Signin-popup (외부 웹 페이지)]
    ↓ URL 파라미터 확인 (?extension=true)
    ↓ 자동으로 Google 로그인 시작
    ↓ Firebase SDK signInWithPopup() 실행 → Google OAuth 팝업
    ↓ 로그인 성공 시 window.postMessage로 인증 결과 전송

[Content Script]
    ↓ window.postMessage 감지
    ↓ chrome.runtime.sendMessage로 Background에 전달

[Background SW]
    ↓ 인증 결과 수신
    ↓ chrome.storage.local에 저장
    ↓ Popup에 AUTH_SUCCESS 메시지 전송
    ↓ 로그인 완료 후 signin-popup 탭 자동 닫기

[Popup]
    ↓ 로그인 결과 수신 & 저장
    ↓ 로그인 상태 업데이트
```

## 5. Mermaid 시퀀스 다이어그램

```mermaid
sequenceDiagram
    participant P as Popup
    participant B as Background SW
    participant T as 새 탭 (Signin-popup)
    participant C as Content Script
    participant G as Google OAuth

    P->>B: chrome.runtime.sendMessage("LOGIN_GOOGLE")
    B->>T: chrome.tabs.create()\nhttps://domain.com/signin-popup?extension=true

    T->>T: URL 파라미터 확인 (?extension=true)
    T->>G: Firebase signInWithPopup()
    G-->>T: OAuth result (user, idToken)
    T->>C: window.postMessage({ user, idToken })

    C->>B: chrome.runtime.sendMessage({ user, idToken })
    B->>B: chrome.storage.local에 저장
    B->>P: chrome.runtime.sendMessage("AUTH_SUCCESS")
    B->>T: chrome.tabs.remove() (탭 닫기)

    P->>P: 로그인 상태 업데이트
```

## 6. 구현 핵심 요약

- MV3에서는 Firebase SDK를 확장 프로그램 내부에서 직접 사용할 수 없다
- `signInWithPopup()`은 외부 웹 환경에서만 정상 작동한다
- 새 탭을 열어서 외부 웹 페이지에서 로그인을 처리한다
- `window.postMessage`를 통한 이벤트 기반 통신으로 폴링 없이 즉시 처리한다
- Content Script가 웹 페이지와 Extension 사이의 브릿지 역할을 한다
- 최종적으로 메시징 구조로 데이터를 Extension에 전달한다

## 7. 구현 세부사항

### Background Service Worker 구현

```javascript
// 로그인 요청 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "LOGIN_GOOGLE") {
    // 새 탭 열기
    chrome.tabs.create({
      url: `${SIGNIN_POPUP_URL}?extension=true`,
    });
  }

  // Content Script로부터 인증 결과 수신
  if (message.type === "AUTH_RESULT") {
    chrome.storage.local.set({ auth: message.data });
    chrome.runtime.sendMessage({ type: "AUTH_SUCCESS" });

    // 로그인 완료 후 탭 닫기
    if (sender.tab) {
      chrome.tabs.remove(sender.tab.id);
    }
  }
});
```

### Content Script 구현

```javascript
// window.postMessage 감지
window.addEventListener("message", (event) => {
  // 보안을 위해 origin 확인
  if (event.origin !== window.location.origin) return;

  // 인증 결과 메시지인지 확인
  if (event.data.type === "FIREBASE_AUTH_SUCCESS") {
    // Background에 전달
    chrome.runtime.sendMessage({
      type: "AUTH_RESULT",
      data: event.data.payload,
    });
  }
});
```

### SignInPopup 페이지 구현

```javascript
// URL 파라미터 확인
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("extension") === "true") {
  // 자동으로 로그인 시작
  signInWithPopup(auth, googleProvider)
    .then(async (result) => {
      const idToken = await result.user.getIdToken();

      // window.postMessage로 인증 결과 전송
      window.postMessage(
        {
          type: "FIREBASE_AUTH_SUCCESS",
          payload: {
            user: result.user,
            idToken: idToken,
          },
        },
        window.location.origin
      );
    })
    .catch((error) => {
      console.error("로그인 실패:", error);
    });
}
```

### 주의사항

- Content Script는 `manifest.json`에서 해당 웹 페이지 URL에 대해 주입되도록 설정해야 합니다
- `window.postMessage`를 사용할 때는 보안을 위해 `origin`을 확인해야 합니다
- 이벤트 기반 통신을 사용하므로 폴링 없이 즉시 처리됩니다
- 로그인 완료 후 탭을 자동으로 닫아 사용자 경험을 개선합니다

## 8. 마무리: MV3는 코드 문제가 아니라 "아키텍처 문제"다

Chrome Extension MV3는 보안·CSP·실행환경 정책이 매우 강하게 적용되는 구조다.

그래서 MV2/Web처럼 `<script>` 넣고 Firebase Auth를 붙이는 방식은 MV3에서는 더 이상 사용할 수 없다.

나는 이걸 직접 삽질하면서 배웠고, 결국 구조를 완전히 바꾸는 방식으로 해결하게 되었다.

Offscreen Document를 사용하는 방법도 있지만, 새 탭을 여는 방식이 더 단순하고 직관적이며 구현이 쉽다는 것을 경험했다.

이 글이 MV3에서 OAuth를 구현하려는 다른 개발자들에게 조금이나마 도움이 되면 좋겠다.

## 9. 샘플 코드

실제 구현된 전체 코드는 다음 저장소에서 확인할 수 있습니다:

- [v3-extension-sample](https://github.com/raincoat98/v3-extension-sample) - Chrome Extension v3와 Firebase Authentication을 활용한 Google 로그인 및 Extension-웹앱 간 이벤트 기반 통신 구현

---
categories: [Firebase]
title: Firebase CLI 설치 가이드
description: Firebase CLI 최신 버전(v14) 기준 설치부터 프로젝트 초기화까지. npm 설치, 로그인, firebase init, 배포까지 한 번에 정리합니다.
created: 2026-05-05
updated: 2026-05-05
tags: [Firebase|orange, DevOps|teal]
platform: Firebase CLI v14
readingTime: 5
---

# Firebase CLI 설치 가이드

> 📎 참고 문서
> - [Firebase CLI 공식 문서](https://firebase.google.com/docs/cli)
> - [firebase-tools npm](https://www.npmjs.com/package/firebase-tools)
> - [Firebase 릴리즈 노트](https://firebase.google.com/support/releases)

현재 최신 버전은 **v14.27.0** (2026년 5월 기준)이에요.

---

## 사전 요구사항

Firebase CLI v13부터 **Node.js 18 이상**이 필요해요.

```bash
node -v  # v18.0.0 이상인지 확인
npm -v
```

Node.js가 없거나 버전이 낮다면 [nodejs.org](https://nodejs.org)에서 LTS 버전을 설치하세요.

---

## 1. Firebase CLI 설치

### npm으로 설치 (권장)

```bash
npm install -g firebase-tools
```

### 설치 확인

```bash
firebase --version
# 14.x.x 가 출력되면 정상
```

### 업데이트

이미 설치되어 있다면 같은 명령어로 최신 버전으로 업데이트할 수 있어요.

```bash
npm install -g firebase-tools
```

---

## 2. Google 계정으로 로그인

```bash
firebase login
```

브라우저가 열리면서 Google 계정 인증 화면이 나와요.
로그인 완료 후 터미널에 `Success!` 메시지가 뜨면 돼요.

브라우저가 없는 환경(SSH 등)이라면 이렇게 해요.

```bash
firebase login --no-localhost
```

터미널에 출력된 URL을 복사해서 브라우저에 붙여넣고, 코드를 복사해서 터미널에 입력하면 돼요.

### 로그인 상태 확인

```bash
firebase login:list
```

### 로그아웃

```bash
firebase logout
```

---

## 3. 프로젝트 연결 및 초기화

프로젝트 폴더로 이동한 후 실행해요.

```bash
firebase init
```

원하는 Firebase 기능을 선택하는 화면이 나와요.

```
? Which Firebase features do you want to set up for this directory?
  ◯ Firestore
  ◯ Functions
❯ ◉ Hosting
  ◯ Storage
  ◯ Emulators
  ...
```

스페이스바로 선택하고 엔터를 누르면 다음 단계로 넘어가요.

### 기능별 init 바로가기

특정 기능만 초기화하고 싶다면 바로 지정할 수 있어요.

```bash
firebase init hosting     # Hosting만
firebase init functions   # Cloud Functions만
firebase init firestore   # Firestore만
firebase init emulators   # Emulator Suite만
```

---

## 4. 배포

```bash
firebase deploy
```

특정 기능만 배포할 때는 `--only` 플래그를 써요.

```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

---

## 5. 로컬 에뮬레이터 (선택)

실제 Firebase 서비스 대신 로컬에서 테스트할 수 있어요.

```bash
firebase emulators:start
```

Emulator Suite UI는 기본적으로 `http://localhost:4000`에서 열려요.

---

## CI 환경에서 사용할 때

GitHub Actions 같은 CI 환경에서는 브라우저 로그인이 불가능해요.
서비스 계정 키를 사용하는 방법이 공식 권장 방식이에요.

1. Google Cloud Console에서 서비스 계정 생성
2. JSON 키 파일 발급
3. CI 환경변수에 등록

```bash
# CI 환경에서
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
firebase deploy
```

> `FIREBASE_TOKEN`을 사용하는 방식(`firebase login:ci`)은 **deprecated** 되었어요. 서비스 계정 방식을 쓰세요.

---

## 주요 명령어 정리

| 명령어 | 설명 |
|---|---|
| `firebase login` | Google 계정으로 로그인 |
| `firebase logout` | 로그아웃 |
| `firebase projects:list` | 연결된 프로젝트 목록 |
| `firebase use <project-id>` | 활성 프로젝트 변경 |
| `firebase init` | 프로젝트 초기화 |
| `firebase deploy` | 전체 배포 |
| `firebase deploy --only hosting` | Hosting만 배포 |
| `firebase emulators:start` | 로컬 에뮬레이터 실행 |
| `firebase --version` | 버전 확인 |

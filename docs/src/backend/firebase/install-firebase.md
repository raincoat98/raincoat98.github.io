# Firebase CLI 설치 가이드

Firebase를 프로젝트에 적용할 때 필수인 Firebase CLI(firebase-tools) 설치 방법을 정리했습니다.<br>
처음 사용하는 분들도 차근차근 따라할 수 있도록, 기본부터 배포까지 전체 과정을 안내합니다.

## ✅ 이런 분께 추천

- Firebase Hosting/Functions/Firestore를 사용해보려는 분
- 로컬/CI 환경에서 일관된 CLI 사용법이 필요한 분
- macOS에서 Homebrew로 깔끔하게 설치하고 싶은 분

## 1. 사전 준비

### Node.js & npm 확인

Firebase CLI는 Node.js 기반으로 동작합니다. 아래 명령으로 버전을 먼저 확인해 주세요.

```bash
node -v
npm -v
```

- 버전이 출력되면 설치된 상태입니다.
- 없거나 너무 오래된 버전이라면 Node.js LTS 설치를 권장합니다. (macOS는 nvm 사용 추천)

> ✋ **권장 버전**: Node 18 이상 (LTS)

## 2. 설치 방법

### 방법 A: npm 전역 설치 (가장 보편적)

```bash
npm install -g firebase-tools
firebase --version
```

권한 오류(EACCES 등)가 날 경우 macOS/Linux에서는 `sudo` 대신 전역 설치 경로(prefix)를 사용자 폴더로 바꾸는 방식을 권장합니다.

```bash
npm config set prefix ~/.npm-global
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
npm i -g firebase-tools
```

### 방법 B: Homebrew(macOS)로 설치 (깔끔한 관리)

```bash
brew update
brew install firebase-cli
firebase --version
```

업데이트:

```bash
brew upgrade firebase-cli
```

### 방법 C: 프로젝트 로컬 설치 (팀/CI 일관성용, 추천)

```bash
npm i -D firebase-tools
npx firebase --version
```

`package.json`에 스크립트 추가 예시:

```json
{
  "scripts": {
    "fb:login": "firebase login",
    "fb:init": "firebase init",
    "fb:deploy": "firebase deploy"
  }
}
```

> 💡 팀 단위로는 로컬 설치 + npx 사용을 추천합니다. 개발/CI 환경의 버전 일치가 쉬워집니다.

## 3. 최초 로그인 & 프로젝트 초기화

### 로그인 (최초 1회)

```bash
firebase login
```

브라우저가 열리면 구글 계정으로 로그인해 주세요.

헤드리스/CI 환경에서는:

```bash
firebase login:ci

# 출력된 토큰을 CI Secret에 저장 후
firebase deploy --token "$FIREBASE_TOKEN"
```

### 프로젝트 초기화

프로젝트 루트에서 실행합니다.

```bash
firebase init
```

- Hosting / Functions / Firestore 등 필요한 항목만 체크하여 설정하면 됩니다.

## 4. 배포 (Hosting 예시)

```bash
firebase deploy

# 또는 특정 대상만
firebase deploy --only hosting
```

## 5. 업데이트 & 제거

### npm 전역 업데이트/제거

```bash
# 업데이트
npm i -g firebase-tools

# 제거
npm uninstall -g firebase-tools
```

### Homebrew 업데이트/제거

```bash
# 업데이트
brew upgrade firebase-cli

# 제거
brew uninstall firebase-cli
```

## 6. 자주 겪는 이슈 & 해결법

### 6.1 `zsh: command not found: firebase`

**원인**: PATH에 전역 설치 경로가 잡혀있지 않음

**해결**:

```bash
npm config get prefix
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
hash -r
```

### 6.2 권한 오류(EACCES 등)로 전역 설치 실패

- `sudo` 사용은 가급적 지양 → 전역 prefix를 사용자 영역으로 변경(상단 방법 A 참고)

### 6.3 회사 프록시/사내 레지스트리 환경

```bash
npm config set proxy http://<user>:<pass>@<proxy-host>:<port>
npm config set https-proxy http://<user>:<pass>@<proxy-host>:<port>

# 필요 시 .npmrc에 registry도 명시
```

### 6.4 Node 버전 이슈

- 최소 Node 18 LTS 이상 권장
- 버전 관리 도구: macOS/Linux는 nvm, Windows는 nvm-windows 또는 Volta

## 7. 빠른 시작 (요약)

```bash
# 1) 설치
npm i -g firebase-tools

# 2) 로그인
firebase login

# 3) 초기화
firebase init

# 4) 로컬 확인(에뮬레이터)
firebase emulators:start --only hosting

# 5) 배포
firebase deploy
```

## 8. 유용한 명령 모음

### 프로젝트 목록/선택

```bash
firebase projects:list
firebase use <projectId>
```

### 특정 리소스만 배포

```bash
firebase deploy --only functions
firebase deploy --only hosting:siteA
```

### 에뮬레이터 (로컬 테스트)

```bash
firebase emulators:start
firebase emulators:start --only firestore,functions
```

### Functions 로그 보기

```bash
firebase functions:log
```

## 마무리

Firebase CLI는 초기 설정만 익히면 호스팅부터 백엔드 함수, 데이터베이스 에뮬레이터까지 손쉽게 다룰 수 있습니다.

설치 과정에서 막히는 부분이 있으면 언제든 문의해 주세요.
안정적인 개발 환경 구축을 함께 돕겠습니다 🙂

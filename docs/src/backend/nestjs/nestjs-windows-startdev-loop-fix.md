---
category: NestJS
title: NestJS 윈도우 무한 루프 문제 해결
---

# NestJS 윈도우 무한 루프 문제 해결

## 문제 요약

Windows WSL 환경에서 NestJS 프로젝트를 실행할 때:

```
File change detected. Starting incremental compilation...
Found 0 errors. Watching for file changes.
```

이 메시지가 출력된 뒤 터미널이 초기화되면서 동일한 메시지가 반복 출력됩니다.<br>
`npm run start:dev` 명령이 정상적으로 작동하지 않고 무한 루프처럼 보이며<br>
개발 서버가 실행되지 않는 문제가 발생합니다.

> 윈도우에서만 발생해서 머쓱했었다😎

## 원인

이 문제는 아래 요인들이 복합적으로 작용해 발생할 수 있습니다:

1. TypeScript의 `--watch` 모드와 Windows 파일 감시 시스템의 충돌
2. `tsconfig.json`에 `watchOptions`가 누락됨
3. VSCode, Git Bash, PowerShell 등 터미널 환경이 파일 변경 이벤트를 과도하게 트리거함
4. 파일 시스템 감시를 폴링 방식으로 사용하면서 `dist/` 또는 `node_modules` 폴더까지 감시함

## 해결 방법

### 1. `tsconfig.json`에 `watchOptions` 추가

```json
{
  "compilerOptions": {
    // 기존 설정 유지
  },
  "watchOptions": {
    "watchFile": "fixedPollingInterval",
    "watchDirectory": "useFsEvents",
    "fallbackPolling": "dynamicPriority",
    "synchronousWatchDirectory": true,
    "excludeDirectories": ["**/node_modules", "dist"]
  }
}
```

- `watchFile: fixedPollingInterval`은 불필요한 파일 변경 감지를 줄여줍니다.
- `excludeDirectories`로 `dist`와 `node_modules`를 감시 대상에서 제외합니다.

### 2. 최신 TypeScript 버전으로 업그레이드

```bash
npm install typescript@latest --save-dev
```

- `v4.9.x` 버전에서 특히 이 문제가 자주 발생하며,
- `v5.x` 이상 버전에서 해결된 사례가 많습니다.

### 3. `start:dev`에 메모리 옵션 추가 (메모리 부족 시)

```bash
# macOS / Linux
export NODE_OPTIONS="--max-old-space-size=4096"
npm run start:dev

# Windows PowerShell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run start:dev
```

### 4. `dist`, `node_modules` 삭제 후 재설치

```bash
# macOS / Linux
rm -rf dist node_modules
npm install

# Windows
rd /s /q dist
rd /s /q node_modules
npm install
```

### 5. 터미널 변경 테스트

- VSCode 내 터미널 대신 `cmd` 또는 `PowerShell (관리자 권한)`으로 실행해 보세요.
- 또는 `WSL` 환경에서 실행하면 문제가 발생하지 않는 경우도 많습니다.

## 주의: 관련 Deprecated 경고

NestJS 프로젝트에서 `npm install` 시 다음과 같은 경고가 발생할 수 있습니다:

```
npm WARN deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
npm WARN deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
```

직접적인 오류는 아니지만, 의존성 최신화를 위해 아래 명령어를 사용하는 것을 추천합니다:

```bash
npx npm-check-updates -u
npm install
```

---

위 방법들을 순차적으로 적용하면 대부분의 경우<br>
NestJS `start:dev` 무한 루프 문제를 해결할 수 있습니다.<br>
문제를 겪고 있는 개발자분들께 도움이 되었길 바랍니다!

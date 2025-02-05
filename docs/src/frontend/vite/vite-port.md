# Vite 서버 포트 설정

Vite는 기본적으로 3000번 포트를 사용하여 개발 서버를 실행합니다. <br>
그러나 다른 포트를 사용하고자 할 경우, `vite.config.js` 파일에서 설정할 수 있습니다. <br>
이 문서에서는 Vite 서버 포트를 설정하는 방법을 소개합니다.

## 1. `vite.config.js` 파일 설정

Vite 프로젝트의 루트 디렉토리에 있는 `vite.config.js` 파일에서 `server.port` 옵션을 사용하여 포트를 설정할 수 있습니다.

### 예시:

```js
// vite.config.js
export default {
  server: {
    port: 3001, // 원하는 포트 번호로 설정
  },
};
```

위의 예시에서는 개발 서버가 4000번 포트에서 실행됩니다.

## 2. 환경 변수 사용

Vite는 .env 파일을 사용하여 환경 변수를 설정하고, 이를 통해 서버 포트를 동적으로 설정할 수 있습니다.

1단계: .env 파일 설정

프로젝트 루트 디렉토리에 .env 파일을 생성하고, VITE_PORT 환경 변수를 설정합니다.

```
VITE_PORT=5000
```

2단계: vite.config.js에서 환경 변수 사용

```javascript
// vite.config.js
export default {
  server: {
    port: process.env.VITE_PORT || 3000, // 환경 변수 VITE_PORT에 따라 포트를 설정
  },
};
```

위와 같이 설정하면, .env 파일에서 정의한 포트 번호를 사용하고, 정의되지 않았다면 기본값인 3000번 포트가 사용됩니다.

## 3. 커맨드 라인 옵션 사용

Vite 서버를 실행할 때, 커맨드 라인에서 직접 포트를 지정하여 서버를 시작할 수 있습니다.

예시:

```bash
vite --port 6000
```

이렇게 하면 Vite 서버가 6000번 포트에서 실행됩니다.

## 4. 전체 예시

전체 설정 예시는 아래와 같습니다.

vite.config.js 파일:

```javascript
// vite.config.js
export default {
  server: {
    port: process.env.VITE_PORT || 3000,
  },
};
```

.env 파일:

```
VITE_PORT=3001
```

위 설정을 통해 Vite는 .env 파일에 설정된 포트를 사용하여 개발 서버를 시작합니다.

## 결론

Vite에서 서버 포트를 설정하는 방법은 여러 가지가 있으며,<br>
vite.config.js 파일을 사용하거나, <br>
.env 파일을 통해 동적으로 포트를 설정하거나,<br>
커맨드 라인에서 직접 설정할 수 있습니다.<br>
상황에 맞는 방법을 선택하여 설정하면 됩니다.

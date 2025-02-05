# Vite CORS 관련 Proxy 설정

PHP와 React 프로젝트를 연동하는 과정에서 CORS 문제가 발생했습니다.<br>
PHP 측에서 헤더 설정을 수정하는 등의 여러 방법을 시도했지만 해결되지 않았습니다.<br>
결국 Vite의 proxy 설정을 활용하여 임시로 해결하였으며, 이를 공유하고자 합니다.

## 1. 사용 이유

Vite 개발 환경에서는 기본적으로 CORS(Cross-Origin Resource Sharing) 정책이 적용됩니다.<br>
그러나 백엔드에서 CORS 설정을 직접 변경할 수 없는 경우, API 요청이 차단될 수 있습니다.<br>
이러한 상황에서 Vite의 Proxy 설정을 활용하면 CORS 문제를 우회하여 해결할 수 있습니다.

## 2. Vite Proxy 설정 방법

Vite에서는 `vite.config.js` 또는 `vite.config.ts` 파일에서 `server.proxy` 옵션을 활용하여 API 요청을 프록시할 수 있습니다.

### 2.1. 기본 설정

아래와 같이 `defineConfig` 함수 내에서 `server.proxy` 옵션을 설정하면 됩니다.

```javascript
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://backend.example.com", // 실제 백엔드 서버 URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

### 2.2. 옵션 설명

- `target`: 요청을 전달할 백엔드 서버의 주소
- `changeOrigin`: `true`로 설정하면 원본 요청의 `Host` 헤더를 백엔드 주소로 변경
- `rewrite`: 요청 경로를 변경하여 `/api` 프리픽스를 제거하여 백엔드에서 인식할 수 있도록 함

## 3. 추가 설정

### 3.1. WebSocket 프록시 설정

WebSocket을 사용할 경우 `ws: true` 옵션을 추가하면 됩니다.

```javascript
proxy: {
  '/ws': {
    target: 'ws://backend.example.com',
    ws: true,
  },
},
```

### 3.2. HTTPS 백엔드 지원

HTTPS를 사용하는 백엔드라면 `secure: false`를 설정하여 SSL 인증서 오류를 무시할 수 있습니다.

```javascript
proxy: {
  '/api': {
    target: 'https://backend.example.com',
    changeOrigin: true,
    secure: false,
  },
},
```

## 4. 결론

백엔드에서 CORS 설정을 직접 수정할 수 없다면, Vite의 Proxy 기능을 활용하는 것이 좋은 해결책이 될 수 있습니다.
이 설정을 적용하면 CORS 문제로 인해 API 요청이 차단되는 일을 방지하고, 프론트엔드와 백엔드 간의 원활한 통신을 보장할 수 있습니다.
자세한 내용은 공식 문서를 참고하시기 바랍니다: [Vite Server Options](https://vitejs.dev/config/server-options.html)

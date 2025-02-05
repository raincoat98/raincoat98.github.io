# Vite Import Alias 설정

## 1. 기존의 문제점

Vite를 사용하지 않거나, Import Alias를 설정하지 않으면 다음과 같은 문제가 발생할 수 있습니다.

1. **상대 경로 복잡성**
   - 모듈을 불러올 때 `../../../components/Button.vue`처럼 여러 단계의<br> 상대 경로를 사용해야 하는 경우 가독성이 떨어집니다.
2. **파일 이동 시 경로 변경 문제**

   - 파일을 다른 디렉토리로 옮기면 모든 import 경로를 수정해야 합니다.

3. **일관성 부족**
   - 프로젝트 내에서 경로를 통일하기 어렵고, 새로운 팀원이 코드를 이해하기 어려울 수 있습니다.

## 2. Import Alias의 장점

1. **가독성 향상**
   - `@/components/Button.vue`처럼 의미 있는 경로로 import하여 코드가 직관적이고 간결해집니다.
2. **유지보수성 증가**

   - 파일을 이동하더라도 import 경로를 변경할 필요가 없습니다.

3. **생산성 향상**
   - 개발자가 빠르게 필요한 모듈을 찾고 사용할 수 있습니다.

## 3. Vite에서 Import Alias 설정 방법

### 3.1 `vite.config.js` 설정

Vite 프로젝트에서 Import Alias를 설정하려면 `vite.config.js` 파일을 수정해야 합니다.

```javascript
import { defineConfig } from "vite";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
    },
  },
});
```

### 3.2 `vite-tsconfig-paths` 플러그인 사용

`vite-tsconfig-paths` 플러그인을 사용하면 `tsconfig.json`에 설정된 경로를<br>
자동으로 인식하여 별도로 `vite.config.js`에서 alias를 지정하지 않아도 됩니다.

#### 1) 플러그인 설치

```sh
npm install vite-tsconfig-paths --save-dev
```

#### 2) `vite.config.js`에 플러그인 추가

```javascript
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
});
```

이렇게 설정하면 `tsconfig.json`의 `paths` 설정을 Vite에서 자동으로 해석하여 사용할 수 있습니다.

### 3.3 `tsconfig.json` 또는 `jsconfig.json` 설정 (TypeScript 사용 시)

TypeScript를 사용한다면 `tsconfig.json`에도 alias를 설정해주어야 합니다.

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

이렇게 설정하면, 다음과 같이 Import를 간결하게 작성할 수 있습니다.

```javascript
import Button from "@components/Button.vue";
import store from "@/store";
```

## 4. 결론

Import Alias를 설정하면 코드 가독성이 좋아지고 유지보수성이 향상됩니다. 또한,<br>
개발 생산성을 높일 수 있어 팀 프로젝트에서도 매우 유용합니다. <br>
따라서 Vite 프로젝트를 설정할 때 반드시 Import Alias를 적용하는 것을 추천합니다.

추가적으로, `vite-tsconfig-paths` 플러그인을 사용하면<br>
`tsconfig.json`에 설정한 경로를 자동으로 인식하여 더욱 편리하게 관리할 수 있습니다. <br>

이 방법을 활용하면 `vite.config.js`에서 별도로 alias를 설정할 필요 없이<br>
`tsconfig.json`만으로 경로를 깔끔하게 관리할 수 있습니다.

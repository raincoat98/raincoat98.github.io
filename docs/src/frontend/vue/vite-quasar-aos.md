# Vite Quasar에서 AOS로 애니메이션 적용하기

이 문서는 Vite와 Quasar를 사용하여 웹 페이지에 스크롤 애니메이션을 추가하는 방법을 안내합니다. AOS (Animate On Scroll) 라이브러리를 사용하여 웹 페이지에 동적인 효과를 적용할 수 있습니다.

## 1. 필요한 패키지 설치

먼저, 프로젝트에 AOS 라이브러리와 필요한 타입 정의를 추가합니다. 타입스크립트를 사용하는 경우 `@types/aos` 패키지도 설치해야 합니다.

```bash
npm install aos --save
npm install --save @types/aos // 타입스크립트 사용시
```

## 2. 필요한 스타일 및 스크립트 임포트

AOS 스타일시트를 임포트합니다.

```javascript
import { createApp } from "vue";
import App from "./App.vue";
import { Quasar } from "quasar";
import "quasar/src/css/index.sass";
import "./assets/tailwind.css";
import "aos/dist/aos.css"; // AOS 스타일 임포트
```

## 3. Vue 애플리케이션 생성 및 마운트

Vue 애플리케이션을 생성하고, Quasar 플러그인을 사용합니다. 그 다음, 애플리케이션을 마운트합니다.

```javascript
const app = createApp(App);

app.use(Quasar, { plugins: {} });
app.mount("#app");
```

## 4. AOS 초기화

`onMounted` 훅을 사용하여 컴포넌트가 마운트되었을 때 AOS를 초기화합니다. 이렇게 하면 페이지 로드 시 애니메이션이 활성화됩니다.

```html
<script setup lang="ts">
  import { onMounted } from "vue";
  import AOS from "aos";

  onMounted(() => {
    AOS.init();
  });
</script>
```

## 5. AOS 애니메이션 적용

HTML 요소에 `data-aos` 속성을 추가하여 원하는 애니메이션 효과를 적용합니다. 각 카드에 다양한 애니메이션을 적용해 보세요.

```html
<template>
  <div class="hello">
    <!-- 각 카드 예시 -->
    <div
      data-aos="zoom-in"
      class="card"
      style="width: 18rem; margin: 100px auto"
    >
      <img
        src="https://example.com/image1.jpg"
        class="card-img-top"
        alt="..."
      />
      <div class="card-body">
        <h5 class="card-title">Card 1</h5>
        <p class="card-text">카드의 설명입니다.</p>
      </div>
    </div>
    <!-- 더 많은 카드 -->
  </div>
</template>
```

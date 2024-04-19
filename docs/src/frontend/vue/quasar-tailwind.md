# Vue Quasar에서 Tailwind CSS 사용하기

이 문서는 Vue Quasar 프로젝트에서 Tailwind CSS를 사용하는 방법을 안내합니다.

## 1. 필수 패키지 설치

Vue Quasar 프로젝트에서는 기존의 Quasar 라이브러리만 사용하여 스타일을 적용하는 것이 번거로웠습니다.
때때로 HTML의 `<style>` 태그와 클래스를 혼용하여 코드가 복잡해지는 문제가 있었습니다.
이로 인해 스타일링을 적용하거나 변경하기가 어려웠습니다. 따라서 Tailwind CSS를 설치하여 이러한 문제를 해결하기로 결정했습니다.

## 2. Tailwind CSS 초기화

먼저 npm을 사용하여 필요한 패키지를 설치합니다.

```bash
npm install -D tailwindcss postcss autoprefixer
```

## 3. Tailwind CSS 구성 설정

다음으로 Tailwind CSS를 초기화합니다.

```bash
npx tailwindcss init -p
```

## 4. Tailwind CSS 구성 설정

프로젝트 루트에 `tailwind.config.js` 파일을 생성하고 다음 내용을 추가합니다.

::: tip
Tailwind CSS 구성시 파일이 생성됩니다.
:::

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## 5. PostCSS 구성 설정

프로젝트 루트에 `postcss.config.js` 파일을 생성하고 다음 내용을 추가합니다.

::: tip
Tailwind CSS 구성시 파일이 생성됩니다.
:::

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## 6. Tailwind CSS 파일 작성

`src/css` 폴더에 `tailwind.css` 파일을 생성하고 다음 내용을 추가합니다.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 7. Quasar 설정

`quasar.config.js` 파일에서 Quasar 앱에 Tailwind CSS를 추가합니다.

```javascript
module.exports = function (ctx) {
  return {
    css: ["app.scss", "tailwind.css"],
    // 다른 설정들...
  };
};
```

이제 Vue Quasar 앱에서 Tailwind CSS를 더욱 즐겁게 스타일을 적용해보아요 :)

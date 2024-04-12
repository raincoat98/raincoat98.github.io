# Vue에 설치된 Tailwind brand 컬러 지정

## 1. Tailwind 설정 파일 수정하기

Tailwind CSS의 설정 파일(`tailwind.config.js`)을 수정하여 프로젝트 전체에서 사용할 브랜드 컬러를 지정합니다. 다음은 브랜드 컬러로 `primary`를 설정하는 예시입니다.

```javascript
export default {
  darkMode: "class",
  prefix: "tw-", // Tailwind 클래스에 'tw-' 접두어 추가
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6F61C0", // 기본 primary 색상
          50: "#F3F2FA", // 가장 밝은 톤
          100: "#E1DCF6",
          200: "#C4BAED",
          300: "#A797E4",
          400: "#8A74DB",
          500: "#6F61C0", // 기본 톤
          600: "#564DA9",
          700: "#3D3981",
          800: "#272559",
          900: "#0F1131", // 가장 어두운 톤
        },
      },
    },
  },
  plugins: [],
};
```

## 2. 접두어(prefix) 사용하기

`prefix: "tw-"` 설정을 통해 모든 Tailwind CSS 클래스에 `tw-` 접두어가 추가됩니다. 이 접두어는 Tailwind CSS의 클래스와 다른 CSS 프레임워크나 스타일 시트 간의 이름 충돌을 방지하는데 유용합니다.

예를 들어, Tailwind의 텍스트 색상 클래스 `text-blue-500`는 `tw-text-blue-500`로 변경됩니다. 이렇게 접두어를 사용하면 클래스명이 길어지는 단점이 있지만, 스타일 충돌을 효과적으로 예방할 수 있습니다.

## 3. CSS에서 Tailwind 클래스 사용하기

접두어를 설정한 후, HTML이나 Vue, React 등의 컴포넌트에서 Tailwind 클래스를 사용할 때는 접두어를 포함하여 클래스를 지정해야 합니다.

```html
<button class="tw-bg-primary-500 tw-text-white tw-p-4 tw-rounded-lg">
  클릭하세요
</button>
```

이 구성을 통해 다른 라이브러리나 프레임워크와 함께 Tailwind CSS를 사용하면서 스타일의 일관성을 유지하고 충돌을 방지할 수 있습니다.

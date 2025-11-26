---
title: Vue에서 dayjs로 한국 시간(KST) 처리하기
description: Vue 프로젝트에서 dayjs를 사용하여 한국 시간(KST)을 처리하는 방법을 정리합니다. 타임존 설정, 플러그인 사용법, 실제 예제를 포함합니다.
keywords: Vue, dayjs, KST, 한국 시간, 타임존, 날짜 처리, 프론트엔드 개발
date: 2024-01-01
---

# Vue에서 dayjs로 한국 시간(KST) 처리하기

## 배경

프론트엔드 개발을 하다 보면 날짜와 시간을 다루는 일이 정말 많습니다.<br>
게시글 작성 시간, 채팅 메시지 시간, 예약 시간 등 거의 모든 기능에서 날짜가 필요하죠.

처음에는 JavaScript의 기본 `Date` 객체를 사용했지만, 타임존 처리가 복잡하고 포맷팅도 번거로웠습니다. 특히 서버에서 UTC로 받은 시간을 한국 시간(KST)으로 변환하는 과정에서 자주 실수가 발생했습니다.

이런 문제를 해결하기 위해 `dayjs`를 도입했고,<br>
이번 글에서는 Vue 프로젝트에서 dayjs를 어떻게 설정하고 사용하는지 정리해보겠습니다.

## dayjs를 선택한 이유

예전에는 `moment.js`를 많이 사용했지만, 다음과 같은 이유로 dayjs로 전환했습니다:

- **가벼움**: moment.js는 약 67KB인 반면, dayjs는 약 2KB에 불과합니다.<br>
- **간단한 API**: moment.js와 거의 동일한 API를 제공하여 학습 곡선이 낮습니다
- **불변성**: 메서드 체이닝 시 원본 객체를 변경하지 않아 안전합니다
- **플러그인 시스템**: 필요한 기능만 선택적으로 추가할 수 있습니다

## 설치하기

먼저 dayjs와 타임존 관련 플러그인을 설치합니다:

```bash
npm install dayjs
```

한국 시간(KST) 처리를 위해서는 timezone 플러그인이 필요합니다. timezone 플러그인은 utc 플러그인에 의존하므로 함께 설치합니다:

```bash
npm install dayjs-plugin-utc dayjs-plugin-timezone
```

## 설정하기

dayjs는 플러그인을 명시적으로 등록해야 사용할 수 있습니다. 프로젝트 전역에서 사용할 수 있도록 유틸리티 파일을 만들어 설정합니다:

```javascript
// utils/dayjs.js
import dayjs from "dayjs";
import utc from "dayjs-plugin-utc";
import timezone from "dayjs-plugin-timezone";
import "dayjs/locale/ko";

// 플러그인 등록 (순서 중요! utc를 먼저 등록해야 함)
dayjs.extend(utc);
dayjs.extend(timezone);

// 한국어 locale 설정
dayjs.locale("ko");

// 기본 타임존을 서울로 설정
dayjs.tz.setDefault("Asia/Seoul");

export default dayjs;
```

**중요한 점:**

- `utc` 플러그인을 `timezone` 플러그인보다 먼저 등록해야 합니다
- `dayjs.locale("ko")`를 설정하면 '오전', '월요일' 같은 한국어 표현을 사용할 수 있습니다
- `dayjs.tz.setDefault()`로 기본 타임존을 설정하면 매번 타임존을 지정하지 않아도 됩니다

## 사용 예시

### 기본 사용법

```javascript
import dayjs from "@/utils/dayjs";

// 현재 시간 (한국 시간 기준)
const now = dayjs();
console.log(now.format("YYYY년 MM월 DD일 A hh시 mm분"));
// 출력: 2025년 5월 8일 오후 03시 21분
```

### UTC를 KST로 변환

서버에서 UTC 시간을 받았을 때 한국 시간으로 변환하는 방법입니다:

```javascript
// 서버에서 받은 UTC 시간
const utcTime = "2025-05-08T06:00:00Z";

// 한국 시간으로 변환
const kstTime = dayjs(utcTime).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm");
console.log(kstTime); // 2025-05-08 15:00
```

### Vue 컴포넌트에서 사용

```vue
<script setup>
import { ref, computed } from "vue";
import dayjs from "@/utils/dayjs";

const createdAt = ref("2025-05-08T06:00:00Z");

// 포맷된 날짜
const formattedDate = computed(() => {
  return dayjs(createdAt.value).format("YYYY년 MM월 DD일 A hh:mm");
});

// 상대 시간 (예: "3시간 전")
// relative time 플러그인 필요
const relativeTime = computed(() => {
  return dayjs(createdAt.value).fromNow();
});
</script>

<template>
  <div>
    <p>작성 시간: {{ formattedDate }}</p>
    <p>{{ relativeTime }}</p>
  </div>
</template>
```

## 자주 사용하는 포맷 정리

| 목적             | 포맷 문자열           | 결과 예시             |
| ---------------- | --------------------- | --------------------- |
| 날짜만           | `YYYY-MM-DD`          | 2025-05-08            |
| 날짜 + 시간      | `YYYY-MM-DD HH:mm`    | 2025-05-08 15:00      |
| 날짜 + 시간 + 초 | `YYYY-MM-DD HH:mm:ss` | 2025-05-08 15:00:30   |
| 한국식 날짜      | `YYYY년 M월 D일`      | 2025년 5월 8일        |
| 요일 포함        | `YYYY년 M월 D일 dddd` | 2025년 5월 8일 목요일 |
| 오전/오후        | `A hh:mm`             | 오후 03:00            |
| 24시간 형식      | `HH:mm`               | 15:00                 |

## 자주 발생하는 문제와 해결

### 1. `.tz()` 함수가 undefined 에러

```javascript
// ❌ 에러 발생
import dayjs from "dayjs";
const time = dayjs().tz("Asia/Seoul");
```

**원인:** timezone 플러그인을 extend하지 않았습니다.

**해결:** 플러그인을 반드시 등록해야 합니다.

```javascript
import dayjs from "dayjs";
import utc from "dayjs-plugin-utc";
import timezone from "dayjs-plugin-timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
```

### 2. 한국어가 표시되지 않음

```javascript
// "Thursday" 대신 "목요일"이 표시되지 않음
console.log(dayjs().format("dddd"));
```

**원인:** locale을 설정하지 않았습니다.

**해결:**

```javascript
import "dayjs/locale/ko";
dayjs.locale("ko");
```

### 3. 시간이 9시간 차이남

서버에서 UTC로 시간을 보냈는데, 변환 없이 그대로 표시하면 한국 시간보다 9시간 느립니다.

**해결:** 반드시 `.tz("Asia/Seoul")`로 변환해야 합니다.

```javascript
const serverTime = "2025-05-08T06:00:00Z"; // UTC
const displayTime = dayjs(serverTime).tz("Asia/Seoul"); // KST로 변환
```

## 추가로 유용한 플러그인

### 상대 시간 표시 (fromNow)

"3시간 전", "2일 전" 같은 표현을 사용하려면:

```bash
npm install dayjs-plugin-relative-time
```

```javascript
// utils/dayjs.js에 추가
import relativeTime from "dayjs-plugin-relative-time";
dayjs.extend(relativeTime);

// 사용
console.log(dayjs("2025-05-08").fromNow()); // "3일 전"
```

### 날짜 범위 비교 (isBetween)

특정 날짜가 범위 안에 있는지 확인:

```bash
npm install dayjs-plugin-is-between
```

```javascript
import isBetween from "dayjs-plugin-is-between";
dayjs.extend(isBetween);

const date = dayjs("2025-05-08");
const start = dayjs("2025-05-01");
const end = dayjs("2025-05-31");

console.log(date.isBetween(start, end)); // true
```

## 마무리

dayjs는 가볍고 빠르면서도 강력한 날짜 라이브러리입니다. Vue와도 잘 어울리며,<br>
특히 한국 시간(KST) 기준으로 날짜를 다뤄야 하는 프로젝트에서 매우 유용합니다.

핵심은 다음 세 가지입니다:

1. **플러그인 등록**: utc와 timezone 플러그인을 extend 해야 타임존 변환이 가능합니다.<br>
2. **locale 설정**: 한국어 표현을 사용하려면 locale을 "ko"로 설정합니다
3. **기본 타임존 설정**: `dayjs.tz.setDefault("Asia/Seoul")`로 매번 타임존을 지정하는 번거로움을 줄일 수 있습니다

이 글이 Vue에서 날짜를 다룰 때 도움이 되었으면 좋겠습니다!

## 참조 사이트

- https://day.js.org/docs/en/plugin/utc
- https://day.js.org/docs/en/plugin/timezone

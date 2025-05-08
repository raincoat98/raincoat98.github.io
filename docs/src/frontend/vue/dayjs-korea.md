# 🇰🇷 Vue에서 dayjs로 한국 시간(KST) 처리하는 법 정리

안녕하세요! 프론트엔드 개발하고 있는 상욱입니다. 😄  
Vue 프로젝트 하다 보면 날짜 다룰 일이 진짜 많죠.  
게시글 작성 시간, 채팅 시간, 예약 시간 등등…  
이럴 때마다 매번 new Date() 쓰면서 고생하다가,  
저는 요즘 dayjs를 애용하고 있어요.

이번 포스팅에서는 dayjs를 Vue에서 어떻게 세팅하는지,  
그리고 한국 시간(KST) 기준으로 날짜를 포맷하는 법까지 차근차근 정리해볼게요.

---

## ✅ 1. dayjs 설치하기

먼저 기본 라이브러리부터 설치해요:

```bash
npm install dayjs
```

우리가 한국 시간(KST)을 다루려면 timezone 관련 플러그인도 같이 설치해줘야 해요:

```bash
npm install dayjs-plugin-utc dayjs-plugin-timezone
```

---

## 🧩 2. 플러그인 extend 하기

dayjs는 플러그인을 직접 extend() 해줘야 작동해요.  
특히 timezone 플러그인을 쓰려면 utc 플러그인도 먼저 extend 해줘야 해요!

```js
// utils/dayjs.js 또는 composables/dayjs.js 같은 파일로 만들기 추천
import dayjs from "dayjs";
import utc from "dayjs-plugin-utc";
import timezone from "dayjs-plugin-timezone";

// 플러그인 등록 (순서 중요!)
dayjs.extend(utc);
dayjs.extend(timezone);

// 기본 타임존을 'Asia/Seoul'로 지정
dayjs.tz.setDefault("Asia/Seoul");

export default dayjs;
```

이제 `import dayjs from '@/utils/dayjs'`만 하면, 항상 서울 시간 기준으로 날짜를 다룰 수 있어요. 편하죠?

---

## 🌍 3. 한국어(locale) 설정까지 해주기

한국식으로 '오전', '월요일' 같은 표현을 쓰려면, ko locale도 적용해줘야 해요:

```bash
npm install dayjs
```

(이미 설치했으면 생략 가능)

```js
// utils/dayjs.js에 이어서
import "dayjs/locale/ko";

dayjs.locale("ko"); // 날짜 표시를 한국어로
```

---

## 🧪 4. 사용 예시

이제 어디서든 아래처럼 사용하면 돼요:

```js
import dayjs from "@/utils/dayjs";

const now = dayjs();
console.log(now.format("YYYY년 MM월 DD일 A hh시 mm분"));
// 👉 예: 2025년 05월 08일 오후 03시 21분
```

또는 특정 시간 포맷팅:

```js
const formatted = dayjs("2025-05-08T06:00:00Z")
  .tz("Asia/Seoul")
  .format("YYYY-MM-DD HH:mm");

console.log(formatted); // 👉 2025-05-08 15:00
```

---

## 🗂️ 5. 자주 쓰는 포맷 정리

| 목적        | 포맷 문자열         | 결과 예시             |
| ----------- | ------------------- | --------------------- |
| 날짜만      | YYYY-MM-DD          | 2025-05-08            |
| 날짜+시간   | YYYY-MM-DD HH:mm    | 2025-05-08 15:00      |
| 한국식 표기 | YYYY년 M월 D일 dddd | 2025년 5월 8일 목요일 |
| 오전/오후   | A hh:mm             | 오후 03:00            |

---

## ❗ 잠깐! .tz() 안 되는 이유?

혹시 아래처럼 코드를 짰는데 .tz() 함수가 undefined라고 에러 나나요?

```js
import dayjs from "dayjs";

const time = dayjs().tz("Asia/Seoul"); // ❌ 에러 발생
```

그럴 땐 플러그인 extend를 안 한 거예요!  
반드시 이렇게 해줘야 .tz()가 작동해요:

```js
dayjs.extend(utc);
dayjs.extend(timezone);
```

---

## 🔚 마무리

저는 예전엔 moment.js 많이 썼는데, 요즘은 가볍고 빠른 dayjs로 갈아탔어요.  
Vue랑도 잘 어울리고, 특히 한국 시간(KST) 기준으로 날짜 다룰 일이 많은 분들에겐 정말 강추입니다.

이 글이 Vue에서 날짜 다룰 때 도움됐으면 좋겠어요!

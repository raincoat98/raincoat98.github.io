---
outline: deep
---

# "오늘 하루 보지 않기" 기능, Vue Cookie로 쉽게 만들기

웹 사이트를 운영하다 보면 공지사항이나 광고와 같은 중요 정보를 사용자에게 전달해야 할 상황이 종종 있습니다. 그러나 이러한 알림이 지나치게 자주 등장하면 사용자의 불편을 초래하고, 결국 웹사이트 방문을 중단할 수 있습니다. 이를 방지하기 위해 "오늘 하루동안 보지 않기" 또는 "일주일 동안 보지 않기"와 같은 기능을 구현함으로써 사용자가 원치 않는 알림을 숨길 수 있게 하는 것이 필요합니다.

## Vue Cookies 설치

첫 단계로, vue-cookies 라이브러리를 npm을 통해 설치합니다. 이 라이브러리는 Vue.js 애플리케이션에서 쿠키를 쉽게 관리할 수 있게 해줍니다.

```bash
npm install vue-cookies
```

## 코드

이제 본격적으로 코드를 작성해 봅시다. 코드는 크게 다음과 같은 부분으로 구성됩니다.

```md
<script setup>
import { ref, onMounted } from 'vue';
import VueCookies from 'vue-cookies';

const isDialogHidden = ref(false);

// 다이얼로그 표시 여부를 결정하는 함수
function checkDialogVisibility() {
  const hideDialogDate = VueCookies.get('hideDialogDate'); // 쿠키에서 "오늘 하루 보지 않기" 클릭 시 저장한 날짜 가져오기
  const today = new Date().toDateString(); // 오늘 날짜

  if (hideDialogDate === today) {
    isDialogHidden.value = true; // 오늘 하루 동안 보지 않기로 설정한 경우 다이얼로그 숨김
  }
}

// "오늘 하루 보지 않기" 버튼 클릭 이벤트 핸들러
function hideDialogForToday() {
  const today = new Date().toDateString();
  VueCookies.set('hideDialogDate', today, '1d'); // 1일 동안 쿠키 유지
  isDialogHidden.value = true;
}

// "닫기" 버튼 클릭 이벤트 핸들러
function hideDialog() {
  isDialogHidden.value = true;
}

onMounted(() => {
  checkDialogVisibility();
});
</script>

<template>
  <div v-if="!isDialogHidden">
    <div class="dialog">
      <p>여기에 다이얼로그 내용이 들어갑니다.</p>
      <button @click="hideDialogForToday">오늘 하루 보지 않기</button>
      <button @click="hideDialog">닫기</button>
    </div>
  </div>
</template>
```

## 코드 설명

- checkDialogVisibility 함수는 페이지가 로드될 때마다 호출되어, vue-cookies를 통해 저장된 쿠키를 확인합니다.
- 쿠키에 저장된 날짜가 오늘 날짜와 동일하면, isDialogHidden을 true로 설정해 다이얼로그를 숨깁니다.
- hideDialogForToday 함수는 "오늘 하루 보지 않기" 버튼의 클릭 이벤트 핸들러로, 오늘 날짜를 쿠키에 저장하고 다이얼로그를 숨깁니다. 쿠키의 유효 기간은 1일로 설정됩니다.
- hideDialog 함수는 "닫기" 버튼의 클릭 이벤트 핸들러로, 다이얼로그를 단순히 숨깁니다.
- onMounted 훅을 사용해 컴포넌트가 마운트될 때 checkDialogVisibility 함수를 호출하여, 페이지 로드 시 다이얼로그의 표시 여부를 결정합니다.

## 결론

이 방법을 통해 사용자는 불필요한 광고나 공지사항을 반복해서 보는 불편함 없이, 웹 사이트를 보다 편리하게 이용할 수 있습니다.

## More

Check out the documentation for the [vueCookie APIs](https://www.npmjs.com/package/vue-cookies).

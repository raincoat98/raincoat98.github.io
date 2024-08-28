# 폼 검증하기

이 문서에서는 `vee-validate`와 `yup`을 사용하여 VitePress에서 폼 검증을 구현하는 방법을 설명합니다. `vee-validate`는 Vue.js를 위한 폼 검증 라이브러리이며, `yup`은 객체 스키마를 정의하고 검증하는 JavaScript 라이브러리입니다.

### 참고 링크

- [vee-validate 공식 문서](https://vee-validate.logaretm.com/v4)
- [yup 공식 문서](https://github.com/jquense/yup)

아래 예제는 이메일, 전화번호, 생년월일 필드를 검증하고, 제출 시 검증을 확인하며, 검증 초기화 기능을 보여줍니다.

## 예제 코드

아래는 `vee-validate`와 `yup`을 사용하여 폼 검증을 구현한 코드입니다:

```vue
<script setup>
import { useForm } from "vee-validate";
import * as yup from "yup";
import { ref } from "vue";

// 폼 검증 스키마 정의
const { values, errors, handleSubmit, resetForm, defineField } = useForm({
  validationSchema: yup.object({
    email: yup
      .string()
      .email("유효한 이메일 주소를 입력하세요.")
      .required("이메일은 필수 항목입니다."),
    phone: yup
      .string()
      .matches(
        /^01[0-9]\d{7,8}$/,
        "유효한 전화번호 형식이 아닙니다. 예: 01012345678"
      )
      .required("전화번호는 필수 항목입니다."),
    birthdate: yup
      .date()
      .max(new Date(), "생년월일은 미래의 날짜일 수 없습니다.")
      .min(new Date(1900, 0, 1), "생년월일은 1900년 이후여야 합니다.")
      .required("생년월일은 필수 항목입니다.")
      .typeError("유효한 날짜 형식이 아닙니다. 예: YYYY-MM-DD"),
  }),
});

// 각 필드 정의
const [email, emailAttrs] = defineField("email");
const [phone, phoneAttrs] = defineField("phone");
const [birthdate, birthdateAttrs] = defineField("birthdate");

// 폼 제출 처리 함수
const onSubmit = handleSubmit((values) => {
  alert("폼이 성공적으로 제출되었습니다!\n" + JSON.stringify(values, null, 2));
});

// 폼 검증 초기화
const onReset = () => {
  resetForm();
};
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div>
      <input v-model="email" v-bind="emailAttrs" placeholder="이메일" />
      <span v-if="errors.email">{{ errors.email }}</span>
    </div>

    <div>
      <input
        v-model="phone"
        v-bind="phoneAttrs"
        placeholder="전화번호 (숫자만)"
      />
      <span v-if="errors.phone">{{ errors.phone }}</span>
    </div>

    <div>
      <input
        v-model="birthdate"
        v-bind="birthdateAttrs"
        placeholder="생년월일 (YYYY-MM-DD)"
        type="date"
      />
      <span v-if="errors.birthdate">{{ errors.birthdate }}</span>
    </div>

    <button type="submit">제출</button>
    <button type="button" @click="onReset">초기화</button>

    <pre>values: {{ values }}</pre>
    <pre>errors: {{ errors }}</pre>
  </form>
</template>
```

<iframe
  src="https://stackblitz.com/edit/ublm1d?embed=1&file=src%2FApp.vue"
  style="width: 100%; height: 500px; border: 0; overflow: hidden;"
  title="Form Validation Example"
></iframe>

## yup 검증 예시

`yup`을 사용하여 다양한 유형의 필드 검증을 구현할 수 있습니다. 아래는 위에서 사용된 각 필드의 검증 방법에 대한 설명입니다:

1. **이메일 검증**  
   이메일 필드는 반드시 유효한 이메일 형식이어야 하며, 필수 입력 항목입니다.

   ```javascript
   email: yup
     .string()
     .email("유효한 이메일 주소를 입력하세요.")
     .required("이메일은 필수 항목입니다.");
   ```

2. **전화번호 검증**  
   전화번호는 숫자만 입력할 수 있으며, `01`로 시작하고 10~11자리의 숫자를 요구합니다.

   ```javascript
   phone: yup
     .string()
     .matches(
       /^01[0-9]\d{7,8}$/,
       "유효한 전화번호 형식이 아닙니다. 예: 01012345678"
     )
     .required("전화번호는 필수 항목입니다.");
   ```

3. **생년월일 검증**  
   생년월일은 과거의 날짜여야 하며, 1900년 이후의 날짜여야 합니다.
   ```javascript
   birthdate: yup
     .date()
     .max(new Date(), "생년월일은 미래의 날짜일 수 없습니다.")
     .min(new Date(1900, 0, 1), "생년월일은 1900년 이후여야 합니다.")
     .required("생년월일은 필수 항목입니다.")
     .typeError("유효한 날짜 형식이 아닙니다. 예: YYYY-MM-DD");
   ```

위와 같이 `yup`의 다양한 검증 기능을 활용하여, 사용자 입력값을 보다 구체적이고 엄격하게 검증할 수 있습니다.
필요에 따라 정규식과 날짜 범위 조건을 조정하여 더 구체적인 검증을 구현할 수 있습니다.

# **Vue.js 컴포넌트 코드 컨벤션 가이드**

## **개요**

이 문서는 Vue.js 프로젝트에서 일관된 코드 작성을 위한 컨벤션을 제공합니다. 아래의 가이드라인을 따름으로써 효율적이고 유지보수가 용이한 코드를 작성할 수 있습니다. 개발자가 일관된 코드 스타일을 유지하면 코드의 가독성과 협업의 효율성을 크게 향상시킬 수 있습니다.

## **코드 예제**

```jsx
<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const inputText = ref('');
const todos = ref([]);

const filteredTodos = computed(() =>
  todos.value.filter(todo => todo.text.includes(inputText.value))
);

onMounted(() => {
  console.log('Component is mounted.');
});

const addTodo = () => {
  if (inputText.value.trim()) {
    todos.value.push({ id: Date.now(), text: inputText.value });
    inputText.value = '';
  }
};

watch(inputText, (newValue) => {
  console.log(`Input value changed to: ${newValue}`);
});
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <input v-model="inputText" placeholder="Type here">
    <button @click="addTodo">Add Todo</button>
    <ul>
      <li v-for="todo in filteredTodos" :key="todo.id">
        {{ todo.text }}
      </li>
    </ul>
  </div>
</template>

<style>
/* 여기에 스타일을 추가하세요 */
</style>
```

## **컨벤션 세부사항**

### **1. 컴포넌트 임포트**

- **목적**: 필요한 모든 Vue 컴포넌트를 체계적으로 임포트합니다.
- **세부사항**: 코드의 맨 위에서 모든 컴포넌트를 임포트합니다. 이렇게 함으로써 파일의 의존성을 명확히 할 수 있습니다.

### **2. 라이브러리와 유틸리티 임포트**

- **목적**: 외부 라이브러리와 유틸리티 함수를 임포트합니다.
- **세부사항**: Vue 외의 추가적인 라이브러리나 유틸리티는 컴포넌트 임포트 이후에 위치시킵니다.

### **3. 컴포넌트 옵션**

- **목적**: 컴포넌트의 프롭스와 이벤트를 정의합니다.
- **세부사항**: `defineProps`와 `defineEmits`를 사용하여 컴포넌트의 인터페이스를 명확히 합니다.

### **4. 리액티브 참조 및 상태**

- **목적**: 컴포넌트의 로컬 상태를 관리합니다.
- **세부사항**: `ref`나 `reactive`를 사용하여 데이터의 반응성을 관리합니다.

### **5. 컴퓨티드 프로퍼티**

- **목적**: 종속된 데이터에 기반한 계산된 값을 정의합니다.
- **세부사항**: `computed`를 사용하여 컴퓨티드 프로퍼티를 생성합니다.

### **6. 라이프사이클 훅**

- **목적**: 컴포넌트의 라이프사이클을 관리합니다.
- **세부사항**: `onMounted`, `onUpdated` 등을 사용하여 컴포넌트의 라이프사이클 이벤트를 처리합니다.

### **7. 메소드**

- **목적**: 컴포넌트의 함수적 동작을 정의합니다.
- **세부사항**: 컴포넌트 내에서 사용되는 메소드를 명확하게 작성합니다.

### **8. 워처**

- **목적**: 데이터의 변화를 감시합니다.
- **세부사항**: `watch`나 `watchEffect`를 사용하여 데이터의 변화를 감시하고, 이에 대응하는 동작을 정의합니다.

### **9. 지역 컴포넌트**

- **목적**: 특정 컴포넌트 내에서만 사용되는 지역 컴포넌트를 정의합니다.
- **세부사항**: 전역 범위가 아닌 특정 컴포넌트 내에서만 사용되는 컴포넌트를 정의합니다.

### **10. 스타일 임포트**

- **목적**: 컴포넌트의 스타일을 정의합니다.
- **세부사항**: 필요한 CSS 또는 SCSS 파일을 임포트합니다. 스타일 임포트는 코드의 마지막 부분에 위치합니다.

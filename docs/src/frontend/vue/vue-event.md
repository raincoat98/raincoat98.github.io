# Vue 이벤트 및 이벤트 수정자

Vue에서는 템플릿에서 다양한 이벤트를 사용하여 사용자와의 상호작용을 처리할 수 있으며,<br>
이벤트 수정자를 통해 이벤트 동작을 세밀하게 제어할 수 있습니다.<br>
이 문서에서는 Vue에서 자주 사용하는 이벤트와 이벤트 수정자의 종류와 사용 방법에 대해 정리합니다.

## 1. Vue 이벤트 종류

Vue 템플릿에서는 `@` 접두사를 사용하여 클릭, 입력, 포커스 등 <br>
다양한 이벤트를 요소에 직접 바인딩할 수 있습니다.

### 주요 이벤트 목록

| 이벤트         | 설명                                 | 발생 시기                                          | 사용 예시                                                     |
| -------------- | ------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------- |
| `@click`       | 클릭 이벤트                          | 사용자가 요소를 클릭할 때                          | `<button @click="handleClick">Click</button>`                 |
| `@dblclick`    | 더블 클릭 이벤트                     | 사용자가 요소를 두 번 클릭할 때                    | `<button @dblclick="handleDoubleClick">Double Click</button>` |
| `@focus`       | 포커스 이벤트                        | 입력 필드가 포커스를 얻을 때                       | `<input @focus="handleFocus" />`                              |
| `@blur`        | 포커스 해제 이벤트                   | 입력 필드에서 포커스가 해제될 때                   | `<input @blur="handleBlur" />`                                |
| `@input`       | 입력 이벤트                          | 사용자가 입력 필드에 값을 입력할 때                | `<input @input="handleInput" />`                              |
| `@change`      | 값 변경 완료 이벤트                  | 사용자가 입력 필드에서 값 입력 후 포커스를 바꿀 때 | `<input @change="handleChange" />`                            |
| `@submit`      | 폼 제출 이벤트                       | 폼이 제출될 때                                     | `<form @submit.prevent="handleSubmit">`                       |
| `@keydown`     | 키 누름 이벤트                       | 사용자가 키보드를 누를 때                          | `<input @keydown="handleKeydown" />`                          |
| `@keyup`       | 키 해제 이벤트                       | 사용자가 키보드를 누르다 떼었을 때                 | `<input @keyup="handleKeyup" />`                              |
| `@keypress`    | 키 누름 이벤트 (키가 입력될 때 발생) | 사용자가 키보드를 눌렀을 때 (텍스트 입력 시)       | `<input @keypress="handleKeypress" />`                        |
| `@mouseenter`  | 마우스 오버 이벤트                   | 마우스가 요소 위로 올라갈 때                       | `<div @mouseenter="handleMouseEnter">`                        |
| `@mouseleave`  | 마우스 오버 해제 이벤트              | 마우스가 요소에서 벗어날 때                        | `<div @mouseleave="handleMouseLeave">`                        |
| `@mousemove`   | 마우스 이동 이벤트                   | 마우스가 요소 위에서 이동할 때                     | `<div @mousemove="handleMouseMove">`                          |
| `@mouseover`   | 마우스 오버 이벤트                   | 마우스가 요소 위로 올라갔을 때                     | `<div @mouseover="handleMouseOver">`                          |
| `@mouseout`    | 마우스 오버 해제 이벤트              | 마우스가 요소 밖으로 벗어날 때                     | `<div @mouseout="handleMouseOut">`                            |
| `@contextmenu` | 컨텍스트 메뉴 (오른쪽 클릭) 이벤트   | 사용자가 요소를 오른쪽 클릭할 때                   | `<div @contextmenu="handleContextMenu">`                      |
| `@wheel`       | 마우스 휠 이벤트                     | 사용자가 마우스 휠을 움직일 때                     | `<div @wheel="handleWheel">`                                  |

---

## 2. Vue 이벤트 수정자

이벤트 수정자는 이벤트의 기본 동작과 전파 방식을 제어하는 데 사용됩니다.

| 이벤트 수정자 | 설명                                                                                          | 사용 예시                        |
| ------------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| `.stop`       | 이벤트 전파를 중단합니다. 부모 요소로의 이벤트 전파가 차단됩니다.                             | `@click.stop="handleClick"`      |
| `.prevent`    | 기본 이벤트 동작을 방지합니다. 주로 폼 제출 등의 기본 동작을 방지할 때 사용합니다.            | `@submit.prevent="handleSubmit"` |
| `.capture`    | 캡처링 단계에서 이벤트를 처리합니다. 이벤트가 자식에서 부모로 전달되기 전에 발생합니다.       | `@click.capture="handleClick"`   |
| `.self`       | 이벤트가 특정 요소에서만 발생하도록 제한합니다. 중첩된 요소의 이벤트 처리를 할 때 유용합니다. | `@click.self="handleClick"`      |
| `.once`       | 이벤트가 처음 발생할 때 한 번만 처리되도록 합니다.                                            | `@click.once="handleClick"`      |
| `.passive`    | 스크롤 성능을 향상시키기 위해 기본 동작을 비동기적으로 처리합니다.                            | `@scroll.passive="handleScroll"` |

### 수정자 사용 예시

```html
<!-- 기본 동작 방지 (폼 제출) -->
<form @submit.prevent="handleSubmit">...</form>

<!-- 이벤트 전파 차단 -->
<div @click.stop="handleClick">...</div>

<!-- 캡처링 단계에서 이벤트 처리 -->
<div @click.capture="handleClick">...</div>

<!-- 요소 자체에서만 이벤트 트리거 -->
<div @click.self="handleClick">여기를 클릭해 보세요.</div>

<!-- 한 번만 이벤트 처리 -->
<button @click.once="handleClick">한 번만 클릭 됩니다.</button>
```

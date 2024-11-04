# JavaScript 배열 메서드와 `for...of` 비동기 처리

안녕하세요! 😊 오늘은 자바스크립트 배열을 다룰 때 자주 사용되는<br>
네 가지 메서드(`map`, `filter`, `reduce`, `forEach`)와 함께<br>
`for...of`를 이용한 비동기 처리 방법을 알아볼게요.

## 배열 메서드

### 1. `map()`

`map` 메서드는 배열의 각 요소에 함수를 적용해서 새로운 배열을 만들어줍니다.<br>
원본 배열은 변경되지 않으니 안심하고 사용하세요!

#### 문법

```javascript
array.map((element, index, array) => {
  /* ... */
});
```

예시

```javascript
const numbers = [1, 2, 3, 4];
const doubled = numbers.map((num) => num * 2);
console.log(doubled); // [2, 4, 6, 8]
```

### 2. filter()

filter 메서드는 조건에 맞는 요소들만 걸러서 새로운 배열을 만들어줍니다.<br>
마찬가지로 원본 배열은 변경되지 않습니다.

문법

```javascript
array.filter((element, index, array) => {
  /* ... */
});
```

예시

```javascript
const numbers = [1, 2, 3, 4];
const evenNumbers = numbers.filter((num) => num % 2 === 0);
console.log(evenNumbers); // [2, 4]
```

### 3. reduce()

reduce 메서드는 배열의 각 요소를 합쳐 하나의 값으로 줄여줍니다.<br>
예를 들어 배열의 모든 숫자를 더하거나 곱할 때 유용해요.

문법

```javascript
array.reduce((accumulator, currentValue, index, array) => {
  /_ ... _/;
}, initialValue);
```

예시

```javascript
const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 10
```

### 4. forEach()

forEach 메서드는 배열의 각 요소에 대해 함수를 실행하지만, 결과를 반환하지 않습니다.<br>
주로 배열을 순회하며 요소에 대해 작업을 수행할 때 사용해요.

문법

```javascript
array.forEach((element, index, array) => {
  /_ ... _/;
});
```

예시

```javascript
const numbers = [1, 2, 3, 4];
numbers.forEach((num) => console.log(num * 2));
// 출력: 2, 4, 6, 8
```

### 5. for...of와 비동기 처리

비동기 작업이 포함된 배열 요소를 처리해야 할 때는<br>
for...of와 async/await를 함께 사용하는 것이 좋습니다.<br>
예를 들어, 배열 요소마다 순차적으로 fetch 요청을 보내야 할 때 유용해요.

예시 코드: for...of를 이용한 비동기 fetch

```javascript
const urls = [
  "https://api.example.com/data1",
  "https://api.example.com/data2",
  "https://api.example.com/data3",
];

(async () => {
  for (const url of urls) {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data); // 각 URL의 데이터를 순서대로 출력합니다.
  }
})();
```

설명

1. urls 배열에 여러 API 엔드포인트가 담겨 있습니다.
2. for...of 반복문 내에서 await를 사용하여 각 URL이 완료될 때까지 기다렸다가 다음 URL을 요청합니다.
3. 순차적으로 요청을 보내고 응답 데이터를 출력합니다.<br> 이렇게 하면 요청이 순서대로 진행되어야 할 때 유용해요!

요약

| 메서드     | 용도                     | 반환 값     | 원본 배열 수정 여부 |
| ---------- | ------------------------ | ----------- | ------------------- |
| `map`      | 각 요소 변환             | 새 배열     | 아니요              |
| `filter`   | 조건에 맞는 요소 필터링  | 새 배열     | 아니요              |
| `reduce`   | 배열 요소 하나로 줄이기  | 단일 값     | 아니요              |
| `forEach`  | 각 요소에 대해 작업 수행 | `undefined` | 아니요              |
| `for...of` | 비동기 작업을 순차 수행  | `undefined` |

이렇게 자바스크립트 배열 메서드와 비동기 반복문을 잘 활용하면,<br>
코드의 효율성과 가독성을 높일 수 있어요.<br>
배열 데이터를 다룰 때 어떤 메서드가 가장 적합할지 고민하며 사용해보세요! 😊

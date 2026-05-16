---
categories: [JavaScript]
title: JavaScript 배열 메서드 정리
description: map, filter, reduce, forEach와 for...of 비동기 처리까지. 실무에서 자주 쓰는 배열 메서드를 예제 위주로 정리합니다.
date: 2024-11-04
tags: [JavaScript, 배열, map, filter, reduce, forEach, 비동기]
platform: Browser / Node.js
readingTime: 5
---

# JavaScript 배열 메서드 정리

`map`, `filter`, `reduce`, `forEach` 네 가지와 비동기 처리에 쓰는 `for...of`까지 예제 위주로 정리했습니다.

---

## map()

각 요소에 함수를 적용해 **새 배열**을 반환합니다. 원본 배열은 변경되지 않습니다.

```js
const numbers = [1, 2, 3, 4];
const doubled = numbers.map((num) => num * 2);
console.log(doubled); // [2, 4, 6, 8]
```

---

## filter()

조건에 맞는 요소만 골라 **새 배열**을 반환합니다. 원본 배열은 변경되지 않습니다.

```js
const numbers = [1, 2, 3, 4];
const even = numbers.filter((num) => num % 2 === 0);
console.log(even); // [2, 4]
```

---

## reduce()

배열 요소를 누적해 **하나의 값**으로 줄입니다. 합산, 객체 변환 등에 자주 씁니다.

```js
const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 10
```

---

## forEach()

각 요소에 대해 함수를 실행합니다. **반환값이 없습니다** (`undefined`).
결과 배열이 필요하면 `map`을, 단순 순회에는 `forEach`를 씁니다.

```js
const numbers = [1, 2, 3, 4];
numbers.forEach((num) => console.log(num * 2));
// 2, 4, 6, 8
```

---

## for...of + async/await (비동기 순차 처리)

`forEach`는 `await`를 기다리지 않습니다. 비동기 작업을 순서대로 처리해야 한다면 `for...of`를 쓰세요.

```js
const urls = [
  "https://api.example.com/data1",
  "https://api.example.com/data2",
  "https://api.example.com/data3",
];

(async () => {
  for (const url of urls) {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data); // 순서대로 출력
  }
})();
```

각 요청이 완료된 후 다음 요청을 보내기 때문에 순서가 보장됩니다.

---

## 한눈에 비교

| 메서드 | 용도 | 반환값 | 원본 변경 |
|--------|------|--------|-----------|
| `map` | 각 요소 변환 | 새 배열 | ✕ |
| `filter` | 조건 필터링 | 새 배열 | ✕ |
| `reduce` | 하나의 값으로 누적 | 단일 값 | ✕ |
| `forEach` | 단순 순회 | `undefined` | ✕ |
| `for...of` | 비동기 순차 처리 | `undefined` | ✕ |
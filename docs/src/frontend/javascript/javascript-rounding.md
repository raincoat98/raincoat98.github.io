---
categories: [JavaScript]
title: JavaScript 소수점 반올림 버그 해결 — Number.EPSILON, toFixed, Decimal 완전 정리
description: JavaScript 부동소수점 오차로 인한 반올림 버그 원인과 해결법. Number.EPSILON 패턴, toFixed 주의사항, decimal.js 활용까지 예제로 정리합니다.
created: 2026-01-08
tags: [JavaScript|orange, 반올림|orange, Math.round|teal, Number.EPSILON|teal, 부동소수점|orange, decimal.js|teal]
platform: Browser / Node.js
readingTime: 6
---

# JavaScript 소수점 반올림 제대로 하기

`Math.round(1.005 * 100) / 100`이 `1.01`이 아니라 `1`을 반환합니다.
부동소수점 때문에 발생하는 버그인데, 실무에서는 자주 마주칩니다.

---

## 왜 Math.round()만으로는 안 될까

JavaScript는 IEEE 754 부동소수점 방식을 따릅니다. 보이는 숫자와 내부 저장값이 다를 수 있어요.

```js
console.log(1.005);              // 1.005처럼 보이지만
console.log(1.005.toFixed(20));  // 실제로는 1.00499999999999990...

Math.round(1.005 * 100) / 100;   // 1 (틀림!)
```

**금융 계산, 가격 표시, 통계**에서 특히 치명적입니다.

---

## 정답 패턴 — Number.EPSILON 보정

`Number.EPSILON`(약 `2.22e-16`)을 더해서 부동소수점 오차를 보정합니다.

```js
const round = (num, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

round(1.005, 2);     // 1.01 ✓
round(2.675, 2);     // 2.68 ✓
round(0.1 + 0.2, 2); // 0.3 ✓
```

대부분의 경우 이 함수 하나면 충분합니다.

### 자주 쓰는 자릿수는 전용 함수로

대량 데이터를 반복 처리할 때는 전용 함수가 빠릅니다.

```js
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const round3 = (n) => Math.round((n + Number.EPSILON) * 1000) / 1000;

prices.map(round2);  // 가장 빠름
```

---

## 버림 / 올림

```js
const floorRound = (n, d = 0) => Math.floor(n * 10 ** d) / 10 ** d;
const ceilRound = (n, d = 0) => Math.ceil(n * 10 ** d) / 10 ** d;

floorRound(1.999, 2); // 1.99
ceilRound(1.001, 2);  // 1.01
```

---

## 금융·정산은 정수 단위로

정확도가 절대적인 영역(돈 계산)에서는 **소수점을 쓰지 말고 정수 단위로 계산**하세요. 가장 안전합니다.

```js
// 가격을 센트 단위로 저장
const cents = Math.round(price * 100);

// 모든 계산을 정수로
const tax = Math.round(cents * 0.1);
const total = cents + tax;

// 출력할 때만 다시 소수점으로
const displayPrice = total / 100;
```

### 더 정밀하게 — Decimal 라이브러리

복잡한 금융 계산이라면 [decimal.js](https://github.com/MikeMcl/decimal.js)를 쓰세요.

```js
import Decimal from "decimal.js";

const price = new Decimal("1.005");
price.toDecimalPlaces(2).toNumber(); // 1.01
```

| 라이브러리 | 특징 |
|----------|------|
| `decimal.js` | 가장 인기, 기능 풍부 |
| `big.js` | 경량, 기본 기능 |
| `bignumber.js` | 큰 숫자 전문 |

---

## 계산용 vs 표시용 분리

UI에 표시할 때는 `toFixed()`를 쓰되, **계산 후 마지막에만** 사용해야 합니다.

```js
// ✅ 계산은 숫자로, 표시할 때만 문자열로
const total = round2(price + tax);
const display = `$${total.toFixed(2)}`;

// ❌ toFixed() 결과를 다시 계산에 쓰면 안 됨
const wrong = parseFloat(price.toFixed(2)) + 0.1; // 오차 재발생
```

---

## 상황별 추천

| 상황 | 방법 |
|------|------|
| UI 표시 | `toFixed()` |
| 일반 계산 | `round + Number.EPSILON` |
| 대량 연산 | 자릿수 전용 함수 (`round2`) |
| 금융·정산 | 정수 단위 계산 |
| 정밀 계산 | `decimal.js` |

---

## 자주 하는 실수

### 부동소수점 비교

```js
0.1 + 0.2 === 0.3;  // false ❌

// 올바른 비교
Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON;  // true ✓
```

### 반올림 중첩

```js
round(round(value, 2), 1);  // ❌ 정확도 떨어짐
round(value, 1);            // ✅ 한 번만
```

---

## 한 줄 정리

> 일반 계산은 `Number.EPSILON` 보정, 돈은 정수 단위, UI는 `toFixed()` — 그 외엔 `decimal.js`.

```js
// 어디서든 쓸 수 있는 유틸
export const round = (num, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
```
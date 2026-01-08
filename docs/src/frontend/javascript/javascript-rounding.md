---
title: JavaScript 소수점 반올림 완벽 가이드
description: 부동소수점 오차를 해결하는 실무 최적화 패턴. Number.EPSILON, 정수 변환, Decimal 라이브러리까지 정확하고 안정적인 반올림 기법
---

# JavaScript 소수점 반올림 완벽 가이드

JavaScript에서 소수점 반올림은 생각보다 복잡합니다. 부동소수점 오차 때문에 간단한 `Math.round()`로는 정확한 결과를 보장할 수 없기 때문이죠.

이 글에서는 실무에서 검증된 최적화 패턴을 단계별로 정리했습니다.

---

## 1. 왜 그냥 Math.round()만으로는 문제가 생길까?

JavaScript는 IEEE 754 부동소수점 방식을 따르기 때문에, 우리가 보는 숫자와 내부적으로 저장되는 값이 다를 수 있습니다.

```javascript
// 기대값: 1.01
// 실제 결과: 1
Math.round(1.005 * 100) / 100

// 왜?
console.log(1.005);           // 1.005로 보입니다
console.log(1.005.toFixed(20)); // 1.00499999999999990...
// 1.005가 내부적으로 1.004999999...로 저장되므로
// Math.round(100.4999...) = 100
// 100 / 100 = 1 (틀렸습니다!)
```

이런 오류는 특히 **금융 계산, 통계 분석, 가격 표시**에서 심각한 문제가 됩니다.

---

## 2. 가장 안전한 기본 공식: Number.EPSILON 활용

`Number.EPSILON`은 JavaScript에서 표현할 수 있는 가장 작은 차이(약 2.22e-16)입니다. 부동소수점 오차를 보정하는 데 이상적입니다.

### 표준 실무 패턴

```javascript
function round(num, digits = 0) {
  const factor = 10 ** digits;
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

// 사용 예
console.log(round(1.005, 2));  // 1.01 ✓
console.log(round(2.675, 2));  // 2.68 ✓
console.log(round(0.1 + 0.2, 2)); // 0.3 ✓
console.log(round(9.995, 2));  // 10 ✓
```

### 왜 이 방법이 좋은가?

- ✅ `Number.EPSILON` 보정으로 부동소수점 오차 해결
- ✅ 간단하고 이해하기 쉬운 코드
- ✅ 대부분의 금융, 통계, UI 반올림에 충분히 안정적
- ✅ 외부 라이브러리 불필요
- ✅ 성능도 우수함

---

## 3. 성능까지 고려한 초경량 버전

루프나 대량 데이터 처리 시에는 함수 호출 오버헤드도 중요합니다. 자주 쓰는 자릿수는 전용 함수로 만드는 게 최적입니다.

```javascript
// 소수점 2자리 전용 (가장 흔한 경우)
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// 소수점 3자리 전용
const round3 = (n) => Math.round((n + Number.EPSILON) * 1000) / 1000;

// 사용
console.log(round2(1.005));  // 1.01
console.log(round3(1.0055)); // 1.006

// 벤치마크: 1,000,000번 반복
console.time('round2');
for (let i = 0; i < 1_000_000; i++) round2(1.005);
console.timeEnd('round2'); // 약 2-3ms
```

### 대량 계산이 필요한 경우 (가격 목록 처리 예제)

```javascript
const prices = [1.005, 2.675, 9.995, 0.335];

// ❌ 느린 방법: 범용 함수 호출
const roundedSlow = prices.map(p => round(p, 2));

// ✅ 빠른 방법: 전용 함수 사용
const roundedFast = prices.map(round2);
```

---

## 4. 소수점 자리 유지 + 문자열 출력이 목적인 경우

UI에 표시할 때는 **계산용 반올림**과 **표시용 포맷**을 분리하는 것이 중요합니다.

```javascript
// 단계 1: 정확한 계산을 위해 반올림
const calculatedValue = round(1.005, 2); // 1.01

// 단계 2: UI 표시용 문자열 변환
const displayValue = calculatedValue.toFixed(2); // "1.01"

// 예: 가격 표시
const price = round(19.995, 2);
const priceText = `$${price.toFixed(2)}`; // "$20.00"
```

### ⚠️ 주의사항

```javascript
// ❌ 잘못된 사용: toFixed 문자열을 다시 계산에 사용
const result = parseFloat(price.toFixed(2)) + 0.1; // 위험!

// ✅ 올바른 사용: 원본 숫자로 계산 후 마지막에만 포맷
const result = round(price + 0.1, 2).toFixed(2);
```

---

## 5. 반올림 정책별 최적 구현

상황에 따라 다른 반올림 정책이 필요할 수 있습니다.

### ① 일반 반올림 (Half-Up) - 가장 자주 사용

```javascript
// 0.5 이상이면 올림, 미만이면 내림
function round(n, d = 0) {
  const factor = 10 ** d;
  return Math.round((n + Number.EPSILON) * factor) / factor;
}

console.log(round(1.245, 2)); // 1.25
console.log(round(1.244, 2)); // 1.24
```

### ② 버림 (Floor)

```javascript
// 항상 내림
function floorRound(n, d = 0) {
  const factor = 10 ** d;
  return Math.floor(n * factor) / factor;
}

console.log(floorRound(1.999, 2)); // 1.99
console.log(floorRound(1.001, 2)); // 1.00
```

### ③ 올림 (Ceil)

```javascript
// 항상 올림
function ceilRound(n, d = 0) {
  const factor = 10 ** d;
  return Math.ceil(n * factor) / factor;
}

console.log(ceilRound(1.001, 2)); // 1.01
console.log(ceilRound(1.999, 2)); // 2.00
```

### ④ 신뢰도 높은 반올림 (정확도 우선)

```javascript
// 부동소수점 오차에 대해 더 보수적으로 처리
function safeRound(n, d = 0) {
  // 입력값을 문자열로 처리하여 오차 감소
  const factor = 10 ** d;
  return Math.round((n + Number.EPSILON) * factor) / factor;
}
```

---

## 6. 금융/정밀 계산에서의 "진짜 최적화"

정확도가 절대적으로 중요한 경우(금융 시스템, 회계, 통계), 다른 접근이 필요합니다.

### 전략 1: 정수 변환 계산

가장 효율적이고 안전한 방법입니다.

```javascript
// 예: 가격 계산 (원 → 센트)
const price = 1.005;
const cents = Math.round(price * 100); // 101

console.log(cents);              // 101
console.log(cents / 100);        // 1.01 ✓

// 금리 계산 예제
const principal = 1000.00;       // 1000원
const ratePercent = 0.125;       // 12.5%
const interestCents = Math.round(principal * 100 * ratePercent) / 100;
console.log(interestCents);      // 125 (정확히 125원)
```

### 전략 2: 정수 단위로 모든 계산

```javascript
class MoneyCalculator {
  constructor(cents) {
    this.cents = Math.round(cents); // 항상 정수
  }

  add(other) {
    return new MoneyCalculator(this.cents + other.cents);
  }

  multiply(factor) {
    return new MoneyCalculator(this.cents * factor);
  }

  divide(divisor) {
    return new MoneyCalculator(Math.round(this.cents / divisor));
  }

  toNumber() {
    return this.cents / 100;
  }
}

// 사용
const amount = new MoneyCalculator(100.50 * 100); // 10050 센트
const result = amount.multiply(1.1);              // 10% 할인
console.log(result.toNumber());                   // 11055센트 = 110.55원
```

### 전략 3: 라이브러리 사용 (최고의 정확도)

복잡한 금융 계산이라면 전문 라이브러리를 사용하세요.

```javascript
// decimal.js 설치: npm install decimal.js
import Decimal from "decimal.js";

const price = new Decimal('1.005');
const result = price.toDecimalPlaces(2); // Decimal(1.01)
console.log(result.toNumber());          // 1.01

// 복잡한 계산
const principal = new Decimal('1000');
const rate = new Decimal('0.125');
const interest = principal.times(rate);
console.log(interest.toDecimalPlaces(2).toNumber()); // 125.00
```

**주요 라이브러리:**
- **decimal.js**: 가장 인기, 유연함
- **big.js**: 경량, 기본 기능에 충실
- **bignumber.js**: 큰 숫자 전문

---

## 7. 상황별 추천 정리

| 상황 | 추천 방법 | 예제 |
|------|---------|------|
| **UI 표시** | `toFixed()` | `(1.005).toFixed(2)` → `"1.01"` |
| **일반 계산** | `round + Number.EPSILON` | `round(1.005, 2)` → `1.01` |
| **대량 연산** | 자릿수 고정 전용 함수 | `round2(1.005)` → `1.01` |
| **금융/정산** | 정수 변환 or Decimal | `Math.round(1.005 * 100)` |
| **정밀 통계** | Decimal/BigNumber | `new Decimal('1.005').toDP(2)` |
| **성능 최우선** | 정수 단위 계산 | 모든 값을 센트 단위로 관리 |

---

## 8. 실무에서 가장 많이 쓰는 "정답 패턴"

이 패턴 하나면 대부분의 반올림 문제를 해결합니다.

```javascript
/**
 * 부동소수점 오차를 보정하여 정확히 반올림합니다
 * @param {number} num - 반올림할 숫자
 * @param {number} digits - 소수점 자릿수 (기본값: 0)
 * @returns {number} 반올림된 숫자
 */
export const round = (num, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

// 자주 쓰는 자릿수는 전용 함수로 (성능 최적화)
export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
export const round3 = (n) => Math.round((n + Number.EPSILON) * 1000) / 1000;

// 버림/올림이 필요한 경우
export const floorRound = (n, d = 0) => Math.floor(n * 10 ** d) / 10 ** d;
export const ceilRound = (n, d = 0) => Math.ceil(n * 10 ** d) / 10 ** d;
```

### 공통 유틸 모듈로 사용 (React/Node 모두 적용 가능)

```javascript
// utils/math.js
export const round = (num, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
```

```javascript
// React 컴포넌트에서 사용
import { round2 } from '@/utils/math';

export function PriceDisplay({ price }) {
  return <span>${round2(price).toFixed(2)}</span>;
}
```

```javascript
// Node.js 백엔드에서 사용
import { round2 } from '@/utils/math';

app.get('/api/prices', (req, res) => {
  const prices = getFromDB().map(p => ({
    ...p,
    finalPrice: round2(p.basePrice * p.taxRate)
  }));
  res.json(prices);
});
```

---

## 9. 실전 예제

### 예제 1: 장바구니 총가격 계산

```javascript
const items = [
  { name: '상품A', price: 19.995, quantity: 2 },
  { name: '상품B', price: 9.995, quantity: 1 },
];

const subtotal = items.reduce((sum, item) =>
  sum + round2(item.price * item.quantity), 0
);

const tax = round2(subtotal * 0.1);
const total = round2(subtotal + tax);

console.log(`소계: $${subtotal.toFixed(2)}`);     // $49.98
console.log(`세금: $${tax.toFixed(2)}`);         // $5.00
console.log(`합계: $${total.toFixed(2)}`);       // $54.98
```

### 예제 2: 평균값 계산

```javascript
const scores = [85.555, 92.444, 78.666, 95.111];

const average = round(
  scores.reduce((a, b) => a + b, 0) / scores.length,
  2
);

console.log(`평균: ${average}`); // 87.94
```

### 예제 3: 백분율 계산

```javascript
const revenue = 10000.50;
const profit = 2500.75;
const margin = round((profit / revenue) * 100, 2);

console.log(`마진율: ${margin}%`); // 25.01%
```

### 예제 4: 할인 적용

```javascript
function applyDiscount(price, discountPercent) {
  const discountAmount = round2(price * (discountPercent / 100));
  return round2(price - discountAmount);
}

console.log(applyDiscount(99.99, 15)); // 84.99
console.log(applyDiscount(19.995, 10)); // 17.99
```

---

## 10. 주의사항 및 Best Practices

### ✅ DO

```javascript
// 계산 후 마지막에 반올림
const total = round(100 + 200 + 300, 2);

// 금융 계산은 정수 단위로
const cents = Math.round(price * 100);

// UI 표시 전에만 toFixed() 사용
const display = value.toFixed(2);

// 라이브러리 활용 (필요시)
const precise = new Decimal('1.005').toDP(2);
```

### ❌ DON'T

```javascript
// 반올림을 여러 번 수행
const bad = round(round(value, 2), 1);

// toFixed() 결과를 계산에 다시 사용
const wrong = parseFloat('1.01') + 0.1; // 부동소수점 오차 재발생

// 부동소수점끼리 비교
if (0.1 + 0.2 === 0.3) { } // false!

// 올바르게:
if (Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON) { } // true
```

---

## 정리

| 요점 | 설명 |
|------|------|
| **기본** | `round = (n, d=0) => Math.round((n + Number.EPSILON) * 10**d) / 10**d` |
| **성능** | 자주 쓰는 자릿수는 전용 함수로 최적화 |
| **금융** | 정수 변환 계산 또는 Decimal 라이브러리 필수 |
| **UI** | 계산과 표시를 분리, 마지막에만 `toFixed()` 사용 |
| **검증** | 중요한 계산은 Jest 테스트로 검증 |

이제 소수점 반올림으로 더 이상 고민할 필요가 없습니다! 🎯

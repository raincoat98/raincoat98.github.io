---
categories: [JavaScript]
title: JavaScript 객체 복사, 뭐가 다를까?
description: structuredClone, lodash cloneDeep, JSON.parse/stringify 세 가지 깊은 복사 방법의 차이점과 각 방법의 장단점을 비교합니다.
date: 2026-05-16
updated: 2026-05-16
tags: [JavaScript, Frontend]
platform: Frontend
readingTime: 3
---

# JavaScript 객체 복사, 뭐가 다를까?

JavaScript에서 객체를 복사하는 방법은 여러 가지가 있습니다. 이 글에서는 가장 많이 쓰이는 세 가지 방법(`structuredClone`, `lodash cloneDeep`, `JSON.parse(JSON.stringify())`)을 비교해보겠습니다 😃

## structuredClone

`structuredClone`은 JavaScript에 내장된 깊은 복사 기능입니다. 중첩된 객체나 다양한 데이터 타입도 문제없이 복사할 수 있습니다. 원본 데이터를 수정해도 복사된 데이터에는 영향을 주지 않습니다.

```javascript
const original = {
  name: "Test Object",
  date: new Date(),
  nested: {
    count: 5,
    flags: new Set([true, false]),
  },
};

const cloned = structuredClone(original);

console.log(cloned);
// { name: 'Test Object', date: Date 객체, nested: { count: 5, flags: Set { true, false } } }
```

**장점**:

- **깊은 복사**: 객체 내부의 중첩된 객체까지 모두 새롭게 복사합니다
- **다양한 타입 지원**: `Date`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, `ImageData` 등 내장 객체 타입과 사용자 정의 객체도 지원합니다
- **별도 라이브러리 불필요**: 브라우저와 Node.js에 내장되어 있습니다

**단점**:

- 복사할 수 없는 데이터 타입(예: `Function`)을 만나면 예외를 발생시킵니다

## lodash cloneDeep

`_.cloneDeep()`은 lodash 라이브러리의 깊은 복사 함수입니다. lodash는 JavaScript의 대표적인 유틸리티 라이브러리로, 광범위한 데이터 조작 기능을 제공합니다.

```javascript
import _ from "lodash"; // ⚠️ 71.5K (gzipped: 25.3K) 높은 용량

const original = {
  name: "Test Object",
  date: new Date(),
  nested: {
    count: 5,
    flags: new Set([true, false]),
  },
};

const cloned = _.cloneDeep(original);

console.log(cloned);
// { name: 'Test Object', date: Date 객체, nested: { count: 5, flags: Set {} } }
```

**장점**:

- **광범위한 호환성**: 오래된 브라우저에서도 사용할 수 있습니다
- **사용자 정의 가능**: 복사 과정에서 특정 동작을 사용자가 정의할 수 있습니다

**단점**:

- 일반적으로 `structuredClone`보다 속도가 느립니다
- 라이브러리를 추가로 설치해야 합니다 (번들 크기 증가)

## JSON.parse(JSON.stringify())

객체를 JSON 형식으로 직렬화한 다음 다시 객체로 변환하는 방식입니다. 가장 오래된 깊은 복사 트릭이기도 합니다.

```javascript
const original = {
  name: "Test Object",
  date: new Date(),
  nested: {
    count: 5,
    array: [1, 2, 3],
  },
};

const cloned = JSON.parse(JSON.stringify(original));

console.log(cloned);
// { name: 'Test Object', date: '2021-01-01T12:00:00.000Z', nested: { count: 5, array: [1, 2, 3] } }
```

**장점**:

- **간단한 구현**: 별도의 라이브러리나 함수 없이 사용할 수 있습니다
- **널리 사용되는 방법**: 모든 JavaScript 환경에서 지원됩니다

**단점**:

- `Date`, `RegExp`, `Function`, `Map`, `Set` 등을 복사할 수 없습니다 (`Date`는 문자열로 변환됨)
- 큰 객체를 다룰 때 성능이 저하될 수 있습니다

## 한눈에 비교

| 항목 | structuredClone | lodash cloneDeep | JSON.parse/stringify |
|------|:-:|:-:|:-:|
| 속도 | 빠름 | 보통 | 빠르지만 큰 객체에선 느림 |
| Date, Map, Set 지원 | ✓ | ✓ | ✕ |
| Function 복사 | ✕ | ✕ | ✕ |
| 외부 라이브러리 | 불필요 | 필요 | 불필요 |
| 브라우저 호환성 | 모던 브라우저 | 모든 환경 | 모든 환경 |

## 결론

다른 복사 방법들도 있지만, 가볍고 깊은 복사가 가능한 `structuredClone`을 사용하여 보다 쉽게 데이터를 복사하고 사용해 보세요. 별도 설치가 필요 없고, 대부분의 데이터 타입을 안전하게 복사합니다.

오래된 브라우저를 지원해야 하거나 커스텀 복사 로직이 필요한 경우에만 lodash를 고려하면 됩니다.
test

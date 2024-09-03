# [es-tookit](https://es-toolkit.slash.page/ko/intro.html)

[[toc]]

es-toolkit은 JavaScript 개발자가 자주 사용하는 다양한 함수들을 현대적으로 구현한 유틸리티 라이브러리입니다.
lodash와 같은 유사한 기능을 제공하지만, 더 작은 번들 사이즈와 더 빠른 성능을 목표로 설계되었습니다.
이는 프로젝트의 효율성과 성능을 향상시키고자 하는 개발자들에게 훌륭한 대안이 될 수 있습니다.

**기존 프로젝트에서의 문제점**

기존 프로젝트에서 lodash를 사용했지만, 사용하는 기능에 비해 라이브러리 용량이 크다고 느껴 대안을 찾던 중 es-toolkit을 발견하게 되었습니다.

## 설치 방법

Node.js  
es-toolkit은 Node.js 18 또는 이후 버전을 지원해요.<br>
es-toolkit을 설치하기 위해서는 아래 명령어를 사용해주세요.

::: code-group

```sh [npm]
npm install es-toolkit
```

```sh [pnpm]
pnpm add es-toolkit
```

```sh [yarn]
yarn add es-toolkit
```

:::

## 자주 사용하는 기능 및 메서드

### 1. orderBy

orderBy는 여러 속성과 해당 순서 방향에 따라 객체 배열을 정렬하는 함수입니다.<br>
주어진 조건(criteria)과 지정한 순서 방향(orders)에 따라 배열을 정렬합니다.<br>

조건이 프로퍼티 이름이면, 해당하는 프로퍼티 값에 따라 정렬합니다.<br>
조건이 함수이면, 함수가 반환하는 값에 따라 정렬합니다.<br>
배열은 지정된 순서에 따라 오름차순(asc) 또는 내림차순(desc)으로 정렬됩니다.<br>
조건에 따라 두 요소의 값이 같으면, 다음 조건으로 정렬됩니다.

사용법:

```typescript
import { orderBy } from "es-toolkit/array";

const users = [
  { user: "fred", age: 48 },
  { user: "barney", age: 34 },
  { user: "fred", age: 40 },
  { user: "barney", age: 36 },
];

// 'user'를 오름차순으로, 'age'를 내림차순으로 정렬
const result = orderBy(users, [(obj) => obj.user, "age"], ["asc", "desc"]);
console.log(result);
// 출력:
// [
// { user: 'barney', age: 36 },
// { user: 'barney', age: 34 },
// { user: 'fred', age: 48 },
// { user: 'fred', age: 40 }
// ]
```

### 2. sortBy

sortBy는 주어진 조건에 따라 객체로 이루어진 배열을 정렬하는 함수입니다.<br>
기본적으로 배열은 오름차순으로 정렬되며,<br>
조건에 따라 두 요소의 값이 같으면 다음 조건을 적용해 정렬합니다.

- 사용법

```typescript
import { sortBy } from "es-toolkit/array";

const users = [
  { user: "foo", age: 24 },
  { user: "bar", age: 7 },
  { user: "foo", age: 8 },
  { user: "bar", age: 29 },
];

// 프로퍼티 이름으로 정렬
const sortedUsers = sortBy(users, ["user", "age"]);
console.log(sortedUsers);
// 출력: [ { user: 'bar', age: 7 }, { user: 'bar', age: 29 }, { user: 'foo', age: 8 }, { user: 'foo', age: 24 } ]
```

### 3. isNil

isNil은 주어진 값이 null이나 undefined인지 확인하는 함수입니다.<br>
이 함수는 TypeScript의 타입 가드로 사용할 수 있어,<br>
주어진 값을 null이나 undefined 타입으로 좁히는 데 유용합니다.

- 사용법

```typescript
import { isNil } from "es-toolkit/predicate";

const value1 = null;
const value2 = undefined;
const value3 = 42;

console.log(isNil(value1)); // true
console.log(isNil(value2)); // true
console.log(isNil(value3)); // false
```

### 4. cloneDeep

cloneDeep은 주어진 객체를 깊은 복사하는 함수입니다.<br>
이 함수는 객체 내 중첩된 객체나 배열까지도 재귀적으로 복사하여 새로운 메모리 주소에 할당합니다.<br>
lodash의 cloneDeep과 동일한 기능을 제공합니다.

- 사용법

```typescript
import { cloneDeep } from "es-toolkit/object";

const original = { a: { b: { c: "deep" } }, d: [1, 2, { e: "nested" }] };
const cloned = cloneDeep(original);

console.log(cloned); // { a: { b: { c: 'deep' } }, d: [1, 2, { e: 'nested' }] }
console.log(original !== cloned); // true
```

### 5. debounce

debounce는 제공된 함수 호출을 지연시키는 debounce된 함수를 생성하는 함수입니다.<br>
debounce된 함수는 마지막 호출 후 지정된 시간(debounceMs)이 경과해야 호출됩니다.<br>
또한, 대기 중인 실행을 취소할 수 있는 cancel 메서드를 포함합니다.

사용법:

```typescript
import { debounce } from 'es-toolkit/function';

const debouncedFunction = debounce(() => {
console.log('실행됨');
}, 1000);

// 1초 안에 다시 호출되지 않으면, '실행됨'이 로깅됩니다.
debouncedFunction();

// 이전 호출이 취소되었으므로, 아무것도 로깅되지 않습니다.
debouncedFunction.cancel();
AbortSignal 사용 예시:

typescript
코드 복사
const controller = new AbortController();
const signal = controller.signal;

const debouncedWithSignalFunction = debounce(() => {
console.log('실행됨');
}, 1000, { signal });

// 1초 안에 다시 호출되지 않으면, '실행됨'이 로깅됩니다.
debouncedWithSignalFunction();

// debounce 함수 호출을 취소합니다.
controller.abort();
```

## 주요특징

- **최대 97% 더 작은 번들 사이즈**: lodash와 같은 유사 라이브러리와 비교했을 때, es-toolkit은 더 작은 번들 사이즈를 제공합니다.
- **2~3배 더 빠른 성능**: 최신 JavaScript API를 활용하여 더 빠른 속도로 동작합니다.
- **견고한 TypeScript 타입 지원**: 모든 함수는 TypeScript 타입을 내장하여 타입 안정성과 개발자 경험을 향상시킵니다.
- **100% 테스트 커버리지**: 높은 신뢰성을 보장하기 위해 전체 코드베이스에 대해 100% 테스트 커버리지를 목표로 합니다.

es-toolkit은 성능과 번들 크기 면에서 더 나은 대안을 찾고자 하는 개발자들에게 적합한 선택입니다.
<br>최신 JavaScript 환경과 TypeScript 지원을 중요시하는 프로젝트에서 es-toolkit을 사용하면<br>
보다 효율적이고 깔끔한 코드를 작성할 수 있습니다.

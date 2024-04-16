# 깊은 복사 이제는 structuredClone ❗️

## structuredClone

`structuredClone`은 JavaScript에서 복잡한 객체를 완벽하게 복사할 수 있는 기능입니다. 이를 사용하면 중첩된 객체나 다양한 데이터 타입도 문제없이 복사할 수 있습니다. 예를 들어, 원본 데이터를 수정해도 복사된 데이터에는 영향을 주지 않습니다. 이 기능은 데이터를 안전하게 다룰 때 매우 유용합니다 :) 지금부터 객체를 복사할 때 유용한 `structuredClone`을 알아봅시다.

### structuredClone 사용 예제

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
// 출력: { name: 'Test Object', date: Date 객체, nested: { count: 5, flags: Set { true, false } } }
```

- **깊은 복사**: `structuredClone`은 객체 내부의 중첩된 객체까지 모두 새롭게 복사합니다.
- **다양한 데이터 타입 지원**: `Date`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, `ImageData` 등 다양한 내장 객체 타입과 사용자 정의 객체도 지원합니다.
- **에러 처리**: 복사할 수 없는 데이터 타입을 만나면 예외를 발생시킵니다.

## 다른 복사 방법

### lodash

#### lodash의 `cloneDeep`과의 비교

`_.cloneDeep()` 함수는 lodash 라이브러리의 일부로, 깊은 복사를 수행합니다. lodash는 JavaScript의 유틸리티 라이브러리 중 하나로, 광범위한 데이터 조작 기능을 제공합니다.

**장점**:

- **광범위한 호환성**: 오래된 브라우저에서도 lodash를 사용할 수 있습니다.
- **사용자 정의 가능**: 복사 과정에서 특정 동작을 사용자가 정의할 수 있는 기능을 제공합니다.

**단점**:

- **속도**: 일반적으로 `structuredClone`보다 속도가 느립니다.
- **추가 라이브러리 필요**: lodash를 사용하기 위해서는 해당 라이브러리를 프로젝트에 추가해야 합니다.

```javascript
import _ from "lodash"; // ‼️ 71.5K (gzipped: 25.3K) 높은 용량을 가지고 있음

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
// 출력: { name: 'Test Object', date: Date 객체, nested: { count: 5, flags: Set {} } }
```

### JSON.parse와 JSON.stringify와의 비교

`JSON.parse(JSON.stringify(object))`는 객체를 깊은 복사하는 또 다른 방법입니다. 이 방법은 JSON 형식으로 객체를 직렬화한 다음 다시 객체로 변환합니다.

**장점**:

- **간단한 구현**: 별도의 라이브러리나 함수 없이 사용할 수 있습니다.
- **널리 사용되는 방법**: JSON 메서드는 모든 JavaScript 환경에서 지원됩니다.

**단점**:

- **제한된 데이터 타입 지원**: `Date`, `RegExp`, `Function` 등의 타입을 복사할 수 없습니다.
- **성능**: 큰 객체를 다룰 때 성능이 저하될 수 있습니다.

#### JSON.parse와 JSON.stringify 사용 예제

```javascript
const original = {
  name: "Test Object",
  date: new Date(),
  nested: {
    count: 5,
    array: [
      1, 2,

      3,
    ],
  },
};

const cloned = JSON.parse(JSON.stringify(original));

console.log(cloned);
// 출력: { name: 'Test Object', date: '2021-01-01T12:00:00.000Z', nested: { count: 5, array: [1, 2, 3] } }
```

## 결론

다른 복사 방법들도 있지만, 가볍고 깊은 복사가 가능한 `structuredClone`을 사용하여 보다 쉽게 데이터를 복사하고 사용해 보세요.

<Comment />

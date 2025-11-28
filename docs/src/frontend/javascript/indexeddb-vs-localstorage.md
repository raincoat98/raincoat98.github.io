# IndexedDB vs LocalStorage: 웹 스토리지 완벽 비교 가이드

웹 애플리케이션을 개발하다 보면 클라이언트 측에 데이터를 저장해야 하는 순간이 옵니다. 이때 가장 많이 고민하는 것이 바로 "IndexedDB를 쓸까, LocalStorage를 쓸까?"입니다. 오늘은 이 두 브라우저 스토리지 기술을 깊이 있게 비교해보겠습니다.

## 기본 개념

### LocalStorage

LocalStorage는 키-값 쌍으로 문자열 데이터를 저장하는 가장 단순한 형태의 웹 스토리지입니다. 사용법이 매우 직관적이고, 동기적으로 동작합니다.

```javascript
// 저장
localStorage.setItem('username', 'John');

// 읽기
const username = localStorage.getItem('username');

// 삭제
localStorage.removeItem('username');

// 전체 삭제
localStorage.clear();
```

### IndexedDB

IndexedDB는 브라우저에 내장된 NoSQL 데이터베이스입니다. 대용량 데이터를 구조화하여 저장할 수 있고, 인덱싱과 트랜잭션을 지원합니다. 비동기적으로 동작합니다.

```javascript
// IndexedDB 열기
const request = indexedDB.open('MyDatabase', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const objectStore = db.createObjectStore('users', { keyPath: 'id' });
  objectStore.createIndex('name', 'name', { unique: false });
};

request.onsuccess = (event) => {
  const db = event.target.result;
  
  // 데이터 저장
  const transaction = db.transaction(['users'], 'readwrite');
  const objectStore = transaction.objectStore('users');
  objectStore.add({ id: 1, name: 'John', age: 30 });
};
```

## 주요 차이점 비교

### 1. 저장 용량

- **LocalStorage**: 약 5-10MB (브라우저마다 다름)
- **IndexedDB**: 수백 MB에서 GB 단위까지 가능 (사용 가능한 디스크 공간에 따라 다름)

대용량 데이터를 다뤄야 한다면 IndexedDB가 명확한 선택입니다.

### 2. 데이터 타입

- **LocalStorage**: 문자열만 저장 가능 (객체는 JSON.stringify 필요)
- **IndexedDB**: JavaScript 객체, Blob, File 등 다양한 타입 저장 가능

```javascript
// LocalStorage - 객체 저장 시
const user = { name: 'John', age: 30 };
localStorage.setItem('user', JSON.stringify(user));
const savedUser = JSON.parse(localStorage.getItem('user'));

// IndexedDB - 객체 직접 저장
objectStore.add({ name: 'John', age: 30, profile: blobData });
```

### 3. 성능과 동작 방식

- **LocalStorage**: 동기적 API로 메인 스레드를 블로킹할 수 있음
- **IndexedDB**: 비동기적 API로 대용량 작업에서도 UI가 멈추지 않음

LocalStorage의 동기적 특성은 대량의 데이터를 읽거나 쓸 때 페이지를 느리게 만들 수 있습니다.

### 4. 쿼리 능력

- **LocalStorage**: 키로만 접근 가능, 검색 기능 없음
- **IndexedDB**: 인덱스를 활용한 효율적인 검색과 범위 쿼리 지원

```javascript
// IndexedDB 인덱스 검색
const index = objectStore.index('name');
const request = index.get('John');
```

### 5. 트랜잭션

- **LocalStorage**: 트랜잭션 개념 없음
- **IndexedDB**: ACID 트랜잭션 지원으로 데이터 무결성 보장

## 언제 무엇을 사용할까?

### LocalStorage를 선택하는 경우

- 저장할 데이터가 5MB 미만일 때
- 단순한 키-값 저장이 필요할 때
- 사용자 설정, 테마, 작은 캐시 데이터
- 빠른 개발이 필요할 때

**사용 예시**: 다크모드 설정, 언어 선택, 간단한 폼 데이터 임시 저장

### IndexedDB를 선택하는 경우

- 대용량 데이터를 저장해야 할 때
- 복잡한 데이터 구조와 관계가 필요할 때
- 오프라인 기능이 필요한 PWA
- 검색과 필터링이 필요할 때

**사용 예시**: 오프라인 이메일 클라이언트, 미디어 라이브러리, 게임 데이터, 대용량 폼 데이터

## 실전 활용 팁

### LocalStorage 최적화

```javascript
// 객체 저장 시 유틸리티 함수 만들기
const storage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
};
```

### IndexedDB 래퍼 라이브러리

IndexedDB의 복잡한 API 때문에 많은 개발자들이 래퍼 라이브러리를 사용합니다:

- **Dexie.js**: 가장 인기 있는 IndexedDB 래퍼
- **idb**: Google의 경량 Promise 기반 래퍼
- **localForage**: LocalStorage와 유사한 API로 IndexedDB 사용

```javascript
// Dexie.js 예시
import Dexie from 'dexie';

const db = new Dexie('MyDatabase');
db.version(1).stores({
  users: '++id, name, age'
});

// 간단한 CRUD
await db.users.add({ name: 'John', age: 30 });
const users = await db.users.where('age').above(25).toArray();
```

## 보안 고려사항

두 스토리지 모두 같은 도메인의 JavaScript에서 접근 가능하므로:

- XSS 공격에 취약할 수 있습니다
- 민감한 정보(비밀번호, 토큰 등)는 암호화하여 저장하세요
- HTTPS를 사용하여 전송 중 데이터를 보호하세요

## 마치며

LocalStorage와 IndexedDB는 각각의 장점이 있습니다. 프로젝트의 요구사항에 따라 적절한 선택을 하는 것이 중요합니다. 간단한 데이터는 LocalStorage로, 복잡하고 대용량 데이터는 IndexedDB로 관리하는 것이 일반적인 접근법입니다.

때로는 두 기술을 함께 사용하는 하이브리드 접근도 좋은 선택입니다. 예를 들어, 사용자 설정은 LocalStorage에, 애플리케이션 데이터는 IndexedDB에 저장하는 방식입니다.

여러분의 프로젝트에는 어떤 스토리지가 적합할까요? 댓글로 의견을 나눠주세요!

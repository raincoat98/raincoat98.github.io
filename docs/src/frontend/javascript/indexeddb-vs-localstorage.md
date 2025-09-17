# IndexedDB vs LocalStorage 차이 정리

## 1. 개요

개발하다 보면 이미지를 임시로 저장하거나, 사용자 설정을 저장해야 하는 경우가 종종 있어요.<br>
저도 실제로 프로젝트에서 이런 니즈가 생겨서 브라우저 저장소를 찾아봤는데,<br>
가장 많이 쓰이는 게 LocalStorage랑 IndexedDB였어요.

둘 다 "브라우저에 데이터를 저장한다"는 점에서는 비슷해 보이지만,<br>
막상 파고들어 보니 성격이 꽤 다르더라고요.<br>
그래서 저처럼 "언제 LocalStorage를 쓰고,<br>
언제 IndexedDB를 써야 하지?" 헷갈리는 분들이 있을 것 같아<br>
제가 직접 정리한 경험과 함께 비교해보려고 합니다.

## 2. LocalStorage

### 특징

- **저장 방식**: Key-Value (문자열 기반)
- **용량 제한**: 브라우저마다 다르지만 보통 5MB 정도
- **처리 방식**: 동기적(Sync) → 저장/조회 순간 UI 멈춤 발생 가능
- **데이터 구조**: 문자열만 저장 가능 (객체는 JSON.stringify 필요)
- **만료 없음**: 브라우저 꺼도 데이터 유지

### 장점

- 사용법이 아주 간단함
- 소규모 데이터 저장에 적합
- 빠른 조회

### 단점

- 용량 작음
- 동기 방식이라 대량 데이터 처리에 불리
- 보안에 취약 → 민감 정보 절대 저장 금지

### LocalStorage 사용 예제

```javascript
// 데이터 저장
localStorage.setItem("theme", "dark");
localStorage.setItem("user", JSON.stringify({ name: "홍길동", age: 30 }));

// 데이터 조회
const theme = localStorage.getItem("theme");
const user = JSON.parse(localStorage.getItem("user"));

// 데이터 삭제
localStorage.removeItem("theme");

// 전체 삭제
localStorage.clear();
```

## 3. IndexedDB

### 특징

- **저장 방식**: Key-Value 기반 + 인덱스 지원
- **용량 제한**: 수백 MB 이상 가능 (브라우저/사용자 권한 따라 다름)
- **처리 방식**: 비동기적(Async) → UI 끊김 없음
- **데이터 구조**: 객체 그대로 저장 가능 (JSON 변환 필요 없음)
- **트랜잭션 지원**: 여러 작업을 안정적으로 묶어서 처리
- **검색 성능**: 인덱스 기반으로 빠른 검색 가능

### 장점

- 대용량 데이터 저장 가능
- 구조화된 데이터 관리에 적합
- 오프라인 앱에서 유리
- UI 성능에 영향 없음

### 단점

- API 복잡 → 처음 학습 곡선이 있음
- 단순 저장에는 오버스펙

### IndexedDB 사용 예제

```javascript
// DB 연결
const request = indexedDB.open("MyDatabase", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;

  // Object Store 생성
  const objectStore = db.createObjectStore("users", { keyPath: "id" });

  // 인덱스 생성
  objectStore.createIndex("name", "name", { unique: false });
};

request.onsuccess = function (event) {
  const db = event.target.result;

  // 데이터 저장
  const transaction = db.transaction(["users"], "readwrite");
  const objectStore = transaction.objectStore("users");

  objectStore.add({ id: 1, name: "홍길동", age: 30 });

  // 데이터 조회
  const getRequest = objectStore.get(1);
  getRequest.onsuccess = function (event) {
    console.log(event.target.result);
  };
};
```

### IndexedDB 간단하게 사용하기 (Dexie.js 라이브러리)

```javascript
// Dexie.js를 사용하면 훨씬 간단해집니다
import Dexie from "dexie";

const db = new Dexie("MyDatabase");
db.version(1).stores({
  users: "++id, name, age",
});

// 데이터 저장
await db.users.add({ name: "홍길동", age: 30 });

// 데이터 조회
const users = await db.users.toArray();
const user = await db.users.get(1);

// 검색
const youngUsers = await db.users.where("age").below(25).toArray();
```

## 4. 비교 요약

| 구분        | LocalStorage                  | IndexedDB                |
| ----------- | ----------------------------- | ------------------------ |
| 저장 방식   | 문자열 기반 Key-Value         | 객체 기반 + 인덱스       |
| 용량        | 약 5MB                        | 수백 MB 이상             |
| 처리 방식   | 동기                          | 비동기                   |
| 데이터 구조 | 문자열만 저장 가능            | 객체 저장 가능           |
| 난이도      | 매우 간단                     | 조금 복잡                |
| 적합한 용도 | 설정값, 토큰 등 소규모 데이터 | 오프라인 앱, 대용량 캐싱 |

## 5. 실제 사용 시나리오

### LocalStorage가 적합한 경우

- 다크모드/라이트모드 설정
- 사용자 언어 설정
- 간단한 사용자 정보 (이름, 이메일)
- JWT 토큰 저장
- 폼 임시 저장 (자동 저장)

```javascript
// 테마 설정 저장
const saveTheme = (theme) => {
  localStorage.setItem("theme", theme);
};

// 폼 자동 저장
const autoSaveForm = (formData) => {
  localStorage.setItem("draft", JSON.stringify(formData));
};
```

### IndexedDB가 적합한 경우

- 오프라인 메모/노트 앱
- 이미지 캐시 저장
- 대용량 설정 데이터
- 채팅 메시지 히스토리
- 게임 세이브 데이터

```javascript
// 이미지 캐시 저장 (Dexie 사용)
const db = new Dexie("ImageCache");
db.version(1).stores({
  images: "url, blob, timestamp",
});

const cacheImage = async (url, blob) => {
  await db.images.put({
    url,
    blob,
    timestamp: Date.now(),
  });
};

const getCachedImage = async (url) => {
  return await db.images.get(url);
};
```

## 6. 성능 비교

### 작은 데이터 (< 1MB)

- **LocalStorage**: 빠름, 간단함
- **IndexedDB**: 오버헤드 있음, 복잡함

### 큰 데이터 (> 1MB)

- **LocalStorage**: 용량 제한, UI 블로킹
- **IndexedDB**: 안정적, 비동기 처리

## 7. 결론

### 언제 LocalStorage를 쓸까? 👉

- 가볍고 단순한 데이터
- 즉시 동기적으로 접근해야 하는 데이터
- 설정값, 토큰, 간단한 사용자 정보

### 언제 IndexedDB를 쓸까? 👉

- 대규모 데이터나 오프라인 기능이 필요한 앱
- 복잡한 검색이 필요한 데이터
- 메모 앱, 이미지 캐시, 파일 저장소

**간단히 말하면: 작은 건 LocalStorage, 큰 건 IndexedDB!**

이렇게 쓰는 게 제일 깔끔하고, 각각의 장점을 최대한 활용할 수 있습니다.

---
categories: [JavaScript]
title: IndexedDB vs LocalStorage 차이점 완전 비교 — 언제 무엇을 써야 할까
description: IndexedDB vs LocalStorage 저장 용량·동기/비동기·데이터 타입·브라우저 지원 완전 비교. 웹 스토리지 선택 기준과 실무 활용 팁을 정리합니다.
created: 2025-09-17
tags: [JavaScript|orange, IndexedDB|teal, LocalStorage|teal, 웹 스토리지|teal, 브라우저 저장소|teal]
platform: Browser
readingTime: 7
---

# IndexedDB vs LocalStorage 차이점 완전 비교

클라이언트에 데이터를 저장할 때 가장 많이 고민하는 두 가지입니다.
결론부터 말하면 **간단한 설정값은 LocalStorage, 대용량·구조화 데이터는 IndexedDB**입니다.

---

## 한눈에 비교

| 항목 | LocalStorage | IndexedDB |
|------|-------------|-----------|
| 저장 용량 | 5~10MB | 수백 MB ~ GB |
| 데이터 타입 | 문자열만 | 객체, Blob, File 등 |
| 동작 방식 | 동기 (메인 스레드 블로킹) | 비동기 |
| 검색·필터 | 키로만 접근 | 인덱스, 범위 쿼리 지원 |
| 트랜잭션 | 없음 | ACID 트랜잭션 지원 |
| 사용 난이도 | 쉬움 | 복잡 (래퍼 라이브러리 권장) |

---

## LocalStorage

키-값 쌍으로 문자열을 저장합니다. 사용법이 단순하고 동기적으로 동작합니다.

```js
// 저장
localStorage.setItem("theme", "dark");

// 읽기
const theme = localStorage.getItem("theme");

// 삭제
localStorage.removeItem("theme");
```

객체를 저장할 때는 직렬화가 필요합니다.

```js
// 저장
localStorage.setItem("user", JSON.stringify({ name: "John", age: 30 }));

// 읽기
const user = JSON.parse(localStorage.getItem("user"));
```

자주 쓴다면 유틸리티 함수로 감싸두는 게 편합니다.

```js
const storage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
};
```

---

## IndexedDB

브라우저에 내장된 NoSQL 데이터베이스입니다. 비동기로 동작하며 인덱싱과 트랜잭션을 지원합니다.

```js
const request = indexedDB.open("MyDatabase", 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const store = db.createObjectStore("users", { keyPath: "id" });
  store.createIndex("name", "name", { unique: false });
};

request.onsuccess = (event) => {
  const db = event.target.result;
  const tx = db.transaction(["users"], "readwrite");
  tx.objectStore("users").add({ id: 1, name: "John", age: 30 });
};
```

날 API가 복잡하기 때문에 실무에서는 래퍼 라이브러리를 씁니다.

### 래퍼 라이브러리

- **Dexie.js** — 가장 인기 있고 기능이 풍부함
- **idb** — Google이 만든 경량 Promise 기반 래퍼
- **localForage** — LocalStorage와 유사한 API로 IndexedDB 사용

```js
// Dexie.js 예시
import Dexie from "dexie";

const db = new Dexie("MyDatabase");
db.version(1).stores({ users: "++id, name, age" });

await db.users.add({ name: "John", age: 30 });
const result = await db.users.where("age").above(25).toArray();
```

---

## 언제 무엇을 쓸까

**LocalStorage**
- 다크모드, 언어 설정 같은 사용자 환경설정
- 5MB 미만의 단순 키-값 데이터
- 빠르게 구현해야 할 때

**IndexedDB**
- 오프라인 지원이 필요한 PWA
- 이미지, 파일 등 Blob 데이터 저장
- 검색·필터가 필요한 대용량 데이터
- 오프라인 이메일, 미디어 라이브러리, 게임 세이브 데이터

두 가지를 함께 쓰는 경우도 많습니다. 사용자 설정은 LocalStorage에, 애플리케이션 데이터는 IndexedDB에 분리하는 방식입니다.

---

## 보안 주의사항

두 스토리지 모두 같은 도메인의 JavaScript에서 접근 가능합니다.

- XSS 공격에 노출될 수 있으므로 민감한 정보(토큰, 비밀번호)는 저장하지 마세요
- 꼭 저장해야 한다면 암호화 후 저장하세요
- HTTPS 환경에서 사용하세요
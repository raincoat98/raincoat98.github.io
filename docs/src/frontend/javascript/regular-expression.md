---
category: [JavaScript]
title: JavaScript 정규식 한 번에 정리
description: 자주 사용하는 정규식 패턴과 기본 개념을 정리했습니다. 이메일, 전화번호, 비밀번호 등 실무에서 바로 쓰는 예제 위주로 정리합니다.
keywords: 정규식, Regular Expression, RegExp, JavaScript, 패턴 매칭, 문자열 검증
date: 2024-01-01
tags: [JavaScript]
platform: Browser / Node.js
readingTime: 6
---

# JavaScript 정규식 한 번에 정리

정규식은 외울 필요 없습니다. 패턴만 이해하면 필요할 때 조합해서 쓸 수 있습니다.
자주 쓰는 메타문자와 실무 패턴을 한 곳에 정리했습니다.

---

## 작성 방법

```js
// 리터럴 방식
/패턴/플래그

// RegExp 객체 방식
new RegExp("패턴", "플래그")
```

### 플래그

| 플래그 | 설명 |
|--------|------|
| `g` | 전체에서 모든 일치 항목 찾기 |
| `i` | 대소문자 구분 없이 검색 |
| `m` | 여러 줄 모드 (`^`, `$`를 각 줄에 적용) |

---

## 주요 메타문자

| 문자 | 의미 |
|------|------|
| `.` | 임의의 한 문자 |
| `^` | 문자열 시작 |
| `$` | 문자열 끝 |
| `*` | 0번 이상 반복 |
| `+` | 1번 이상 반복 |
| `?` | 0번 또는 1번 |
| `{n}` | 정확히 n번 반복 |
| `{n,m}` | n번 이상 m번 이하 반복 |
| `[abc]` | a, b, c 중 하나 |
| `[^abc]` | a, b, c 제외 |
| `\|` | OR |
| `()` | 그룹화 |

---

## 기본 사용법

### 패턴 확인

```js
const text = "Hello World!";

/World/.test(text);      // true
text.match(/World/);     // ["World"]
```

### 문자열 교체

```js
"I love JavaScript!".replace(/JavaScript/, "Vue.js");
// "I love Vue.js!"
```

---

## 실무 패턴 모음

### 이메일

```js
const email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

email.test("example@example.com"); // true
```

### 휴대전화 (010-0000-0000)

```js
const phone = /^010-\d{3,4}-\d{4}$/;

phone.test("010-1234-5678"); // true
```

### 비밀번호
대문자 1개 이상, 소문자 1개 이상, 숫자 1개 이상, 특수문자(`!$^&*`) 1개 이상, 8~20자리

```js
const password = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!$^&*])[A-Za-z\d!$^&*]{8,20}$/;
```

### 한글 + 영문만

```js
const korEng = /^[가-힣a-zA-Z]+$/;
```

### 영문만

```js
const eng = /^[a-zA-Z]+$/;
```

### 알파벳 + 숫자 + 하이픈만

```js
const slug = /^[a-zA-Z0-9\-]+$/;

slug.test("Hello-World"); // true
slug.test("Hello World"); // false — 공백 불가
slug.test("Hello_123");   // false — 밑줄 불가
```

---

## 특정 문자 제외 패턴

```js
/^[^-]+$/       // 하이픈(-) 제외
/^[^0-9]+$/     // 숫자 제외
/^[^abc]+$/     // a, b, c 제외
/^[^-_]+$/      // 하이픈, 밑줄 제외
```

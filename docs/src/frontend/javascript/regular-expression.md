# 정규식(Regular Expression)

안녕하세요!😄 개발자라면 누구나 한 번쯤은 정규식 때문에 머리를 쥐어뜯어 본 경험이 있으시죠? <br>
저 역시 매번 프로젝트마다 “아, 이거 또 정규식 써야 하네…” 하며 고생했던 기억이 납니다. <br>
그래서! 이번에 자주 쓰이는 정규식과 기본적인 개념을 한눈에 보기 좋게 정리해봤습니다.

저는 개발자로서 정규식과 씨름한 시간이 꽤 길었습니다. <br>
하지만 지금도 필요할 때마다 정규식을 새로 작성하거나 검색하며 시행착오를 겪고 있죠. <br>
이번 문서를 통해 조금이라도 정규식 작성의 부담을 덜고,<br> “아, 이거 이렇게 쓰면 되는구나!” 하는 순간을 느끼셨으면 좋겠습니다!

정규식은 어렵지만, 제대로 알면 정말 강력한 도구니까요. <br>
가볍고 밝은 마음으로 따라오세요. 🚀

그럼 시작해볼까요? 😊

## 1. 정규식 개요

정규식(Regular Expression)은 텍스트 데이터에서<br> 특정 패턴을 찾거나 수정하거나 검증하는 데 사용되는 강력한 도구입니다.
<br>주로 문자열 처리 작업에서 사용되며, 다양한 프로그래밍 언어에서 지원됩니다.

## 2. 정규식 작성 방법

정규식은 두 가지 방식으로 작성할 수 있습니다:

- **리터럴 방식**: `/패턴/플래그`

- **RegExp 객체 방식** (JavaScript 기준): `new RegExp("패턴", "플래그")`

### 주요 플래그

- `g`: 전역 검색 (모든 일치 항목 찾기)

- `i`: 대소문자 구분 없이 검색

- `m`: 여러 줄 모드 (각 줄에 대해 `^`와 `$` 적용)

## 3. 주요 메타문자

- `.`: 임의의 한 문자

- `^`: 문자열의 시작

- `$`: 문자열의 끝

- `*`: 0번 이상 반복

- `+`: 1번 이상 반복

- `?`: 0번 또는 1번

- `{n}`: 정확히 n번 반복

- `{n,}`: n번 이상 반복

- `{n,m}`: n번 이상, m번 이하 반복

- `[]`: 문자 집합 (예: `[a-z]`는 소문자 알파벳)

- `[^...]`: 문자 집합의 \***\*예외\*\*** (예: `[^a-z]`는 소문자 제외)

- `|`: OR 연산자

- `()`: 그룹화

## 4. 정규식 사용 예제

### 1) 문자열에서 패턴 찾기

```javascript
const text = "Hello World!";

const pattern = /World/;

console.log(pattern.test(text)); // true

console.log(text.match(pattern)); // ["World"]
```

### 2) 문자열 교체

```javascript
const text = "I love JavaScript!";

const pattern = /JavaScript/;

console.log(text.replace(pattern, "Vue.js")); // "I love Vue.js!"
```

### 3) 입력 값 검증 (이메일)

```javascript
const email = "example@example.com";

const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

console.log(pattern.test(email)); // true
```

### 5. 자주 쓰이는 정규식

**1) 문자만 (한글, 영문)**

```javascript
const pattern = /^[가-힣a-zA-Z]+$/;
```

**2) 영문자만 (대소문자)**

```javascript
const pattern = /^[a-zA-Z]+$/;
```

**3) 이름 정규식 (한글, 영문)**

```javascript
const pattern = /^[가-힣a-zA-Z]+$/;
```

**4) 휴대전화번호 (010-0000-0000 형태)**

```javascript
const pattern = /^010-\d{3,4}-\d{4}$/;
```

**5) 비밀번호**
**조건**: 영문 대문자 1개 이상, 소문자 1개 이상, 숫자 1개 이상, 특수문자 (!$^&\*) 중 1개 이상, 8~20자리

```javascript
const pattern =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!$^&*])[A-Za-z\d!$^&*]{8,20}$/;
```

**6) 특정 문자 예외 처리**

**특정 글자 - 제외**

```javascript
const pattern = /^[^-]+$/;
```

**숫자 제외**

```javascript
const pattern = /^[^0-9]+$/;
```

**특정 문자 집합 a, b, c 제외**

```javascript
const pattern = /^[^abc]+$/;
```

**특정 문자 -와 \_ 제외**

```javascript
const pattern = /^[^-_]+$/;
```

**6. 예제: 사용자 입력 검증**

**조건**

1.  알파벳 대소문자, 숫자, 하이픈(-)만 허용.

2.  문자열의 시작과 끝 검사.

**정규식**

```javascript
const pattern = /^[a-zA-Z0-9\-]+$/;
```

**예제 코드**

```javascript
const pattern = /^[a-zA-Z0-9\-]+$/;
```

```javascript
console.log(pattern.test("Hello123")); // true

console.log(pattern.test("Hello-World")); // true

console.log(pattern.test("Hello World")); // false (공백 포함)

console.log(pattern.test("Hello_123")); // false (밑줄 포함)

console.log(pattern.test("12345-67890")); // true
```

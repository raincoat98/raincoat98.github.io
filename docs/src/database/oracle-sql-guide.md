---
categories: [Database]
title: Oracle SQL 완전 가이드 — 개념부터 실무까지
description: Oracle SQL을 처음 배우는 사람부터 현업 개발자까지 쓸 수 있는 완전 가이드. 개념 → 문법 → 예시 → 실무 주의사항 순으로 정리했습니다.
created: 2026-06-04
tags: [SQL|teal, Oracle|red, Database|teal, 실무|orange]
platform: Database
readingTime: 20
---

# Oracle SQL 완전 가이드 — 개념부터 실무까지

> 이 문서 하나로 끝낸다. 처음 SQL을 배우는 사람부터 현업 개발자까지,
> Oracle SQL을 이해하고 실무에 바로 쓸 수 있도록 **개념 → 문법 → 예시 → 주의점** 순으로 정리했다.
> 예제 테이블은 `EMPLOYEE`(직원), `DEPARTMENT`(부서), `ORDERS`(주문)다.

---

## 목차

0. [SQL이란 & 4가지 분류](#0-sql이란--4가지-분류)
1. [데이터 타입](#1-데이터-타입)
2. [테이블 만들기 (DDL)](#2-테이블-만들기-ddl)
3. [조회의 기본 (SELECT)](#3-조회의-기본-select)
4. [조건 걸기 (WHERE)](#4-조건-걸기-where)
5. [정렬 (ORDER BY)](#5-정렬-order-by)
6. [함수 총정리](#6-함수-총정리)
7. [조건 분기 (CASE / DECODE)](#7-조건-분기-case--decode)
8. [집계와 그룹핑 (GROUP BY / HAVING)](#8-집계와-그룹핑-group-by--having)
9. [JOIN — 여러 테이블 연결](#9-join--여러-테이블-연결)
10. [서브쿼리](#10-서브쿼리)
11. [집합 연산 (UNION 등)](#11-집합-연산-union-등)
12. [윈도우(분석) 함수](#12-윈도우분석-함수)
13. [WITH(CTE)와 계층 쿼리](#13-withcte와-계층-쿼리)
14. [데이터 변경 (INSERT / UPDATE / DELETE / MERGE)](#14-데이터-변경-insert--update--delete--merge)
15. [트랜잭션 (COMMIT / ROLLBACK)](#15-트랜잭션-commit--rollback)
16. [페이징](#16-페이징)
17. [뷰 · 시퀀스 · 인덱스](#17-뷰--시퀀스--인덱스)
18. [실무 주의사항 모음](#18-실무-주의사항-모음)

---

## 0. SQL이란 & 4가지 분류

SQL은 데이터베이스에 "무엇을 원하는지"를 선언하는 언어다. 명령의 성격에 따라 4가지로 나뉘는데, 이 분류를 알면 각 명령이 **자동 저장되는지(COMMIT)**, **되돌릴 수 있는지(ROLLBACK)**가 바로 잡힌다.

| 분류 | 풀네임 | 대표 명령 | 역할 |
|------|--------|-----------|------|
| **DDL** | Data Definition | CREATE, ALTER, DROP, TRUNCATE | 구조(테이블 등) 정의 |
| **DML** | Data Manipulation | SELECT, INSERT, UPDATE, DELETE | 데이터 조작 |
| **TCL** | Transaction Control | COMMIT, ROLLBACK, SAVEPOINT | 변경 확정/취소 |
| **DCL** | Data Control | GRANT, REVOKE | 권한 부여/회수 |

> 중요: **DDL은 실행 즉시 자동 커밋**되어 되돌릴 수 없다. 반면 DML(INSERT/UPDATE/DELETE)은 COMMIT 전까지 ROLLBACK으로 취소할 수 있다. (15장 참고)

---

## 1. 데이터 타입

컬럼을 만들 때 "어떤 종류의 값이 들어가는지"를 정한다. Oracle에서 실무에 쓰는 핵심만 추렸다.

| 타입 | 설명 | 예 |
|------|------|----|
| `NUMBER(p, s)` | 숫자. p=전체 자릿수, s=소수 자릿수 | `NUMBER(10,2)` → 12345678.99 |
| `VARCHAR2(n)` | 가변 길이 문자열 (가장 많이 씀) | `VARCHAR2(100)` |
| `CHAR(n)` | 고정 길이 문자열 (남으면 공백 채움) | `CHAR(2)` → 'KR' |
| `DATE` | 날짜 + 시간(초 단위) | 2026-06-01 13:30:00 |
| `TIMESTAMP` | 날짜 + 시간(밀리초·타임존) | 정밀 시간 |
| `CLOB` | 대용량 텍스트 | 게시글 본문 |

> `VARCHAR`가 아니라 **`VARCHAR2`**를 쓰는 게 Oracle 관례다. 길이는 보통 바이트 기준이라, 한글을 넉넉히 담으려면 여유 있게 잡아두는 게 좋다.

---

## 2. 테이블 만들기 (DDL)

### 생성 (CREATE)

```sql
CREATE TABLE DEPARTMENT (
    DEPT_ID    NUMBER       PRIMARY KEY,           -- 기본키 (중복·NULL 불가)
    DEPT_NAME  VARCHAR2(50) NOT NULL,              -- 필수 입력
    LOCATION   VARCHAR2(50)
);

CREATE TABLE EMPLOYEE (
    EMP_NO     NUMBER       PRIMARY KEY,
    EMP_NAME   VARCHAR2(50) NOT NULL,
    DEPT_ID    NUMBER,
    SALARY     NUMBER(10)   DEFAULT 0,             -- 기본값
    HIRE_DATE  DATE         DEFAULT SYSDATE,
    EMAIL      VARCHAR2(100) UNIQUE,               -- 중복 불가
    CONSTRAINT FK_DEPT FOREIGN KEY (DEPT_ID)       -- 외래키
        REFERENCES DEPARTMENT (DEPT_ID)
);
```

### 제약조건 (Constraint)

데이터 무결성을 지키는 규칙이다. 잘못된 데이터가 애초에 못 들어오게 막아준다.

| 제약조건 | 의미 |
|----------|------|
| `PRIMARY KEY` | 각 행을 구분하는 고유값. 중복·NULL 불가 |
| `FOREIGN KEY` | 다른 테이블의 PK를 참조 (관계 연결) |
| `NOT NULL` | 반드시 값이 있어야 함 |
| `UNIQUE` | 중복 불가 (단, NULL은 허용) |
| `CHECK` | 조건 만족하는 값만 (`CHECK (SALARY >= 0)`) |
| `DEFAULT` | 값을 안 넣으면 들어가는 기본값 |

### 구조 변경 (ALTER) / 삭제 (DROP)

```sql
ALTER TABLE EMPLOYEE ADD (PHONE VARCHAR2(20));        -- 컬럼 추가
ALTER TABLE EMPLOYEE MODIFY (EMP_NAME VARCHAR2(100)); -- 타입 변경
ALTER TABLE EMPLOYEE DROP COLUMN PHONE;               -- 컬럼 삭제

DROP TABLE EMPLOYEE;        -- 테이블 통째로 삭제
TRUNCATE TABLE EMPLOYEE;    -- 데이터만 전부 삭제(구조 유지, 매우 빠름, 롤백 불가)
```

> `DELETE`(행 단위, 롤백 가능) vs `TRUNCATE`(전체 비우기, 빠름, 롤백 불가) vs `DROP`(테이블 자체 제거). 이 세 가지는 꼭 구분해두자.

---

## 3. 조회의 기본 (SELECT)

```sql
SELECT *               FROM EMPLOYEE;                -- 전체 컬럼
SELECT EMP_NO, EMP_NAME FROM EMPLOYEE;               -- 특정 컬럼
SELECT EMP_NAME AS NAME FROM EMPLOYEE;               -- 별칭(Alias)
SELECT DISTINCT DEPT_ID FROM EMPLOYEE;               -- 중복 제거
```

`AS`는 생략 가능하다. 별칭에 공백·대소문자를 살리려면 큰따옴표(`"Full Name"`)를 쓴다.

문자열을 이어붙일 때는 `||`를 쓴다.

```sql
SELECT EMP_NAME || ' (' || DEPT_ID || ')' AS LABEL
FROM EMPLOYEE;   -- 홍길동 (10)
```

### SQL 실행 순서 (꼭 기억)

작성 순서와 실제 처리 순서가 다르다. 이걸 알면 "왜 ORDER BY에서는 별칭을 쓸 수 있는데 WHERE에서는 안 되지?" 같은 의문이 바로 풀린다.

```
작성:  SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY
처리:  FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
```

`SELECT`(별칭이 정해지는 시점)가 `WHERE`보다 **나중에** 처리되니까, WHERE에서는 SELECT의 별칭을 쓸 수 없다. ORDER BY는 SELECT 이후라 별칭 사용이 가능하다.

---

## 4. 조건 걸기 (WHERE)

### 비교·논리 연산자

```sql
SELECT * FROM EMPLOYEE WHERE EMP_NO = 1001;
SELECT * FROM EMPLOYEE
WHERE DEPT_ID = 10
  AND SALARY >= 5000;      -- AND, OR, NOT 조합
```

사용 연산자: `=`, `!=`(또는 `<>`), `>`, `<`, `>=`, `<=`, `AND`, `OR`, `NOT`.

### LIKE — 패턴 검색

```sql
WHERE NAME LIKE '김%'    -- 김으로 시작
WHERE NAME LIKE '%김'    -- 김으로 끝
WHERE NAME LIKE '%김%'   -- 김 포함
WHERE CODE LIKE 'A_C'    -- A?C (가운데 한 글자)
```

`%`=0글자 이상, `_`=정확히 1글자. `%`나 `_` 자체를 검색하려면 ESCAPE를 쓴다.

```sql
WHERE RATE LIKE '50\%%' ESCAPE '\'   -- "50%"로 시작하는 값
```

### IN / BETWEEN

```sql
WHERE DEPT_ID IN (10, 20, 30);              -- 여러 값 중 하나
WHERE SALARY BETWEEN 3000 AND 5000;         -- 3000 이상 5000 이하(양끝 포함)
```

### NULL 다루기 — 가장 흔한 실수

NULL은 "값이 없음"이라 `=`로 비교가 안 된다. 반드시 `IS NULL` / `IS NOT NULL`을 써야 한다.

```sql
WHERE COMMISSION IS NULL;       -- 맞음
WHERE COMMISSION = NULL;        -- ❌ 항상 거짓 → 결과 0건
```

> NULL과의 모든 산술·비교는 결과가 `UNKNOWN`이 된다. (`NULL + 100` → NULL, `NULL = NULL` → 거짓) 이 성질이 뒤에서 LEFT JOIN, NOT IN 함정의 원인이 된다.

---

## 5. 정렬 (ORDER BY)

```sql
SELECT * FROM EMPLOYEE ORDER BY SALARY DESC;                    -- 내림차순
SELECT * FROM EMPLOYEE ORDER BY DEPT_ID ASC, SALARY DESC;      -- 다중 정렬
SELECT * FROM EMPLOYEE ORDER BY SALARY DESC NULLS LAST;        -- NULL을 맨 뒤로
```

`ASC`(오름차순)가 기본값이라 생략 가능하다. Oracle은 기본적으로 NULL을 가장 큰 값으로 취급(ASC면 뒤, DESC면 앞)하니, 필요하면 `NULLS FIRST` / `NULLS LAST`로 명시하자.

---

## 6. 함수 총정리

### 문자 함수

| 함수 | 설명 | 예시 → 결과 |
|------|------|-------------|
| `UPPER / LOWER` | 대/소문자 변환 | `UPPER('abc')` → ABC |
| `SUBSTR(s, m, n)` | m번째부터 n글자 자르기 | `SUBSTR('HELLO',2,3)` → ELL |
| `INSTR(s, t)` | t의 위치 찾기 | `INSTR('HELLO','L')` → 3 |
| `LENGTH(s)` | 길이 | `LENGTH('홍길동')` → 3 |
| `TRIM / LTRIM / RTRIM` | 공백 제거 | `TRIM('  a  ')` → a |
| `REPLACE(s, a, b)` | a를 b로 치환 | `REPLACE('a-b','-','/')` → a/b |
| `LPAD / RPAD(s,n,c)` | n자리로 채우기 | `LPAD('7',3,'0')` → 007 |
| `CONCAT / \|\|` | 문자열 잇기 | `'A' \|\| 'B'` → AB |

### 숫자 함수

| 함수 | 설명 | 예시 → 결과 |
|------|------|-------------|
| `ROUND(n, d)` | 반올림 | `ROUND(3.456,1)` → 3.5 |
| `TRUNC(n, d)` | 버림(자르기) | `TRUNC(3.456,1)` → 3.4 |
| `MOD(a, b)` | 나머지 | `MOD(10,3)` → 1 |
| `CEIL / FLOOR` | 올림 / 내림 | `CEIL(3.1)` → 4 |
| `ABS(n)` | 절대값 | `ABS(-5)` → 5 |
| `POWER(a, b)` | 거듭제곱 | `POWER(2,3)` → 8 |

### 날짜 함수

```sql
SELECT SYSDATE FROM DUAL;        -- 현재 날짜·시간
SELECT SYSTIMESTAMP FROM DUAL;   -- 정밀 시간(타임존 포함)

-- 날짜 연산
SELECT SYSDATE + 7             FROM DUAL;             -- 7일 후
SELECT SYSDATE - HIRE_DATE     FROM EMPLOYEE;         -- 두 날짜 차이(일수)

-- 함수
SELECT ADD_MONTHS(SYSDATE, 3)                FROM DUAL;      -- 3개월 후
SELECT MONTHS_BETWEEN(SYSDATE, HIRE_DATE)    FROM EMPLOYEE;  -- 개월 수 차이
SELECT LAST_DAY(SYSDATE)                     FROM DUAL;      -- 그 달의 마지막 날
SELECT TRUNC(SYSDATE)                        FROM DUAL;      -- 시간 떼고 자정으로
```

> Oracle의 `DATE`는 날짜에 정수를 더하면 "일", `1/24`를 더하면 "시간" 단위로 계산된다.

### 변환 함수 (형 변환)

```sql
-- 날짜 → 문자
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;
SELECT TO_CHAR(SYSDATE, 'YYYY"년" MM"월" DD"일"') FROM DUAL;

-- 숫자 → 문자(자릿수 콤마)
SELECT TO_CHAR(1234567, 'FM999,999,999') FROM DUAL;  -- 1,234,567

-- 문자 → 날짜
SELECT TO_DATE('2026-06-01', 'YYYY-MM-DD') FROM DUAL;

-- 문자 → 숫자
SELECT TO_NUMBER('1500') FROM DUAL;
```

**자주 쓰는 날짜 포맷**: `YYYY`(연), `MM`(월), `DD`(일), `HH24`(24시간제), `MI`(분), `SS`(초), `DAY`(요일 전체), `DY`(요일 약자).

### NULL 처리 함수 — 실무 필수

```sql
SELECT NVL(COMMISSION, 0)                    FROM EMPLOYEE;  -- NULL이면 0
SELECT NVL2(COMMISSION, 'Y', 'N')            FROM EMPLOYEE;  -- 값 있으면 Y, 없으면 N
SELECT COALESCE(TEL, MOBILE, '연락처없음')   FROM EMPLOYEE;  -- 처음 만나는 NOT NULL
SELECT NULLIF(A, B)                          FROM DUAL;      -- A=B면 NULL, 아니면 A
```

| 함수 | NULL일 때 | 값이 있을 때 |
|------|-----------|--------------|
| `NVL(a, b)` | b 반환 | a 반환 |
| `NVL2(a, x, y)` | y 반환 | x 반환 |
| `COALESCE(a,b,c…)` | 다음 인자 확인 | 처음 NOT NULL 값 |

---

## 7. 조건 분기 (CASE / DECODE)

### CASE — 표준이며 범위 비교 가능

```sql
SELECT EMP_NAME,
       CASE
           WHEN SALARY >= 7000 THEN '상'
           WHEN SALARY >= 5000 THEN '중'
           ELSE '하'
       END AS GRADE
FROM EMPLOYEE;
```

특정 값과 같은지만 볼 때는 간단형도 쓸 수 있다.

```sql
SELECT CASE DEPT_ID
           WHEN 10 THEN '개발'
           WHEN 20 THEN '품질'
           ELSE '기타'
       END AS DEPT_KOR
FROM EMPLOYEE;
```

### DECODE — Oracle 전용 축약형 (등가 비교만)

```sql
SELECT EMP_NAME,
       DECODE(DEPT_ID, 10, '개발', 20, '품질', '기타') AS DEPT_KOR
FROM EMPLOYEE;
```

`DECODE(컬럼, 값1, 결과1, 값2, 결과2, …, 기본값)`. **등호(=) 비교만** 된다. 범위(`>=`)가 필요하면 CASE를 써야 한다.

---

## 8. 집계와 그룹핑 (GROUP BY / HAVING)

### 집계 함수

| 함수 | 설명 |
|------|------|
| `COUNT(*)` | 행 개수 (NULL 포함) |
| `COUNT(컬럼)` | 그 컬럼이 NULL이 아닌 개수 |
| `SUM` / `AVG` | 합계 / 평균 |
| `MAX` / `MIN` | 최대 / 최소 |

> `COUNT(*)`와 `COUNT(컬럼)`은 다르다. 후자는 NULL을 빼고 센다. `AVG`도 NULL은 분모에서 제외하니, NULL을 0으로 보려면 `AVG(NVL(컬럼,0))`을 쓰자.

### GROUP BY / HAVING

```sql
-- 부서별 인원수와 평균 급여
SELECT DEPT_ID, COUNT(*) AS CNT, ROUND(AVG(SALARY)) AS AVG_SAL
FROM EMPLOYEE
GROUP BY DEPT_ID;

-- 인원이 10명 이상인 부서만
SELECT DEPT_ID, COUNT(*)
FROM EMPLOYEE
GROUP BY DEPT_ID
HAVING COUNT(*) >= 10;
```

**WHERE vs HAVING**: WHERE는 그룹핑 **전**(개별 행) 필터, HAVING은 그룹핑 **후**(집계 결과) 필터다. 집계함수 조건(`COUNT(*) >= 10`)은 HAVING에만 쓸 수 있다.

> 규칙: SELECT에 쓴 일반 컬럼은 **전부 GROUP BY에 들어가야** 한다. (집계함수로 감싼 컬럼은 예외)

### 소계·총계 (ROLLUP)

```sql
SELECT DEPT_ID, SUM(SALARY)
FROM EMPLOYEE
GROUP BY ROLLUP(DEPT_ID);   -- 부서별 합계 + 맨 아래 전체 총합 한 줄 추가
```

---

## 9. JOIN — 여러 테이블 연결

흩어진 테이블을 키로 이어 한 결과로 보는 게 JOIN이다. 실무 SQL의 핵심이라고 봐도 된다.

### JOIN 6종 요약

| JOIN | 결과 | 설명 |
|------|------|------|
| INNER JOIN | A ∩ B | 양쪽 매칭되는 행만 |
| LEFT JOIN | A 전체 + B 매칭 | 왼쪽은 다, 오른쪽은 있으면 |
| RIGHT JOIN | B 전체 + A 매칭 | 오른쪽 기준 |
| FULL JOIN | A 전체 + B 전체 | 둘 다, 없으면 NULL |
| CROSS JOIN | A × B | 모든 조합 |
| SELF JOIN | A ↔ A | 같은 테이블끼리 |

### 기본 예시

```sql
-- INNER JOIN: 부서가 있는 직원만
SELECT E.EMP_NAME, D.DEPT_NAME
FROM EMPLOYEE E
INNER JOIN DEPARTMENT D ON E.DEPT_ID = D.DEPT_ID;

-- LEFT JOIN: 부서 없는 직원도 포함(부서명은 NULL)
SELECT E.EMP_NAME, D.DEPT_NAME
FROM EMPLOYEE E
LEFT JOIN DEPARTMENT D ON E.DEPT_ID = D.DEPT_ID;

-- SELF JOIN: 사원 ↔ 관리자
SELECT E.EMP_NAME AS 사원, M.EMP_NAME AS 관리자
FROM EMPLOYEE E
LEFT JOIN EMPLOYEE M ON E.MANAGER_ID = M.EMP_NO;
```

`INNER`, `OUTER` 키워드는 생략 가능하다. (`JOIN`=INNER, `LEFT JOIN`=LEFT OUTER JOIN)

### ⚠️ 실무 함정 1 — LEFT JOIN이 INNER JOIN처럼 되는 경우

```sql
-- 의도: 모든 직원 + (서울 부서면) 부서명
SELECT E.EMP_NAME, D.DEPT_NAME
FROM EMPLOYEE E
LEFT JOIN DEPARTMENT D ON E.DEPT_ID = D.DEPT_ID
WHERE D.LOCATION = 'SEOUL';   -- ❌ 부서 없는 직원이 사라짐
```

부서 없는 직원은 JOIN 후 `D.LOCATION`이 NULL → `NULL = 'SEOUL'`이 거짓 → WHERE에서 제거되면서 LEFT JOIN이 무력화된다.

**해결: 오른쪽 테이블 조건은 `ON` 절로 옮긴다.**

```sql
SELECT E.EMP_NAME, D.DEPT_NAME
FROM EMPLOYEE E
LEFT JOIN DEPARTMENT D
       ON E.DEPT_ID = D.DEPT_ID
      AND D.LOCATION = 'SEOUL';   -- ✅
```

핵심 원리: **`ON`은 JOIN 도중**(안 맞아도 왼쪽 생존), **`WHERE`는 JOIN 끝난 뒤**(NULL 행 제거)에 적용된다.

### ⚠️ 실무 함정 2 — 1:N 조인의 행 뻥튀기

사용자 1명이 주문 3건이면 결과에 그 사용자가 3줄 나온다. 여기서 `COUNT(*)`나 `SUM`을 하면 값이 부풀려진다.

```sql
-- 해결: 집계를 먼저 한 뒤 붙인다
SELECT U.USER_NAME, NVL(O.CNT, 0) AS ORDER_CNT
FROM USERS U
LEFT JOIN (
    SELECT USER_ID, COUNT(*) AS CNT
    FROM ORDERS GROUP BY USER_ID
) O ON U.USER_ID = O.USER_ID;
```

---

## 10. 서브쿼리

쿼리 안의 쿼리다. 위치에 따라 이름이 달라진다.

### 단일행 / 다중행 서브쿼리 (WHERE 절)

```sql
-- 평균보다 많이 받는 직원 (단일행 → = 사용)
SELECT * FROM EMPLOYEE
WHERE SALARY > (SELECT AVG(SALARY) FROM EMPLOYEE);

-- 서울 부서 소속 직원 (다중행 → IN 사용)
SELECT * FROM EMPLOYEE
WHERE DEPT_ID IN (SELECT DEPT_ID FROM DEPARTMENT WHERE LOCATION = 'SEOUL');
```

> 결과가 여러 행이면 `=`가 아니라 `IN`(또는 `ANY`, `ALL`)을 써야 한다.

### 인라인 뷰 (FROM 절)

```sql
SELECT DEPT_ID, AVG_SAL
FROM (
    SELECT DEPT_ID, AVG(SALARY) AS AVG_SAL
    FROM EMPLOYEE GROUP BY DEPT_ID
)
WHERE AVG_SAL >= 5000;
```

### 스칼라 서브쿼리 (SELECT 절, 값 하나 반환)

```sql
SELECT E.EMP_NAME,
       (SELECT D.DEPT_NAME FROM DEPARTMENT D WHERE D.DEPT_ID = E.DEPT_ID) AS DEPT
FROM EMPLOYEE E;
```

### EXISTS — 존재 여부 확인 (중복 없음)

```sql
-- 주문이 있는 사용자
SELECT * FROM USERS U
WHERE EXISTS (SELECT 1 FROM ORDERS O WHERE O.USER_ID = U.USER_ID);

-- 주문이 없는 사용자
SELECT * FROM USERS U
WHERE NOT EXISTS (SELECT 1 FROM ORDERS O WHERE O.USER_ID = U.USER_ID);
```

> ⚠️ **NOT IN의 NULL 함정**: `NOT IN` 서브쿼리 결과에 NULL이 하나라도 섞이면 전체 결과가 **0건**이 된다. "~가 없는" 조건은 **NOT EXISTS**가 안전하다.

---

## 11. 집합 연산 (UNION 등)

두 SELECT 결과를 위아래로 합치거나 비교한다. 컬럼 개수와 타입이 같아야 한다.

| 연산자 | 의미 |
|--------|------|
| `UNION` | 합집합 (중복 제거) |
| `UNION ALL` | 합집합 (중복 유지, 더 빠름) |
| `INTERSECT` | 교집합 (양쪽 공통) |
| `MINUS` | 차집합 (A에는 있고 B에는 없는) |

```sql
SELECT EMP_NAME FROM EMPLOYEE_2025
UNION
SELECT EMP_NAME FROM EMPLOYEE_2026;
```

> 중복 제거가 필요 없다면 `UNION ALL`이 정렬·중복제거 과정을 건너뛰어 훨씬 빠르다.

---

## 12. 윈도우(분석) 함수

GROUP BY는 행을 합쳐 줄이지만, 윈도우 함수는 **행을 유지한 채** 각 행 옆에 순위·누계·이전값 등을 계산해 붙인다.

```sql
-- 급여 순 순번 / 순위
SELECT EMP_NAME, SALARY,
       ROW_NUMBER() OVER (ORDER BY SALARY DESC) AS ROW_NUM,
       RANK()       OVER (ORDER BY SALARY DESC) AS RNK,
       DENSE_RANK() OVER (ORDER BY SALARY DESC) AS D_RNK
FROM EMPLOYEE;
```

동점 처리 차이:

| 급여 | ROW_NUMBER | RANK | DENSE_RANK |
|------|-----------|------|------------|
| 7000 | 1 | 1 | 1 |
| 7000 | 2 | 1 | 1 |
| 5000 | 3 | **3**(건너뜀) | **2**(연속) |

```sql
-- PARTITION BY: 부서별로 나눠 순위
SELECT EMP_NAME, DEPT_ID,
       RANK() OVER (PARTITION BY DEPT_ID ORDER BY SALARY DESC) AS 부서내순위
FROM EMPLOYEE;

-- 자주 쓰는 분석 함수들
SELECT EMP_NAME, SALARY,
       SUM(SALARY) OVER (ORDER BY EMP_NO) AS 누적합,
       LAG(SALARY)  OVER (ORDER BY EMP_NO) AS 이전행급여,
       LEAD(SALARY) OVER (ORDER BY EMP_NO) AS 다음행급여
FROM EMPLOYEE;
```

`OVER()` 안의 `PARTITION BY`는 그룹을, `ORDER BY`는 계산 순서를 정한다.

---

## 13. WITH(CTE)와 계층 쿼리

### WITH — 복잡한 쿼리를 이름 붙여 정리

```sql
WITH DEPT_AVG AS (
    SELECT DEPT_ID, AVG(SALARY) AS AVG_SAL
    FROM EMPLOYEE GROUP BY DEPT_ID
)
SELECT E.EMP_NAME, E.SALARY, D.AVG_SAL
FROM EMPLOYEE E
JOIN DEPT_AVG D ON E.DEPT_ID = D.DEPT_ID
WHERE E.SALARY > D.AVG_SAL;   -- 부서 평균보다 많이 받는 직원
```

서브쿼리를 미리 이름 붙여 빼두면 본문이 훨씬 읽기 편해진다. 같은 블록을 여러 번 참조할 때도 유용하다.

### 계층 쿼리 (CONNECT BY) — 조직도/카테고리 트리

```sql
SELECT LPAD(' ', (LEVEL-1)*2) || EMP_NAME AS 조직도, LEVEL
FROM EMPLOYEE
START WITH MANAGER_ID IS NULL          -- 최상위(사장)부터 시작
CONNECT BY PRIOR EMP_NO = MANAGER_ID;  -- 부모(PRIOR)-자식 연결
```

`LEVEL`은 깊이(1=최상위)다. `LPAD`로 들여쓰기를 주면 트리 모양으로 보인다.

---

## 14. 데이터 변경 (INSERT / UPDATE / DELETE / MERGE)

### INSERT

```sql
INSERT INTO EMPLOYEE (EMP_NO, EMP_NAME, DEPT_ID)
VALUES (1001, '홍길동', 10);

-- 다른 테이블 결과를 통째로 입력
INSERT INTO EMPLOYEE_BACKUP
SELECT * FROM EMPLOYEE WHERE DEPT_ID = 10;
```

### UPDATE

```sql
UPDATE EMPLOYEE
SET SALARY = 6000,
    DEPT_ID = 20
WHERE EMP_NO = 1001;
```

### DELETE

```sql
DELETE FROM EMPLOYEE WHERE EMP_NO = 1001;
```

> ⚠️ UPDATE·DELETE에서 **WHERE를 빼면 전체 행**이 바뀌거나 지워진다. 실행 전 같은 조건으로 SELECT를 먼저 돌려서 영향 범위를 확인하는 습관을 들이자.

### MERGE (UPSERT) — 있으면 수정, 없으면 입력

```sql
MERGE INTO EMPLOYEE T
USING (SELECT 1001 AS EMP_NO, '홍길동' AS EMP_NAME FROM DUAL) S
ON (T.EMP_NO = S.EMP_NO)
WHEN MATCHED THEN
    UPDATE SET T.EMP_NAME = S.EMP_NAME
WHEN NOT MATCHED THEN
    INSERT (EMP_NO, EMP_NAME) VALUES (S.EMP_NO, S.EMP_NAME);
```

대량 동기화(있는 건 갱신, 없는 건 추가)를 한 번에 처리할 때 정말 유용하다.

---

## 15. 트랜잭션 (COMMIT / ROLLBACK)

여러 변경을 "전부 성공 or 전부 취소"라는 한 묶음으로 다루는 게 트랜잭션이다. (계좌 이체: 출금과 입금이 함께 성공해야 한다)

```sql
UPDATE ACCOUNT SET BALANCE = BALANCE - 1000 WHERE ID = 'A';
UPDATE ACCOUNT SET BALANCE = BALANCE + 1000 WHERE ID = 'B';

COMMIT;     -- 두 변경을 확정 (이제 되돌릴 수 없음)
-- ROLLBACK;  -- 마지막 COMMIT 이후 모든 변경을 취소
```

```sql
-- SAVEPOINT: 부분 취소 지점
SAVEPOINT SP1;
DELETE FROM ORDERS WHERE STATUS = 'CANCEL';
ROLLBACK TO SP1;   -- SP1 이후만 취소
```

핵심:
- DML(INSERT/UPDATE/DELETE)은 COMMIT 전까지 임시 상태이며 ROLLBACK 가능하다.
- COMMIT하면 영구 반영되어 되돌릴 수 없다.
- **DDL(CREATE/ALTER/DROP/TRUNCATE)은 자동 COMMIT**되어 ROLLBACK이 불가하다.

---

## 16. 페이징

목록을 10개씩 끊어 보여주는 등의 처리다.

```sql
-- Oracle 12c 이상 (권장)
SELECT *
FROM EMPLOYEE
ORDER BY EMP_NO
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;   -- 1~10번째

-- 구버전 (ROWNUM 방식)
SELECT *
FROM (
    SELECT ROWNUM RN, A.*
    FROM (
        SELECT * FROM EMPLOYEE ORDER BY EMP_NO
    ) A
)
WHERE RN BETWEEN 1 AND 10;
```

> 구버전 주의: `ROWNUM`은 **정렬되기 전에** 매겨진다. 정렬된 결과를 페이징하려면 위처럼 정렬한 서브쿼리(인라인 뷰)를 먼저 만든 뒤 그 바깥에서 ROWNUM을 적용해야 한다.

---

## 17. 뷰 · 시퀀스 · 인덱스

### 뷰 (View) — 저장된 SELECT

복잡한 쿼리를 가상의 테이블처럼 이름 붙여 재사용한다.

```sql
CREATE VIEW V_DEPT_SALARY AS
SELECT DEPT_ID, AVG(SALARY) AS AVG_SAL
FROM EMPLOYEE GROUP BY DEPT_ID;

SELECT * FROM V_DEPT_SALARY;   -- 테이블처럼 조회
```

### 시퀀스 (Sequence) — 자동 증가 번호

PK용 일련번호를 자동 생성한다.

```sql
CREATE SEQUENCE SEQ_EMP START WITH 1 INCREMENT BY 1;

INSERT INTO EMPLOYEE (EMP_NO, EMP_NAME)
VALUES (SEQ_EMP.NEXTVAL, '신입사원');   -- 다음 번호 자동 할당
```

### 인덱스 (Index) — 조회 속도 향상

책의 색인처럼, 자주 검색·조인하는 컬럼에 만들면 조회가 빨라진다.

```sql
CREATE INDEX IDX_EMP_DEPT ON EMPLOYEE (DEPT_ID);
```

> 인덱스는 조회를 빠르게 하지만 INSERT/UPDATE/DELETE 시 갱신 부담이 생긴다. 또 컬럼을 함수로 가공(`WHERE UPPER(NAME)=...`)하면 인덱스를 못 타니 주의하자.

---

## 18. 실무 주의사항 모음

이것만 몸에 익혀도 흔한 SQL 사고의 대부분을 막을 수 있다.

1. **NULL은 `=`로 비교 안 된다** → `IS NULL` 사용. 산술·비교에 NULL이 끼면 결과가 NULL/거짓이 된다.
2. **LEFT JOIN의 오른쪽 조건을 WHERE에 두면 INNER JOIN처럼 동작** → 조건을 `ON` 절로 옮긴다.
3. **1:N 조인 후 집계는 부풀려진다** → 집계를 먼저 하고 JOIN하거나 DISTINCT(단순 목록 한정)를 쓴다.
4. **NOT IN + NULL = 결과 0건** → `NOT EXISTS`를 기본으로 쓴다.
5. **UPDATE / DELETE 전 WHERE 확인** → 같은 조건으로 SELECT 먼저 실행해 영향 범위 점검.
6. **DDL과 TRUNCATE는 롤백 불가** (자동 커밋). 운영 DB에서 특히 신중히.
7. **컬럼을 함수로 감싸면 인덱스를 못 탄다** → `WHERE NAME = '홍길동'`은 빠르지만 `WHERE SUBSTR(NAME,1,1)='홍'`은 느릴 수 있다.
8. **`SELECT *`는 운영 코드에서 지양** → 필요한 컬럼만 명시(성능·가독성·변경 안정성).
9. **ROWNUM은 정렬 전에 매겨진다** → 정렬 페이징은 서브쿼리로 감싼다.
10. **UNION보다 UNION ALL이 빠르다** → 중복 제거가 필요 없으면 ALL.

---

## 마무리

SQL은 문법 암기가 아니라 **세 가지 흐름을 이해하는 것**이 핵심이다.

- **행이 줄어드는가?** (WHERE, GROUP BY, INNER JOIN)
- **행이 늘어나는가?** (1:N JOIN, CROSS JOIN)
- **NULL이 어디로 흐르는가?** (WHERE vs ON, NOT IN vs NOT EXISTS)

이 세 가지를 기준으로 쿼리를 읽으면, 처음 보는 복잡한 SQL도 구조가 보인다.

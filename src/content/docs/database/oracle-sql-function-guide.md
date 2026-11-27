---
categories: [Database]
title: Oracle SQL 함수 가이드
description: Oracle SQL에서 문자, 숫자, 날짜, 타입 변환, NULL 처리, 조건 분기에 쓰는 함수와 예제.
created: 2026-06-04
tags: [SQL|teal, Oracle|red, Database|teal]
platform: Database
readingTime: 6
---

# Oracle SQL 함수 가이드

이전 글: [Oracle SQL 기초 가이드](./oracle-sql-basic-guide)  
다음 글: [Oracle SQL 조회 심화 가이드](./oracle-sql-query-guide)

## 문자 함수

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

## 숫자 함수

| 함수 | 설명 | 예시 → 결과 |
|------|------|-------------|
| `ROUND(n, d)` | 반올림 | `ROUND(3.456,1)` → 3.5 |
| `TRUNC(n, d)` | 버림(자르기) | `TRUNC(3.456,1)` → 3.4 |
| `MOD(a, b)` | 나머지 | `MOD(10,3)` → 1 |
| `CEIL / FLOOR` | 올림 / 내림 | `CEIL(3.1)` → 4 |
| `ABS(n)` | 절대값 | `ABS(-5)` → 5 |
| `POWER(a, b)` | 거듭제곱 | `POWER(2,3)` → 8 |

## 날짜 함수

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

Oracle `DATE`에 숫자를 더하면 일 단위로 계산한다. `1`은 하루, `1/24`는 한 시간이다.

## 변환 함수 (형 변환)

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

날짜 형식에서 `YYYY`, `MM`, `DD`는 연월일을 뜻한다. `HH24`, `MI`, `SS`는 시분초, `DAY`와 `DY`는 요일 이름과 약자다.

## NULL 처리 함수

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

## 조건 분기 (CASE / DECODE)

### CASE

```sql
SELECT EMP_NAME,
       CASE
           WHEN SALARY >= 7000 THEN '상'
           WHEN SALARY >= 5000 THEN '중'
           ELSE '하'
       END AS GRADE
FROM EMPLOYEE;
```

특정 값과 같은지만 볼 때는 간단형을 쓸 수 있습니다.

```sql
SELECT CASE DEPT_ID
           WHEN 10 THEN '개발'
           WHEN 20 THEN '품질'
           ELSE '기타'
       END AS DEPT_KOR
FROM EMPLOYEE;
```

### DECODE

```sql
SELECT EMP_NAME,
       DECODE(DEPT_ID, 10, '개발', 20, '품질', '기타') AS DEPT_KOR
FROM EMPLOYEE;
```

`DECODE`는 일치하는 값이 없으면 기본값을 반환한다. 범위 조건에는 `CASE WHEN`을 사용한다.

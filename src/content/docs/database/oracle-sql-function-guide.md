---
categories: [Database]
title: Oracle SQL 함수 가이드
description: Oracle SQL 함수 총정리. 문자·숫자·날짜·변환·NULL 처리 함수와 CASE/DECODE 조건 분기를 예시와 함께 정리했습니다. 자주 찾는 레퍼런스로 쓰세요.
created: 2026-06-04
tags: [SQL|teal, Oracle|red, Database|teal]
platform: Database
readingTime: 6
---

# Oracle SQL 함수 가이드

이 글은 Oracle SQL 함수의 레퍼런스입니다. 자주 찾는 함수를 표와 예시로 정리했습니다. 필요할 때 열어보는 매뉴얼로 쓰세요.

**이전 글:** [Oracle SQL 기초 가이드](./oracle-sql-basic-guide) · **다음 글:** [Oracle SQL 조회 심화 가이드](./oracle-sql-query-guide)

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

> Oracle의 `DATE`는 날짜에 정수를 더하면 "일", `1/24`를 더하면 "시간" 단위로 계산됩니다.

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

**자주 쓰는 날짜 포맷:** `YYYY`(연), `MM`(월), `DD`(일), `HH24`(24시간제), `MI`(분), `SS`(초), `DAY`(요일 전체), `DY`(요일 약자)

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

특정 값과 같은지만 볼 때는 간단형을 쓸 수 있습니다.

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

`DECODE(컬럼, 값1, 결과1, 값2, 결과2, …, 기본값)`. **등호(=) 비교만** 됩니다. 범위(`>=`)가 필요하면 CASE를 써야 합니다.

## 정리

함수는 외우기보다 필요할 때 찾는 게 효율적입니다. 흐름상 다음은 조회를 확장하는 집계·조인·서브쿼리입니다.

**다음 글:** [Oracle SQL 조회 심화 가이드](./oracle-sql-query-guide)
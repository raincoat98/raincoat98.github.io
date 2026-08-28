---
categories: [Database]
title: Oracle SQL 조회 심화 가이드
description: 집계(GROUP BY·HAVING), JOIN과 실무 함정 2가지, 서브쿼리, 집합 연산, 윈도우 함수, WITH·계층 쿼리까지. Oracle로 복잡한 조회를 다루는 방법을 정리했습니다.
created: 2026-06-04
tags: [SQL|teal, Oracle|red, Database|teal]
platform: Database
readingTime: 8
---

# Oracle SQL 조회 심화 가이드

기본 조회와 함수를 익혔다면 이제 데이터를 묶고, 이어 붙이고, 가공하는 심화 조회를 배울 차례입니다. 실무 SQL의 핵심입니다.

**이전 글:** [Oracle SQL 함수 가이드](./oracle-sql-function-guide) · **다음 글:** [Oracle SQL 실무 가이드](./oracle-sql-practice-guide)

## 집계와 그룹핑 (GROUP BY / HAVING)

### 집계 함수

| 함수 | 설명 |
|------|------|
| `COUNT(*)` | 행 개수 (NULL 포함) |
| `COUNT(컬럼)` | 그 컬럼이 NULL이 아닌 개수 |
| `SUM` / `AVG` | 합계 / 평균 |
| `MAX` / `MIN` | 최대 / 최소 |

> `COUNT(*)`와 `COUNT(컬럼)`은 다릅니다. 후자는 NULL을 빼고 셉니다. `AVG`도 NULL은 분모에서 제외하니, NULL을 0으로 보려면 `AVG(NVL(컬럼,0))`을 쓰세요.

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

**WHERE vs HAVING:** WHERE는 그룹핑 **전**(개별 행) 필터, HAVING은 그룹핑 **후**(집계 결과) 필터입니다. 집계함수 조건(`COUNT(*) >= 10`)은 HAVING에만 쓸 수 있습니다.

> 규칙: SELECT에 쓴 일반 컬럼은 **전부 GROUP BY에 들어가야** 합니다. (집계함수로 감싼 컬럼은 예외)

### 소계·총계 (ROLLUP)

```sql
SELECT DEPT_ID, SUM(SALARY)
FROM EMPLOYEE
GROUP BY ROLLUP(DEPT_ID);   -- 부서별 합계 + 맨 아래 전체 총합 한 줄 추가
```

## JOIN — 여러 테이블 연결

흩어진 테이블을 키로 이어 한 결과로 보는 게 JOIN입니다.

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

`INNER`, `OUTER` 키워드는 생략 가능합니다. (`JOIN` = INNER, `LEFT JOIN` = LEFT OUTER JOIN)

### 실무 함정 1 — LEFT JOIN이 INNER JOIN처럼 되는 경우

```sql
-- 의도: 모든 직원 + (서울 부서면) 부서명
SELECT E.EMP_NAME, D.DEPT_NAME
FROM EMPLOYEE E
LEFT JOIN DEPARTMENT D ON E.DEPT_ID = D.DEPT_ID
WHERE D.LOCATION = 'SEOUL';   -- 틀림. 부서 없는 직원이 사라짐
```

부서 없는 직원은 JOIN 후 `D.LOCATION`이 NULL → `NULL = 'SEOUL'`이 거짓 → WHERE에서 제거되면서 LEFT JOIN이 무력화됩니다.

**해결: 오른쪽 테이블 조건은 `ON` 절로 옮깁니다.**

```sql
SELECT E.EMP_NAME, D.DEPT_NAME
FROM EMPLOYEE E
LEFT JOIN DEPARTMENT D
       ON E.DEPT_ID = D.DEPT_ID
      AND D.LOCATION = 'SEOUL';   -- 맞음
```

핵심 원리: **`ON`은 JOIN 도중**(안 맞아도 왼쪽 생존), **`WHERE`는 JOIN 끝난 뒤**(NULL 행 제거)에 적용됩니다.

### 실무 함정 2 — 1:N 조인의 행 뻥튀기

사용자 1명이 주문 3건이면 결과에 그 사용자가 3줄 나옵니다. 여기서 `COUNT(*)`나 `SUM`을 하면 값이 부풀려집니다.

```sql
-- 해결: 집계를 먼저 한 뒤 붙인다
SELECT U.USER_NAME, NVL(O.CNT, 0) AS ORDER_CNT
FROM USERS U
LEFT JOIN (
    SELECT USER_ID, COUNT(*) AS CNT
    FROM ORDERS GROUP BY USER_ID
) O ON U.USER_ID = O.USER_ID;
```

## 서브쿼리

쿼리 안의 쿼리입니다. 위치에 따라 이름이 달라집니다.

### 단일행 / 다중행 서브쿼리 (WHERE 절)

```sql
-- 평균보다 많이 받는 직원 (단일행 → = 사용)
SELECT * FROM EMPLOYEE
WHERE SALARY > (SELECT AVG(SALARY) FROM EMPLOYEE);

-- 서울 부서 소속 직원 (다중행 → IN 사용)
SELECT * FROM EMPLOYEE
WHERE DEPT_ID IN (SELECT DEPT_ID FROM DEPARTMENT WHERE LOCATION = 'SEOUL');
```

> 결과가 여러 행이면 `=`가 아니라 `IN`(또는 `ANY`, `ALL`)을 써야 합니다.

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

> **NOT IN의 NULL 함정:** `NOT IN` 서브쿼리 결과에 NULL이 하나라도 섞이면 전체 결과가 **0건**이 됩니다. "~가 없는" 조건은 **NOT EXISTS**가 안전합니다.

## 집합 연산 (UNION 등)

두 SELECT 결과를 위아래로 합치거나 비교합니다. 컬럼 개수와 타입이 같아야 합니다.

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

> 중복 제거가 필요 없다면 `UNION ALL`이 정렬·중복제거 과정을 건너뛰어 훨씬 빠릅니다.

## 윈도우(분석) 함수

GROUP BY는 행을 합쳐 줄이지만, 윈도우 함수는 **행을 유지한 채** 각 행 옆에 순위·누계·이전값 등을 계산해 붙입니다.

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

`OVER()` 안의 `PARTITION BY`는 그룹을, `ORDER BY`는 계산 순서를 정합니다.

## WITH(CTE)와 계층 쿼리

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

서브쿼리를 미리 이름 붙여 빼두면 본문이 훨씬 읽기 편해집니다. 같은 블록을 여러 번 참조할 때도 유용합니다.

### 계층 쿼리 (CONNECT BY) — 조직도/카테고리 트리

```sql
SELECT LPAD(' ', (LEVEL-1)*2) || EMP_NAME AS 조직도, LEVEL
FROM EMPLOYEE
START WITH MANAGER_ID IS NULL          -- 최상위(사장)부터 시작
CONNECT BY PRIOR EMP_NO = MANAGER_ID;  -- 부모(PRIOR)-자식 연결
```

`LEVEL`은 깊이(1=최상위)입니다. `LPAD`로 들여쓰기를 주면 트리 모양으로 보입니다.

## 정리

조회 쪽에서 만나는 대부분의 문제는 이 글의 5가지 도구(집계·JOIN·서브쿼리·윈도우·WITH)로 해결됩니다. 다음은 데이터를 바꾸는 DML과 실무 운영 이야기입니다.

**다음 글:** [Oracle SQL 실무 가이드](./oracle-sql-practice-guide)
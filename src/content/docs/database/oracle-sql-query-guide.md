---
categories: [Database]
title: Oracle SQL 조회 심화 가이드
description: Oracle SQL 집계와 조인, 서브쿼리, 집합 연산, 윈도우 함수, 계층 쿼리를 예제로 다룬다.
created: 2026-06-04
tags: [SQL|teal, Oracle|red, Database|teal]
platform: Database
readingTime: 8
---

# Oracle SQL 조회 심화 가이드

이전 글: [Oracle SQL 함수 가이드](./oracle-sql-function-guide)  
다음 글: [Oracle SQL 가이드](./oracle-sql-practice-guide)

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

`WHERE`는 집계할 행을 고르고, `HAVING`은 집계한 그룹을 고른다. 부서별 인원으로 결과를 제한하려면 `HAVING COUNT(*) >= 10`을 사용한다.

### 소계·총계 (ROLLUP)

```sql
SELECT DEPT_ID, SUM(SALARY)
FROM EMPLOYEE
GROUP BY ROLLUP(DEPT_ID);   -- 부서별 합계와 전체 합계
```

## JOIN

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

### LEFT JOIN에서 왼쪽 행 유지하기

```sql
-- 의도: 모든 직원 + (서울 부서면) 부서명
SELECT E.EMP_NAME, D.DEPT_NAME
FROM EMPLOYEE E
LEFT JOIN DEPARTMENT D ON E.DEPT_ID = D.DEPT_ID
WHERE D.LOCATION = 'SEOUL';   -- 틀림. 부서 없는 직원이 사라짐
```

부서가 없는 직원의 `D.LOCATION`은 `NULL`이다. `WHERE D.LOCATION = 'SEOUL'`은 이 행을 제외한다. 직원을 모두 남기고 서울 부서만 연결하려면 위치 조건을 `ON`에 둔다.

```sql
SELECT E.EMP_NAME, D.DEPT_NAME
FROM EMPLOYEE E
LEFT JOIN DEPARTMENT D
       ON E.DEPT_ID = D.DEPT_ID
      AND D.LOCATION = 'SEOUL';   -- 맞음
```

### 일대다 조인 전에 집계하기

한 사용자의 주문이 세 건이면 조인 결과에서 사용자 행이 세 번 반복된다. 아래 예제는 사용자마다 한 행을 남기도록 주문을 먼저 집계한다.

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

### EXISTS

```sql
-- 주문이 있는 사용자
SELECT * FROM USERS U
WHERE EXISTS (SELECT 1 FROM ORDERS O WHERE O.USER_ID = U.USER_ID);

-- 주문이 없는 사용자
SELECT * FROM USERS U
WHERE NOT EXISTS (SELECT 1 FROM ORDERS O WHERE O.USER_ID = U.USER_ID);
```

`NOT IN`의 비교 목록에 `NULL`이 있으면 일치하지 않는 값도 결과에서 빠진다. 연결된 행이 없는지 검사하려면 `NOT EXISTS`를 사용한다.

## 집합 연산 (UNION 등)

두 `SELECT` 결과를 합치거나 비교한다. 열 개수가 같아야 하고, 같은 위치의 열은 호환되는 데이터 타입 그룹에 속해야 한다.

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

중복을 유지하려면 `UNION ALL`을 사용한다. `UNION`과 달리 중복을 제거하지 않는다.

## 윈도우(분석) 함수

`GROUP BY`는 그룹마다 한 행을 반환한다. 윈도우 함수는 행을 유지하면서 각 행에 순위나 누계를 붙인다.

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

### WITH

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

`WITH`로 부서별 평균을 계산하는 쿼리에 이름을 붙이면 본문에서 그 결과를 테이블처럼 참조할 수 있다.

### 계층 쿼리 (CONNECT BY)

```sql
SELECT LPAD(' ', (LEVEL-1)*2) || EMP_NAME AS 조직도, LEVEL
FROM EMPLOYEE
START WITH MANAGER_ID IS NULL          -- 최상위(사장)부터 시작
CONNECT BY PRIOR EMP_NO = MANAGER_ID;  -- 부모(PRIOR)-자식 연결
```

`LEVEL`은 깊이(1=최상위)입니다. `LPAD`로 들여쓰기를 주면 트리 모양으로 보입니다.

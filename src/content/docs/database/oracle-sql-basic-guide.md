---
categories: [Database]
title: Oracle SQL 기초 가이드
description: Oracle의 데이터 타입과 테이블 생성, SELECT를 이용한 조회와 정렬을 다룬다.
created: 2026-06-04
tags: [SQL|teal, Oracle|red, Database|teal]
platform: Database
readingTime: 6
---

# Oracle SQL 기초 가이드

예제 테이블은 세 개입니다. 뒤의 모든 글에서 같은 테이블을 씁니다.

- `EMPLOYEE` (직원)
- `DEPARTMENT` (부서)
- `ORDERS` (주문)

**다음 글:** [Oracle SQL 함수 가이드](./oracle-sql-function-guide)

## SQL 4가지 분류

이 글에서는 조회를 DML에 포함해 SQL 명령을 네 가지로 분류한다.

| 분류 | 풀네임 | 대표 명령 | 역할 |
|------|--------|-----------|------|
| DDL | Data Definition | CREATE, ALTER, DROP, TRUNCATE | 구조(테이블 등) 정의 |
| DML | Data Manipulation | SELECT, INSERT, UPDATE, DELETE | 데이터 조작 |
| TCL | Transaction Control | COMMIT, ROLLBACK, SAVEPOINT | 변경 확정/취소 |
| DCL | Data Control | GRANT, REVOKE | 권한 부여/회수 |

Oracle은 유효한 DDL을 실행하기 전에 진행 중인 트랜잭션을 커밋한다. 성공한 DDL은 `ROLLBACK`으로 취소할 수 없다. DML 변경은 커밋 전에 취소할 수 있다.

## 데이터 타입

| 타입 | 설명 | 예 |
|------|------|----|
| `NUMBER(p, s)` | 숫자. p=전체 자릿수, s=소수 자릿수 | `NUMBER(10,2)` → 12345678.99 |
| `VARCHAR2(n)` | 가변 길이 문자열 (가장 많이 씀) | `VARCHAR2(100)` |
| `CHAR(n)` | 고정 길이 문자열 (남으면 공백 채움) | `CHAR(2)` → 'KR' |
| `DATE` | 날짜 + 시간(초 단위) | 2026-06-01 13:30:00 |
| `TIMESTAMP` | 날짜 + 시간(밀리초·타임존) | 정밀 시간 |
| `CLOB` | 대용량 텍스트 | 게시글 본문 |

`VARCHAR2(30 CHAR)`는 길이를 문자 수로, `VARCHAR2(30 BYTE)`는 바이트 수로 제한한다.

## 테이블 만들기 (DDL)

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

제약조건은 중복 키나 존재하지 않는 부서 번호처럼 허용하지 않는 값을 막는다.

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

`DELETE`는 조건에 맞는 행을 지우며 커밋 전에 취소할 수 있다. `TRUNCATE`는 구조를 남기고 모든 행을 지운다. `DROP`은 테이블 자체를 제거한다.

## 조회의 기본 (SELECT)

```sql
SELECT *               FROM EMPLOYEE;                -- 전체 컬럼
SELECT EMP_NO, EMP_NAME FROM EMPLOYEE;               -- 특정 컬럼
SELECT EMP_NAME AS NAME FROM EMPLOYEE;               -- 별칭(Alias)
SELECT DISTINCT DEPT_ID FROM EMPLOYEE;               -- 중복 제거
```

`AS`는 생략 가능합니다. 별칭에 공백·대소문자를 살리려면 큰따옴표(`"Full Name"`)를 씁니다.

문자열 연결은 `||`입니다.

```sql
SELECT EMP_NAME || ' (' || DEPT_ID || ')' AS LABEL
FROM EMPLOYEE;   -- 홍길동 (10)
```

### SQL의 논리적 처리 순서

다음은 절의 의미를 이해하기 위한 순서다. 실제 실행 순서는 실행 계획에 따라 달라질 수 있다.

```text
작성:  SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY
처리:  FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
```

같은 쿼리 블록의 `WHERE`에서는 `SELECT` 별칭을 참조할 수 없다. `ORDER BY`에서는 참조할 수 있다.

## 조건 걸기 (WHERE)

### 비교·논리 연산자

```sql
SELECT * FROM EMPLOYEE WHERE EMP_NO = 1001;
SELECT * FROM EMPLOYEE
WHERE DEPT_ID = 10
  AND SALARY >= 5000;      -- AND, OR, NOT 조합
```

연산자: `=`, `!=`(`<>`), `>`, `<`, `>=`, `<=`, `AND`, `OR`, `NOT`

### LIKE

```sql
WHERE NAME LIKE '김%'    -- 김으로 시작
WHERE NAME LIKE '%김'    -- 김으로 끝
WHERE NAME LIKE '%김%'   -- 김 포함
WHERE CODE LIKE 'A_C'    -- A?C (가운데 한 글자)
```

`%`는 0글자 이상, `_`는 정확히 1글자입니다. `%`나 `_` 자체를 검색하려면 ESCAPE를 씁니다.

```sql
WHERE RATE LIKE '50\%%' ESCAPE '\'   -- "50%"로 시작하는 값
```

### IN / BETWEEN

```sql
WHERE DEPT_ID IN (10, 20, 30);              -- 여러 값 중 하나
WHERE SALARY BETWEEN 3000 AND 5000;         -- 3000 이상 5000 이하(양끝 포함)
```

### NULL 다루기

NULL은 "값이 없음"이라 `=`로 비교가 안 됩니다. 반드시 `IS NULL` / `IS NOT NULL`을 써야 합니다.

```sql
WHERE COMMISSION IS NULL;       -- 맞음
WHERE COMMISSION = NULL;        -- 틀림. 항상 거짓 → 결과 0건
```

`NULL + 100`은 `NULL`이다. `NULL = NULL`은 `UNKNOWN`이며, `WHERE`는 조건이 참인 행만 남긴다.

## 정렬 (ORDER BY)

```sql
SELECT * FROM EMPLOYEE ORDER BY SALARY DESC;                    -- 내림차순
SELECT * FROM EMPLOYEE ORDER BY DEPT_ID ASC, SALARY DESC;      -- 다중 정렬
SELECT * FROM EMPLOYEE ORDER BY SALARY DESC NULLS LAST;        -- NULL을 맨 뒤로
```

`ASC`(오름차순)가 기본값이라 생략 가능합니다. Oracle은 기본적으로 NULL을 가장 큰 값으로 취급하므로(ASC면 뒤, DESC면 앞), 필요하면 `NULLS FIRST` / `NULLS LAST`로 명시하세요.

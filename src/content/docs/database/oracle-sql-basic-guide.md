---
categories: [Database]
title: Oracle SQL 기초 가이드
description: Oracle SQL의 시작. SQL 4가지 분류, 데이터 타입, 테이블 만들기(DDL)부터 SELECT·WHERE·ORDER BY 기본 조회까지 예제 중심으로 정리했습니다.
created: 2026-06-04
tags: [SQL|teal, Oracle|red, Database|teal]
platform: Database
readingTime: 6
---

# Oracle SQL 기초 가이드

SQL을 처음 접한다면 이 글부터 읽으세요. 이 글에서는 Oracle SQL의 뼈대인 분류·타입·테이블 생성과 기본 조회를 다룹니다.

예제 테이블은 세 개입니다. 뒤의 모든 글에서 같은 테이블을 씁니다.

- `EMPLOYEE` (직원)
- `DEPARTMENT` (부서)
- `ORDERS` (주문)

**다음 글:** [Oracle SQL 함수 가이드](./oracle-sql-function-guide)

## SQL 4가지 분류

SQL은 "무엇을 원하는지"를 선언하는 언어입니다. 명령의 성격에 따라 4가지로 나뉩니다. 이 분류를 알면 **자동 저장되는지(COMMIT)**, **되돌릴 수 있는지(ROLLBACK)**가 바로 보입니다.

| 분류 | 풀네임 | 대표 명령 | 역할 |
|------|--------|-----------|------|
| DDL | Data Definition | CREATE, ALTER, DROP, TRUNCATE | 구조(테이블 등) 정의 |
| DML | Data Manipulation | SELECT, INSERT, UPDATE, DELETE | 데이터 조작 |
| TCL | Transaction Control | COMMIT, ROLLBACK, SAVEPOINT | 변경 확정/취소 |
| DCL | Data Control | GRANT, REVOKE | 권한 부여/회수 |

> **중요:** DDL은 실행 즉시 자동 커밋되어 되돌릴 수 없습니다. 반면 DML(INSERT/UPDATE/DELETE)은 COMMIT 전까지 ROLLBACK으로 취소할 수 있습니다.

## 데이터 타입

컬럼을 만들 때 "어떤 종류의 값이 들어가는지"를 정합니다. Oracle에서 실무에 쓰는 핵심만 추렸습니다.

| 타입 | 설명 | 예 |
|------|------|----|
| `NUMBER(p, s)` | 숫자. p=전체 자릿수, s=소수 자릿수 | `NUMBER(10,2)` → 12345678.99 |
| `VARCHAR2(n)` | 가변 길이 문자열 (가장 많이 씀) | `VARCHAR2(100)` |
| `CHAR(n)` | 고정 길이 문자열 (남으면 공백 채움) | `CHAR(2)` → 'KR' |
| `DATE` | 날짜 + 시간(초 단위) | 2026-06-01 13:30:00 |
| `TIMESTAMP` | 날짜 + 시간(밀리초·타임존) | 정밀 시간 |
| `CLOB` | 대용량 텍스트 | 게시글 본문 |

> `VARCHAR`가 아니라 **`VARCHAR2`**를 쓰는 게 Oracle 관례입니다. 길이는 보통 바이트 기준이라 한글을 넉넉히 담으려면 여유 있게 잡으세요.

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

잘못된 데이터가 애초에 못 들어오게 막는 규칙입니다. 데이터 무결성의 핵심입니다.

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

> 세 가지 삭제는 꼭 구분하세요. `DELETE`는 행 단위·롤백 가능, `TRUNCATE`는 전체 비우기·빠름·롤백 불가, `DROP`은 테이블 자체 제거입니다.

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

### SQL 실행 순서 (꼭 기억)

작성 순서와 실제 처리 순서가 다릅니다. 이걸 알면 "왜 WHERE에서는 별칭을 못 쓸까?" 같은 의문이 바로 풀립니다.

```text
작성:  SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY
처리:  FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
```

`SELECT`(별칭이 정해지는 시점)가 `WHERE`보다 **나중에** 처리되므로 WHERE에서는 SELECT의 별칭을 쓸 수 없고, ORDER BY는 SELECT 이후라 별칭 사용이 가능합니다.

## 조건 걸기 (WHERE)

### 비교·논리 연산자

```sql
SELECT * FROM EMPLOYEE WHERE EMP_NO = 1001;
SELECT * FROM EMPLOYEE
WHERE DEPT_ID = 10
  AND SALARY >= 5000;      -- AND, OR, NOT 조합
```

연산자: `=`, `!=`(`<>`), `>`, `<`, `>=`, `<=`, `AND`, `OR`, `NOT`

### LIKE — 패턴 검색

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

### NULL 다루기 — 가장 흔한 실수

NULL은 "값이 없음"이라 `=`로 비교가 안 됩니다. 반드시 `IS NULL` / `IS NOT NULL`을 써야 합니다.

```sql
WHERE COMMISSION IS NULL;       -- 맞음
WHERE COMMISSION = NULL;        -- 틀림. 항상 거짓 → 결과 0건
```

> NULL과의 모든 산술·비교는 결과가 `UNKNOWN`이 됩니다. (`NULL + 100` → NULL, `NULL = NULL` → 거짓) 이 성질이 뒤에서 LEFT JOIN, NOT IN 함정의 원인이 됩니다.

## 정렬 (ORDER BY)

```sql
SELECT * FROM EMPLOYEE ORDER BY SALARY DESC;                    -- 내림차순
SELECT * FROM EMPLOYEE ORDER BY DEPT_ID ASC, SALARY DESC;      -- 다중 정렬
SELECT * FROM EMPLOYEE ORDER BY SALARY DESC NULLS LAST;        -- NULL을 맨 뒤로
```

`ASC`(오름차순)가 기본값이라 생략 가능합니다. Oracle은 기본적으로 NULL을 가장 큰 값으로 취급하므로(ASC면 뒤, DESC면 앞), 필요하면 `NULLS FIRST` / `NULLS LAST`로 명시하세요.

## 정리

이 글에서 다룬 것: SQL 4분류, 데이터 타입, CREATE TABLE, SELECT, WHERE, ORDER BY. 다음 단계는 조회에 살을 붙이는 함수입니다.

**다음 글:** [Oracle SQL 함수 가이드](./oracle-sql-function-guide)
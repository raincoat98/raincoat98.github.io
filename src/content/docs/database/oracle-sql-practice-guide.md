---
categories: [Database]
title: Oracle SQL 실무 가이드
description: INSERT·UPDATE·DELETE·MERGE 데이터 변경, 트랜잭션(COMMIT·ROLLBACK), 페이징, 뷰·시퀀스·인덱스와 실무 주의사항 10가지까지. 운영에서 바로 쓰는 Oracle SQL을 정리했습니다.
created: 2026-06-04
tags: [SQL|teal, Oracle|red, Database|teal, 실무|orange]
platform: Database
readingTime: 7
---

# Oracle SQL 실무 가이드

데이터를 바꾸고, 확정하고, 성능을 관리하는 운영 관점의 SQL입니다. 실무에서 마주하는 작업과 사고 예방을 다룹니다.

**이전 글:** [Oracle SQL 조회 심화 가이드](./oracle-sql-query-guide)

## 데이터 변경 (INSERT / UPDATE / DELETE / MERGE)

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

> **UPDATE·DELETE에서 WHERE를 빼면 전체 행**이 바뀌거나 지워집니다. 실행 전 같은 조건으로 SELECT를 먼저 돌려 영향 범위를 확인하는 습관을 들이세요.

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

대량 동기화(있는 건 갱신, 없는 건 추가)를 한 번에 처리할 때 유용합니다.

## 트랜잭션 (COMMIT / ROLLBACK)

여러 변경을 "전부 성공 or 전부 취소"라는 한 묶음으로 다루는 게 트랜잭션입니다. 계좌 이체를 떠올리면 쉽습니다. 출금과 입금이 함께 성공해야 합니다.

```sql
UPDATE ACCOUNT SET BALANCE = BALANCE - 1000 WHERE ID = 'A';
UPDATE ACCOUNT SET BALANCE = BALANCE + 1000 WHERE ID = 'B';

COMMIT;     -- 두 변경을 확정 (이제 되돌릴 수 없음)
-- ROLLBACK;  -- 마지막 COMMIT 이후 모든 변경을 취소
```

부분 취소가 필요하면 SAVEPOINT를 씁니다.

```sql
SAVEPOINT SP1;
DELETE FROM ORDERS WHERE STATUS = 'CANCEL';
ROLLBACK TO SP1;   -- SP1 이후만 취소
```

핵심:

- DML(INSERT/UPDATE/DELETE)은 COMMIT 전까지 임시 상태이며 ROLLBACK 가능
- COMMIT하면 영구 반영되어 되돌릴 수 없음
- **DDL(CREATE/ALTER/DROP/TRUNCATE)은 자동 COMMIT**되어 ROLLBACK 불가

## 페이징

목록을 10개씩 끊어 보여주는 처리입니다.

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

> 구버전 주의: `ROWNUM`은 **정렬되기 전에** 매겨집니다. 정렬된 결과를 페이징하려면 정렬한 서브쿼리(인라인 뷰)를 먼저 만든 뒤 그 바깥에서 ROWNUM을 적용해야 합니다.

## 뷰 · 시퀀스 · 인덱스

### 뷰 (View) — 저장된 SELECT

복잡한 쿼리를 가상의 테이블처럼 이름 붙여 재사용합니다.

```sql
CREATE VIEW V_DEPT_SALARY AS
SELECT DEPT_ID, AVG(SALARY) AS AVG_SAL
FROM EMPLOYEE GROUP BY DEPT_ID;

SELECT * FROM V_DEPT_SALARY;   -- 테이블처럼 조회
```

### 시퀀스 (Sequence) — 자동 증가 번호

PK용 일련번호를 자동 생성합니다.

```sql
CREATE SEQUENCE SEQ_EMP START WITH 1 INCREMENT BY 1;

INSERT INTO EMPLOYEE (EMP_NO, EMP_NAME)
VALUES (SEQ_EMP.NEXTVAL, '신입사원');   -- 다음 번호 자동 할당
```

### 인덱스 (Index) — 조회 속도 향상

책의 색인처럼, 자주 검색·조인하는 컬럼에 만들면 조회가 빨라집니다.

```sql
CREATE INDEX IDX_EMP_DEPT ON EMPLOYEE (DEPT_ID);
```

> 인덱스는 조회를 빠르게 하지만 INSERT/UPDATE/DELETE 시 갱신 부담이 생깁니다. 또 컬럼을 함수로 가공(`WHERE UPPER(NAME)=...`)하면 인덱스를 못 타니 주의하세요.

## 실무 주의사항 10가지

이것만 몸에 익혀도 흔한 SQL 사고의 대부분을 막을 수 있습니다.

1. **NULL은 `=`로 비교 안 됩니다** → `IS NULL` 사용. 산술·비교에 NULL이 끼면 결과가 NULL/거짓이 됩니다.
2. **LEFT JOIN의 오른쪽 조건을 WHERE에 두면 INNER JOIN처럼 동작** → 조건을 `ON` 절로 옮깁니다.
3. **1:N 조인 후 집계는 부풀려집니다** → 집계를 먼저 하고 JOIN하거나 DISTINCT(단순 목록 한정)를 씁니다.
4. **NOT IN + NULL = 결과 0건** → `NOT EXISTS`를 기본으로 씁니다.
5. **UPDATE / DELETE 전 WHERE 확인** → 같은 조건으로 SELECT 먼저 실행해 영향 범위 점검.
6. **DDL과 TRUNCATE는 롤백 불가** (자동 커밋). 운영 DB에서 특히 신중히.
7. **컬럼을 함수로 감싸면 인덱스를 못 탑니다** → `WHERE NAME = '홍길동'`은 빠르지만 `WHERE SUBSTR(NAME,1,1)='홍'`은 느릴 수 있습니다.
8. **`SELECT *`는 운영 코드에서 지양** → 필요한 컬럼만 명시(성능·가독성·변경 안정성).
9. **ROWNUM은 정렬 전에 매겨집니다** → 정렬 페이징은 서브쿼리로 감쌉니다.
10. **UNION보다 UNION ALL이 빠릅니다** → 중복 제거가 필요 없으면 ALL.

## 마무리

SQL은 문법 암기가 아니라 **세 가지 흐름을 이해하는 것**이 핵심입니다.

- **행이 줄어드는가?** (WHERE, GROUP BY, INNER JOIN)
- **행이 늘어나는가?** (1:N JOIN, CROSS JOIN)
- **NULL이 어디로 흐르는가?** (WHERE vs ON, NOT IN vs NOT EXISTS)

이 세 가지 기준으로 쿼리를 읽으면 처음 보는 복잡한 SQL도 구조가 보입니다.
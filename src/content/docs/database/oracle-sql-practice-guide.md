---
categories: [Database]
title: Oracle SQL 가이드
description: Oracle SQL의 데이터 변경과 트랜잭션, 페이징, 뷰, 시퀀스, 인덱스 예제를 다룬다.
created: 2026-06-04
tags: [SQL|teal, Oracle|red, Database|teal]
platform: Database
readingTime: 7
---

# Oracle SQL 가이드

데이터를 변경할 때는 대상 행과 커밋 시점을 먼저 확인한다.

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

`UPDATE`와 `DELETE`는 `WHERE`를 생략하면 모든 행에 적용된다. 실행 전에 같은 조건으로 `SELECT`를 실행해 대상 행을 확인한다.

### MERGE (UPSERT)

```sql
MERGE INTO EMPLOYEE T
USING (SELECT 1001 AS EMP_NO, '홍길동' AS EMP_NAME FROM DUAL) S
ON (T.EMP_NO = S.EMP_NO)
WHEN MATCHED THEN
    UPDATE SET T.EMP_NAME = S.EMP_NAME
WHEN NOT MATCHED THEN
    INSERT (EMP_NO, EMP_NAME) VALUES (S.EMP_NO, S.EMP_NAME);
```

직원 번호가 있으면 이름을 갱신하고, 없으면 새 행을 추가한다.

## 트랜잭션 (COMMIT / ROLLBACK)

트랜잭션은 여러 변경을 한 단위로 묶는다. 계좌 이체라면 출금과 입금을 함께 확정하거나 함께 취소한다.

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

`COMMIT` 이후에는 `ROLLBACK`으로 변경을 취소할 수 없다. Oracle은 유효한 DDL을 실행하기 전에 진행 중인 트랜잭션을 커밋한다.

## 페이징

직원 번호순으로 정렬한 뒤 10행을 가져온다. 정렬값이 겹칠 수 있다면 기본 키를 마지막 정렬 기준으로 추가한다.

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

`ROWNUM` 방식에서는 안쪽 쿼리에서 정렬하고 바깥 쿼리에서 행 범위를 제한한다. 같은 쿼리 블록에서 두 작업을 하면 정렬 결과의 첫 페이지를 보장하지 않는다.

## 뷰, 시퀀스, 인덱스

### 뷰 (View)

복잡한 쿼리를 가상의 테이블처럼 이름 붙여 재사용합니다.

```sql
CREATE VIEW V_DEPT_SALARY AS
SELECT DEPT_ID, AVG(SALARY) AS AVG_SAL
FROM EMPLOYEE GROUP BY DEPT_ID;

SELECT * FROM V_DEPT_SALARY;   -- 테이블처럼 조회
```

### 시퀀스 (Sequence)

`NEXTVAL`로 기본 키에 쓸 번호를 가져온다. 롤백해도 이미 가져온 번호는 되돌아오지 않는다.

```sql
CREATE SEQUENCE SEQ_EMP START WITH 1 INCREMENT BY 1;

INSERT INTO EMPLOYEE (EMP_NO, EMP_NAME)
VALUES (SEQ_EMP.NEXTVAL, '신입사원');   -- 다음 번호 자동 할당
```

### 인덱스 (Index)

인덱스는 조건에 맞는 행을 찾는 데 쓸 수 있다. 실제 사용 여부는 실행 계획에서 확인한다.

```sql
CREATE INDEX IDX_EMP_DEPT ON EMPLOYEE (DEPT_ID);
```

데이터를 변경할 때는 인덱스도 갱신해야 한다. `WHERE UPPER(NAME) = ...` 같은 조건을 자주 쓴다면 같은 표현식에 함수 기반 인덱스를 검토한다.
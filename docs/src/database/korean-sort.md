---
category: [Database]
title: SQL에서 한글 ORDER BY가 이상할 때
description: ORDER BY를 걸었는데 한글이 이상한 순서로 나올 때 원인과 해결 방법. MySQL COLLATE 절과 PostgreSQL bytea 캐스팅을 사용한 DBMS별 정렬 처리 방법을 정리합니다.
date: 2024-09-03
tags: [SQL, Database, MySQL, PostgreSQL]
platform: Database
readingTime: 2
---

# SQL에서 한글 ORDER BY가 이상할 때

ORDER BY를 걸었는데 한글이 이상한 순서로 나올 때가 있습니다. 대부분 인코딩이나 Collation 설정 문제입니다. DBMS별로 해결 방법이 다릅니다.

## MySQL / MariaDB

COLLATE 절로 정렬 규칙을 직접 지정합니다.

```sql
SELECT name
FROM users
ORDER BY name COLLATE utf8mb4_unicode_ci;
```

`utf8mb4_unicode_ci`는 유니코드 기반 정렬 규칙으로, 한글을 가나다 순으로 정확하게 정렬합니다. 테이블 기본 Collation이 맞지 않을 때 쿼리 단에서 이렇게 재지정할 수 있습니다.

## PostgreSQL

컬럼을 `bytea` 타입으로 캐스팅해서 UTF-8 바이트 순서 기준으로 정렬합니다.

```sql
SELECT name
FROM users
ORDER BY name::bytea;
```

PostgreSQL은 Collation 설정에 따라 동작이 달라질 수 있어서, `bytea` 캐스팅으로 인코딩 기준 정렬을 강제하는 방식이 깔끔합니다.

## 참고

- Oracle, SQL Server도 각자 Collation 설정이 있습니다. 사용 중인 DBMS 공식 문서에서 한글 Collation을 확인하세요.
- 테이블 생성 시 Collation을 미리 `utf8mb4_unicode_ci`로 잡아두면 쿼리마다 지정할 필요가 없습니다.

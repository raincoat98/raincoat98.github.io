---
categories: [React]
title: nuqs로 URL 쿼리 파라미터 상태 관리하기
description: nuqs의 useQueryState·useQueryStates로 URL 쿼리 파라미터를 타입 안전하게 React state처럼 다루는 방법을 정리합니다. 파서 종류, 옵션, 검색·필터·페이지네이션 실무 예제까지 한 번에.
created: 2026-06-01
tags: [React|blue, Next.js|blue, nuqs|teal, URL 상태|teal, query string|teal]
platform: nuqs v2
readingTime: 7
---

# nuqs로 URL 쿼리 파라미터 상태 관리하기

> `useQueryState` · `useQueryStates` · parsers · history 옵션 한 번에 정리

`useState`처럼 URL 쿼리 파라미터를 읽고 쓰는 라이브러리입니다.  
`URLSearchParams`를 직접 다루지 않아도 되고, **타입 변환·기본값·히스토리 제어**까지 한 번에 해결합니다.

---

## 목차

1. [개요](#_1-개요)
2. [useQueryState — 단일 파라미터](#_2-usequerystate)
3. [파서(parsers) 종류](#_3-파서-종류)
4. [useQueryStates — 복수 파라미터](#_4-usequerystates)
5. [주요 옵션](#_5-주요-옵션)
6. [실무 예제 — 검색 + 필터 + 페이지네이션](#_6-실무-예제)

---

## 1. 개요

URL: `?search=AG+Grid&page=2&category=react`

```tsx
// URLSearchParams 직접 사용 (기존 방식)
const params = new URLSearchParams(location.search);
const search = params.get('search') ?? '';
const page = parseInt(params.get('page') ?? '1');

// nuqs
const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
```

`setSearch('AG Grid')`를 호출하면 URL이 `?search=AG+Grid`로 자동 업데이트됩니다.  
새로고침해도 URL에서 값을 복원하므로 **링크 공유·북마크**가 자연스럽게 동작합니다.

### 설치

```bash
npm install nuqs
```

Next.js App Router는 루트 레이아웃에 `NuqsAdapter`를 추가합니다.

```tsx
// app/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
```

> **React SPA (Vite 등):** `nuqs/adapters/react` 어댑터를 루트에 적용합니다.
>
> ```tsx
> import { NuqsAdapter } from 'nuqs/adapters/react';
> ```

---

## 2. useQueryState

`useState`와 동일한 인터페이스로 단일 파라미터를 읽고 씁니다.

```tsx
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';

function SearchBar() {
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="검색어 입력"
    />
  );
}
```

`setSearch('')`를 호출하면 기본값과 같으므로 URL에서 `q` 파라미터가 **자동 제거**됩니다.

### 값 초기화

```tsx
await setSearch(null); // URL에서 파라미터 제거
```

---

## 3. 파서 종류

| 파서 | URL 값 | JS 타입 |
|------|--------|---------|
| `parseAsString` | `'hello'` | `string` |
| `parseAsInteger` | `'42'` | `number` |
| `parseAsFloat` | `'3.14'` | `number` |
| `parseAsBoolean` | `'true'` | `boolean` |
| `parseAsIsoDateTime` | `'2026-06-01T00:00:00.000Z'` | `Date` |
| `parseAsArrayOf(parseAsString)` | `'a,b,c'` | `string[]` |
| `parseAsJson<T>()` | JSON 문자열 | `T` |

```tsx
// 배열 파라미터: ?tags=react,typescript,nextjs
const [tags, setTags] = useQueryState('tags', parseAsArrayOf(parseAsString).withDefault([]));

// 커스텀 파서
const parseAsSort = parseAsStringLiteral(['asc', 'desc'] as const);
const [sort, setSort] = useQueryState('sort', parseAsSort.withDefault('asc'));
```

---

## 4. useQueryStates

여러 파라미터를 하나의 훅으로 묶어 관리합니다.

```tsx
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs';

const filterParsers = {
  search: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
  category: parseAsString,
  sort: parseAsString.withDefault('name'),
};

function ProductFilter() {
  const [filters, setFilters] = useQueryStates(filterParsers);

  const handleReset = () =>
    setFilters({ search: null, page: null, category: null, sort: null });

  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
      />
      <select
        value={filters.category ?? ''}
        onChange={(e) => setFilters({ category: e.target.value || null, page: 1 })}
      >
        <option value="">전체</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
      </select>
      <button onClick={handleReset}>초기화</button>
    </div>
  );
}
```

> **팁:** `setFilters`는 부분 업데이트를 지원합니다. 지정하지 않은 파라미터는 유지됩니다.

---

## 5. 주요 옵션

```tsx
const [search, setSearch] = useQueryState('search', {
  ...parseAsString,
  defaultValue: '',
  history: 'replace',  // 'push' | 'replace' (기본: 'replace')
  shallow: true,       // false면 서버 재요청 (Next.js App Router)
  scroll: false,       // 파라미터 변경 시 스크롤 맨 위로 이동 여부
  throttleMs: 300,     // URL 업데이트 쓰로틀 (ms)
});
```

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `history` | `'replace'` | `'push'`면 뒤로 가기로 이전 필터 복원 가능 |
| `shallow` | `true` | `false`면 Next.js 서버 컴포넌트 재실행 |
| `scroll` | `false` | `true`면 파라미터 변경 시 페이지 최상단으로 이동 |
| `throttleMs` | `0` | 타이핑 중 URL 업데이트 횟수 제한 |

---

## 6. 실무 예제

검색어 입력 · 카테고리 필터 · 페이지네이션을 URL로 관리하는 예제입니다.

```tsx
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs';

const searchParsers = {
  q: parseAsString.withDefault(''),
  category: parseAsString.withDefault('all'),
  page: parseAsInteger.withDefault(1),
};

export default function ProductPage() {
  const [{ q, category, page }, setSearch] = useQueryStates(searchParsers, {
    history: 'push',    // 뒤로 가기로 이전 검색 상태 복원
    throttleMs: 300,    // 검색어 타이핑 최적화
  });

  // q, category, page가 바뀌면 데이터 재조회
  const { data } = useProducts({ q, category, page });

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setSearch({ q: e.target.value, page: 1 })}
        placeholder="검색어"
      />
      <select
        value={category}
        onChange={(e) => setSearch({ category: e.target.value, page: 1 })}
      >
        <option value="all">전체</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
      </select>
      <ProductList data={data} />
      <Pagination
        current={page}
        onChange={(p) => setSearch({ page: p })}
      />
    </div>
  );
}
```

URL: `?q=grid&category=react&page=2`  
새로고침해도 필터 상태가 그대로 복원되고, 뒤로 가기로 이전 검색 조건으로 돌아갈 수 있습니다.

---

## 핵심 요약

- **`useQueryState`** — `useState`처럼 단일 파라미터 읽기·쓰기.
- **`useQueryStates`** — 여러 파라미터 묶음 관리. 부분 업데이트 지원.
- **parsers** — `parseAsInteger`, `parseAsBoolean`, `parseAsArrayOf` 등으로 타입 변환 자동 처리.
- **`null` 설정** — 기본값과 같거나 `null`이면 URL에서 파라미터 자동 제거.
- **`history: 'push'`** — 뒤로 가기로 이전 필터 상태 복원이 필요할 때 사용.

---
categories: [React]
title: nuqs로 URL 쿼리 파라미터 상태 관리하기
description: Next.js App Router에서 nuqs로 검색어, 카테고리, 페이지 번호를 URL에 저장하고 뒤로 가기 동작을 설정한다.
created: 2026-06-01
tags: [React|blue, Next.js|blue, nuqs|teal, URL 상태|teal, query string|teal]
platform: nuqs v2
readingTime: 4
---

# nuqs로 URL 쿼리 파라미터 상태 관리하기

검색 결과의 URL이 `/products?q=grid&category=react&page=2`라면 새로고침하거나 링크를 공유해도 같은 검색 조건으로 목록을 열 수 있다. 검색 조건을 `useState`에만 저장하면 URL에 이 정보가 남지 않는다.

nuqs는 URL의 쿼리 파라미터를 React 상태처럼 읽고 쓰는 라이브러리다. 이 글에서는 nuqs v2와 Next.js App Router를 기준으로 설명한다.

## 어댑터 설정

```bash
npm install nuqs@2
```

`app/layout.tsx`에서 `NuqsAdapter`로 페이지를 감싼다. 이 어댑터가 URL 상태 변경을 App Router에 연결한다.

```tsx
import type { ReactNode } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
```

## 검색어, 카테고리, 페이지 번호 묶기

파라미터 하나만 읽고 쓰려면 `useQueryState`를 사용한다. 검색어와 카테고리가 바뀔 때 페이지도 함께 초기화해야 하므로 여기서는 `useQueryStates`로 세 값을 묶는다. 3페이지에서 결과가 한 페이지뿐인 조건으로 바꿔도 빈 페이지에 남지 않는다.

파서는 URL 문자열을 화면에서 사용할 값으로 바꾼다. `page`는 숫자로 읽고, `category`는 목록에 있는 값만 받는다. 값이 없거나 파서가 읽지 못하면 `.withDefault()`에 지정한 값을 사용한다. 예제의 상품 목록은 코드 안에 두므로 별도 API가 필요 없다.

`app/products/page.tsx`:

```tsx
'use client';

import { Suspense } from 'react';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';

const parsers = {
  q: parseAsString.withDefault(''),
  category: parseAsStringLiteral(['all', 'react', 'vue']).withDefault('all'),
  page: parseAsInteger.withDefault(1),
};

const products = [
  { name: 'React Grid Basic', category: 'react' },
  { name: 'React Grid Pro', category: 'react' },
  { name: 'React Grid Kit', category: 'react' },
  { name: 'Vue Grid', category: 'vue' },
];
const pageSize = 2;

export default function ProductsPage() {
  return (
    <Suspense fallback={<p>목록을 불러오는 중</p>}>
      <ProductList />
    </Suspense>
  );
}

function ProductList() {
  const [{ q, category, page }, setFilters] = useQueryStates(parsers);
  const term = q.trim().toLowerCase();
  const matches = products.filter(
    (product) =>
      (category === 'all' || category === product.category) &&
      product.name.toLowerCase().includes(term),
  );
  const lastPage = Math.max(1, Math.ceil(matches.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * pageSize;

  return (
    <main>
      <label>
        검색어
        <input
          value={q}
          onChange={(event) => setFilters({ q: event.target.value, page: 1 })}
        />
      </label>
      <label>
        카테고리
        <select
          value={category}
          onChange={(event) => {
            const value = parsers.category.parse(event.target.value);
            void setFilters({ category: value, page: 1 });
          }}
        >
          <option value="all">전체</option>
          <option value="react">React</option>
          <option value="vue">Vue</option>
        </select>
      </label>
      <button onClick={() => setFilters(null)}>초기화</button>
      {matches.length === 0 ? (
        <p>검색 결과가 없다.</p>
      ) : (
        <ul>
          {matches.slice(start, start + pageSize).map((product) => (
            <li key={product.name}>{product.name}</li>
          ))}
        </ul>
      )}
      <button
        disabled={currentPage <= 1}
        onClick={() => setFilters({ page: currentPage - 1 }, { history: 'push' })}
      >
        이전
      </button>
      <span>{currentPage} / {lastPage}</span>
      <button
        disabled={currentPage >= lastPage}
        onClick={() => setFilters({ page: currentPage + 1 }, { history: 'push' })}
      >
        다음
      </button>
    </main>
  );
}
```

`ProductList`는 URL을 읽는 클라이언트 컴포넌트라서 정적 빌드에서도 사용할 수 있도록 `Suspense`로 감쌌다. 페이지 번호는 화면에 표시할 때 범위를 제한한다. `/products?page=999`를 열면 마지막 페이지를 보여주지만 URL의 숫자를 다시 쓰지는 않는다.

## URL과 뒤로 가기 동작 확인

1. `/products?q=grid&category=react&page=2`를 열면 두 번째 페이지의 `React Grid Kit`가 나온다.
2. 검색어를 `pro`로 바꾸면 첫 페이지의 `React Grid Pro`가 나온다. `page`는 기본값인 `1`과 같으므로 URL에서 빠진다.
3. 카테고리를 바꾸면 검색어는 유지된다. `setFilters`는 넘긴 키만 바꾼다. 초기화 버튼의 `setFilters(null)`은 이 훅이 관리하는 세 키만 제거한다.
4. 검색 조건을 초기화한 뒤 `다음`을 눌러 2페이지로 이동한다. 브라우저에서 뒤로 가기를 하면 1페이지로 돌아간다.

검색어와 카테고리 변경은 기본값인 `history: 'replace'`를 사용한다. 검색어 한 글자마다 방문 기록을 남기지 않기 위해서다. 페이지 이동은 `history: 'push'`로 새 기록을 추가한다.

이 예제는 브라우저에서 목록을 필터링하므로 기본값인 `shallow: true`를 그대로 쓴다. 서버 컴포넌트에서 검색 결과를 다시 조회해야 한다면 해당 업데이트에 `shallow: false`를 지정한다.

공식 문서: [어댑터](https://nuqs.dev/docs/adapters), [useQueryStates](https://nuqs.dev/docs/batching), [히스토리와 서버 갱신 옵션](https://nuqs.dev/docs/options)

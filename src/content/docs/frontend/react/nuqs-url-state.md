---
categories: [React]
title: nuqs로 URL 쿼리 파라미터 상태 관리하기
description: React 18.3과 Ant Design에서 검색어, 카테고리, 페이지 번호를 URL에 저장하고 같은 예제를 Next.js App Router에서도 사용한다.
created: 2026-06-01
tags: [React|blue, Next.js|blue, nuqs|teal, URL 상태|teal, query string|teal]
platform: nuqs v2
readingTime: 4
---

# nuqs로 URL 쿼리 파라미터 상태 관리하기

상품 목록의 URL이 `/?q=keyboard&category=peripherals&page=2`라면 새로고침하거나 링크를 공유해도 같은 검색 결과의 2페이지를 열 수 있다. 검색 조건을 `useState`에만 저장하면 링크에 이 정보가 남지 않는다.

nuqs는 URL의 쿼리 파라미터를 React 상태처럼 읽고 쓰는 라이브러리다. 기본 예제는 Vite, React 18.3, Ant Design 5로 구성한다. nuqs v2는 React SPA에서 React 18.3 이상인 18.x와 React 19를 지원한다. Next.js는 별도 어댑터로 연결한다.

## React 18.3에서 어댑터 설정

```bash
npm install react@18.3 react-dom@18.3 nuqs@2 antd@5
npm install -D @types/react@18 @types/react-dom@18
```

Vite의 React TypeScript 프로젝트를 기준으로 `src/main.tsx`에서 `NuqsAdapter`로 상품 목록을 감싼다.

```tsx
import { createRoot } from 'react-dom/client';
import { NuqsAdapter } from 'nuqs/adapters/react';
import ProductList from './ProductList';

createRoot(document.getElementById('root')!).render(
  <NuqsAdapter>
    <ProductList />
  </NuqsAdapter>,
);
```

## 검색어, 카테고리, 페이지 번호 묶기

파라미터 하나만 읽고 쓰려면 `useQueryState`를 사용한다. 검색어와 카테고리가 바뀔 때 페이지도 함께 초기화해야 하므로 여기서는 `useQueryStates`로 세 값을 묶는다. 3페이지에서 결과가 한 페이지뿐인 조건으로 바꿔도 빈 페이지에 남지 않는다.

파서는 URL 문자열을 화면에서 사용할 값으로 바꾼다. `page`는 숫자로 읽고, `category`는 목록에 있는 값만 받는다. 값이 없거나 파서가 읽지 못하면 `.withDefault()`에 지정한 값을 사용한다. 예제의 상품 목록은 코드 안에 두므로 별도 API가 필요 없다.

`src/ProductList.tsx`:

```tsx
'use client';

import { Button, Input, Select, Space, Table } from 'antd';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';

const categories = ['all', 'peripherals', 'audio'] as const;
type Category = (typeof categories)[number];

const parsers = {
  q: parseAsString.withDefault(''),
  category: parseAsStringLiteral(categories).withDefault('all'),
  page: parseAsInteger.withDefault(1),
};

const products = [
  { name: 'Keyboard Basic', category: 'peripherals' },
  { name: 'Keyboard Pro', category: 'peripherals' },
  { name: 'Keyboard Mini', category: 'peripherals' },
  { name: 'Headphones', category: 'audio' },
];
const pageSize = 2;

export default function ProductList() {
  const [{ q, category, page }, setFilters] = useQueryStates(parsers);
  const term = q.trim().toLowerCase();
  const matches = products.filter(
    (product) =>
      (category === 'all' || category === product.category) &&
      product.name.toLowerCase().includes(term),
  );
  const lastPage = Math.max(1, Math.ceil(matches.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), lastPage);

  return (
    <main>
      <Space wrap>
        <Input
          aria-label="상품 검색"
          placeholder="상품명"
          value={q}
          onChange={(event) => setFilters({ q: event.target.value, page: 1 })}
        />
        <Select<Category>
          aria-label="카테고리"
          value={category}
          options={[
            { value: 'all', label: '전체' },
            { value: 'peripherals', label: '주변기기' },
            { value: 'audio', label: '오디오' },
          ]}
          onChange={(value) => setFilters({ category: value, page: 1 })}
        />
        <Button onClick={() => setFilters(null)}>초기화</Button>
      </Space>
      <Table
        rowKey="name"
        dataSource={matches}
        columns={[{ title: '상품명', dataIndex: 'name' }]}
        pagination={{
          current: currentPage,
          pageSize,
          showSizeChanger: false,
          onChange: (nextPage) => setFilters({ page: nextPage }, { history: 'push' }),
        }}
      />
    </main>
  );
}
```

Ant Design의 `Table`에는 필터링한 전체 배열을 넘긴다. 현재 페이지는 URL에서 읽고, 어느 행을 보여줄지는 `Table`의 페이지네이션에 맡긴다. `/?page=999`를 열면 마지막 페이지를 보여주되 URL의 숫자는 다시 쓰지 않는다.

## URL과 뒤로 가기 동작 확인

1. `/?q=keyboard&category=peripherals&page=2`를 열면 2페이지의 `Keyboard Mini`가 나온다.
2. 검색어를 `pro`로 바꾸면 1페이지의 `Keyboard Pro`가 나온다. `page`는 기본값인 `1`과 같으므로 URL에서 빠진다.
3. 카테고리를 바꾸면 검색어는 유지된다. `setFilters`는 넘긴 키만 바꾼다. 초기화 버튼의 `setFilters(null)`은 이 훅이 관리하는 세 키만 제거한다.
4. 초기화한 뒤 테이블 아래에서 2페이지를 누른다. 브라우저에서 뒤로 가기를 하면 1페이지로 돌아간다.

검색어와 카테고리 변경은 기본값인 `history: 'replace'`를 사용한다. 검색어 한 글자마다 방문 기록을 남기지 않기 위해서다. 페이지 이동은 `history: 'push'`로 새 기록을 추가한다.

## Next.js App Router에서 같은 목록 사용하기

Next.js 14.2 이상에서는 루트 레이아웃에 `nuqs/adapters/next/app`의 어댑터를 쓴다.

```tsx
// app/layout.tsx
import type { ReactNode } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body><NuqsAdapter>{children}</NuqsAdapter></body>
    </html>
  );
}
```

위 목록을 `app/products/ProductList.tsx`에 두고 `app/products/page.tsx`에서 렌더링한다. 정적 빌드에서는 검색 파라미터를 읽는 컴포넌트를 `Suspense`로 감싼다.

```tsx
import { Suspense } from 'react';
import ProductList from './ProductList';

export default function ProductsPage() {
  return (
    <Suspense fallback={<p>목록을 불러오는 중</p>}>
      <ProductList />
    </Suspense>
  );
}
```

목록을 브라우저에서 필터링하므로 기본값인 `shallow: true`를 유지한다. Next.js의 서버 컴포넌트에서 결과를 다시 조회하려면 해당 업데이트에 `shallow: false`를 지정한다.

공식 문서: [nuqs 지원 버전](https://nuqs.dev/docs/installation), [어댑터](https://nuqs.dev/docs/adapters), [Ant Design Table](https://ant.design/components/table/)

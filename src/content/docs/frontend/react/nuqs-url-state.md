---
categories: [React]
title: nuqs로 URL 쿼리 파라미터 상태 관리하기
description: React 18.3과 Ant Design에서 nuqs로 검색어, 카테고리, 페이지 번호를 URL에 저장하는 방법.
created: 2026-06-01
tags: [React|blue, Next.js|blue, nuqs|teal, URL 상태|teal, query string|teal]
platform: nuqs v2
readingTime: 4
---

# nuqs로 URL 쿼리 파라미터 상태 관리하기

상품 목록에서 검색한 뒤 2페이지로 이동했다고 해볼게요. 주소가 `/?q=keyboard&category=peripherals&page=2`라면 새로고침하거나 링크를 공유해도 같은 화면을 열 수 있어요. 검색 조건을 `useState`에만 넣으면 주소에는 아무것도 남지 않죠.

nuqs를 쓰면 URL의 쿼리 파라미터를 React 상태처럼 읽고 바꿀 수 있어요. 먼저 Vite, React 18.3, Ant Design 5로 목록을 만들고, 같은 컴포넌트를 Next.js에도 연결해 볼게요. nuqs v2는 React SPA에서 React 18.3 이상인 18.x와 React 19를 지원해요.

## React 18.3에서 어댑터 설정

```bash
npm install react@18.3 react-dom@18.3 nuqs@2 antd@5
npm install -D @types/react@18 @types/react-dom@18
```

Vite의 React TypeScript 프로젝트라면 `src/main.tsx`에서 목록을 `NuqsAdapter`로 감싸면 돼요.

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

URL에서 값 하나만 관리한다면 `useQueryState`면 충분해요. 이 목록에서는 2페이지에서 검색 조건을 바꿨을 때 1페이지부터 보여줘야 해요. 그래서 `useQueryStates`로 조건과 페이지 번호를 한 번에 바꿔요.

URL의 값은 문자열이에요. 파서는 이 값을 화면에서 쓸 형태로 바꿔 줘요. 예를 들어 `page=2`는 숫자 `2`로 읽고, `category`는 목록에 있는 값만 받아요. 값이 없거나 파서가 읽지 못하면 `.withDefault()`에 넣은 값을 써요. 상품 목록은 예제 코드에 들어 있으니 별도 API는 필요 없어요.

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

Ant Design의 `Table`에는 필터링한 배열 전체를 넘겨요. URL에서 현재 페이지를 읽고, 실제로 보여줄 행은 `Table`이 골라요. `/?page=999`처럼 범위를 벗어난 주소로 들어오면 마지막 페이지를 보여줘요. 주소의 숫자까지 바꾸지는 않아요.

## URL과 뒤로 가기 동작 확인

1. `/?q=keyboard&category=peripherals&page=2`를 열어 보세요. 2페이지에 `Keyboard Mini`가 나와요.
2. 검색어를 `pro`로 바꾸면 `Keyboard Pro`가 있는 1페이지로 돌아가요. `1`은 기본값이라 주소에서 `page`가 빠져요.
3. 카테고리만 바꾸면 검색어는 그대로 남아요. `setFilters`는 넘긴 키만 바꾸기 때문이에요. 초기화 버튼은 `setFilters(null)`로 이 훅이 관리하는 세 키를 지워요.
4. 초기화한 뒤 테이블 아래에서 2페이지를 눌러 보세요. 브라우저에서 뒤로 가기를 하면 1페이지로 돌아와요.

검색어를 한 글자 입력할 때마다 뒤로 가기 기록이 쌓이면 불편해요. 그래서 검색어와 카테고리는 기본값인 `history: 'replace'`로 현재 기록을 바꾸고, 페이지를 이동할 때만 `history: 'push'`로 새 기록을 남겨요.

## Next.js App Router에서 같은 목록 사용하기

Next.js 14.2 이상에서도 목록 컴포넌트는 그대로 쓸 수 있어요. 루트 레이아웃에는 `nuqs/adapters/next/app`에서 가져온 어댑터를 넣어요.

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

목록 컴포넌트를 `app/products/ProductList.tsx`에 옮기고 `app/products/page.tsx`에서 불러와요. 정적 빌드에서는 검색 파라미터를 읽는 컴포넌트를 `Suspense`로 감싸야 해요.

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

이 예제는 브라우저에서 목록을 거르므로 기본값인 `shallow: true`면 충분해요. Next.js의 서버 컴포넌트에서 결과를 다시 조회해야 할 때는 해당 업데이트에 `shallow: false`를 지정해요.

공식 문서: [nuqs 지원 버전](https://nuqs.dev/docs/installation), [어댑터](https://nuqs.dev/docs/adapters), [Ant Design Table](https://ant.design/components/table/)

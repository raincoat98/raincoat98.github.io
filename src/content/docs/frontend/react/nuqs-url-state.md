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

검색어와 페이지 번호를 URL에 저장하면, 링크를 받은 사람도 같은 검색 결과를 볼 수 있습니다.

## nuqs란?

nuqs는 URL의 쿼리 파라미터를 React 상태처럼 읽고 쓰는 라이브러리입니다. `useQueryState('q')`로 주소에서 검색어를 읽고, 반환된 업데이트 함수로 검색어를 바꾸면 URL에도 반영됩니다. 페이지 번호처럼 숫자로 다룰 값에는 `parseAsInteger` 파서를 사용합니다.

공식 문서: [nuqs 소개](https://nuqs.dev/)와 [기본 사용법](https://nuqs.dev/docs/basic-usage)

예제는 Vite, React 18.3, Ant Design 5를 사용합니다. Next.js에 연결하는 방법은 글 마지막에 다룹니다. nuqs v2는 React SPA에서 React 18.3 이상인 18.x와 React 19를 지원합니다.

## 브라우저 기본 API와 비교

검색 조건을 URL에 저장하는 데 nuqs가 꼭 필요한 것은 아닙니다. 브라우저의 `URLSearchParams`로 값을 읽고, `history.replaceState()`나 `history.pushState()`로 주소를 바꿀 수 있습니다.

| 작업 | 브라우저 기본 API | nuqs |
| --- | --- | --- |
| 페이지 번호 읽기 | 문자열을 읽은 뒤 숫자로 변환하고 기본값을 정합니다. | `parseAsInteger.withDefault(1)`로 변환과 기본값을 선언합니다. |
| 검색어 변경과 페이지 초기화 | 두 키를 수정하고 주소와 화면 상태를 함께 갱신합니다. | `setFilters({ q: 검색어, page: 1 })` 한 번으로 두 값을 바꿉니다. |
| 뒤로 가기 후 화면 복원 | `popstate`에서 주소를 다시 읽어 화면 상태를 갱신합니다. | 훅으로 읽는 상태가 주소 변경을 따라갑니다. |

파라미터 하나를 읽기만 한다면 `URLSearchParams`로 충분합니다. 검색어와 필터를 바꿀 때 페이지도 초기화하고 뒤로 가기까지 지원해야 한다면, nuqs를 사용해 URL과 화면을 맞추는 코드를 줄일 수 있습니다.

## React 18.3에서 어댑터 설정

```bash
npm install react@18.3 react-dom@18.3 nuqs@2 antd@5
npm install -D @types/react@18 @types/react-dom@18
```

Vite의 React TypeScript 프로젝트에서는 `src/main.tsx`에서 목록을 `NuqsAdapter`로 감쌉니다.

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

URL에서 값 하나만 관리할 때는 `useQueryState`를 사용합니다. 이 예제에서는 검색 조건을 바꾸면 1페이지부터 보여줘야 하므로 `useQueryStates`로 검색 조건과 페이지 번호를 함께 갱신합니다.

파서는 URL 문자열을 화면에서 쓸 값으로 변환합니다. `page=2`는 숫자 `2`로 읽고, `category`는 미리 지정한 값만 받습니다. 값이 없거나 파서가 읽을 수 없으면 `.withDefault()`에 지정한 값을 사용합니다. 상품 목록은 예제에 포함되어 있으므로 별도 API는 필요하지 않습니다.

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

Ant Design의 `Table`에는 필터링한 배열 전체를 넘깁니다. 현재 페이지는 URL에서 읽고, 해당 페이지에 표시할 행은 `Table`이 선택합니다. `/?page=999`처럼 범위를 벗어난 주소로 들어오면 마지막 페이지를 표시하되 주소는 바꾸지 않습니다.

## URL과 뒤로 가기 동작 확인

1. `/?q=keyboard&category=peripherals&page=2`를 열면 2페이지에 `Keyboard Mini`가 표시됩니다.
2. 검색어를 `pro`로 바꾸면 `Keyboard Pro`가 있는 1페이지로 돌아갑니다. `1`은 기본값이므로 주소에서 `page`가 빠집니다.
3. 카테고리를 바꿔도 검색어는 유지됩니다. `setFilters`는 전달한 키만 갱신합니다. 초기화 버튼은 `setFilters(null)`을 호출해 이 훅이 관리하는 세 키를 제거합니다.
4. 초기화한 뒤 테이블 아래에서 2페이지를 선택합니다. 브라우저에서 뒤로 가기를 하면 1페이지로 돌아갑니다.

검색어를 입력할 때마다 방문 기록이 쌓이지 않도록 검색어와 카테고리는 기본값인 `history: 'replace'`로 현재 기록을 바꿉니다. 페이지를 이동할 때만 `history: 'push'`로 새 기록을 추가합니다.

## Next.js App Router에서 같은 목록 사용하기

Next.js 14.2 이상에서도 같은 목록 컴포넌트를 사용할 수 있습니다. 루트 레이아웃에는 `nuqs/adapters/next/app`에서 가져온 어댑터를 추가합니다.

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

목록 컴포넌트를 `app/products/ProductList.tsx`에 옮기고 `app/products/page.tsx`에서 불러옵니다. 정적 빌드에서는 검색 파라미터를 읽는 컴포넌트를 `Suspense`로 감쌉니다.

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

이 예제는 브라우저에서 목록을 필터링하므로 기본값인 `shallow: true`를 유지합니다. Next.js의 서버 컴포넌트에서 결과를 다시 조회해야 할 때는 해당 업데이트에 `shallow: false`를 지정합니다.

공식 문서: [nuqs 지원 버전](https://nuqs.dev/docs/installation), [어댑터](https://nuqs.dev/docs/adapters), [Ant Design Table](https://ant.design/components/table/)

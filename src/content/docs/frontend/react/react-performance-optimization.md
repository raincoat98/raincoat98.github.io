---
categories: [React]
title: "React useMemo, useCallback, memo 차이와 사용법"
description: React의 useMemo, useCallback, memo 차이를 상품 목록 예제로 비교합니다. 계산 결과를 재사용할 때와 자식 리렌더링을 줄일 때 어떤 API를 쓰는지 설명합니다.
created: 2026-05-05
tags: [React|blue, 성능 최적화|orange, useMemo|teal, useCallback|teal]
platform: React
readingTime: 4
---

# React useMemo, useCallback, memo 차이와 사용법

`useMemo`는 계산 결과를, `useCallback`은 함수 참조를 재사용합니다. `memo`는 부모가 리렌더링될 때 props가 같은 자식의 렌더링을 건너뛸 수 있게 합니다. 상품 목록과 장바구니 예제로 세 API가 어떤 일을 하는지 비교합니다.

## useMemo, useCallback, memo 비교

| 도구 | 동작 | 사용할 때 |
| --- | --- | --- |
| `useMemo` | 의존성이 같으면 이전 계산 결과를 반환합니다. | 비용이 큰 계산을 반복하거나 자식에게 전달할 배열이나 객체의 참조를 유지할 때 사용합니다. |
| `useCallback` | 의존성이 같으면 이전 함수 참조를 반환합니다. | `memo`로 감싼 자식에게 전달하는 함수가 매번 달라지는 문제를 막을 때 사용합니다. |
| `memo` | 부모가 다시 렌더링돼도 props가 같으면 자식 렌더링을 건너뛸 수 있습니다. | 동일한 props로 자주 렌더링되는 자식의 비용이 클 때 사용합니다. |

`useMemo`와 `useCallback`은 컴포넌트 자체의 렌더링을 막지 않습니다. `memo`도 자식 자신의 상태나 자식이 읽는 Context가 바뀌면 렌더링을 건너뛰지 않습니다.

## React 리렌더링 최적화 예제: 상품 목록

이 예제는 검색어가 바뀌면 목록을 다시 계산하고, 장바구니 개수만 바뀌면 기존 목록과 함수 참조를 재사용합니다.

```jsx
import { memo, useCallback, useMemo, useState } from 'react';

const products = [
  { id: 1, name: '노트북' },
  { id: 2, name: '마우스' },
  { id: 3, name: '키보드' },
];

const ProductList = memo(function ProductList({ items, onAdd }) {
  return (
    <ul>
      {items.map(({ id, name }) => (
        <li key={id}>
          {name} <button onClick={onAdd}>담기</button>
        </li>
      ))}
    </ul>
  );
});

export default function ProductPage() {
  const [query, setQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const filtered = useMemo(
    () => products.filter(({ name }) => name.includes(query)),
    [query],
  );

  const addToCart = useCallback(() => {
    setCartCount((count) => count + 1);
  }, []);

  return (
    <>
      <label>
        상품 검색
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <p>장바구니: {cartCount}개</p>
      <ProductList items={filtered} onAdd={addToCart} />
    </>
  );
}
```

`담기`를 누르면 `ProductPage`의 `cartCount`가 바뀝니다. `query`는 그대로이므로 `useMemo`는 이전 배열을 반환합니다. `addToCart`는 현재 개수를 직접 읽는 대신 상태 업데이트 함수가 받은 값을 사용하므로 `cartCount`를 의존성에 넣을 필요가 없습니다. 두 props의 참조가 같으면 `memo`는 `ProductList`의 렌더링을 건너뛸 수 있습니다.

`memo`는 기본적으로 각 prop을 `Object.is`로 비교합니다. 배열 내용이 같아도 렌더링마다 `filter()`를 호출하면 새 배열이 생깁니다. `onAdd`에 인라인 함수를 넘겨도 새 함수가 생깁니다. 둘 중 하나만 달라져도 이 예제에서는 목록을 건너뛸 수 없습니다.

## 메모이제이션이 필요한지 확인하기

예제처럼 상품이 세 개뿐이라면 보통 `filter()`를 그대로 사용해도 충분합니다. 실제 화면이 느리다면 React DevTools의 Profiler로 어느 컴포넌트가 자주 렌더링되고 시간이 얼마나 드는지 확인합니다. 비용이 큰 부분에만 적용하고 같은 동작을 다시 측정합니다.

메모이제이션은 동작을 보장하는 장치가 아니라 성능 최적화입니다. 의존성에서 값을 의도적으로 빼면 이전 값을 읽을 수 있으므로, 계산이나 함수가 사용하는 반응형 값은 의존성에 포함합니다.

공식 문서: [useMemo](https://react.dev/reference/react/useMemo), [useCallback](https://react.dev/reference/react/useCallback), [memo](https://react.dev/reference/react/memo)

---
categories: [React]
title: React useMemo · useCallback · memo 차이
description: useMemo, useCallback, React.memo의 차이와 언제 써야 하는지를 실전 예제로 정리합니다.
created: 2026-05-05
updated: 2026-05-16
tags: [React|blue, 성능 최적화|orange, useMemo|teal, useCallback|teal]
platform: React
readingTime: 6
---

# React useMemo · useCallback · memo 차이

React를 쓰다 보면 한 번쯤 의문이 생긴다. "왜 내 앱이 느려지지?"

오늘은 그 답이 되는 세 가지 도구를 정리한다. `useMemo`, `useCallback`, `React.memo`. 어렵지 않다.

---

## 시작 전에: React는 어떻게 동작하나

버튼을 누르면 컴포넌트 함수 전체가 다시 실행된다. 이게 React의 기본 동작이다.

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  // 버튼을 클릭할 때마다 이 함수 전체가 다시 실행된다
  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

대부분은 문제없다. 하지만 때로는 안 해도 될 계산을 반복하거나, 안 바뀐 컴포넌트를 다시 그린다. 그걸 막는 게 성능 최적화다.

---

## 1. useMemo — 계산 결과를 기억한다

### 문제

```javascript
function ShoppingList() {
  const [items, setItems] = useState([/* ... */]);
  const [count, setCount] = useState(0);

  // count가 바뀔 때마다 이것도 다시 계산된다
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <p>총 가격: {total}원</p>
      <p>클릭 횟수: {count}</p>
      <button onClick={() => setCount(count + 1)}>클릭</button>
    </div>
  );
}
```

`count`만 바뀌는데 `total`도 매번 다시 계산된다. 장바구니는 그대로인데도.

### 해결

```javascript
import { useState, useMemo } from 'react';

function ShoppingList() {
  const [items, setItems] = useState([/* ... */]);
  const [count, setCount] = useState(0);

  // items가 바뀔 때만 다시 계산한다
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  return (
    <div>
      <p>총 가격: {total}원</p>
      <p>클릭 횟수: {count}</p>
      <button onClick={() => setCount(count + 1)}>클릭</button>
    </div>
  );
}
```

`[]` 안에 있는 값이 바뀔 때만 다시 계산하고, 그 외에는 저장된 결과를 재사용한다.

> **핵심:** `useMemo`는 계산 결과를 기억한다.

---

## 2. useCallback — 함수를 기억한다

### 문제

```javascript
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [count, setCount] = useState(0);

  // count가 바뀔 때마다 새로운 함수가 만들어진다
  const addTodo = (text) => {
    setTodos([...todos, text]);
  };

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>클릭</button>
      <TodoInput onAdd={addTodo} />
    </div>
  );
}
```

클릭할 때마다 `addTodo` 함수가 새로 만들어진다. 내용은 똑같은데도.

### 해결

```javascript
import { useState, useCallback } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [count, setCount] = useState(0);

  // 함수를 저장해둔다
  const addTodo = useCallback((text) => {
    setTodos((prev) => [...prev, text]);
  }, []); // 의존성이 없으면 한 번만 만들어진다

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>클릭</button>
      <TodoInput onAdd={addTodo} />
    </div>
  );
}
```

> **핵심:** `useCallback`은 함수 자체를 기억한다.

### useMemo vs useCallback 한 줄 정리

```javascript
const value = useMemo(() => number * 2, [number]);   // 값을 기억
const fn    = useCallback(() => doSomething(), []);  // 함수를 기억
```

---

## 3. React.memo — 컴포넌트를 기억한다

### 문제

```javascript
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
      <ExpensiveChild name="철수" />
    </div>
  );
}

function ExpensiveChild({ name }) {
  // count가 바뀔 때마다 여기도 다시 실행된다
  return <div>안녕 {name}!</div>;
}
```

부모의 `count`가 바뀔 때마다 `ExpensiveChild`도 다시 그려진다. `name`은 전혀 안 바뀌었는데도.

### 해결

```javascript
import { memo } from 'react';

// memo로 감싸면 props가 바뀔 때만 다시 그린다
const ExpensiveChild = memo(function ExpensiveChild({ name }) {
  return <div>안녕 {name}!</div>;
});
```

> **핵심:** `React.memo`는 props가 바뀌지 않으면 컴포넌트를 다시 그리지 않는다.

---

## 실전: 세 가지 모두 함께 쓰기

검색 기능이 있는 상품 목록이다.

```javascript
import { useState, useMemo, useCallback, memo } from 'react';

function ProductPage() {
  const [products] = useState([
    { id: 1, name: '노트북', price: 1000000 },
    { id: 2, name: '마우스', price: 30000 },
    { id: 3, name: '키보드', price: 80000 },
  ]);
  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // 1. useMemo: 검색 결과를 기억
  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.name.includes(search));
  }, [products, search]);

  // 2. useCallback: 함수를 기억
  const addToCart = useCallback(() => {
    setCartCount((prev) => prev + 1);
  }, []);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="상품 검색"
      />
      <p>장바구니: {cartCount}개</p>

      {/* 3. memo: 컴포넌트를 기억 */}
      <ProductList products={filteredProducts} onAddToCart={addToCart} />
    </div>
  );
}

const ProductList = memo(function ProductList({ products, onAddToCart }) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name} - {product.price.toLocaleString()}원
          <button onClick={onAddToCart}>담기</button>
        </li>
      ))}
    </ul>
  );
});
```

검색창에 입력하면 `filteredProducts`가 다시 계산되고 `ProductList`도 다시 그린다. 하지만 장바구니 버튼을 눌러도 `ProductList`는 다시 그리지 않는다. props가 안 바뀌었으니까.

---

## 언제 써야 하나

| 도구 | 언제 쓰나 |
|---|---|
| `useMemo` | 배열 필터링, 정렬, 복잡한 계산 |
| `useCallback` | 자식 컴포넌트에 함수를 전달할 때 |
| `React.memo` | 부모가 자주 렌더링되는데 자식은 잘 안 바뀔 때 |

### 쓰지 말아야 할 때

```javascript
// 과한 최적화 — 하지 마세요
const sum = useMemo(() => 2 + 2, []);
const Simple = memo(function Simple({ text }) { return <p>{text}</p>; });

// 그냥 이렇게
const sum = 2 + 2;
function Simple({ text }) { return <p>{text}</p>; }
```

계산이 간단하거나 컴포넌트가 가벼우면 최적화 비용이 오히려 더 크다.

---

## 요약

- `useMemo` — 계산 결과를 기억한다
- `useCallback` — 함수를 기억한다
- `React.memo` — 컴포넌트를 기억한다

처음 React를 배울 때는 이걸 신경 쓰지 않아도 된다. 먼저 동작하는 코드를 만들자. 앱이 느려지는 걸 느낄 때 그때 꺼내 쓰면 충분하다.

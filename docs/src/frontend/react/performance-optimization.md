# React 성능 최적화 쉽게 이해하기

React를 처음 배우고 계신가요? 코드를 작성하다 보면 "왜 내 앱이 느려지지?"라는 의문이 들 때가 있습니다. 오늘은 React 앱을 빠르게 만드는 세 가지 마법 같은 도구를 아주 쉽게 설명해드리겠습니다.

## 시작하기 전에: React는 어떻게 동작할까?

React의 기본 동작을 이해하면 최적화가 왜 필요한지 알 수 있습니다.

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  // 버튼을 클릭할 때마다 이 함수 전체가 다시 실행됩니다!
  console.log("Counter 컴포넌트가 실행되었어요");

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

버튼을 누를 때마다 `Counter` 함수 전체가 다시 실행됩니다. 이것이 React의 기본 동작입니다. 대부분은 문제없지만, 때로는 불필요한 작업을 반복하게 됩니다.

## 1. useMemo: "이거 전에 계산했는데..."

### 일상생활 비유

시험 공부를 한다고 생각해봅시다. 복잡한 수학 문제를 풀었는데, 나중에 똑같은 문제가 또 나왔어요. 다시 처음부터 풀 필요 없이 전에 푼 답을 가져다 쓰면 되겠죠? `useMemo`가 바로 이런 역할입니다.

### 문제 상황

```javascript
function ShoppingList() {
  const [items, setItems] = useState([
    { name: "사과", price: 1000 },
    { name: "바나나", price: 1500 },
    { name: "우유", price: 2000 },
  ]);
  const [count, setCount] = useState(0);

  // 😱 count가 바뀔 때마다 이것도 다시 계산됩니다
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

위 코드에서 클릭 버튼을 누르면 `count`만 바뀌는데, 총 가격도 매번 다시 계산됩니다. 장바구니는 안 바뀌었는데 말이죠!

### 해결 방법

```javascript
import { useState, useMemo } from "react";

function ShoppingList() {
  const [items, setItems] = useState([
    { name: "사과", price: 1000 },
    { name: "바나나", price: 1500 },
    { name: "우유", price: 2000 },
  ]);
  const [count, setCount] = useState(0);

  // ✅ items가 바뀔 때만 다시 계산합니다
  const total = useMemo(() => {
    console.log("총 가격 계산 중...");
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]); // items가 바뀔 때만 실행

  return (
    <div>
      <p>총 가격: {total}원</p>
      <p>클릭 횟수: {count}</p>
      <button onClick={() => setCount(count + 1)}>클릭</button>
    </div>
  );
}
```

**핵심**: `useMemo`는 "계산 결과"를 기억합니다. `[]` 안에 있는 값이 바뀔 때만 다시 계산하고, 그 외에는 저장된 결과를 재사용합니다.

### 더 쉬운 예제

```javascript
function NumberGame() {
  const [number, setNumber] = useState(5);
  const [color, setColor] = useState("blue");

  // number가 바뀔 때만 계산
  const doubled = useMemo(() => {
    console.log("2배 계산!");
    return number * 2;
  }, [number]);

  return (
    <div>
      <p style={{ color }}>
        숫자: {number}, 2배: {doubled}
      </p>
      <button onClick={() => setNumber(number + 1)}>숫자 증가</button>
      <button onClick={() => setColor(color === "blue" ? "red" : "blue")}>
        색 변경
      </button>
    </div>
  );
}
```

색을 바꿔도 2배 계산은 안 일어납니다! `number`가 바뀔 때만 계산하니까요.

## 2. useCallback: "이 함수 전에 만들었는데..."

### 일상생활 비유

친구한테 전화번호를 저장해 놓으면, 매번 물어볼 필요 없이 저장된 번호로 전화하면 되죠? `useCallback`은 함수를 저장해 두는 것입니다.

### 문제 상황

```javascript
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [count, setCount] = useState(0);

  // 😱 count가 바뀔 때마다 새로운 함수가 만들어집니다
  const addTodo = (text) => {
    setTodos([...todos, text]);
  };

  return (
    <div>
      <p>클릭: {count}</p>
      <button onClick={() => setCount(count + 1)}>클릭</button>
      <TodoInput onAdd={addTodo} />
    </div>
  );
}
```

클릭 버튼을 누를 때마다 `addTodo` 함수가 새로 만들어집니다. 내용은 똑같은데 말이죠!

### 해결 방법

```javascript
import { useState, useCallback } from "react";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [count, setCount] = useState(0);

  // ✅ 함수를 저장해둡니다
  const addTodo = useCallback((text) => {
    setTodos((prevTodos) => [...prevTodos, text]);
  }, []); // 의존성이 없으면 한 번만 만들어집니다

  return (
    <div>
      <p>클릭: {count}</p>
      <button onClick={() => setCount(count + 1)}>클릭</button>
      <TodoInput onAdd={addTodo} />
    </div>
  );
}
```

**핵심**: `useCallback`은 "함수 자체"를 기억합니다. `[]` 안에 있는 값이 바뀔 때만 함수를 새로 만듭니다.

### 초보자를 위한 팁

```javascript
// 이 두 개는 거의 비슷합니다
const value = useMemo(() => number * 2, [number]); // 값을 기억
const fn = useCallback(() => doSomething(), []); // 함수를 기억

// 쉽게 기억하세요
// useMemo → 계산 결과를 기억
// useCallback → 함수를 기억
```

## 3. React.memo: "이 컴포넌트 다시 그릴 필요 없는데..."

### 일상생활 비유

그림을 그리는데, 이미 완벽하게 그린 부분을 다시 그릴 필요는 없겠죠? `React.memo`는 "이 부분은 안 바뀌었으니 다시 안 그려도 돼"라고 말해주는 것입니다.

### 문제 상황

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
  console.log("ExpensiveChild 렌더링!");
  // 복잡한 작업들...
  return <div>안녕 {name}!</div>;
}
```

부모의 `count`가 바뀔 때마다 `ExpensiveChild`도 다시 그려집니다. `name`은 안 바뀌었는데 말이죠!

### 해결 방법

```javascript
import { memo } from "react";

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

// ✅ memo로 감싸면 props가 안 바뀌면 다시 안 그립니다
const ExpensiveChild = memo(function ExpensiveChild({ name }) {
  console.log("ExpensiveChild 렌더링!");
  return <div>안녕 {name}!</div>;
});
```

**핵심**: `React.memo`는 컴포넌트를 감싸서, props(전달받은 값)가 안 바뀌면 다시 그리지 않습니다.

### 쉬운 비교

```javascript
// memo 없이
function Child({ name }) {
  // 부모가 렌더링될 때마다 나도 렌더링됨 😥
  return <div>{name}</div>;
}

// memo 사용
const Child = memo(function Child({ name }) {
  // name이 바뀔 때만 렌더링됨 😊
  return <div>{name}</div>;
});
```

## 실전 예제: 세 가지 모두 사용하기

검색 기능이 있는 상품 목록을 만들어봅시다.

```javascript
import { useState, useMemo, useCallback, memo } from "react";

function ProductPage() {
  const [products] = useState([
    { id: 1, name: "노트북", price: 1000000 },
    { id: 2, name: "마우스", price: 30000 },
    { id: 3, name: "키보드", price: 80000 },
  ]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // 1. useMemo: 검색 결과를 기억
  const filteredProducts = useMemo(() => {
    console.log("검색 중...");
    return products.filter((p) => p.name.includes(search));
  }, [products, search]); // search나 products가 바뀔 때만

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

// memo로 감싼 자식 컴포넌트
const ProductList = memo(function ProductList({ products, onAddToCart }) {
  console.log("ProductList 렌더링");

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name} - {product.price}원
          <button onClick={onAddToCart}>담기</button>
        </li>
      ))}
    </ul>
  );
});
```

**무슨 일이 일어날까요?**

1. 검색창에 입력 → `filteredProducts` 다시 계산, `ProductList` 다시 그림 ✅
2. 장바구니에 담기 → `ProductList`는 다시 안 그림 (props 안 바뀜) ✅
3. 불필요한 재계산과 재렌더링이 줄어듭니다! 🎉

## 언제 사용해야 할까?

### 초보자를 위한 간단한 가이드

**useMemo 사용:**

- 계산이 복잡할 때 (배열 필터링, 정렬, 복잡한 수식)
- 데이터가 많을 때 (상품 목록, 게시글 목록)

```javascript
// ✅ 좋은 예
const sortedList = useMemo(() => bigArray.sort((a, b) => a - b), [bigArray]);

// ❌ 필요 없는 예
const sum = useMemo(() => 2 + 2, []); // 너무 간단함
```

**useCallback 사용:**

- 자식 컴포넌트에 함수를 전달할 때
- 자식이 `memo`로 감싸져 있을 때

```javascript
// ✅ 좋은 예
const handleClick = useCallback(() => {
  doSomething();
}, []);
return <MemoizedChild onClick={handleClick} />;

// ❌ 필요 없는 예
const handleClick = useCallback(() => {
  console.log("click");
}, []);
return <button onClick={handleClick}>클릭</button>; // 일반 버튼
```

**React.memo 사용:**

- 컴포넌트가 복잡할 때
- 부모가 자주 렌더링되는데 자식은 잘 안 바뀔 때

```javascript
// ✅ 좋은 예
const HeavyComponent = memo(function HeavyComponent({ data }) {
  // 복잡한 렌더링 로직
  return <div>{/* ... */}</div>;
});

// ❌ 필요 없는 예
const Simple = memo(function Simple({ text }) {
  return <p>{text}</p>; // 너무 간단함
});
```

## 주의사항: 과하게 쓰지 마세요!

최적화는 약처럼, 필요할 때만 써야 합니다.

```javascript
// ❌ 과한 최적화
function SimpleCounter() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const doubledCount = useMemo(() => count * 2, [count]);

  return <p>{doubledCount}</p>;
}

// ✅ 그냥 이렇게
function SimpleCounter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const doubledCount = count * 2;

  return <p>{doubledCount}</p>;
}
```

## 요약: 한 문장으로 정리

- **useMemo**: "이 계산 결과, 전에 했던 거 다시 쓸게요"
- **useCallback**: "이 함수, 전에 만든 거 다시 쓸게요"
- **React.memo**: "이 컴포넌트, 안 바뀌었으면 다시 안 그릴게요"

## 마무리

React를 처음 배울 때는 이런 최적화를 신경 쓰지 않아도 됩니다. 먼저 동작하는 코드를 만드는 데 집중하세요. 나중에 앱이 느려지는 걸 느끼면, 그때 이 도구들을 하나씩 적용해보세요.

기억하세요: **동작하는 코드가 최적화된 코드보다 낫습니다!** 최적화는 나중에 해도 늦지 않아요. 😊

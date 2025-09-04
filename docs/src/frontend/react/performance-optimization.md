# React 성능 최적화 - useMemo, useCallback, React.memo

## 1. 공통 개념

React는 state가 바뀌면 컴포넌트를 다시 렌더링합니다.
이 과정에서 값이나 함수가 매번 새로 만들어지는 문제가 생길 수 있는데,
이를 최적화하는 도구가 바로:

- **useMemo** → 값(value)을 메모
- **useCallback** → 함수(function)를 메모
- **React.memo** → 컴포넌트 리렌더링 방지

## 2. 각각의 역할

### 🔹 useMemo

값을 기억해둡니다.
계산 비용이 큰 연산(정렬, 필터링 등)이 매번 실행되지 않도록 최적화합니다.

```jsx
const sorted = useMemo(() => items.sort(), [items]);
```

👉 `items`가 안 바뀌면 이전 정렬 결과를 재사용합니다.

### 🔹 useCallback

함수를 기억해둡니다.
렌더링 때마다 새 함수가 만들어져서 자식 컴포넌트가 불필요하게 리렌더링되는 걸 방지합니다.

```jsx
const handleClick = useCallback(() => {
  console.log("clicked");
}, []);
```

👉 의존성이 안 바뀌면 같은 함수 객체를 유지합니다.

### 🔹 React.memo

props가 바뀌지 않으면 컴포넌트 리렌더링을 건너뜁니다.

```jsx
const Child = React.memo(({ value }) => {
  console.log("렌더링됨");
  return <div>{value}</div>;
});
```

👉 props가 그대로면 렌더링을 생략합니다.

## 3. 함께 쓰는 예시 (리스트 최적화)

### ✅ 최적화 적용

```jsx
function App() {
  const [search, setSearch] = useState("");
  const items = ["apple", "banana", "cherry"];

  // 값 메모
  const filtered = useMemo(() => {
    return items.filter((item) => item.includes(search));
  }, [items, search]);

  // 함수 메모
  const handleClick = useCallback((item) => {
    console.log(item);
  }, []);

  return (
    <>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      {filtered.map((item) => (
        <Item key={item} item={item} onClick={handleClick} />
      ))}
    </>
  );
}

// 자식 컴포넌트 최적화
const Item = React.memo(({ item, onClick }) => {
  console.log("렌더링됨:", item);
  return <div onClick={() => onClick(item)}>{item}</div>;
});
```

👉 **결과:**

- `search` 안 바뀌면 필터링 안 됨 (useMemo)
- `handleClick` 같은 함수 재사용 (useCallback)
- `Item` 불필요한 리렌더링 방지 (React.memo)

## 4. 비유

- **useMemo**: 📦 "값을 상자에 담아 기억"
- **useCallback**: 📞 "전화번호를 메모지에 적어두고 같은 종이 계속 보여줌"
- **React.memo**: 🚪 "집에 변화 없으면 굳이 문 열고 안 들어감"

## 5. 안 써야 하는 상황

### 🚫 useMemo

- 계산이 가벼운 경우 → 메모하는 비용이 오히려 더 비쌈
- 예: `const doubled = num * 2;` 같은 단순 계산

### 🚫 useCallback

- 자식 컴포넌트에 함수를 props로 넘기지 않을 때
- 의존성 배열이 자주 바뀌어서 결국 매번 새 함수가 생성될 때
- 아주 간단한 함수 (굳이 메모할 필요 없음)

### 🚫 React.memo

- props가 자주 바뀌는 컴포넌트 → 리렌더링 막을 효과가 없음
- 오히려 비교 비용(얕은 비교)이 추가돼서 성능 손해

## ✅ 정리

- **useMemo** → 값 최적화 (비싼 계산만)
- **useCallback** → 함수 최적화 (자식 props로 내려갈 때만)
- **React.memo** → 컴포넌트 리렌더링 최적화 (props가 자주 안 바뀔 때)

👉 세 가지 다 "무조건 쓰는 게 최적화"는 아닙니다.
필요한 곳에만 선택적으로 써야 진짜 최적화가 됩니다 🚀

## 추가 예시

### 복잡한 계산 최적화

```jsx
function ExpensiveComponent({ data }) {
  // 비싼 계산을 useMemo로 최적화
  const processedData = useMemo(() => {
    return data
      .filter((item) => item.active)
      .sort((a, b) => a.priority - b.priority)
      .map((item) => ({
        ...item,
        displayName: `${item.name} (${item.category})`,
      }));
  }, [data]);

  return (
    <div>
      {processedData.map((item) => (
        <div key={item.id}>{item.displayName}</div>
      ))}
    </div>
  );
}
```

### 이벤트 핸들러 최적화

```jsx
function TodoList({ todos, onToggle, onDelete }) {
  // 각각의 핸들러를 useCallback으로 최적화
  const handleToggle = useCallback(
    (id) => {
      onToggle(id);
    },
    [onToggle]
  );

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete]
  );

  return (
    <div>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

// 자식 컴포넌트도 React.memo로 최적화
const TodoItem = React.memo(({ todo, onToggle, onDelete }) => {
  return (
    <div>
      <span onClick={() => onToggle(todo.id)}>
        {todo.completed ? "✅" : "⭕"} {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)}>삭제</button>
    </div>
  );
});
```

### 성능 측정 팁

```jsx
import { Profiler } from "react";

function onRenderCallback(id, phase, actualDuration) {
  console.log("렌더링 시간:", actualDuration);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourComponent />
    </Profiler>
  );
}
```

이렇게 React의 성능 최적화 도구들을 적절히 활용하면<br>
불필요한 리렌더링을 줄이고 앱의 성능을 크게 향상시킬 수 있습니다.

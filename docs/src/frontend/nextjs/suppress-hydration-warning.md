# Next.js suppressHydrationWarning 에러 해결법

## 개요

Next.js에서 `suppressHydrationWarning` 에러는 <br>
서버 사이드 렌더링(SSR)과 클라이언트 사이드 하이드레이션 과정에서 발생하는 일반적인 문제입니다.<br>
이 문서에서는 이 에러의 원인과 해결 방법을 자세히 설명합니다.

## 에러 발생 원인

### 1. 서버와 클라이언트 간 데이터 불일치

- 서버에서 렌더링된 HTML과 클라이언트에서 렌더링된 HTML이 다를 때
- 동적 데이터나 시간 기반 콘텐츠가 포함된 경우
- 브라우저 전용 API 사용 시

### 2. 일반적인 시나리오

```javascript
// 문제가 되는 코드 예시
function Component() {
  const [time, setTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <div>{time}</div>; // 서버와 클라이언트에서 다른 값
}
```

## 해결 방법

### 1. suppressHydrationWarning 사용 (권장하지 않음)

```javascript
function Component() {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleString());
  }, []);

  return <div suppressHydrationWarning={true}>{time}</div>;
}
```

**주의사항:** 이 방법은 에러를 숨길 뿐 근본적인 문제를 해결하지 않습니다.

### 2. 클라이언트 전용 렌더링 (권장)

```javascript
import { useEffect, useState } from "react";

function Component() {
  const [isClient, setIsClient] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    setIsClient(true);
    setTime(new Date().toLocaleString());
  }, []);

  if (!isClient) {
    return <div>로딩 중...</div>; // 서버 사이드에서 표시
  }

  return <div>{time}</div>; // 클라이언트에서만 렌더링
}
```

### 3. dynamic import로 클라이언트 전용 컴포넌트

```javascript
import dynamic from "next/dynamic";

const ClientOnlyComponent = dynamic(() => import("./ClientComponent"), {
  ssr: false,
  loading: () => <div>로딩 중...</div>,
});

function Page() {
  return (
    <div>
      <h1>정적 콘텐츠</h1>
      <ClientOnlyComponent />
    </div>
  );
}
```

### 4. 조건부 렌더링 패턴

```javascript
function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <div>{mounted && <DynamicContent />}</div>;
}
```

## 실제 사용 예시

### 날짜/시간 표시

```javascript
function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString("ko-KR"));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isClient) {
    return <span>로딩 중...</span>;
  }

  return <span>{currentTime}</span>;
}
```

### 브라우저 전용 기능

```javascript
function BrowserOnlyFeature() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!isClient) {
    return <div>브라우저 정보 로딩 중...</div>;
  }

  return (
    <div>
      <p>
        화면 크기: {windowSize.width} x {windowSize.height}
      </p>
    </div>
  );
}
```

## 모범 사례

### 1. 컴포넌트 설계 시 고려사항

- 서버와 클라이언트에서 동일하게 렌더링될 수 있는지 확인
- 동적 데이터는 useEffect 내에서 처리
- 브라우저 전용 API는 클라이언트 확인 후 사용

### 2. 성능 최적화

```javascript
// 불필요한 리렌더링 방지
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []); // 의존성 배열을 빈 배열로 설정

// 컴포넌트가 마운트된 후에만 실행
if (!isClient) return null;
```

### 3. 에러 바운더리와 함께 사용

```javascript
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }) {
  return (
    <div role="alert">
      <p>문제가 발생했습니다:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component />
    </ErrorBoundary>
  );
}
```

## 디버깅 팁

### 1. 개발자 도구 활용

- React DevTools에서 컴포넌트 상태 확인
- 브라우저 콘솔에서 hydration 경고 메시지 확인
- Network 탭에서 서버 응답과 클라이언트 요청 비교

### 2. 로깅 추가

```javascript
useEffect(() => {
  console.log("클라이언트에서 마운트됨");
  setIsClient(true);
}, []);

console.log("렌더링 시점:", { isClient, mounted: !!mounted });
```

## 결론

`suppressHydrationWarning` 에러는 Next.js 애플리케이션에서 흔히 발생하는 문제입니다.<br>
이 에러를 해결할 때는 단순히 경고를 숨기는 것이 아니라,<br>
근본적인 원인을 파악하고 적절한 패턴을 적용하는 것이 중요합니다.

클라이언트 전용 렌더링, 조건부 렌더링, dynamic import 등을 활용하여<br>
서버와 클라이언트 간의 일관성을 유지하면서도 사용자 경험을 향상시킬 수 있습니다.

## 참고 자료

- [Next.js 공식 문서 - Hydration](https://nextjs.org/docs/messages/react-hydration-error)
- [React 공식 문서 - useEffect](https://react.dev/reference/react/useEffect)
- [Next.js 공식 문서 - Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)

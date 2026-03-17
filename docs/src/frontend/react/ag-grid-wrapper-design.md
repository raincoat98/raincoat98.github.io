---
title: AG Grid 공통 래퍼 설계 (Client / Server 분리 전략)
description: AG Grid를 실무에서 깔끔하게 쓰기 위한 공통 래퍼 설계 방법. ClientSideGrid와 ServerSideGrid를 분리하고 gridOptions로 기능을 위임하는 구조를 설명합니다.
date: 2026-03-17
---

# AG Grid 공통 래퍼 설계 (Client / Server 분리 전략)

AG Grid를 실무에서 쓰다 보면
페이지마다 반복되는 설정 때문에 코드가 점점 지저분해진다.

그래서 나는 다음 기준으로 공통 래퍼를 설계했다.

---

## 설계 목표

- 공통 로직 최소화
- 기능은 각 화면에서 자유롭게 설정
- Client / Server 책임 분리
- 유지보수 쉬운 구조

---

## 핵심 아이디어

> **"래퍼는 최소만, 나머지는 gridOptions로"**

```jsx
<ClientSideGrid
  rowData={rowData}
  columnDefs={columnDefs}
  gridOptions={{
    pagination: true,
    rowSelection: { mode: "multiRow" },
  }}
/>
```

AG Grid의 모든 기능은 `gridOptions`로 위임한다.

---

## 1. ClientSideGrid

### 언제 쓰는가?

- 데이터가 많지 않을 때
- 프론트에서 정렬/필터 처리 가능할 때
- 전체 데이터를 한 번에 가져올 때

### 구현 코드

```javascript
"use strict";

import React, { forwardRef, useMemo, useRef, useImperativeHandle } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const ClientSideGrid = forwardRef((props, ref) => {
  const {
    rowData = [],
    columnDefs = [],
    defaultColDef,
    theme = "ag-theme-quartz",
    width = "100%",
    height = "100%",
    gridOptions = {},
  } = props;

  const gridRef = useRef(null);

  useImperativeHandle(ref, () => ({
    api: gridRef.current?.api,
    columnApi: gridRef.current?.columnApi,
  }));

  const containerStyle = useMemo(
    () => ({ width, height }),
    [width, height]
  );

  const mergedDefaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      ...defaultColDef,
    }),
    [defaultColDef]
  );

  return (
    <div style={containerStyle}>
      <div className={theme} style={{ width: "100%", height: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={mergedDefaultColDef}
          {...gridOptions}
        />
      </div>
    </div>
  );
});

export default React.memo(ClientSideGrid);
```

### 사용 예시

```javascript
const gridOptions = {
  rowSelection: { mode: "singleRow" },
  animateRows: true,
  onRowClicked: (e) => console.log(e.data),
};

<ClientSideGrid
  rowData={data}
  columnDefs={columns}
  height="600px"
  gridOptions={gridOptions}
/>
```

### 장점

- 단순하다
- 모든 기능을 `gridOptions`로 제어 가능
- AG Grid 공식 문서와 동일한 사용 방식

---

## 2. ServerSideGrid

### 언제 쓰는가?

- 데이터가 많을 때 (수천 ~ 수백만)
- 페이지네이션이 서버 기반일 때
- 정렬 / 필터를 서버에서 처리할 때

### 핵심 개념

> **"그리드가 필요한 만큼만 서버에서 가져온다"**

```
스크롤 ↓
→ getRows 호출
→ 서버 요청
→ 데이터 반환
```

### 구현 코드

```javascript
"use strict";

import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const ServerSideGrid = forwardRef((props, ref) => {
  const {
    columnDefs = [],
    defaultColDef,
    theme = "ag-theme-quartz",
    width = "100%",
    height = "100%",
    serverSideDatasource,
    gridOptions = {},
  } = props;

  const gridRef = useRef(null);

  useImperativeHandle(ref, () => ({
    api: gridRef.current?.api,
    columnApi: gridRef.current?.columnApi,
  }));

  const containerStyle = useMemo(
    () => ({ width, height }),
    [width, height]
  );

  const mergedDefaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      ...defaultColDef,
    }),
    [defaultColDef]
  );

  return (
    <div style={containerStyle}>
      <div className={theme} style={{ width: "100%", height: "100%" }}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={mergedDefaultColDef}
          rowModelType="serverSide"
          serverSideDatasource={serverSideDatasource}
          {...gridOptions}
        />
      </div>
    </div>
  );
});

export default React.memo(ServerSideGrid);
```

### 사용 예시

```javascript
const datasource = {
  getRows: async (params) => {
    const res = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify(params.request),
    });

    const data = await res.json();

    params.success({
      rowData: data.rows,
      rowCount: data.totalCount,
    });
  },
};

const gridOptions = {
  cacheBlockSize: 50,
  rowSelection: { mode: "singleRow" },
  getRowId: (params) => String(params.data.id),
};

<ServerSideGrid
  columnDefs={columns}
  serverSideDatasource={datasource}
  height="600px"
  gridOptions={gridOptions}
/>
```

### 서버에서 처리해야 할 것

`params.request` 구조:

```json
{
  "startRow": 0,
  "endRow": 50,
  "sortModel": [{ "colId": "price", "sort": "asc" }],
  "filterModel": {}
}
```

서버 역할:
- 페이지 범위 계산
- 정렬 처리
- 필터 처리
- 데이터 + `totalCount` 반환

---

## ServerSideGrid 필수 팁

### 1. getRowId 꼭 넣어라

```javascript
getRowId: (params) => String(params.data.id)
```

선택 유지 / 리렌더 안정성의 핵심이다.

### 2. datasource는 memo 필수

```javascript
useMemo(() => datasource, []);
```

안 하면 컴포넌트 리렌더 때마다 datasource가 새로 생성되어 매번 재조회된다.

### 3. 클라이언트 정렬 사용하지 말 것

서버에서 처리해야 정상 동작한다.

---

## Client vs Server 비교

| 항목 | Client | Server |
|------|--------|--------|
| 데이터 위치 | 브라우저 | 서버 |
| 성능 | 데이터 적을 때 좋음 | 대용량에 최적 |
| 정렬/필터 | 클라이언트 | 서버 |
| 구현 난이도 | 쉬움 | 중간 |
| 추천 상황 | 관리 화면 | 검색/리스트 |

---

## 결론

이 구조의 핵심은 딱 하나다.

> **"AG Grid 기능은 전부 gridOptions로 위임"**

### 이 구조의 장점

- AG Grid 문서 그대로 사용 가능
- 래퍼 유지보수 최소화
- 화면별 커스터마이징 자유
- Client / Server 역할 명확

**한 줄 요약:**

> "래퍼는 최소, 나머지는 gridOptions"

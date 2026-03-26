---
title: AG Grid v33 공통 래퍼 설계 (Client / Server 분리 전략)
description: AG Grid v33 기준으로 실무에서 쓰는 공통 래퍼 설계 방법. ClientSideGrid와 ServerSideGrid를 분리하고 gridOptions로 기능을 위임하는 구조를 설명합니다.
date: 2026-03-26
---

# AG Grid v33 공통 래퍼 설계 (Client / Server 분리 전략)

AG Grid 쓰다 보면 어느 순간 이런 생각이 들 거예요.

> "왜 페이지마다 이 설정을 또 쓰고 있지...?"

저도 처음엔 그냥 복붙하면서 넘어갔는데, 화면이 10개 넘어가면서부터 진짜 관리가 안 되더라고요.
그래서 공통 래퍼를 만들었고, 지금은 이 구조 없이는 AG Grid 못 쓸 것 같아요. 😅

---

## 설계할 때 고민했던 것들

- 공통 설정은 래퍼에서 처리하되, 너무 많이 감싸지 말자
- 각 화면에서 자유롭게 커스터마이징할 수 있어야 한다
- Client용이랑 Server용은 역할이 달라서 분리하는 게 맞다
- 나중에 수정할 때 래퍼 하나만 건드리면 되게 하자

---

## 핵심 아이디어

> **래퍼는 최소한만, 나머지는 gridOptions로 넘기자**

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

AG Grid 옵션이 엄청 많잖아요. 그걸 래퍼에서 다 prop으로 받으면 래퍼가 너무 비대해져요.
그래서 `gridOptions` 하나로 묶어서 그냥 통째로 넘기는 방식을 택했어요.
AG Grid 공식 문서에 있는 옵션이면 뭐든 그대로 쓸 수 있어서 편하더라고요.

---

## 1. ClientSideGrid

### 이럴 때 쓰세요

- 데이터가 많지 않을 때 (수백 ~ 수천 건 정도)
- 프론트에서 정렬이나 필터 처리해도 괜찮을 때
- API 한 번 호출로 전체 데이터를 가져올 때

### 구현 코드

```jsx
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

  // v33부터 columnApi가 사라지고 gridApi로 통합됐어요
  useImperativeHandle(ref, () => ({
    api: gridRef.current?.api,
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

### 이렇게 사용해요

```jsx
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

`gridOptions`에 뭐든 넣으면 그대로 AG Grid로 전달돼요.
공식 문서 보면서 필요한 옵션 바로 갖다 쓰면 되니까 되게 편해요.

---

## 2. ServerSideGrid

### 이럴 때 쓰세요

- 데이터가 진짜 많을 때 (수만 건 이상)
- 정렬이나 필터를 서버에서 처리해야 할 때
- 페이지네이션이 서버 기반일 때

### 개념 먼저 잡고 가요

> **"그리드가 필요한 만큼만 서버에서 가져온다"**

ClientSide는 데이터를 한 번에 다 받아오는 반면,
ServerSide는 스크롤할 때마다 서버에 요청해요.

```
스크롤 ↓
→ getRows 호출
→ 서버 요청
→ 데이터 반환
```

대용량 데이터에서 성능이 훨씬 좋아서, 리스트나 검색 화면엔 이걸 쓰는 게 나아요.

### 모듈 등록 먼저 해야 해요 (필수!)

ServerSideRowModel은 Enterprise 기능이라서, 앱 시작점에서 한 번 등록해줘야 해요.
안 하면 `missing module serverSideRowModel` 에러가 뜨거든요. 저도 이거 때문에 한참 헤맸어요 😂

```js
// main.jsx 또는 App.jsx 최상단
import "ag-grid-enterprise";
```

번들 크기가 신경 쓰이면 이렇게 필요한 것만 골라서 등록할 수도 있어요.

```js
import { ModuleRegistry, ServerSideRowModelModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([ServerSideRowModelModule]);
```

### 구현 코드

```jsx
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

  // v33부터 columnApi가 사라지고 gridApi로 통합됐어요
  useImperativeHandle(ref, () => ({
    api: gridRef.current?.api,
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

### 이렇게 사용해요

```jsx
// datasource는 useMemo 필수예요! 밑에서 설명할게요
const datasource = useMemo(() => ({
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
}), []);

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

### 서버에서 이걸 처리해줘야 해요

그리드가 `getRows`를 호출할 때 `params.request`로 이런 정보를 넘겨줘요.

```json
{
  "startRow": 0,
  "endRow": 50,
  "sortModel": [{ "colId": "price", "sort": "asc" }],
  "filterModel": {}
}
```

서버에서는 이걸 받아서:
- `startRow` ~ `endRow` 범위만큼 잘라서 반환
- `sortModel`대로 정렬
- `filterModel`대로 필터
- `rowData`랑 `totalCount` 같이 보내주면 돼요

---

## ServerSideGrid 쓸 때 꼭 챙겨야 하는 것들

### 1. getRowId는 무조건 넣어요

```js
getRowId: (params) => String(params.data.id)
```

이거 없으면 행 선택이 유지가 안 되거나 리렌더 때 이상하게 동작하는 경우가 생겨요.
처음부터 넣는 습관을 들이는 게 나아요.

### 2. datasource는 useMemo로 감싸야 해요

```js
const datasource = useMemo(() => ({ getRows: ... }), []);
```

`useMemo` 안 쓰면 컴포넌트가 리렌더될 때마다 datasource 객체가 새로 만들어지고,
그걸 AG Grid가 감지해서 데이터를 처음부터 다시 불러와요.
화면이 깜빡깜빡하는 이슈가 생기니까 꼭 써주세요.

### 3. 정렬은 서버에서 처리해야 해요

클라이언트에서 정렬하면 현재 로딩된 데이터만 정렬돼요.
전체 데이터 기준으로 정렬하려면 서버에서 처리해야 해요.

### 4. ref로 API 쓸 때 이렇게 해요 (v33 기준)

```jsx
const gridRef = useRef(null);

// v33 — columnApi 없어졌고, gridApi 하나로 다 돼요
gridRef.current?.api.setGridOption('columnDefs', newCols);
gridRef.current?.api.refreshServerSide({ purge: true });
```

---

## Client vs Server 한눈에 비교

| 항목 | Client | Server |
|------|--------|--------|
| 데이터 위치 | 브라우저 | 서버 |
| 성능 | 적은 데이터에 적합 | 대용량에 최적 |
| 정렬/필터 | 클라이언트에서 처리 | 서버에서 처리 |
| 구현 난이도 | 쉬움 | 중간 |
| 추천 상황 | 관리 화면, 설정 페이지 | 검색 화면, 대용량 리스트 |

---

## v33에서 달라진 점 (v21이랑 비교)

| 항목 | v21 | v33 |
|------|-----|-----|
| Column API | `columnApi` 별도 존재 | `gridApi`로 통합 |
| setter 함수 | `api.setColumnDefs()` | `api.setGridOption('columnDefs')` |
| Row ID | `getNodeId` | `getRowId` |
| 모듈 등록 | 자동 | `import 'ag-grid-enterprise'` 필요 |

v21에서 올라오는 거라면 이 네 가지가 제일 많이 걸려요.

---

## 마무리

이 구조 핵심은 결국 이거예요.

> **"AG Grid 기능은 전부 gridOptions로 위임"**

래퍼는 최대한 단순하게 유지하고, 각 화면에서 필요한 옵션만 넘기는 방식이에요.
AG Grid 공식 문서를 그대로 참고할 수 있어서 러닝커브도 낮고,
나중에 래퍼 수정할 일도 거의 없어서 유지보수가 진짜 편해요.

**한 줄 요약:**

> "래퍼는 최소, 나머지는 gridOptions"

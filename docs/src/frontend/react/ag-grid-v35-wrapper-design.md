---
category: React
title: AG Grid 공통 래퍼 설계 (Client / Server)
description: AG Grid v35 기준으로 실무에서 쓰는 공통 래퍼 설계 방법. AgGridProvider로 모듈과 라이선스를 주입하고, ClientSideGrid와 ServerSideGrid를 분리하는 구조를 설명합니다.
date: 2026-05-05
tags: [React, AG Grid]
platform: AG Grid v35
readingTime: 10
---

# AG Grid 공통 래퍼 설계 (Client / Server)

> 📎 참고 문서
> - [React 모듈 등록](https://www.ag-grid.com/react-data-grid/modules/)
> - [라이선스 키 설치](https://www.ag-grid.com/react-data-grid/license-install/)
> - [SSRM Datasource](https://www.ag-grid.com/react-data-grid/server-side-model-datasource/)

---

## 설계 방향

- **`AgGridProvider`를 앱 최상단에 한 번만** — 모듈 등록, 라이선스 주입 여기서 끝
- **래퍼는 최소한만** — 공통 스타일, ref, defaultColDef 정도만 담당
- **나머지는 `gridOptions`로 위임** — AG Grid 옵션은 각 화면에서 직접 제어
- **Client / Server는 역할이 달라서 분리** — 섞으면 관리가 안 됨

---

## 0. 앱 최상단 — AgGridProvider

모듈 등록과 라이선스 주입을 `AgGridProvider` 하나로 처리해요.

```tsx
// main.tsx 또는 App.tsx
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ServerSideRowModelModule,
  ClientSideRowModelModule,
} from "ag-grid-enterprise";
import { ValidationModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";

const modules = [
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  ServerSideRowModelModule,
  ClientSideRowModelModule,
  // 개발 환경에서만 유효성 검사 활성화
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
];

function App() {
  return (
    <AgGridProvider
      modules={modules}
      licenseKey={import.meta.env.VITE_AG_GRID_LICENSE_KEY}
    >
      {/* 나머지 앱 전체 */}
    </AgGridProvider>
  );
}
```

라이선스 키는 환경변수로 관리하세요. 코드에 하드코딩하면 Git에 올라가요.

```
# .env
VITE_AG_GRID_LICENSE_KEY=your_license_key_here
```

---

## 1. ClientSideGrid

### 이럴 때 쓰세요

- 데이터가 많지 않을 때 (수백 ~ 수천 건)
- 프론트에서 정렬·필터 처리해도 괜찮을 때
- API 한 번 호출로 전체 데이터를 받아올 때

### 구현 코드

```tsx
// components/grid/ClientSideGrid.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import type { GridApi, ColDef, GridOptions } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export interface ClientSideGridHandle {
  api: GridApi | null;
}

interface ClientSideGridProps<TData = any> {
  rowData?: TData[];
  columnDefs?: ColDef<TData>[];
  defaultColDef?: ColDef<TData>;
  theme?: string;
  width?: string;
  height?: string;
  gridOptions?: GridOptions<TData>;
}

const ClientSideGrid = forwardRef<ClientSideGridHandle, ClientSideGridProps>(
  (props, ref) => {
    const {
      rowData = [],
      columnDefs = [],
      defaultColDef,
      theme = "ag-theme-quartz",
      width = "100%",
      height = "100%",
      gridOptions = {},
    } = props;

    const gridRef = useRef<AgGridReact>(null);

    useImperativeHandle(ref, () => ({
      get api() {
        return gridRef.current?.api ?? null;
      },
    }));

    const containerStyle = useMemo(() => ({ width, height }), [width, height]);

    const mergedDefaultColDef = useMemo<ColDef>(
      () => ({ flex: 1, minWidth: 100, ...defaultColDef }),
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
  }
);

ClientSideGrid.displayName = "ClientSideGrid";
export default React.memo(ClientSideGrid);
```

### 사용 예시

```tsx
const gridOptions: GridOptions = {
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

---

## 2. ServerSideGrid

### 이럴 때 쓰세요

- 데이터가 진짜 많을 때 (수만 건 이상)
- 정렬·필터를 서버에서 처리해야 할 때
- 페이지네이션이 서버 기반일 때

### 핵심 패턴 — onGridReady에서 datasource 등록

공식 예제 방식을 따라요.
`onGridReady` 콜백 안에서 `params.api.setGridOption("serverSideDatasource", datasource)`로 등록하는 게 권장 패턴이에요.

```
그리드 마운트
→ onGridReady 호출
→ params.api.setGridOption("serverSideDatasource", datasource) 등록
→ 그리드가 getRows 호출
→ 서버 요청
→ params.success({ rowData, rowCount }) 반환
```

### 구현 코드

```tsx
// components/grid/ServerSideGrid.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
} from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export interface ServerSideGridHandle {
  api: GridApi | null;
}

interface ServerSideGridProps<TData = any> {
  columnDefs?: ColDef<TData>[];
  defaultColDef?: ColDef<TData>;
  theme?: string;
  width?: string;
  height?: string;
  /** onGridReady에서 datasource를 만들어 params.api로 등록하는 콜백 */
  onGridReady: (params: GridReadyEvent) => void;
  gridOptions?: GridOptions<TData>;
}

const ServerSideGrid = forwardRef<ServerSideGridHandle, ServerSideGridProps>(
  (props, ref) => {
    const {
      columnDefs = [],
      defaultColDef,
      theme = "ag-theme-quartz",
      width = "100%",
      height = "100%",
      onGridReady,
      gridOptions = {},
    } = props;

    const gridRef = useRef<AgGridReact>(null);

    useImperativeHandle(ref, () => ({
      get api() {
        return gridRef.current?.api ?? null;
      },
    }));

    const containerStyle = useMemo(() => ({ width, height }), [width, height]);

    const mergedDefaultColDef = useMemo<ColDef>(
      () => ({ flex: 1, minWidth: 100, sortable: false, ...defaultColDef }),
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
            onGridReady={onGridReady}
            {...gridOptions}
          />
        </div>
      </div>
    );
  }
);

ServerSideGrid.displayName = "ServerSideGrid";
export default React.memo(ServerSideGrid);
```

### 사용 예시

```tsx
import { useCallback, useMemo } from "react";
import ServerSideGrid from "@/components/grid/ServerSideGrid";
import type { ColDef, GridOptions, IServerSideDatasource } from "ag-grid-community";

const columns: ColDef[] = [
  { field: "athlete", minWidth: 220 },
  { field: "country", minWidth: 200 },
  { field: "year" },
  { field: "sport", minWidth: 200 },
  { field: "gold" },
  { field: "silver" },
  { field: "bronze" },
];

// datasource 생성 함수 — 래퍼 바깥에서 정의
const createDatasource = (): IServerSideDatasource => ({
  getRows: async (params) => {
    console.log("[Datasource] rows requested:", params.request);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params.request),
      });
      const data = await res.json();
      params.success({ rowData: data.rows, rowCount: data.totalCount });
    } catch {
      params.fail();
    }
  },
});

function ProductListPage() {
  // onGridReady: 그리드 준비되면 datasource 등록
  const onGridReady = useCallback((params) => {
    const datasource = createDatasource();
    params.api.setGridOption("serverSideDatasource", datasource);
  }, []);

  const gridOptions: GridOptions = useMemo(() => ({
    cacheBlockSize: 50,
    rowSelection: { mode: "singleRow" },
    getRowId: (params) => String(params.data.id),
  }), []);

  return (
    <ServerSideGrid
      columnDefs={columns}
      onGridReady={onGridReady}
      height="600px"
      gridOptions={gridOptions}
    />
  );
}
```

---

### 서버 요청/응답 형태

`getRows` 호출 시 `params.request`로 넘어오는 값이에요.

```json
{
  "startRow": 0,
  "endRow": 50,
  "sortModel": [{ "colId": "price", "sort": "asc" }],
  "filterModel": {}
}
```

서버 응답은 이 형태로 맞춰주면 돼요.

```json
{ "rows": [...], "totalCount": 1234 }
```

### ref로 API 접근

```tsx
const gridRef = useRef<ServerSideGridHandle>(null);

// 데이터 새로고침 (purge: true = 캐시 초기화)
gridRef.current?.api?.refreshServerSide({ purge: true });

// 컬럼 변경
gridRef.current?.api?.setGridOption("columnDefs", newCols);
```

---

## 파일 구조

```
src/
├── main.tsx                        # AgGridProvider 설치
├── components/
│   └── grid/
│       ├── ClientSideGrid.tsx
│       └── ServerSideGrid.tsx
└── pages/
    ├── ProductListPage.tsx         # ServerSideGrid 사용
    └── SettingsPage.tsx            # ClientSideGrid 사용
```

---

## Client vs Server 한눈에 비교

| 항목 | Client | Server |
|------|--------|--------|
| 데이터 위치 | 브라우저 | 서버 |
| 성능 | 적은 데이터에 적합 | 대용량에 최적 |
| 정렬·필터 | 클라이언트에서 처리 | 서버에서 처리 |
| datasource 등록 | 불필요 | onGridReady에서 등록 |
| 구현 난이도 | 쉬움 | 중간 |
| 추천 상황 | 관리 화면, 설정 페이지 | 검색 화면, 대용량 리스트 |

---

## 한 줄 요약

> "Provider로 주입, 래퍼는 최소, datasource는 onGridReady에서"

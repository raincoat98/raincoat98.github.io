---
title: AG Grid v21 → v33 마이그레이션 완전 정리
description: AG Grid v21에서 v33 마이그레이션 시 필수로 처리해야 할 변경사항. rowSelection, cellRendererFramework, CSS 경로, SSRM 모듈 설정, setGridOption API 통합까지 실무 기준 완전 정리.
date: 2026-03-24
---

# AG Grid v21 → v33 마이그레이션 완전 정리

AG Grid v21에서 v33으로 마이그레이션 시 가장 크게 바뀐 것은 다음 5가지다.

1. Renderer
2. rowSelection
3. CSS
4. Module 구조
5. API 통합 (setGridOption)

---

## 1. rowSelection 방식 변경 (필수)

```jsx
// v21
rowSelection="single"
rowSelection="multiple"

// v33
rowSelection={{ mode: 'singleRow' }}
rowSelection={{ mode: 'multiRow' }}
```

문자열에서 객체 형태로 바뀌었다. 특히 `single` → `singleRow`, `multiple` → `multiRow`로 값도 달라졌으니 주의.

---

## 2. React Renderer API 변경 (필수)

```jsx
// v21
cellRendererFramework
headerComponentFramework

// v33
cellRenderer
headerComponent
```

`Framework` 접미사가 제거되었다. v33부터는 React 컴포넌트를 직접 넣으면 된다.

---

## 3. frameworkComponents 제거

```jsx
// v21
frameworkComponents={{ MyRenderer }}

// v33 — frameworkComponents 없음, 직접 사용
columnDefs={[
  {
    cellRenderer: MyRenderer,
  }
]}
```

`frameworkComponents`로 등록하는 방식 자체가 사라졌다. `cellRenderer`에 컴포넌트를 직접 넣어라.

---

## 4. CSS 경로 변경

```js
// v21
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

// v33
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
```

`dist/styles` → `styles`로 경로가 바뀌었다.

---

## 5. 테마 시스템 변경

v33에서 새로운 테마 방식이 도입되었다.

```jsx
// v33 신규 방식
import { themeBalham } from 'ag-grid-community';

<AgGridReact theme={themeBalham} />
```

하지만 실무에서는 기존 CSS 클래스 방식도 여전히 지원된다.

```jsx
// legacy 방식 — 여전히 동작
<div className="ag-theme-quartz" style={{ height: 500 }}>
  <AgGridReact ... />
</div>
```

기존 프로젝트라면 CSS 클래스 방식(legacy)을 유지하는 것을 추천한다.

---

## 6. Module 시스템 도입

v33에서 모듈 등록 방식이 생겼다.

### 방식 1 — 모듈 선택 등록

```js
import { ModuleRegistry, AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllEnterpriseModule]);
```

### 방식 2 — 전체 번들 임포트 (추천)

```js
import 'ag-grid-enterprise';
```

번들 크기가 중요하지 않다면 전체 임포트가 훨씬 단순하다.

---

## SSRM 에러 주의

```
missing module serverSideRowModel
```

이 에러의 원인은 대부분 모듈 등록 누락이다.

```js
// 해결 방법
import 'ag-grid-enterprise';
```

또는 개별 모듈 등록:

```js
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);
```

---

## 7. 패키지 구조 변경

```
// v21
@ag-grid-community/*
@ag-grid-enterprise/*

// v33
ag-grid-community
ag-grid-enterprise
```

스코프 패키지(`@ag-grid-community/core` 등)가 단일 패키지로 통합되었다.

---

## 8. 기본 테마 자동 적용

- v21 → 테마 미설정 시 스타일 깨짐
- v33 → 기본 테마 자동 적용

---

## 9. CSS 변수 변경

`--ag-*` 계열 CSS 변수 일부가 변경되었다. 커스텀 스타일이 깨지는 경우 변수명을 확인해라.

---

## 10. Row ID 변경 (필수)

```js
// v21
getNodeId: (data) => data.id

// v33
getRowId: (params) => params.data.id
```

- 함수명 변경: `getNodeId` → `getRowId`
- 파라미터 구조 변경: `data` → `params.data`

SSRM, row 선택 유지, delta update에 영향을 미친다.

---

## 11. Grid 옵션 변경 API 통합 (핵심)

v21에서는 옵션마다 별도 setter 함수가 존재했다.

```js
// v21
api.setColumnDefs(colDefs);
api.setRowData(rowData);
api.setQuickFilter('abc');
api.paginationSetPageSize(50);
```

v33에서는 `setGridOption` 하나로 통합되었다.

```js
// v33
api.setGridOption('columnDefs', colDefs);
api.setGridOption('rowData', rowData);
api.setGridOption('quickFilterText', 'abc');
api.setGridOption('paginationPageSize', 50);
```

여러 옵션을 동시에 바꿀 때는 `updateGridOptions`를 사용한다.

```js
api.updateGridOptions({
  columnDefs,
  rowData,
  paginationPageSize: 50,
});
```

---

## 주요 함수 매핑표

| v21 | v33 |
|-----|-----|
| `getNodeId` | `getRowId` |
| `setColumnDefs` | `setGridOption('columnDefs')` |
| `setRowData` | `setGridOption('rowData')` |
| `setQuickFilter` | `setGridOption('quickFilterText')` |
| `setPinnedTopRowData` | `setGridOption('pinnedTopRowData')` |
| `setPinnedBottomRowData` | `setGridOption('pinnedBottomRowData')` |
| `setServerSideDatasource` | `setGridOption('serverSideDatasource')` |
| `paginationSetPageSize` | `setGridOption('paginationPageSize')` |
| `setDomLayout` | `setGridOption('domLayout')` |
| `setSideBar` | `setGridOption('sideBar')` |

---

## 12. Column API 변화

```js
// v21
columnApi.xxx

// v33
gridApi.xxx
```

Column API는 점점 제거되는 방향으로 가고, Grid API 중심으로 통합되고 있다.

---

## 13. Grid 생성 방식 변경 (JS)

```js
// v21
new agGrid.Grid(...)

// v33
agGrid.createGrid(...)
```

React는 `AgGridReact` 컴포넌트를 그대로 쓰기 때문에 영향 거의 없다.

---

## 반드시 수정해야 하는 TOP 10

1. `rowSelection` 문자열 → 객체
2. `cellRendererFramework` → `cellRenderer`
3. `headerComponentFramework` → `headerComponent`
4. CSS 경로 변경 (`dist/styles` → `styles`)
5. SSRM 모듈 등록 확인
6. `getNodeId` → `getRowId`
7. `setColumnDefs` → `setGridOption`
8. `setRowData` → `setGridOption`
9. `setQuickFilter` → `setGridOption`
10. `paginationSetPageSize` → `setGridOption`

---

## 그대로 사용 가능한 것

- `columnDefs` 구조
- `onGridReady`
- `gridApi.getRowNode()`
- `gridApi.refreshServerSide()`
- SSRM datasource 내부 로직
- pagination

---

## 마이그레이션 순서 추천

1. 패키지 업그레이드 (`ag-grid-community`, `ag-grid-enterprise`)
2. CSS 경로 수정
3. renderer 변경 (`Framework` 접미사 제거)
4. `rowSelection` 변경
5. SSRM 모듈 확인 및 등록
6. `getNodeId` → `getRowId` 변경
7. setter 함수 → `setGridOption` 변경

---

## 한 줄 정리

> React 기준 → renderer + rowSelection + CSS + SSRM + setGridOption만 잡으면 끝

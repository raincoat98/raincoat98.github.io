---
category: React
title: AG Grid v21 → v35 마이그레이션
description: AG Grid v21에서 v35 마이그레이션 시 필수로 처리해야 할 변경사항. rowSelection, cellRendererFramework, CSS 경로, Module 등록, setGridOption API 통합까지 실무 기준 완전 정리.
date: 2026-05-05
tags: [React, AG Grid, 마이그레이션]
platform: AG Grid v35
readingTime: 7
---

# AG Grid v21 → v35 마이그레이션

> React 기준 — renderer + rowSelection + CSS + Module + setGridOption만 잡으면 끝

---

## 참고 문서

| 항목 | 링크 |
|---|---|
| 라이선스 키 등록 (React) | [ag-grid.com/react-data-grid/license-install](https://www.ag-grid.com/react-data-grid/license-install/) |
| Community vs Enterprise | [ag-grid.com/.../community-vs-enterprise](https://www.ag-grid.com/javascript-data-grid/community-vs-enterprise/) |
| React 모듈 등록 (AgGridProvider) | [ag-grid.com/react-data-grid/modules](https://www.ag-grid.com/react-data-grid/modules/) |
| v33 업그레이드 가이드 | [ag-grid.com/.../upgrading-to-ag-grid-33](https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-33/) |
| 라이선스 구매/트라이얼 | [ag-grid.com/license-pricing](https://www.ag-grid.com/license-pricing/) |

---

## 반드시 수정해야 할 항목

### 1. rowSelection

문자열에서 객체 형태로 변경. 값 이름도 달라진다.

```jsx
// v21
rowSelection="single"
rowSelection="multiple"

// v35
rowSelection={{ mode: 'singleRow' }}
rowSelection={{ mode: 'multiRow' }}
```

---

### 2. Renderer API

`Framework` 접미사가 완전히 제거되었다. React 컴포넌트를 직접 넣으면 된다.

```jsx
// v21
cellRendererFramework={MyComp}
headerComponentFramework={MyHead}
frameworkComponents={{ MyComp }}

// v35
cellRenderer={MyComp}
headerComponent={MyHead}
// frameworkComponents 제거됨 — columnDefs에 직접 명시
```

---

### 3. CSS 경로

```js
// v21
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

// v35
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
```

기존 CSS 클래스 방식(legacy)은 v35에서도 그대로 동작한다.

```jsx
<div className="ag-theme-quartz" style={{ height: 500 }}>
  <AgGridReact ... />
</div>
```

---

### 4. 라이선스 키 등록 (Enterprise)

> 📎 [공식 문서 — React 라이선스 키 설치](https://www.ag-grid.com/react-data-grid/license-install/)

Enterprise 기능을 프로덕션에서 사용하려면 라이선스 키를 등록해야 한다. 미등록 시 워터마크와 콘솔 에러가 발생한다.

```js
import { LicenseManager } from 'ag-grid-enterprise';

LicenseManager.setLicenseKey('YOUR_LICENSE_KEY_HERE');
```

앱 진입점(`main.tsx` 또는 `index.tsx`)에서 그리드 초기화 전에 반드시 호출해야 한다.

> 로컬 개발/테스트 환경에서는 라이선스 키 없이도 동작하지만 워터마크가 표시된다. 30일 무료 트라이얼은 [여기서](https://www.ag-grid.com/license-pricing/) 신청할 수 있다.

---

### 5. Module 등록 + AgGridProvider

> 📎 [공식 문서 — React 모듈 등록](https://www.ag-grid.com/react-data-grid/modules/)

v33부터 명시적 등록이 필요하고, **v35.1부터 `AgGridProvider`를 사용하는 방식이 공식 권장**이다.

**방식 1 — AgGridProvider (v35.1+ 권장)**

```jsx
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

const modules = [AllEnterpriseModule];

function App() {
  return (
    <AgGridProvider modules={modules}>
      <AgGridReact /* ...props */ />
    </AgGridProvider>
  );
}
```

**방식 2 — 전역 등록 (ModuleRegistry)**

```js
import { ModuleRegistry, AllEnterpriseModule } from 'ag-grid-enterprise';

// 그리드 초기화 전에 호출
ModuleRegistry.registerModules([AllEnterpriseModule]);
```

**SSRM만 필요한 경우**

```js
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);
```

> `missing module serverSideRowModel` 에러는 대부분 이 등록 누락이 원인이다.

---

### 6. Row ID

함수명과 파라미터 구조 모두 변경되었다.

```js
// v21
getNodeId: (data) => data.id

// v35
getRowId: (params) => params.data.id
```

SSRM, row 선택 유지, delta update에 영향을 미치므로 반드시 확인한다.

---

### 7. Grid 옵션 변경 API 통합

v21에서 옵션마다 존재하던 개별 setter가 `setGridOption` 하나로 통합되었다.

```js
// v21
api.setColumnDefs(colDefs);
api.setRowData(rowData);
api.setQuickFilter('abc');
api.paginationSetPageSize(50);
api.setServerSideDatasource(ds);

// v35
api.setGridOption('columnDefs', colDefs);
api.setGridOption('rowData', rowData);
api.setGridOption('quickFilterText', 'abc');   // 키 이름도 변경됨
api.setGridOption('paginationPageSize', 50);
api.setGridOption('serverSideDatasource', ds);

// 여러 옵션 동시 변경
api.updateGridOptions({ columnDefs, rowData, paginationPageSize: 50 });
```

---

## API 매핑표

| v21 (deprecated) | v35 | 비고 |
|---|---|---|
| `getNodeId` | `getRowId` | 파라미터 구조도 변경 |
| `setColumnDefs` | `setGridOption('columnDefs')` | |
| `setRowData` | `setGridOption('rowData')` | |
| `setQuickFilter` | `setGridOption('quickFilterText')` | 키 이름도 변경 |
| `paginationSetPageSize` | `setGridOption('paginationPageSize')` | |
| `setServerSideDatasource` | `setGridOption('serverSideDatasource')` | SSRM |
| `setPinnedTopRowData` | `setGridOption('pinnedTopRowData')` | |
| `setPinnedBottomRowData` | `setGridOption('pinnedBottomRowData')` | |
| `setDomLayout` | `setGridOption('domLayout')` | |
| `setSideBar` | `setGridOption('sideBar')` | |
| `columnApi.xxx` | `gridApi.xxx` | Column API 통합 |

---

## 마이그레이션 순서

1. 패키지 업그레이드 — `ag-grid-community`, `ag-grid-enterprise` → v35
2. CSS 경로 수정 — `dist/styles` → `styles`, 테마명 확인
3. **라이선스 키 등록** — `LicenseManager.setLicenseKey(...)` (진입점 최상단)
4. Module 등록 — `AgGridProvider` 또는 `ModuleRegistry.registerModules([AllEnterpriseModule])`
5. Renderer 변경 — `cellRendererFramework` → `cellRenderer`
6. `rowSelection` 변경 — 문자열 → 객체
7. `getNodeId` → `getRowId` — 파라미터 구조도 같이 변경
8. setter → `setGridOption` — 매핑표 참고해서 전체 교체

---

## 그대로 사용 가능한 것

- `columnDefs` 구조
- `onGridReady`
- `gridApi.getRowNode()`
- `gridApi.refreshServerSide()`
- SSRM datasource 내부 로직
- pagination
- CSS 클래스 방식 테마 (`ag-theme-quartz`)

---

## 주의사항

- `rowSelection` 문자열 방식은 v33부터 deprecated, v35에서 완전 제거
- `columnApi`는 v31부터 deprecated, v33 이후 완전 제거 — `gridApi`로 통합
- `setQuickFilter` → `setGridOption('quickFilterText')`처럼 **키 이름 자체가 바뀌는 케이스**에 주의
- 신규 테마 API(`import { themeBalham } from 'ag-grid-community'`)도 지원되지만, 기존 프로젝트라면 CSS 클래스 방식 유지 권장
- **v35.1부터 `AgGridProvider` 방식이 공식 권장** — `ModuleRegistry` 전역 등록 방식도 여전히 동작하지만, 새 프로젝트라면 Provider 방식으로 작성할 것
- 라이선스 키는 환경 변수(`VITE_AG_GRID_LICENSE_KEY`)로 관리하고 코드에 하드코딩하지 말 것

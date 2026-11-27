---
categories: [React]
title: AG Grid 상세 Drawer를 URL로 복원하기
description: React Router로 상품 ID와 페이지 번호를 URL에 저장하고, 새로고침이나 뒤로 가기 후 Ant Design Drawer와 AG Grid 선택 행을 복원합니다.
created: 2026-02-13
tags: [React|blue, AG Grid|blue, Drawer|teal, URL 상태|teal, React Router|teal]
platform: AG Grid v33+
readingTime: 5
---

# AG Grid 상세 Drawer를 URL로 복원하기

상품 목록의 2페이지에서 상세 패널을 열었다면, 새로고침해도 같은 상품과 목록 페이지가 보이도록 만들 수 있습니다. URL에 상품 ID와 페이지 번호를 저장하고, 그 값을 기준으로 Ant Design Drawer와 AG Grid를 갱신합니다.

## URL에 상품 ID와 페이지 번호 저장하기

`/products?page=2&id=p4`는 목록의 2페이지에서 `p4` 상품을 연 상태입니다. `id`가 없거나 해당 상품을 찾을 수 없으면 Drawer를 닫습니다. 열림 여부는 상품 ID로 판단할 수 있으므로 `detail=true`는 따로 저장하지 않습니다.

React Router의 `useSearchParams`로 주소를 읽습니다. Drawer를 닫을 때는 `id`만 지워 현재 페이지를 유지합니다. 상품을 열 때는 방문 기록을 추가하므로 브라우저에서 뒤로 가기를 하면 열기 전 주소로 돌아갑니다.

## AG Grid 선택 행과 스크롤 복원하기

`getRowId`가 상품 ID를 문자열로 반환하면 `getRowNode(id)`로 해당 행을 찾을 수 있습니다. 첫 데이터 렌더링이 끝난 뒤 `paginationGoToPage()`로 페이지를 맞추고, 행을 선택한 다음 `ensureNodeVisible()`로 스크롤합니다. URL은 1페이지부터 세지만, AG Grid의 페이지 인덱스는 0부터 시작합니다.

예제는 React Router 6의 `BrowserRouter` 안에서 실행합니다. AG Grid v33 이상과 Ant Design 5를 사용하며, 별도 API 없이 확인할 수 있도록 상품을 코드에 정의합니다.

```jsx
import { useEffect, useState } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Button, Drawer } from 'antd';
import { useSearchParams } from 'react-router-dom';

ModuleRegistry.registerModules([AllCommunityModule]);

const products = [
  { id: 'p1', name: '키보드', price: 69000 },
  { id: 'p2', name: '마우스', price: 29000 },
  { id: 'p3', name: '모니터', price: 249000 },
  { id: 'p4', name: '헤드폰', price: 89000 },
  { id: 'p5', name: '웹캠', price: 49000 },
  { id: 'p6', name: '마이크', price: 59000 },
];
const pageSize = 3;
const pageCount = Math.ceil(products.length / pageSize);
const columnDefs = [
  { field: 'name', headerName: '상품명', sortable: false },
  { field: 'price', headerName: '가격', sortable: false },
];
const rowSelection = { mode: 'singleRow', checkboxes: false };
const getRowId = ({ data }) => data.id;

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [api, setApi] = useState(null);
  const requestedPage = Number(params.get('page') ?? 1);
  const page = Number.isSafeInteger(requestedPage)
    ? Math.min(Math.max(1, requestedPage), pageCount)
    : 1;
  const product = products.find(({ id }) => id === params.get('id'));
  const selectedId = product?.id;
  const productIndex = product ? products.indexOf(product) : -1;
  const isOnPage = Math.floor(productIndex / pageSize) === page - 1;

  function updateUrl(nextPage, id) {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    if (id) next.set('id', id);
    else next.delete('id');
    setParams(next);
  }

  useEffect(() => {
    if (!api) return;

    api.paginationGoToPage(page - 1);
    const node = selectedId && isOnPage ? api.getRowNode(selectedId) : undefined;
    if (node) {
      node.setSelected(true);
      api.ensureNodeVisible(node, 'middle');
    } else {
      api.deselectAll();
    }
  }, [api, page, selectedId, isOnPage]);

  return (
    <>
      <div style={{ height: 220 }}>
        <AgGridReact
          rowData={products}
          columnDefs={columnDefs}
          rowSelection={rowSelection}
          getRowId={getRowId}
          pagination
          paginationPageSize={pageSize}
          suppressPaginationPanel
          onFirstDataRendered={({ api }) => setApi(api)}
          onRowClicked={({ data }) => {
            if (data) updateUrl(page, data.id);
          }}
        />
      </div>
      <Button disabled={page === 1} onClick={() => updateUrl(page - 1)}>
        이전
      </Button>
      <span> {page} / {pageCount} </span>
      <Button disabled={page === pageCount} onClick={() => updateUrl(page + 1)}>
        다음
      </Button>
      <Drawer
        title={product?.name ?? '상품 상세'}
        open={Boolean(product)}
        onClose={() => updateUrl(page)}
      >
        {product && <p>가격: {product.price.toLocaleString('ko-KR')}원</p>}
      </Drawer>
    </>
  );
}
```

페이지 이동 버튼은 URL을 먼저 갱신합니다. 그리드의 기본 페이지 버튼을 숨기는 이유는 현재 페이지를 URL과 그리드에서 따로 관리하지 않기 위해서입니다. 주소의 상품이 현재 페이지에 없으면 상세 내용만 열고 행은 선택하지 않습니다.

목록을 API에서 가져오는 경우에는 행 데이터가 그리드에 반영된 뒤에 선택과 스크롤을 적용합니다. `onFirstDataRendered`는 최초 렌더링에만 호출되므로, 이후에도 행 데이터를 교체한다면 `onRowDataUpdated`에서 같은 동작을 적용합니다. 서버 페이지네이션을 사용한다면 URL에 적힌 페이지의 데이터를 먼저 요청해야 합니다.

공식 문서: [React Router useSearchParams](https://reactrouter.com/6.30.1/hooks/use-search-params), [AG Grid 행 ID](https://www.ag-grid.com/react-data-grid/row-ids/), [AG Grid 페이지네이션](https://www.ag-grid.com/react-data-grid/row-pagination/), [Ant Design Drawer](https://ant.design/components/drawer/)

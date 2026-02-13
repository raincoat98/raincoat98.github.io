# React + AG Grid + Drawer + URL 상태동기화 구현기

AG Grid로 목록을 만들다가 "상세보기 Drawer + URL 유지 + 새로고침 복원" 패턴이 필요해서 구현해봤다.
실무에서도 자주 쓰는 구조라 기록 겸 정리한다.

## 구현 목표

1. AG Grid로 상품 목록 표시
2. "상세보기" 클릭 시 Drawer 오픈
3. URL에 상태 저장 → 새로고침해도 동일 상태 복원
4. Drawer 열려 있으면 해당 Row 자동 선택 + 스크롤 이동

---

## 전체 코드

### 1. ProductList.js (AG Grid)

```javascript
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { fetchProducts } from '@/api/productApi';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

ModuleRegistry.registerModules([AllCommunityModule]);

function ProductList({ onOpenDrawer, onProductsLoaded, currentPage = 1, selectedProductId = null }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState(null);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      onProductsLoaded && onProductsLoaded(data);
      setLoading(false);
    });
  }, [onProductsLoaded]);

  useEffect(() => {
    if (gridApi && selectedProductId) {
      const rowNode = gridApi.getRowNode(String(selectedProductId));
      if (rowNode) {
        rowNode.setSelected(true);
        gridApi.ensureNodeVisible(rowNode, 'middle');
      }
    }
  }, [gridApi, selectedProductId]);

  const handleOpenDrawer = useCallback((product) => {
    onOpenDrawer && onOpenDrawer(product, currentPage);
  }, [onOpenDrawer, currentPage]);

  const columnDefs = useMemo(() => [
    {
      field: 'id',
      headerName: '상세',
      width: 80,
      suppressRowClickSelection: true,
      cellRenderer: (params) => (
        <Button
          type="link"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDrawer(params.data);
          }}
        >
          상세보기
        </Button>
      ),
    },
    { field: 'name', headerName: '상품명', width: 150, sortable: true, filter: true },
    { field: 'description', headerName: '설명', width: 200, sortable: true, filter: true },
    {
      field: 'price',
      headerName: '가격',
      width: 120,
      cellRenderer: (p) => `₩${p.value.toLocaleString()}`,
    },
    {
      field: 'stock',
      headerName: '재고',
      width: 100,
      cellRenderer: (p) => (
        <span style={{ color: p.value < 20 ? '#ff4d4f' : '#52c41a' }}>
          {p.value}
        </span>
      ),
    },
    { field: 'category', headerName: '카테고리', width: 120 },
  ], [handleOpenDrawer]);

  const onGridReady = (params) => {
    setGridApi(params.api);

    if (selectedProductId) {
      const rowNode = params.api.getRowNode(String(selectedProductId));
      if (rowNode) {
        rowNode.setSelected(true);
        params.api.ensureNodeVisible(rowNode, 'middle');
      }
    }
  };

  return (
    <div style={{ height: 500 }}>
      <div className="ag-theme-balham" style={{ height: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={products}
          rowSelection="single"
          pagination
          paginationPageSize={5}
          onGridReady={onGridReady}
          getRowId={(p) => String(p.data.id)}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default ProductList;
```

### 2. ProductDetailDrawer.js

```javascript
import React from 'react';
import { Drawer, Divider, Tag } from 'antd';

function ProductDetailDrawer({ product, visible, onClose }) {
  return (
    <Drawer
      title={product ? `상품 상세 정보 - ${product.name}` : '상품 상세 정보'}
      placement="right"
      onClose={onClose}
      visible={visible}
      width={400}
    >
      {product && (
        <>
          <p><b>ID:</b> {product.id}</p>
          <Divider />
          <p><b>상품명:</b> {product.name}</p>
          <Divider />
          <p><b>설명:</b> {product.description}</p>
          <Divider />
          <p><b>가격:</b> <Tag color="blue">₩{product.price.toLocaleString()}</Tag></p>
          <Divider />
          <p><b>재고:</b> <Tag color={product.stock < 20 ? 'red' : 'green'}>{product.stock}</Tag></p>
          <Divider />
          <p><b>카테고리:</b> <Tag>{product.category}</Tag></p>
        </>
      )}
    </Drawer>
  );
}

export default ProductDetailDrawer;
```

### 3. ProductsApp.js

```javascript
import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { withRouter } from 'react-router-dom';
import ProductList from './ProductList';
import ProductDetailDrawer from './ProductDetailDrawer';

function ProductsApp({ location, history }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = parseInt(params.get('id'));
    const page = parseInt(params.get('page')) || 1;
    const detail = params.get('detail') === 'true';

    setCurrentPage(page);

    if (detail && productId) {
      setDrawerVisible(true);

      if (allProducts.length > 0) {
        const product = allProducts.find(p => p.id === productId);
        if (product) setDrawerProduct(product);
      }
    }
  }, [location.search, allProducts]);

  const handleOpenDrawer = (product, page = currentPage) => {
    setDrawerProduct(product);
    setDrawerVisible(true);

    const params = new URLSearchParams();
    params.set('id', product.id);
    params.set('page', page);
    params.set('detail', 'true');
    history.push(`${location.pathname}?${params.toString()}`);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setDrawerProduct(null);
    history.push(location.pathname);
  };

  return (
    <div>
      <Card title="상품 목록">
        <ProductList
          onOpenDrawer={handleOpenDrawer}
          onProductsLoaded={setAllProducts}
          currentPage={currentPage}
          selectedProductId={drawerProduct?.id || null}
        />
      </Card>

      <ProductDetailDrawer
        product={drawerProduct}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}

export default withRouter(ProductsApp);
```

---

## 구현 포인트 (실무 핵심)

### 1. URL 상태 동기화

Drawer 열면 URL이 다음과 같이 변경됨:
```
?id=3&page=1&detail=true
```

새로고침해도 동일 상태가 복원되기 때문에 사용자 경험이 좋다.

**핵심 로직:**
- `history.push()`로 URL 업데이트
- `location.search`로 URL 감시
- 페이지 로드 시 URLSearchParams 파싱하여 상태 복원

### 2. Row 자동 선택 + 스크롤

```javascript
const rowNode = gridApi.getRowNode(String(selectedProductId));
if (rowNode) {
  rowNode.setSelected(true);
  gridApi.ensureNodeVisible(rowNode, 'middle');
}
```

**주의사항:**
- `getRowId` 반드시 정의해야 함 (row 식별자)
- `ensureNodeVisible(rowNode, 'middle')`로 스크롤 위치 조정
- AG Grid 초기화 후에만 gridApi 사용 가능

### 3. 이벤트 버블링 방지

```javascript
onClick={(e) => {
  e.stopPropagation();
  handleOpenDrawer(params.data);
}}
```

버튼 클릭 시 row click 이벤트가 발생하면 selection이 꼬인다.
`e.stopPropagation()`으로 버블링 방지 필수.

### 4. URL 복원 타이밍

**문제:** 데이터 없을 때 Drawer 먼저 열리면 빈 Drawer 발생

**해결:**
- `allProducts` 로드 후 다시 find하는 구조
- `useEffect` 의존성: `[location.search, allProducts]`
- 두 조건이 모두 충족될 때만 Drawer 오픈

---

## 실무 확장 포인트

- **서버 페이징:** `fetchProductById` API 필요
- **페이지 동기화:** AG Grid pagination ↔ URL 쿼리 동기화
- **상태관리:** Zustand/Redux로 상태 분리
- **라우팅:** Drawer 대신 Modal/Route 컴포넌트로 확장
- **성능:** 대규모 데이터셋은 가상 스크롤(virtualRowHeight) 사용

---

## 다음 주제

이 패턴을 확장한 다음 주제들도 기록할 예정:

- AG Grid 서버사이드 페이징 + Drawer
- Zustand + AG Grid 완전 실무 구조
- URL 기반 상태머신 패턴
- React Router v4 → v6 구조 비교
- 대규모 Grid 성능 최적화

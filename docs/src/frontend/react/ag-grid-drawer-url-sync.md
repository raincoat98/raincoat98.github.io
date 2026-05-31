---
categories: [React]
title: AG Grid Drawer + URL 상태 동기화 — 새로고침 복원 패턴
description: AG Grid 목록에서 상세 Drawer를 열고 URL에 상태를 저장해 새로고침해도 복원되는 패턴. getRowId, ensureNodeVisible, useNavigate와 함께 Row 자동 선택·스크롤까지 정리합니다.
created: 2026-02-13
tags: [React|blue, AG Grid|blue, Drawer|teal, URL 상태|teal, React Router|teal]
platform: AG Grid v33+
readingTime: 7
---

# AG Grid Drawer + URL 상태 동기화

> `useNavigate` · `URLSearchParams` · `getRowId` · `ensureNodeVisible` 한 번에 정리

목록에서 상세보기를 누르면 Drawer가 열리고, URL에 상태가 저장되어 **새로고침해도 동일한 상태가 복원**되는 패턴입니다.

---

## 목차

1. [개요](#_1-개요)
2. [ProductsApp — URL ↔ 상태 동기화](#_2-productsapp)
3. [ProductList — Row 자동 선택 + 스크롤](#_3-productlist)
4. [ProductDetailDrawer — Drawer 구성](#_4-productdetaildrawer)
5. [핵심 포인트 4가지](#_5-핵심-포인트-4가지)

---

## 1. 개요

```
1. 목록에서 "상세보기" 클릭
2. Drawer 오픈 + URL에 ?id=3&page=1&detail=true 저장
3. 새로고침 → URL 파싱 → 데이터 로드 완료 후 Drawer 재오픈
4. 해당 Row 자동 선택 + 화면 중앙으로 스크롤
```

**컴포넌트 구조**

```
ProductsApp              ← URL 읽기·쓰기, 상태 관리
├── ProductList          ← AG Grid, Row 선택·스크롤
└── ProductDetailDrawer  ← Ant Design Drawer
```

**URL 파라미터**

| 파라미터 | 예시 | 역할 |
|---------|------|------|
| `id` | `3` | 선택한 상품 ID |
| `page` | `2` | 현재 페이지 번호 |
| `detail` | `true` | Drawer 오픈 여부 |

---

## 2. ProductsApp

URL을 읽어 Drawer 상태를 복원하고, Drawer를 열고 닫을 때 URL을 갱신합니다.

```jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from 'antd';
import ProductList from './ProductList';
import ProductDetailDrawer from './ProductDetailDrawer';

function ProductsApp() {
  const location = useLocation();
  const navigate = useNavigate();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);

  // URL → 상태 복원
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = parseInt(params.get('id'));
    const page = parseInt(params.get('page')) || 1;
    const detail = params.get('detail') === 'true';

    setCurrentPage(page);

    // allProducts가 채워진 뒤에만 find() 실행
    if (detail && productId && allProducts.length > 0) {
      const product = allProducts.find((p) => p.id === productId);
      if (product) {
        setDrawerProduct(product);
        setDrawerVisible(true);
      }
    }
  }, [location.search, allProducts]);

  // Drawer 열기 → URL 갱신
  const handleOpenDrawer = (product, page = currentPage) => {
    setDrawerProduct(product);
    setDrawerVisible(true);
    navigate(`${location.pathname}?${new URLSearchParams({ id: product.id, page, detail: 'true' })}`);
  };

  // Drawer 닫기 → URL 초기화
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setDrawerProduct(null);
    navigate(location.pathname);
  };

  return (
    <>
      <Card title="상품 목록">
        <ProductList
          onOpenDrawer={handleOpenDrawer}
          onProductsLoaded={setAllProducts}
          currentPage={currentPage}
          selectedProductId={drawerProduct?.id ?? null}
        />
      </Card>
      <ProductDetailDrawer
        product={drawerProduct}
        open={drawerVisible}
        onClose={handleCloseDrawer}
      />
    </>
  );
}

export default ProductsApp;
```

---

## 3. ProductList

`getRowId`로 Row를 식별하고, `selectedProductId`가 바뀔 때 해당 Row를 선택·스크롤합니다.

```jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { fetchProducts } from '@/api/productApi';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

function ProductList({ onOpenDrawer, onProductsLoaded, currentPage = 1, selectedProductId = null }) {
  const [products, setProducts] = useState([]);
  const [gridApi, setGridApi] = useState(null);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      onProductsLoaded?.(data);
    });
  }, [onProductsLoaded]);

  // selectedProductId 변경 시 Row 선택 + 스크롤
  useEffect(() => {
    if (!gridApi || !selectedProductId) return;
    const rowNode = gridApi.getRowNode(String(selectedProductId));
    if (rowNode) {
      rowNode.setSelected(true);
      gridApi.ensureNodeVisible(rowNode, 'middle');
    }
  }, [gridApi, selectedProductId]);

  const handleOpenDrawer = useCallback(
    (product) => onOpenDrawer?.(product, currentPage),
    [onOpenDrawer, currentPage]
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: '상세',
        width: 80,
        cellRenderer: (params) => (
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Row click 버블링 방지
              handleOpenDrawer(params.data);
            }}
          >
            상세보기
          </Button>
        ),
      },
      { field: 'name', headerName: '상품명', width: 150 },
      { field: 'description', headerName: '설명', width: 200 },
      {
        field: 'price',
        headerName: '가격',
        width: 120,
        valueFormatter: (p) => `₩${p.value.toLocaleString()}`,
      },
      {
        field: 'stock',
        headerName: '재고',
        width: 100,
        cellStyle: (p) => ({ color: p.value < 20 ? '#ff4d4f' : '#52c41a' }),
      },
      { field: 'category', headerName: '카테고리', width: 120 },
    ],
    [handleOpenDrawer]
  );

  return (
    <div className="ag-theme-quartz" style={{ height: 500 }}>
      <AgGridReact
        rowData={products}
        columnDefs={columnDefs}
        rowSelection={{ mode: 'singleRow' }}
        pagination
        paginationPageSize={5}
        onGridReady={(params) => setGridApi(params.api)}
        getRowId={(p) => String(p.data.id)}
      />
    </div>
  );
}

export default ProductList;
```

---

## 4. ProductDetailDrawer

```jsx
import { Drawer, Descriptions, Tag } from 'antd';

function ProductDetailDrawer({ product, open, onClose }) {
  return (
    <Drawer title={product?.name ?? '상품 상세'} open={open} onClose={onClose} width={480}>
      {product && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="상품명">{product.name}</Descriptions.Item>
          <Descriptions.Item label="카테고리">
            <Tag color="blue">{product.category}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="가격">₩{product.price.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="재고">
            <span style={{ color: product.stock < 20 ? '#ff4d4f' : '#52c41a' }}>
              {product.stock}개
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="설명">{product.description}</Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  );
}

export default ProductDetailDrawer;
```

> **참고:** Ant Design v5부터 `visible` 대신 `open` prop을 사용합니다.

---

## 5. 핵심 포인트 4가지

### 1. `getRowId` 필수

```jsx
getRowId={(p) => String(p.data.id)}
```

이게 없으면 `gridApi.getRowNode()`로 특정 Row를 찾을 수 없습니다.  
반환값은 반드시 **문자열**이어야 합니다.

### 2. `ensureNodeVisible`로 스크롤 이동

```jsx
gridApi.ensureNodeVisible(rowNode, 'middle');
```

Row를 선택(`setSelected`)만 해도 화면 밖에 있으면 보이지 않습니다.  
반드시 함께 호출해 화면 중앙으로 스크롤하세요.

### 3. `e.stopPropagation()`으로 버블링 차단

```jsx
onClick={(e) => {
  e.stopPropagation();
  handleOpenDrawer(params.data);
}}
```

버튼 클릭이 Row click 이벤트로 번지면 selection이 꼬입니다.

### 4. 데이터 로드 타이밍 처리

```jsx
useEffect(() => {
  if (detail && productId && allProducts.length > 0) { // 데이터 있을 때만
    // ...
  }
}, [location.search, allProducts]); // allProducts도 의존성에 포함
```

`allProducts`를 의존성에 추가하면 데이터 로드 후 `useEffect`가 재실행되어 Drawer가 정상 복원됩니다.

---

## 핵심 요약

> URL에 `?id=...&detail=true`를 저장 → `useEffect`로 복원 → `getRowId` + `ensureNodeVisible`로 Row 동기화.

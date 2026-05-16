---
categories: [React]
title: AG Grid Drawer + URL 상태 동기화
description: AG Grid 목록에서 상세 Drawer를 열고, URL에 상태를 저장해 새로고침해도 복원되는 패턴. Row 자동 선택과 스크롤 이동까지 정리합니다.
created: 2026-02-13
updated: 2026-05-16
tags: [React|blue, AG Grid|blue, Drawer|teal, URL 상태|teal, query string|teal]
platform: AG Grid v33+
readingTime: 6
---

# AG Grid Drawer + URL 상태 동기화

목록에서 상세보기를 누르면 Drawer가 열리고, URL에 상태가 저장돼서 **새로고침해도 동일한 상태로 복원**되는 패턴입니다.

---

## 동작 흐름

```
1. 목록에서 "상세보기" 클릭
2. Drawer 오픈 + URL에 ?id=3&page=1&detail=true 저장
3. 새로고침해도 URL을 읽어 Drawer 다시 오픈
4. 해당 Row 자동 선택 + 스크롤 이동
```

---

## 1. ProductsApp — URL ↔ 상태 동기화

URL을 읽어 Drawer 상태를 복원하고, Drawer 열고 닫을 때 URL을 갱신합니다.

```jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "antd";
import ProductList from "./ProductList";
import ProductDetailDrawer from "./ProductDetailDrawer";

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
    const productId = parseInt(params.get("id"));
    const page = parseInt(params.get("page")) || 1;
    const detail = params.get("detail") === "true";

    setCurrentPage(page);

    // 데이터 로드 후에만 product 찾기
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

    const params = new URLSearchParams({
      id: product.id,
      page,
      detail: "true",
    });
    navigate(`${location.pathname}?${params.toString()}`);
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
        visible={drawerVisible}
        onClose={handleCloseDrawer}
      />
    </>
  );
}

export default ProductsApp;
```

---

## 2. ProductList — Row 자동 선택 + 스크롤

`getRowId`로 식별자를 정의하고, `selectedProductId`가 바뀔 때 해당 Row를 선택·스크롤합니다.

```jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "antd";
import { AgGridReact } from "ag-grid-react";
import { fetchProducts } from "@/api/productApi";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

function ProductList({
  onOpenDrawer,
  onProductsLoaded,
  currentPage = 1,
  selectedProductId = null,
}) {
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
      gridApi.ensureNodeVisible(rowNode, "middle");
    }
  }, [gridApi, selectedProductId]);

  const handleOpenDrawer = useCallback(
    (product) => onOpenDrawer?.(product, currentPage),
    [onOpenDrawer, currentPage]
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "상세",
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
      { field: "name", headerName: "상품명", width: 150 },
      { field: "description", headerName: "설명", width: 200 },
      {
        field: "price",
        headerName: "가격",
        width: 120,
        valueFormatter: (p) => `₩${p.value.toLocaleString()}`,
      },
      {
        field: "stock",
        headerName: "재고",
        width: 100,
        cellStyle: (p) => ({ color: p.value < 20 ? "#ff4d4f" : "#52c41a" }),
      },
      { field: "category", headerName: "카테고리", width: 120 },
    ],
    [handleOpenDrawer]
  );

  return (
    <div className="ag-theme-quartz" style={{ height: 500 }}>
      <AgGridReact
        rowData={products}
        columnDefs={columnDefs}
        rowSelection={{ mode: "singleRow" }}
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

## 핵심 포인트 4가지

### 1. `getRowId` 필수

```jsx
getRowId={(p) => String(p.data.id)}
```

이게 없으면 `gridApi.getRowNode()`로 특정 Row를 찾을 수 없습니다.
URL 복원 시 Row 자동 선택이 동작하려면 반드시 필요합니다.

### 2. `ensureNodeVisible`로 스크롤 이동

```jsx
gridApi.ensureNodeVisible(rowNode, "middle");
```

선택만으로는 부족합니다. 페이지가 길면 해당 Row가 보이지 않을 수 있어요.
`"middle"`로 지정하면 화면 가운데로 스크롤됩니다.

### 3. `e.stopPropagation()`으로 버블링 차단

```jsx
onClick={(e) => {
  e.stopPropagation();
  handleOpenDrawer(params.data);
}}
```

버튼 클릭이 Row click 이벤트로 번지면 selection이 꼬입니다. 반드시 차단하세요.

### 4. 데이터 로드 타이밍 처리

URL 파싱 시 `allProducts`가 아직 비어있으면 product를 찾을 수 없습니다.

```jsx
useEffect(() => {
  // ...
  if (detail && productId && allProducts.length > 0) {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      setDrawerProduct(product);
      setDrawerVisible(true);
    }
  }
}, [location.search, allProducts]); // allProducts도 의존성에 포함
```

`allProducts`를 의존성에 넣으면 데이터 로드 후 자동으로 다시 실행돼서 Drawer가 정상 복원됩니다.

---

## 한 줄 정리

> URL에 `?id=...&detail=true`를 저장 → `useEffect`로 복원 → `getRowId` + `ensureNodeVisible`로 Row 동기화.
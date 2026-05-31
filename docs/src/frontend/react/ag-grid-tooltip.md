---
categories: [React]
title: AG Grid Tooltip 사용법 — tooltipField · tooltipValueGetter · tooltipShowDelay
description: AG Grid tooltipField, tooltipValueGetter, headerTooltip, tooltipShowMode, tooltipShowDelay 설정 방법을 JavaScript·React 예제와 함께 한 번에 정리합니다.
created: 2026-05-31
tags: [AG Grid|blue, React|blue, Tooltip|teal, tooltipField|teal, tooltipValueGetter|teal]
platform: AG Grid v33+
readingTime: 8
---

# AG Grid Tooltip 사용법

> `tooltipField` · `tooltipValueGetter` · `headerTooltip` · `tooltipShowDelay` · `tooltipShowMode` 한 번에 정리

AG Grid에서 툴팁은 별도 플러그인 없이 `ColDef`나 `GridOptions`만으로 구현할 수 있습니다.  
이 글에서는 **셀 툴팁·헤더 툴팁·표시 조건·타이밍 제어**까지 실무에서 자주 쓰는 패턴을 모두 정리합니다.

---

## 목차

1. [툴팁 개요](#1-툴팁-개요)
2. [tooltipField — 필드 값 그대로 표시](#2-tooltipfield)
3. [tooltipValueGetter — 동적 툴팁 생성](#3-tooltipvaluegetter)
4. [headerTooltip — 헤더 툴팁](#4-headertooltip)
5. [딜레이 설정 3종](#5-딜레이-설정-3종)
6. [tooltipShowMode — 표시 조건 제어](#6-tooltipshowmode)
7. [전체 예제 코드](#7-전체-예제-코드)
8. [속성 빠른 비교표](#8-속성-빠른-비교표)

---

## 1. 툴팁 개요

AG Grid 툴팁은 **셀, 헤더, 그룹 행** 등 다양한 영역에 추가할 수 있습니다.

| 방법 | 용도 |
|------|------|
| `tooltipField` | 데이터 필드 값을 그대로 표시 |
| `tooltipValueGetter` | 함수로 조건부·복합 텍스트 생성 |
| `headerTooltip` | 컬럼 헤더에 툴팁 추가 |

> **참고:** AG Grid 기본 툴팁은 브라우저 네이티브 `title` 속성을 사용합니다.  
> 커스텀 스타일이 필요하다면 **Custom Tooltip Component**를 구현하세요.

---

## 2. tooltipField

행 데이터의 **특정 필드 값**을 툴팁 텍스트로 사용합니다.  
가장 간단한 방법으로, 데이터 객체의 키 이름만 지정하면 됩니다.

```javascript
const columnDefs = [
  {
    field: 'athleteName',
    headerName: '선수명',
    tooltipField: 'athleteName',      // 셀과 같은 필드를 툴팁으로
  },
  {
    field: 'country',
    headerName: '국가',
    tooltipField: 'countryFullName',  // 다른 필드를 툴팁으로
  }
];
```

> **팁:** `tooltipField`에 현재 컬럼의 `field`와 **다른 필드명**을 지정해도 됩니다.  
> 예를 들어 셀에는 약어 코드를 표시하고, 툴팁에는 전체 이름을 보여주는 패턴이 자주 쓰입니다.

---

## 3. tooltipValueGetter

함수로 동작하며, **조건부 로직이나 가공된 문자열**을 툴팁에 표시할 때 사용합니다.  
`valueGetter`와 동일한 `params` 객체를 받습니다.

### 기본 사용법

```javascript
{
  field: 'gold',
  headerName: '금메달',
  tooltipValueGetter: (params) => {
    const { gold, silver, bronze } = params.data;
    return `금: ${gold} | 은: ${silver} | 동: ${bronze}`;
  }
}
```

### 조건부 툴팁 예시

```javascript
{
  field: 'score',
  headerName: '점수',
  tooltipValueGetter: (params) => {
    if (params.value === null || params.value === undefined) return '데이터 없음';
    if (params.value >= 90) return '우수 성적';
    if (params.value >= 70) return '양호';
    return '개선 필요';
  }
}
```

### params 주요 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| `params.value` | `any` | 현재 셀의 렌더링된 값 |
| `params.data` | `RowData` | 현재 행의 전체 데이터 객체 |
| `params.colDef` | `ColDef` | 현재 컬럼의 ColDef 객체 |
| `params.node` | `RowNode` | 현재 행의 Row Node |

---

## 4. headerTooltip

컬럼 **헤더에 툴팁**을 추가합니다.  
컬럼명이 짧거나 약어일 때 전체 설명을 표시하는 용도로 자주 쓰입니다.

```javascript
const columnDefs = [
  {
    field: 'ctr',
    headerName: 'CTR',
    headerTooltip: 'Click-Through Rate (클릭률)',
  },
  {
    field: 'roas',
    headerName: 'ROAS',
    headerTooltip: 'Return On Ad Spend (광고 수익률)',
  }
];
```

> **주의:** `headerTooltip`은 함수가 아닌 **문자열만** 받습니다.  
> 동적으로 헤더 툴팁을 생성해야 한다면 Custom Header Component를 사용하세요.

---

## 5. 딜레이 설정 3종

툴팁의 표시·숨김 타이밍을 `GridOptions`에서 밀리초(ms) 단위로 제어합니다.

### tooltipShowDelay

마우스를 셀 위에 올린 뒤 툴팁이 **나타나기까지** 기다리는 시간입니다.  
기본값은 `2000ms`이며, UX 개선을 위해 `300~500ms`로 줄이는 경우가 많습니다.

```javascript
const gridOptions = {
  tooltipShowDelay: 500,   // 0.5초 후 표시
};
```

### tooltipSwitchShowDelay

한 셀에서 **다른 셀로 빠르게 이동**할 때 새 툴팁이 나타나는 딜레이입니다.  
이미 툴팁이 열려 있는 상태에서는 `tooltipShowDelay` 대신 이 값이 사용됩니다.  
기본값 `200ms`.

```javascript
const gridOptions = {
  tooltipShowDelay: 500,
  tooltipSwitchShowDelay: 100,  // 셀 이동 시 0.1초 후 전환
};
```

### tooltipHideDelay

마우스가 셀을 벗어난 후 툴팁이 **사라지기까지** 기다리는 시간입니다.  
기본값 `10000ms(10초)`. 빠르게 닫히길 원하면 줄이세요.

```javascript
const gridOptions = {
  tooltipHideDelay: 2000,  // 2초 후 사라짐
};
```

> **팁:** `tooltipShowDelay: 0`으로 설정하면 마우스를 올리는 즉시 툴팁이 나타납니다.  
> 의도치 않은 셀 이동 시에도 계속 뜰 수 있으니 `tooltipSwitchShowDelay`와 함께 조정하세요.

---

## 6. tooltipShowMode

툴팁을 **언제 표시할지** 결정하는 모드입니다.  
`GridOptions`에서 설정하며, 두 가지 값 중 하나를 선택합니다.

| 값 | 동작 | 기본값 |
|----|------|--------|
| `'whenTruncated'` | 셀 텍스트가 잘릴 때만 툴팁 표시 | ✅ 기본값 |
| `'always'` | 텍스트 잘림 여부와 관계없이 항상 표시 | — |

### whenTruncated (기본값)

셀 너비보다 텍스트가 길어 잘린 경우에만 툴팁이 표시됩니다.

```javascript
const gridOptions = {
  tooltipShowMode: 'whenTruncated',  // 기본값 — 생략해도 동일
  tooltipShowDelay: 500,
};
```

### always

텍스트가 잘리지 않아도 툴팁을 항상 표시합니다.  
`tooltipValueGetter`로 부가 정보를 넣었을 때 특히 유용합니다.

```javascript
const gridOptions = {
  tooltipShowMode: 'always',
  tooltipShowDelay: 400,
};
```

### 모드별 동작 비교

| 상황 | whenTruncated | always |
|------|--------------|--------|
| 텍스트가 셀 안에 모두 표시됨 | 툴팁 미표시 | 툴팁 표시 |
| 텍스트가 잘려 일부만 보임 | 툴팁 표시 | 툴팁 표시 |
| tooltipValueGetter로 추가 정보 제공 | 잘린 경우만 | 항상 |

> **추천 조합:** 셀 내용이 짧아도 추가 정보(전체 주소, 상세 설명 등)를 보여주고 싶다면  
> `tooltipShowMode: 'always'` + `tooltipValueGetter`를 함께 사용하세요.

---

## 7. 전체 예제 코드

### JavaScript

```javascript
const columnDefs = [
  {
    field: 'athlete',
    headerName: '선수',
    tooltipField: 'athlete',           // ① 셀 값 그대로 툴팁
    headerTooltip: '선수의 전체 이름', // ② 헤더 툴팁
  },
  {
    field: 'sport',
    headerName: '종목',
    headerTooltip: '참가 스포츠 종목',
    tooltipValueGetter: (p) =>         // ③ 동적 툴팁
      `${p.data.athlete} — ${p.data.sport} (${p.data.year})`,
  },
  {
    field: 'gold',
    headerName: '금',
    headerTooltip: '금메달 획득 수',
    tooltipValueGetter: (p) =>
      `금 ${p.data.gold} · 은 ${p.data.silver} · 동 ${p.data.bronze}`,
  },
];

const gridOptions = {
  columnDefs,
  rowData,
  tooltipShowMode: 'always',        // 항상 표시
  tooltipShowDelay: 400,            // 0.4초 후 표시
  tooltipSwitchShowDelay: 100,      // 셀 이동 시 0.1초 전환
  tooltipHideDelay: 3000,           // 3초 후 숨김
};
```

### React (TSX)

```tsx
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';

const colDefs: ColDef[] = [
  {
    field: 'name',
    tooltipField: 'name',
    headerTooltip: '직원 이름',
  },
  {
    field: 'dept',
    tooltipValueGetter: (p) => `부서: ${p.data.deptFull}`,
  },
];

export default function MyGrid() {
  return (
    <AgGridReact
      columnDefs={colDefs}
      rowData={rowData}
      tooltipShowMode="always"
      tooltipShowDelay={400}
      tooltipSwitchShowDelay={100}
      tooltipHideDelay={3000}
    />
  );
}
```

---

## 8. 속성 빠른 비교표

| 속성 | 위치 | 타입 | 기본값 | 설명 |
|------|------|------|--------|------|
| `tooltipField` | ColDef | `string` | — | 행 데이터의 필드 값을 툴팁으로 사용 |
| `tooltipValueGetter` | ColDef | `function` | — | 함수로 동적 툴팁 문자열 반환 |
| `headerTooltip` | ColDef | `string` | — | 컬럼 헤더에 툴팁 텍스트 지정 |
| `tooltipShowMode` | GridOptions | `string` | `'whenTruncated'` | `'whenTruncated'` \| `'always'` |
| `tooltipShowDelay` | GridOptions | `number` | `2000` | 호버 후 표시까지 딜레이(ms) |
| `tooltipSwitchShowDelay` | GridOptions | `number` | `200` | 툴팁 열린 상태에서 셀 이동 시 딜레이(ms) |
| `tooltipHideDelay` | GridOptions | `number` | `10000` | 마우스 이탈 후 숨김까지 딜레이(ms) |

---

## 핵심 요약

- **tooltipField** — 데이터 필드 값을 그대로 툴팁에 표시. 가장 간단.
- **tooltipValueGetter** — 함수로 조건부·복합 툴팁 텍스트 생성.
- **headerTooltip** — 컬럼 헤더에 설명 추가. 문자열만 가능.
- **tooltipShowMode** — `'whenTruncated'`(기본) 또는 `'always'`. 잘린 경우만 or 항상 표시.
- **tooltipShowDelay** — 기본 2000ms, 빠른 UX를 위해 300~500ms 권장.
- **tooltipSwitchShowDelay** — 셀 간 이동 시 전환 딜레이. 기본 200ms.
- **tooltipHideDelay** — 기본 10000ms, 사용자 경험에 맞게 줄여 사용.

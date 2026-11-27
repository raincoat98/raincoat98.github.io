---
categories: [React]
title: AG Grid Tooltip 사용법
description: AG Grid에서 셀과 헤더에 툴팁을 추가하고 표시 조건을 설정하는 방법입니다.
created: 2026-05-31
tags: [AG Grid|blue, React|blue, Tooltip|teal, tooltipField|teal, tooltipValueGetter|teal]
platform: AG Grid v33+
readingTime: 3
---

# AG Grid Tooltip 사용법

셀에서 잘린 텍스트를 읽거나 짧은 코드의 전체 이름을 확인할 때 툴팁을 사용합니다. 헤더에는 컬럼 이름만으로 알기 어려운 설명을 넣을 수 있습니다.

## 셀과 헤더에 툴팁 추가하기

| 옵션 | 사용하는 경우 |
| --- | --- |
| `tooltipField` | 행 데이터의 값을 그대로 표시합니다. 셀과 다른 필드도 지정할 수 있습니다. |
| `tooltipValueGetter` | 여러 필드를 조합하거나 조건에 따라 툴팁 문구를 바꿉니다. |
| `headerTooltip` | 컬럼 헤더에 설명을 표시합니다. |

다음 React 예제는 국가 셀에 코드만 표시하고 툴팁에는 전체 이름을 보여줍니다. 메달 셀에는 금메달 수를 표시하고 툴팁에는 은메달과 동메달 수도 함께 표시합니다.

```tsx
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule]);

type Athlete = {
  countryCode: string;
  countryName: string;
  gold: number;
  silver: number;
  bronze: number;
};

const rowData: Athlete[] = [
  { countryCode: 'KOR', countryName: '대한민국', gold: 2, silver: 1, bronze: 0 },
];

const columnDefs: ColDef<Athlete>[] = [
  {
    field: 'countryCode',
    headerName: '국가',
    tooltipField: 'countryName',
    headerTooltip: '선수의 국가 코드',
  },
  {
    field: 'gold',
    headerName: '금메달',
    tooltipValueGetter: ({ data }) =>
      data ? `금 ${data.gold}, 은 ${data.silver}, 동 ${data.bronze}` : undefined,
  },
];

export default function AthleteGrid() {
  return (
    <div style={{ height: 240 }}>
      <AgGridReact<Athlete>
        rowData={rowData}
        columnDefs={columnDefs}
        tooltipShowDelay={400}
      />
    </div>
  );
}
```

같은 컬럼에 `tooltipField`와 `tooltipValueGetter`를 함께 설정하면 `tooltipField`가 우선합니다.

## 텍스트가 잘릴 때만 표시하기

기본 표시 모드는 `'always'`입니다. 위 예제처럼 셀 텍스트가 짧더라도 부가 정보를 보여주려면 기본값을 유지합니다. 잘린 텍스트를 보여주는 용도라면 `tooltipShowMode="whenTruncated"`를 설정합니다.

AG Grid는 기본적으로 그리드 자체 툴팁을 표시합니다. `enableBrowserTooltips`를 켜면 브라우저가 표시를 제어하므로 `whenTruncated`와 그리드의 표시 지연 설정은 적용되지 않습니다.

## 표시 시간 조절하기

시간은 밀리초 단위입니다. 위 예제의 `tooltipShowDelay={400}`은 마우스를 올린 뒤 0.4초 후에 툴팁을 표시합니다.

| 옵션 | 기본값 | 동작 |
| --- | --- | --- |
| `tooltipShowDelay` | `2000ms` | 마우스를 올린 뒤 표시까지 기다리는 시간입니다. |
| `tooltipSwitchShowDelay` | `200ms` | 기존 툴팁이 열린 상태에서 다른 툴팁으로 전환할 때 기다리는 시간입니다. |
| `tooltipHideDelay` | `10000ms` | 표시된 툴팁을 자동으로 숨기기까지 기다리는 시간입니다. |

공식 문서: [AG Grid Tooltips](https://www.ag-grid.com/react-data-grid/tooltips/)

---
categories: [React]
title: React에서 PocketBase 쓰기
description: React에서 PocketBase 데이터를 조회하고 수정하는 예제로 SDK 호출, TanStack Query 캐시, API 접근 규칙을 나누는 방법을 설명합니다.
created: 2026-11-27
tags: [React|blue, PocketBase|teal, TanStack Query|orange, TypeScript|blue]
platform: React
readingTime: 4
---

식물 이름을 수정했는데 상세 화면에는 새 이름이, 목록에는 이전 이름이 남을 수 있습니다. 화면마다 PocketBase를 직접 호출하면 저장 뒤 어떤 데이터를 다시 가져올지도 각 화면에서 정해야 합니다. 이 글에서는 식물 목록과 이름 수정을 예제로, PocketBase 요청과 React의 캐시 갱신을 나눕니다.

## PocketBase에서 본인 기록만 허용하기

PocketBase 관리자 화면에서 `plants` 컬렉션을 만듭니다. `name`은 필수 텍스트 필드, `owner`는 `users` 인증 컬렉션을 가리키는 필수 단일 Relation 필드입니다.

List와 View 규칙에는 다음 조건을 넣습니다. 로그인한 사용자와 식물의 소유자가 같을 때만 데이터를 읽을 수 있습니다.

```text
@request.auth.id != "" && owner = @request.auth.id
```

Update 규칙에는 소유자를 변경할 수 없다는 조건을 추가합니다.

```text
@request.auth.id != "" && owner = @request.auth.id && @request.body.owner:changed = false
```

Create와 Delete는 잠금 상태로 둡니다. 빈 규칙은 잠금이 아니라 누구에게나 허용한다는 뜻입니다. 실습용 식물은 관리자 화면에서 만든 뒤 `owner`에 테스트 계정을 지정합니다. 브라우저에서는 일반 사용자로 로그인합니다. 관리자 토큰은 규칙을 우회하므로 브라우저에 넣지 않습니다.

## SDK 호출을 데이터 모듈에 모으기

Vite의 React TypeScript 프로젝트에 `npm install pocketbase @tanstack/react-query`로 패키지를 설치합니다. `.env.local`에 `VITE_POCKETBASE_URL=http://127.0.0.1:8090`을 지정합니다. 서버 주소나 포트가 다르면 실제 주소를 사용합니다.

`src/pocketbase.ts`에서 클라이언트를 만듭니다. 로그인과 데이터 요청에 이 인스턴스를 같이 사용해야 SDK가 로그인 토큰을 요청에 붙입니다.

```ts
import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
```

`src/plants.ts`에 조회와 수정 방법을 둡니다. 목록에는 필요한 필드만 요청하고 처음 20개의 식물을 이름순으로 가져옵니다. 요청이 실패하면 SDK가 예외를 던지므로 빈 목록으로 바꿔 반환하지 않습니다.

```ts
import { pb } from './pocketbase';

type Plant = { id: string; name: string };

export async function listPlants(ownerId: string, signal: AbortSignal) {
  const result = await pb.collection('plants').getList<Plant>(1, 20, {
    fields: 'id,name',
    filter: pb.filter('owner = {:owner}', { owner: ownerId }),
    sort: 'name,id',
    skipTotal: true,
    requestKey: null,
    signal,
  });

  return result.items;
}

export function renamePlant(id: string, name: string) {
  return pb.collection('plants').update<Plant>(id, { name: name.trim() }, {
    fields: 'id,name',
  });
}
```

`pb.filter()`로 조회 조건에 사용자 ID를 전달합니다. 이 필터는 결과 범위를 좁히는 용도입니다. 요청을 변경해도 다른 사람의 기록에 접근하지 못하도록 막는 것은 서버의 API 규칙입니다. `requestKey: null`은 SDK의 중복 요청 자동 취소를 끄고, 이 조회의 취소는 TanStack Query가 전달하는 `signal`에 맡긴다는 뜻입니다.

## 저장에 성공하면 목록 다시 가져오기

`src/usePlants.ts`에서 계정별 목록 키와 갱신 규칙을 관리합니다. 이름이 바뀌면 정렬 순서도 달라질 수 있으므로 목록의 이름만 바꾸지 않고, 서버에서 목록을 다시 가져옵니다.

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPlants, renamePlant } from './plants';

const plantsKey = (ownerId: string) => ['plants', ownerId] as const;

export function usePlants(ownerId: string) {
  return useQuery({
    queryKey: plantsKey(ownerId),
    queryFn: ({ signal }) => listPlants(ownerId, signal),
  });
}

export function useRenamePlant(ownerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renamePlant(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: plantsKey(ownerId) }),
  });
}
```

앱을 `QueryClientProvider`로 감싸고, 로그인한 화면에서 같은 `pb` 인스턴스의 `authStore.record.id`를 두 훅에 전달합니다. 수정 버튼에서는 `mutate({ id, name })`를 호출하고 `isPending`일 때는 다시 저장하지 않도록 버튼을 비활성화합니다. 로그아웃할 때는 인증 상태와 사용자 전용 캐시를 정리합니다.

조회 화면이 하나뿐이라면 파일을 꼭 셋으로 나눌 필요는 없습니다. 같은 목록을 여러 화면에서 쓰기 시작할 때 정렬, 필터, 저장 후 갱신 규칙을 한곳에 모으면 수정할 위치가 분명해집니다. [React Supabase 데이터 조회와 수정](/frontend/react/supabase-data-access/)도 같은 흐름을 사용하지만, 접근 권한은 PocketBase API 규칙 대신 PostgreSQL RLS에서 설정합니다.

공식 문서: [PocketBase API 규칙](https://pocketbase.io/docs/api-rules-and-filters/), [레코드 API](https://pocketbase.io/docs/api-records/), [PocketBase JavaScript SDK](https://github.com/pocketbase/js-sdk), [TanStack Query 캐시 무효화](https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations)

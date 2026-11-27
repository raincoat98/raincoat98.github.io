---
categories: [React]
title: "React와 Supabase 데이터 접근 설계: 쿼리와 UI 분리하기"
description: React에서 Supabase 쿼리를 어디에 둘지 정하고, TanStack Query로 조회와 캐시를 관리하며 RLS로 데이터 접근을 제한하는 방법입니다.
created: 2026-11-27
tags: [React|blue, Supabase|teal, TanStack Query|orange, TypeScript|blue]
platform: React
readingTime: 6
---

프로젝트 목록과 선택 메뉴에서 같은 데이터를 보여 준다고 가정합니다. 두 화면에 Supabase 쿼리를 각각 작성하면, 정렬 규칙을 바꾸거나 프로젝트 이름을 수정했을 때 어느 화면을 다시 조회해야 하는지 두 곳에서 판단하게 됩니다.

이 예제에서는 목록을 가져오는 규칙은 데이터 모듈에, 조회 결과를 언제 다시 가져올지는 TanStack Query에 둡니다. 화면은 데이터를 표시하고 사용자 입력을 받습니다. 어느 사용자가 어떤 행을 읽고 수정할 수 있는지는 Supabase의 PostgreSQL에서 결정합니다.

## 브라우저에서 Supabase에 직접 연결하는 경우

사용자가 자기 프로젝트만 조회하고 이름만 수정하는 기능이라면 별도 서버를 거치지 않아도 됩니다. 브라우저에는 공개 가능한 publishable key를 사용하고, 로그인한 사용자의 세션으로 요청합니다. `secret` 키와 `service_role` 키는 브라우저에 넣지 않습니다.

아래 SQL은 예제용 새 테이블을 만듭니다. 로그인한 사용자는 자신의 행만 볼 수 있고, 수정할 수 있는 열은 `name`뿐입니다. 테이블 권한은 어떤 작업을 할 수 있는지, 행 수준 보안(RLS)은 그 작업을 어느 행에 할 수 있는지 정합니다.

```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null check (length(btrim(name)) > 0)
);

alter table public.projects enable row level security;
revoke all on table public.projects from anon, authenticated;
grant select, update (name) on table public.projects to authenticated;

create policy "Read own projects"
on public.projects for select to authenticated
using (owner_id = (select auth.uid()));

create policy "Rename own projects"
on public.projects for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));
```

예제는 목록 조회와 이름 수정만 다루므로 브라우저에 생성과 삭제 권한을 주지 않습니다. 실습할 때는 로그인 계정의 사용자 ID를 `owner_id`로 지정해 SQL Editor에서 예제 행을 추가합니다. 결제 서비스의 비밀 키를 사용하거나 관리자 권한이 필요한 작업은 서버에서 호출자 권한을 확인한 뒤 처리합니다.

## 데이터 모듈에는 화면이 요청하는 작업을 둡니다

Vite의 React TypeScript 프로젝트를 기준으로 `@supabase/supabase-js`와 `@tanstack/react-query`를 설치합니다. SQL을 적용한 뒤 [DB 타입을 생성](https://supabase.com/docs/guides/api/rest/generating-types)해 `src/database.types.ts`에 저장합니다. 프로젝트 URL과 publishable key는 각각 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`에 설정합니다.

`src/supabase.ts`에서 클라이언트를 한 번 만듭니다.

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
```

`src/projects.ts`에서는 프로젝트 조회와 수정에 필요한 조건을 모읍니다. 호출자는 테이블 이름이나 Supabase 응답 형식을 알 필요가 없습니다. 사용자 ID 필터는 요청을 해당 계정의 데이터로 좁히기 위한 조건입니다. 사용자가 이 값을 임의로 바꿔도 실제 접근 권한은 RLS가 판단합니다.

```ts
import { supabase } from './supabase';

export async function listProjects(ownerId: string, signal: AbortSignal) {
  const { data } = await supabase
    .from('projects')
    .select('id, name')
    .eq('owner_id', ownerId)
    .order('name')
    .order('id')
    .abortSignal(signal)
    .throwOnError();

  return data;
}

export async function renameProject(ownerId: string, id: string, name: string) {
  const { data } = await supabase
    .from('projects')
    .update({ name: name.trim() })
    .eq('owner_id', ownerId)
    .eq('id', id)
    .select('id, name')
    .single()
    .throwOnError();

  return data;
}
```

`throwOnError()`를 사용하면 실패가 TanStack Query의 오류 상태로 전달됩니다. 이름을 바꿀 때는 수정된 행 하나를 요청합니다. 삭제됐거나 접근할 수 없는 행이라면 결과가 없어 `.single()`이 실패하므로, 화면에서 저장 성공으로 처리하지 않습니다.

## TanStack Query에는 캐시 규칙을 둡니다

`src/useProjects.ts`에서 목록 키를 공유합니다. 목록과 선택 메뉴가 같은 훅을 쓰면 조회 결과를 같이 사용합니다. 이름을 바꾸면 이름순 정렬도 달라질 수 있으므로, 변경에 성공한 계정의 목록을 무효화해 서버 결과를 다시 가져옵니다.

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listProjects, renameProject } from './projects';

const projectsKey = (ownerId: string) => ['projects', ownerId] as const;

export function useProjects(ownerId: string) {
  return useQuery({
    queryKey: projectsKey(ownerId),
    queryFn: ({ signal }) => listProjects(ownerId, signal),
  });
}

export function useRenameProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ownerId, id, name }: { ownerId: string; id: string; name: string }) =>
      renameProject(ownerId, id, name),
    onSuccess: (_, { ownerId }) =>
      queryClient.invalidateQueries({ queryKey: projectsKey(ownerId) }),
  });
}
```

앱을 `QueryClientProvider`로 감싸고, 인증이 끝난 화면에서 세션의 `user.id`를 `useProjects()`에 넘깁니다. 이름을 저장할 때는 `useRenameProject()`가 반환한 `mutate({ ownerId, id, name })`를 호출합니다. 화면은 훅의 로딩과 오류 상태를 사용하며 Supabase를 직접 호출하지 않습니다. 사용자별로 캐시 키를 나누고, 로그아웃 시 계정 전용 캐시를 지우거나 계정마다 별도 `QueryClient`를 사용합니다.

## 언제 분리할지 판단하기

화면 하나에서 짧은 조회를 한 번만 한다면, 쿼리 함수를 같은 기능 폴더에 두는 것으로 시작할 수 있습니다. 여러 화면이 같은 정렬이나 필터를 공유하거나, 저장 뒤 갱신할 목록이 늘어날 때 데이터 모듈과 훅을 분리합니다. Supabase의 `select`와 `update`를 이름만 바꿔 전달하는 공통 모듈보다 `listProjects`와 `renameProject`처럼 화면이 요청하는 작업을 드러내는 편이 변경 범위를 찾기 쉽습니다.

공식 문서: [Supabase 행 수준 보안](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase TypeScript 지원](https://supabase.com/docs/reference/javascript/typescript-support), [TanStack Query 변경 후 캐시 무효화](https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations)

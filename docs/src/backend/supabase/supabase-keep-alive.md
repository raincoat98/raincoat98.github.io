---
title: Supabase 무료 플랜 자동 정지 막는 법
description: Supabase Free 플랜의 7일 자동 일시 정지를 GitHub Actions로 막는 방법. RPC + health 폴백 구조로 안정적인 keep-alive를 구현합니다.
date: 2026-05-05
tags: [Supabase, GitHub Actions, DevOps]
platform: Supabase
readingTime: 5
---

# Supabase 무료 플랜 자동 정지 막는 법

며칠 뒤 돌아와보니 DB가 멈춰 있다. 이유도 알고,
해결법도 간단하다. RPC + health 폴백 구조로 완전히 막아보자.

---

## 🧠 왜 이런 일이 생기냐
Supabase Free 플랜은 **7일간 요청이 없으면 자동으로 프로젝트를 일시 정지**시킨다. 결과는 간단하다.

> ❌ **Database is paused** — API 전부 실패, DB 연결 불가, 수동 Resume 필요

해결 방법은 하나다. **주기적으로 요청을 보내면 된다.**
그 방법을 GitHub Actions로 자동화하자.

---

## 🔧 Supabase SQL — ping 함수 등록
SQL Editor에서 한 번만 실행한다.
이 함수가 실제 DB를 "살아있음"으로 인식시키는 핵심이다.

```sql
CREATE OR REPLACE FUNCTION ping()
RETURNS TEXT AS $$
BEGIN
  RETURN 'pong';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔐 GitHub Secrets 등록
리포지토리 **Settings → Secrets → Actions** 에서 두 개를 등록한다.

| 이름 | 값 |
|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi…` |

> ⚠️ **흔한 실수:** 로그에 `-H "apikey: "` 처럼 값이 비어있으면
> Secrets가 아직 등록되지 않은 것이다. 먼저 확인하자.

---

## ✅ GitHub Actions 워크플로우

RPC를 먼저 시도하고, 실패하면 인증이 필요 없는
health 엔드포인트로 폴백하는 구조다.

```yaml
name: Supabase Keep Alive
on:
  schedule:
    - cron: '0 0 */5 * *'   # 5일마다 실행
  workflow_dispatch:         # 수동 트리거도 허용

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Keep Alive (RPC → fallback health)
        run: |
          # 1단계: RPC ping (실제 DB 호출)
          RPC_STATUS=$(curl -o /dev/null -s -w "%{http_code}" \
            -X POST "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/ping" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json")

          if [ "$RPC_STATUS" -ge 200 ] && [ "$RPC_STATUS" -lt 400 ]; then
            echo "✅ RPC keep-alive 성공 ($RPC_STATUS)"
            exit 0
          fi

          # 2단계: health 폴백 (인증 불필요)
          HEALTH_STATUS=$(curl -o /dev/null -s -w "%{http_code}" \
            "${{ secrets.SUPABASE_URL }}/auth/v1/health")

          if [ "$HEALTH_STATUS" -ge 200 ] && [ "$HEALTH_STATUS" -lt 400 ]; then
            echo "✅ Health check 성공 ($HEALTH_STATUS)"
            exit 0
          fi

          echo "❌ RPC, Health 모두 실패"
          exit 1
```

---

## 💡 왜 이 구조인가

### 1. RPC — 진짜 keep-alive
실제 DB 함수 호출이다. Supabase가 프로젝트를 "활성"으로 확실히 인식한다.
이게 핵심이다.

### 2. health — 안전장치 폴백
`/auth/v1/health`는 인증이 필요 없다.
RLS 영향도 없고 401도 없다. RPC가 실패해도 여기서 살린다.

### 왜 `/rest/v1/` 루트는 쓰면 안 되나
인증 필요, RLS 영향, 실패율 높음. 폴백으로 절대 부적합하다.

---

## ⏰ cron 주기 선택
7일 제한이 있으니 그보다 짧아야 한다.

| 주기 | 평가 |
|---|---|
| 3일 | 여유 있음 |
| **5일** | **✅ 추천** |
| 7일 | ⚠️ 위험 |

5일이 가장 합리적이다. 충분한 여유가 있고,
Actions 실행 횟수도 낭비하지 않는다.

---

## 🔥 한 줄 요약

> **DB 직접 호출(RPC) + 실패 대비 health 체크,
> 이게 가장 안정적인 keep-alive 구조다.**

---
categories: [Git]
title: Git 브랜치 전략과 GitHub Flow — 실무 협업 완전 가이드
description: 실무에서 자주 쓰는 master/stage/production 3단계 브랜치 전략, 선택 배포(release)와 긴급 수정(hotfix)부터 GitHub Flow의 PR 병합 방식, 코드 리뷰, CI 자동화까지 정리합니다.
created: 2026-05-19
tags: [Git|orange, GitHub|orange, 브랜치전략|teal]
platform: Git
readingTime: 16
---

# Git 브랜치 전략과 GitHub Flow

기초 명령어를 익혔다면 이제 팀에서 실제로 쓰는 브랜치 운영 방식을 배울 차례입니다. 이 글에서는 3단계 브랜치 전략과 GitHub Flow 협업을 다룹니다.

다룰 내용:

- master/stage/production 3단계 브랜치 전략
- 선택 배포(release)와 긴급 수정(hotfix)
- GitHub Flow와 PR(Pull Request) 협업
- PR 병합 옵션, 코드 리뷰, CI 자동화

> 기초 개념이 필요하면 [Git 기초 가이드](./git-basic-guide)를 먼저 읽으세요. 사고 복구는 [Git 복구 가이드](./git-recovery-guide)에서 다룹니다.

## 1. 3단계 브랜치 전략 — master / stage / production

실무에서 자주 쓰는 3단계 브랜치 전략입니다. 핵심은 단순합니다.

```text
feature/* → master → stage → production
```

각 브랜치가 하는 일:

| 브랜치 | 역할 |
|--------|------|
| `master` | 여러 기능이 모이는 개발 통합 브랜치 |
| `stage` | QA / 스테이징 검증 브랜치 |
| `production` | 실제 사용자에게 서비스되는 운영 브랜치 |

### 기능 개발: feature 브랜치

항상 최신 `master`에서 feature 브랜치를 만들고, 작업이 끝나면 다시 `master`로 돌아옵니다.

```bash
git checkout master
git pull origin master            # master를 최신 상태로
git checkout -b feature/login     # feature 브랜치 생성 + 이동
```

작업 후 커밋하고 푸시한 뒤, `feature/login → master`로 PR을 올립니다.

```bash
git add .
git commit -m "feat: 로그인 기능 추가"
git push origin feature/login
```

### 스테이징 배포: master → stage

`master`에 모인 변경사항을 `stage`로 올려 QA를 진행합니다.

```bash
git checkout stage
git pull origin stage
git merge origin/master
git push origin stage
```

PR로 운영한다면 `master → stage` PR을 만들면 됩니다.

### 운영 배포: stage → production

QA가 끝난 `stage`를 `production`에 반영합니다.

```bash
git checkout production
git pull origin production
git merge origin/stage
git push origin production
```

운영 배포 시에는 반드시 버전 태그를 남깁니다. 롤백과 추적이 쉬워집니다.

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 특정 기능만 골라 배포할 때: release 브랜치

**상황.** `master`에 `login`, `payment`, `chat` 세 기능이 모두 들어 있는데, 운영에는 `login`만 먼저 배포해야 합니다. 이럴 때 통째로 `merge`하면 안 됩니다. `production` 기준으로 release 브랜치를 만들어 필요한 기능만 가져옵니다.

```bash
git checkout production
git pull origin production
git checkout -b release/login
```

필요한 기능만 가져옵니다. feature 브랜치가 살아 있다면 머지, 특정 커밋만 필요하면 cherry-pick 합니다.

```bash
# feature 브랜치 통째로
git merge origin/feature/login

# 또는 특정 커밋만
git cherry-pick <commit_hash>

git push origin release/login
```

검증 후 운영까지 올립니다.

```text
release/login → stage        (테스트)
release/login → production   (테스트 완료 후)
```

### 긴급 장애 대응: hotfix 브랜치

**상황.** 운영에서 로그인이 갑자기 안 됩니다. `feature` 브랜치를 거치면 너무 느립니다. `production`에서 바로 hotfix 브랜치를 만듭니다.

```bash
git checkout production
git pull origin production
git checkout -b hotfix/login-error
```

수정 후 바로 푸시합니다.

```bash
git add .
git commit -m "fix: 로그인 오류 수정"
git push origin hotfix/login-error
```

**핵심은 세 곳 모두에 반영하는 것**입니다. 운영에만 고치고 끝내면, 다음 배포 때 버그가 되살아납니다.

```text
hotfix/login-error → production   (긴급 반영)
hotfix/login-error → stage        (동기화)
hotfix/login-error → master       (동기화)
```

**예시.** `production`에만 반영하고 `master`를 안 고쳤다면? 다음에 기능을 배포할 때 `master`의 옛 로그인 코드가 그대로 올라가 버그가 재발합니다.

### 브랜치 보호 규칙

돌아가고 있는 서비스의 브랜치일수록 규칙을 엄격하게 겁니다.

| 브랜치 | 규칙 |
|--------|------|
| `master` | PR 권장 |
| `stage` | PR 필수 |
| `production` | PR 필수 + 승인 필수 + 직접 push 금지 |

`production`은 절대 직접 push하지 않습니다. 사고의 90%가 여기서 납니다.

### 자주 쓰는 보조 명령어

```bash
# 현재 브랜치 확인
git branch
git branch -a              # 원격 포함 전체

# 브랜치 전환 (checkout보다 안전한 신규 명령)
git switch master
git switch -c feature/new  # 생성 + 전환

# 원격 최신 상태 가져오기 (머지 없이)
git fetch origin

# master 최신 내용을 현재 feature에 반영
git switch feature/login
git merge origin/master
# 또는 히스토리를 깔끔하게 유지하려면
git rebase origin/master

# 작업 중인 변경을 잠시 치워두기
git stash
git stash pop

# 브랜치 삭제
git branch -d feature/login               # 로컬
git push origin --delete feature/login    # 원격
```

### 머지 충돌 해결하기

**상황.** `stage`에 머지하는데, 다른 사람이 같은 파일을 고쳤습니다. Git이 어느 쪽을 쓸지 결정할 수 없어 충돌(conflict)이 발생합니다.

```bash
git merge origin/master
# CONFLICT 발생

# 1. 충돌 파일 확인
git status

# 2. 파일 열어서 충돌 마커 직접 수정
#    <<<<<<< HEAD
#    내 코드
#    =======
#    상대 코드
#    >>>>>>> 브랜치명
#    에서 원하는 쪽만 남기고 나머지 제거

# 3. 해결 후 스테이징해서 머지 완료
git add <충돌_파일>
git commit

# 머지 자체를 취소하고 싶다면
git merge --abort
```

## 2. GitHub Flow와 Pull Request

GitHub Flow는 **단일 `main` 브랜치를 중심으로 작동하는 단순한 협업 방식**입니다.

```text
main 브랜치 → feature 브랜치 분기 → 작업 → PR → 리뷰 → main 병합
```

별도의 develop, release 브랜치 없이 PR 하나로 리뷰와 병합을 처리합니다. 릴리스 주기가 빠른 팀에 잘 맞습니다.

Git Flow와 비교하면:

| | Git Flow | GitHub Flow |
|---|---|---|
| 브랜치 수 | main, develop, release, feature, hotfix | main + feature |
| 릴리스 관리 | 명시적 release 브랜치 | PR로 바로 병합 |
| 적합한 환경 | 버전 관리가 엄격한 대규모 프로젝트 | 빠른 배포 주기, 소규모~중규모 팀 |

앞에서 본 3단계 전략은 Git Flow 계열, 이 섹션은 GitHub Flow를 다룹니다. 팀 규모와 릴리스 방식에 맞게 골라 쓰면 됩니다.

### PR(Pull Request) 기본 흐름

PR은 **"이 브랜치를 저 브랜치에 합쳐도 되냐"고 묻는 요청**입니다. 직접 머지하는 대신, 리뷰받고 승인받아 병합합니다.

```bash
# 1. main 최신화 후 feature 브랜치 생성
git switch main
git pull origin main
git switch -c feature/my-work

# 2. 작업 후 커밋
git add .
git commit -m "feat: 새 기능 추가"

# 3. 원격에 푸시
git push origin feature/my-work
```

GitHub에서 [Pull Requests] → [New pull request]로 이동해 base를 `main`, compare를 `feature/my-work`로 지정하고 PR을 생성합니다.

병합이 완료되면 로컬을 최신 상태로 맞춥니다.

```bash
git switch main
git pull origin main
```

### PR 병합 옵션 3가지

병합 방식은 팀 컨벤션에 따라 고릅니다.

| 옵션 | 동작 | 언제 쓰면 좋은가 |
|------|------|----------|
| **Merge commit** | 모든 커밋 + 병합 커밋(M) 추가 | 이력을 그대로 남기고 싶을 때 |
| **Squash and merge** | 여러 커밋을 하나로 압축 후 병합 | feature 커밋이 잡다할 때 정리용 |
| **Rebase and merge** | 커밋을 직렬로 이어 붙임 | 병합 커밋 없이 선형 이력을 유지할 때 |

Squash는 커밋 이력이 사라져 나중에 추적이 어렵고, Rebase는 충돌이 복잡해질 수 있어 팀 합의가 필요합니다.

### 코드 리뷰

PR 페이지의 [Files changed] 탭에서 변경된 코드를 줄 단위로 확인하고 댓글을 달 수 있습니다. 모든 댓글 작성이 끝나면 [Finish your review]로 최종 제출합니다.

리뷰 타입:

| 타입 | 의미 |
|------|------|
| Comment | 단순 의견, 승인 아님 |
| Approve | 병합 승인 |
| Request changes | 수정 요구, 해결 전까지 병합 차단 |

리뷰는 지적보다 제안 형식이 좋습니다. "이렇게 하면 안 됨"보다 "이렇게 하면 더 좋을 것 같습니다"가 협업에 도움이 됩니다.

### 브랜치 보호 규칙 설정

GitHub 저장소 [Settings] → [Rules] → [Rulesets]에서 `main` 브랜치 보호 규칙을 설정합니다.

자주 쓰는 규칙:

- **Require a pull request before merging**: 직접 push 금지, PR로만 병합 가능
- **Required approvals**: 지정한 수 이상의 승인이 있어야 병합 가능
- **Require status checks to pass**: CI 테스트 통과 후 병합 가능
- **Require conversation resolution**: 리뷰 댓글이 모두 해결돼야 병합 가능

무료 계정은 공개(Public) 저장소에서만 브랜치 규칙을 사용할 수 있습니다.

### GitHub Actions로 PR에 CI 연결

PR이 올라올 때마다 테스트를 자동 실행하려면 `.github/workflows/ci.yml` 파일을 추가합니다.

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
```

브랜치 보호 규칙의 [Require status checks to pass]에 이 워크플로우 작업 이름(`test`)을 추가하면, 테스트가 실패한 PR은 병합할 수 없게 됩니다.

### 이슈로 작업 관리하기

[Issues] → [New issue]에서 이슈를 생성하면 번호(#1, #2...)가 자동 부여됩니다. 이슈 기준으로 브랜치를 만들고 PR과 연결하면 작업 흐름이 명확해집니다.

커밋 메시지나 PR 본문에 `close #번호`를 쓰면, 병합 시 이슈가 자동으로 닫힙니다.

```bash
git commit -m "feat: 로그인 오류 수정. close #12"
```

`close` 대신 `fix`, `resolve`도 동일하게 동작합니다.

**라벨(Label)**: 이슈/PR의 성격을 구분합니다. `bug`, `enhancement`, `docs` 등 기본 제공 라벨 외에 커스텀 라벨도 만들 수 있습니다.

**마일스톤(Milestone)**: 여러 이슈를 묶어 마감일과 목표를 관리합니다. 스프린트 단위 작업에 유용합니다.

## 정리

세 가지 배포 흐름만 기억하면 됩니다.

```text
일반 배포:  feature/* → master → stage → production
선택 배포:  production → release/* → stage 검증 → production
긴급 수정:  production → hotfix/* → production → stage → master
```

원칙:

1. feature는 항상 `master`에서 만들고, 작업 후 `master`로 PR
2. `stage`는 `master`를 검증하는 브랜치
3. `production`은 운영 전용, **직접 push 금지**
4. 특정 기능만 배포할 땐 `release` 브랜치
5. 운영 긴급 수정은 `hotfix` 브랜치
6. `production`에 반영한 내용은 반드시 `stage`와 `master`에도 동기화

브랜치를 잘 운영해도 실수는 납니다. 커밋을 날렸다면 [Git 복구 가이드](./git-recovery-guide)를 보세요.
---
categories: [Git]
title: Git 브랜치 전략과 GitHub Flow
description: GitHub Flow와 master/stage/production 전략을 비교하고, PR과 CI로 변경을 검증하는 방법부터 cherry-pick을 이용한 선택 배포와 운영 긴급 수정까지 정리합니다.
created: 2026-05-19
tags: [Git|orange, GitHub|orange, 브랜치전략|teal]
platform: Git
readingTime: 16
---

# Git 브랜치 전략과 GitHub Flow

로그인과 결제 기능이 모두 개발 브랜치에 들어갔는데, 이번에는 로그인만 배포해야 합니다. 개발 브랜치를 통째로 병합하면 결제도 배포 대상에 들어갑니다. 이런 일이 자주 생기는지, 그리고 무엇을 기준으로 배포하는지부터 정하면 브랜치 운영 방식이 단순해집니다.

| 방식 | 변경이 이동하는 경로 | 쓰기 좋은 상황 |
| --- | --- | --- |
| GitHub Flow | 작업 브랜치 → `main` | 변경을 작게 나누고 `main`에서 자주 배포할 때 |
| 3단계 전략 | 작업 브랜치 → `master` → `stage` → `production` | 개발 통합, 배포 전 검증, 운영 반영의 시점이 다를 때 |

GitHub Flow에서도 스테이징 환경을 쓸 수 있습니다. 별도의 상시 `stage` 브랜치 없이 같은 빌드를 검증 환경과 운영 환경에 차례로 배포할 수 있습니다. 아래의 3단계 전략은 환경별 브랜치를 두는 예입니다. `develop`, `release`, `hotfix`의 역할을 정한 전통적인 Git Flow와는 구분합니다.

커밋이나 원격 저장소가 익숙하지 않다면 [Git 기초 가이드](./git-basic-guide)에서 먼저 확인할 수 있습니다.

## GitHub Flow: `main`으로 PR 보내기

`main`을 배포 가능한 상태로 유지하고, 작업마다 짧게 쓰는 브랜치를 만듭니다. PR(Pull Request)은 작업 브랜치의 변경을 대상 브랜치에 병합해 달라는 요청입니다.

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/login
```

예를 들어 `src/login.js`를 수정했다면 변경을 확인하고 커밋합니다. `--ff-only`는 로컬과 원격 이력이 갈라졌을 때 자동으로 병합하지 않고 중단합니다.

```bash
git status --short
git add src/login.js
git commit -m "feat: 로그인 기능 추가"
git push -u origin feature/login
```

GitHub의 `Pull requests` → `New pull request`에서 `base`(병합 대상)를 `main`, `compare`(작업 브랜치)를 `feature/login`으로 지정합니다. PR 본문에 변경 이유와 검증 방법을 적습니다. 기본 브랜치에 병합할 때 연결된 이슈도 닫으려면 본문에 `Closes #12`처럼 적습니다.

리뷰와 CI(지속적 통합을 위한 자동 검사)를 통과하면 PR을 병합합니다. 자동 배포를 설정했다면 병합이 배포를 시작할 수 있습니다. 수동 배포라면 `main`의 검증된 커밋이나 해당 빌드 결과물을 지정합니다.

### 리뷰와 병합 방식

리뷰어는 `Files changed`에서 실제 변경을 봅니다. 수정을 요청할 때는 문제를 재현하는 조건이나 기대 동작을 적으면 작성자가 확인하기 쉽습니다. `Comment`는 의견만 남기고, `Approve`는 병합을 승인합니다. `Request changes`로 낸 수정 요청은 저장소 규칙과 리뷰어 권한에 따라 병합을 막을 수 있습니다.

| 옵션 | `main`에 남는 이력 | 선택 기준 |
| --- | --- | --- |
| Merge commit | 작업 커밋과 별도의 병합 커밋 | 원래 커밋과 PR의 병합 지점을 남길 때 |
| Squash and merge | PR 변경을 합친 커밋 하나 | PR 하나를 변경 단위로 남길 때 |
| Rebase and merge | 새 해시를 가진 개별 커밋, 병합 커밋 없음 | 개별 커밋을 유지하면서 이력을 한 줄로 남길 때 |

Squash한 PR에서 일부 변경만 나중에 가져오려면, 하나로 합쳐진 커밋을 다시 나눠야 할 수 있습니다. 독립 배포가 필요한 기능은 PR부터 분리하면 가져올 커밋을 고르기 쉽습니다.

### 브랜치 보호와 CI

GitHub 저장소의 `Settings` → `Rules` → `Rulesets`에서 대상 브랜치에 적용할 규칙을 설정합니다. PR을 필수로 지정하면 예외 권한이 없는 사용자는 대상 브랜치에 직접 푸시할 수 없습니다. 필요한 승인 수, 필수 상태 검사, 리뷰 대화 해결 여부도 지정할 수 있습니다.

아래는 `package-lock.json`과 `npm test` 스크립트가 있는 Node.js 프로젝트의 `.github/workflows/ci.yml` 예입니다. Node.js 버전과 검사 명령은 저장소에 맞춥니다.

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
```

`branches`는 작업 브랜치가 아닌 PR의 대상 브랜치에 적용됩니다. PR에서 검사 결과가 표시되면 규칙의 `Require status checks to pass`에 `test`를 추가합니다. 3단계 전략에서 같은 검사를 쓴다면 `branches: [master, stage, production]`으로 바꾸고 각 대상의 필수 검사에 등록합니다. 이 워크플로는 PR을 검사하며 배포는 실행하지 않습니다.

## 3단계 전략: 배포 후보를 단계별로 올리기

`master`는 개발 변경을 모으는 브랜치입니다. `stage`에서는 이번 배포 후보를 검증하고, `production`에는 운영에 반영할 변경을 병합합니다. 이름 자체에는 특별한 동작이 없습니다. 각 브랜치가 어느 환경에 배포되는지는 배포 설정에서 정합니다.

일반 배포는 다음 순서로 진행합니다.

1. `master`에서 작업 브랜치를 만듭니다. 위 명령의 시작 브랜치를 `main`에서 `master`로 바꾸고, PR 대상도 `master`로 지정합니다.
2. 이번에 배포할 변경이 모두 `master`에 들어갔다면 `master` → `stage` PR을 병합합니다. 이때의 배포 후보로 통합 테스트와 QA를 진행합니다.
3. 검증한 후보를 `stage` → `production` PR로 올립니다. `stage`에 새 변경이 들어오면 검증한 커밋에서 별도 브랜치를 만들어 올리거나 새 후보를 다시 검증합니다. `production`에만 있던 변경과 합치면서 배포 내용이 달라지면 병합 결과도 검증합니다.

운영에 반영한 버전을 추적하려면 실제 배포한 커밋에 태그를 붙입니다. 다음 예는 배포 기록의 커밋이 `a1b2c3d`라고 가정합니다. 실제 커밋 해시로 바꾸고, 저장소가 태그 푸시를 배포 신호로 사용한다면 푸시 전에 배포 대상을 확인합니다.

```bash
git fetch origin
git show --no-patch a1b2c3d
git tag -a v1.0.0 a1b2c3d -m "Release v1.0.0"
git push origin v1.0.0
```

### 선택 배포: `release`에서 필요한 변경만 검증하기

`master`에 로그인, 결제, 채팅이 모두 들어갔지만 로그인만 배포한다고 가정합니다. `production`이 현재 운영 코드와 일치한다면 최신 `origin/production`에서 `release/login`을 만듭니다. `production`이 실제 배포보다 앞서 있다면 배포 기록의 커밋이나 태그에서 시작합니다.

```bash
git fetch origin
git switch -c release/login origin/production
git log --oneline HEAD..origin/master
```

`cherry-pick`은 지정한 커밋의 변경을 현재 브랜치에 새 커밋으로 적용합니다. 예를 들어 로그인 PR이 `master`에 `b7c8d9e`로 squash 병합됐고 별도 선행 변경이 없다면 다음과 같이 가져옵니다. 예시 해시는 가져올 커밋의 실제 해시로 바꿉니다.

```bash
git show b7c8d9e
git cherry-pick -x b7c8d9e
git diff origin/production...HEAD
git push -u origin release/login
```

`-x`는 충돌 없이 적용할 때 원본 커밋 해시를 기록합니다. 여러 커밋이 필요하면 의존하는 변경부터 순서대로 적용합니다. 충돌 없이 적용돼도 공통 설정이나 마이그레이션이 빠져 있을 수 있으므로 배포 후보 자체를 테스트합니다. 기능 브랜치를 통째로 병합하면 그 브랜치가 기반으로 삼은 다른 변경도 들어올 수 있습니다.

`stage`에 결제나 채팅이 들어 있다면 그 상태로는 로그인만 담긴 후보를 검증할 수 없습니다. `release/login`의 빌드를 별도 검증 환경에 배포하거나, 공용 검증 환경에 해당 빌드를 따로 올립니다. 검증이 끝나면 `release/login` → `production` PR을 보냅니다. `production`의 미배포 변경이 병합 결과에 섞인다면, 변경 범위를 다시 합의하거나 브랜치 병합 대신 검증한 후보를 지정해 배포합니다.

선택 배포는 이번 배포의 변경 범위를 줄이는 대신, 대상 브랜치별 테스트와 커밋 추적이 필요합니다. 같은 기능이 `master`에 이미 있다면 원본을 다시 적용하지 않습니다. `release/login`에서 추가로 고친 내용만 개발 브랜치에 반영합니다.

### 긴급 수정: 실제 운영 버전에서 `hotfix` 만들기

운영에서 로그인 장애가 났다고 가정합니다. 다음 릴리스 기능을 함께 내보내지 않도록 현재 배포된 커밋에서 수정합니다. 예를 들어 운영 버전이 `v1.0.0`이라면 다음과 같이 작업합니다.

```bash
git fetch origin tag v1.0.0
git switch -c hotfix/login-error v1.0.0
```

수정 범위를 장애 원인으로 제한하고 재현 테스트를 실행합니다. 예시에서 수정한 파일을 커밋하고 작업 브랜치를 원격에 올립니다.

```bash
git add src/login.js
git commit -m "fix: 로그인 오류 수정"
git push -u origin hotfix/login-error
```

`hotfix/login-error` → `production` PR을 만들고, 필수 검사와 승인을 거친 뒤 배포합니다. `production`에 미배포 변경이 있다면 병합 결과를 그대로 배포하지 않습니다. 운영 태그에서 만든 수정 후보만 검증해 배포하고, 수정은 별도로 `production`에도 반영합니다. 실제 배포한 커밋에는 `v1.0.1`처럼 새 태그를 붙입니다.

그다음 `master`와 `stage`, 이미 진행 중인 릴리스 브랜치에 수정이 들어갔는지 확인합니다. 전체 운영 이력을 병합해도 되는 브랜치에는 병합 PR을 보냅니다. 다른 변경이 섞이면 안 되는 후보에는 수정 커밋만 `cherry-pick`하고 다시 검증합니다. 운영에만 수정하면 다음 릴리스에 같은 버그가 남을 수 있습니다.

## 작업 브랜치 갱신과 충돌 해결

`git branch --show-current`로 현재 브랜치를 확인하고, `git branch -a`로 로컬과 원격 추적 브랜치를 확인합니다. 작업 중인 브랜치에 최신 `master`를 반영할 때는 다른 사람과 공유한 커밋을 다시 쓰지 않는 `merge`를 사용할 수 있습니다. GitHub Flow에서는 `origin/master` 대신 `origin/main`을 사용합니다.

```bash
git fetch origin
git switch feature/login
git merge origin/master
```

아직 공유하지 않은 작업 커밋을 새 기준점 위로 옮기려면 `merge` 대신 `git rebase origin/master`를 사용합니다. Rebase는 작업 커밋의 해시를 바꾸므로 공유 브랜치에서는 먼저 팀과 합의합니다.

충돌이 나면 `git status`로 충돌 파일을 확인합니다. 파일에서 `<<<<<<<`, `=======`, `>>>>>>>` 표시를 찾고 양쪽 변경을 검토한 뒤, 원하는 결과를 남기고 표시를 지웁니다. 파일을 `git add`로 등록한 다음 작업에 맞는 명령으로 이어갑니다.

| 진행 중인 작업 | 해결 후 계속하기 | 취소하기 |
| --- | --- | --- |
| Merge | `git merge --continue` | `git merge --abort` |
| Rebase | `git rebase --continue` | `git rebase --abort` |
| Cherry-pick | `git cherry-pick --continue` | `git cherry-pick --abort` |

충돌을 해결하는 동안 편집한 내용도 취소 과정에서 사라질 수 있습니다. 필요한 수정은 따로 보관한 뒤 `--abort`를 실행합니다.

PR이 병합되면 대상 브랜치를 갱신한 뒤 작업 브랜치를 정리합니다. 다른 사람이 사용 중이거나 열린 PR의 대상인 원격 브랜치는 삭제하지 않습니다. 다음 예는 `main`에 병합된 작업 브랜치를 정리하며, 원격 브랜치가 이미 삭제됐다면 마지막 명령은 건너뜁니다.

```bash
git switch main
git pull --ff-only origin main
git branch -d feature/login
git push origin --delete feature/login
```

Squash 또는 rebase 병합 뒤에는 `git branch -d`가 원래 커밋을 병합되지 않은 것으로 판단해 삭제를 거부할 수 있습니다. 강제로 삭제하기 전에 PR이 병합됐는지, 병합 후 로컬에 추가한 커밋이 없는지 확인합니다. 필요한 커밋을 이미 잃어버렸다면 [Git 복구 가이드](./git-recovery-guide)에서 복구 방법을 확인할 수 있습니다.
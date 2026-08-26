---
categories: [Git]
title: Git 완전 가이드 — 기초부터 브랜치 전략, GitHub Flow, 복구까지
description: Git 기초 개념과 명령어부터 master/stage/production 브랜치 전략, GitHub Flow 실전 사례, 실수 복구 방법까지 하나의 글로 정리합니다.
created: 2026-05-19
tags: [Git|orange, GitHub|orange, 브랜치전략|teal, 버전관리|teal]
platform: Git
readingTime: 40
---

# Git 완전 가이드

Git 기초부터 브랜치 전략, GitHub Flow 실전, 사고 복구까지 하나의 글로 정리합니다.

---

## 1부. Git이란? 기본 개념과 명령어

### Git이 뭔가요?

한마디로 **코드의 변경 이력을 관리하는 도구**입니다.

이런 경험 있으실 거예요.

```
보고서_최종.docx
보고서_최종_진짜최종.docx
보고서_최종_이게진짜.docx
```

코드도 똑같습니다. 기능을 추가하다 망가지면 "어제 상태로 돌아가고 싶다"는 순간이 옵니다.
Git은 이 문제를 해결합니다. **언제든 특정 시점으로 되돌아갈 수 있고, 누가 무엇을 왜 바꿨는지 다 기록**됩니다.

여기에 더해 여러 명이 같은 코드를 동시에 작업해도 충돌 없이 합칠 수 있게 해줍니다. 그래서 협업의 필수 도구입니다.

---

### Git vs GitHub

자주 헷갈리는 부분입니다.

| | 설명 |
|---|------|
| **Git** | 내 컴퓨터에서 버전을 관리하는 **프로그램** |
| **GitHub** | Git 저장소를 인터넷에 올려두는 **웹 서비스** |

비유하자면 Git은 카메라, GitHub는 사진을 올리는 클라우드입니다.
GitLab, Bitbucket도 GitHub와 같은 역할의 서비스입니다.

---

### 핵심 개념 4가지

명령어를 이해하려면 이 4개 공간을 알아야 합니다.

```
[작업 디렉터리] → git add → [스테이징] → git commit → [로컬 저장소] → git push → [원격 저장소]
```

1. **작업 디렉터리 (Working Directory)** — 실제로 파일을 수정하는 공간
2. **스테이징 (Staging Area)** — "이번에 기록할 변경사항"을 골라 담는 임시 바구니
3. **로컬 저장소 (Local Repository)** — 내 컴퓨터에 저장된 커밋 기록
4. **원격 저장소 (Remote Repository)** — GitHub 등 인터넷에 올라간 저장소

> **스테이징이 왜 필요한가요?**
> 수정한 파일이 10개라도, 그중 관련 있는 3개만 골라서 하나의 커밋으로 묶을 수 있습니다.
> 커밋을 의미 단위로 깔끔하게 만드는 장치입니다.

---

### 가장 먼저 할 설정

새 컴퓨터에서 딱 한 번만 하면 됩니다. 커밋에 기록될 이름과 이메일입니다.

```bash
git config --global user.name "내 이름"
git config --global user.email "my@email.com"

# 확인
git config --list
```

---

### 기본 흐름 — 이 5개가 90%

#### 1. git init / git clone — 시작하기

```bash
# 새 프로젝트를 Git으로 관리 시작
git init

# 이미 있는 GitHub 저장소를 내 컴퓨터로 복제
git clone https://github.com/user/repo.git
```

#### 2. git status — 지금 상태 보기

가장 자주 치게 될 명령어입니다. 막히면 일단 이걸 칩니다.

```bash
git status
```

#### 3. git add — 기록할 변경사항 고르기

```bash
git add index.html      # 특정 파일만
git add .               # 변경된 전체
```

#### 4. git commit — 변경사항 기록

```bash
git commit -m "feat: 로그인 페이지 추가"
```

#### 5. git push / git pull — 원격과 주고받기

```bash
git push origin main    # 내 커밋을 GitHub에 올리기
git pull origin main    # GitHub의 최신 내용을 내려받기
```

---

### 전체 흐름 한눈에

```bash
git clone https://github.com/user/repo.git
cd repo
git status
git add .
git commit -m "feat: 메인 페이지 디자인 수정"
git push origin main
```

---

### 커밋 메시지 컨벤션

| 접두사 | 의미 |
|--------|------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 포맷 (기능 변화 없음) |
| `refactor` | 리팩터링 |
| `test` | 테스트 코드 |
| `chore` | 빌드/설정 등 잡일 |

---

### 자주 쓰는 명령어 요약

| 명령어 | 하는 일 |
|--------|---------|
| `git init` | 현재 폴더를 Git 저장소로 시작 |
| `git clone <url>` | 원격 저장소 복제 |
| `git status` | 현재 변경 상태 확인 |
| `git add .` | 변경사항 스테이징 |
| `git commit -m "..."` | 변경사항 기록 |
| `git push origin main` | 원격에 올리기 |
| `git pull origin main` | 원격에서 내려받기 |
| `git log --oneline` | 커밋 이력 보기 |
| `git branch` | 브랜치 목록 |
| `git switch <브랜치>` | 브랜치 이동 |

---

## 2부. 브랜치 전략 — master / stage / production

실무에서 자주 쓰는 3단계 브랜치 전략입니다. 핵심은 단순합니다.

```
master      → 개발 통합 브랜치
stage       → QA / 스테이징 브랜치
production  → 운영 브랜치
```

기본 흐름은 이렇게 흘러갑니다.

```
feature/* → master → stage → production
```

---

### 기능 개발

항상 최신 `master`에서 feature 브랜치를 생성합니다.

```bash
git checkout master
git pull origin master
git checkout -b feature/login
```

작업이 끝나면 커밋하고 푸시한 뒤, `feature/login → master`로 PR을 올립니다.

```bash
git add .
git commit -m "feat: 로그인 기능 추가"
git push origin feature/login
```

---

### 스테이징 배포

`master`에 모인 변경사항을 `stage`로 올려 QA를 진행합니다.

```bash
git checkout stage
git pull origin stage
git merge origin/master
git push origin stage
```

PR로 운영한다면 `master → stage`로 올립니다.

---

### 운영 배포

QA가 끝난 `stage`를 `production`으로 반영합니다.

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

---

### 특정 기능만 운영 배포할 때 — release 브랜치

`master`에 `login`, `payment`, `chat`이 다 들어 있는데 운영에는 **`login`만** 배포해야 하는 상황이 있습니다. 이때는 `release` 브랜치를 씁니다.

`production` 기준으로 release 브랜치를 만듭니다.

```bash
git checkout production
git pull origin production
git checkout -b release/login
```

필요한 기능만 가져옵니다. feature 브랜치가 살아있다면 머지, 특정 커밋만 필요하면 cherry-pick 합니다.

```bash
# feature 브랜치 통째로
git merge origin/feature/login

# 또는 특정 커밋만
git cherry-pick <commit_hash>

git push origin release/login
```

검증 후 운영까지 올립니다.

```
release/login → stage   (테스트)
release/login → production   (테스트 완료 후)
```

---

### Hotfix Flow

운영에서 긴급 장애가 발생하면 `production`에서 바로 `hotfix` 브랜치를 만듭니다.

```bash
git checkout production
git pull origin production
git checkout -b hotfix/login-error
```

수정 후 푸시합니다.

```bash
git add .
git commit -m "fix: 로그인 오류 수정"
git push origin hotfix/login-error
```

**핵심은 세 곳 모두에 반영하는 것**입니다. 운영에만 고치고 끝내면 다음 배포 때 버그가 되살아납니다.

```
hotfix/login-error → production   (긴급 반영)
hotfix/login-error → stage        (동기화)
hotfix/login-error → master       (동기화)
```

---

### 브랜치 보호 규칙

| 브랜치 | 규칙 |
|--------|------|
| `master` | PR 권장 |
| `stage` | PR 필수 |
| `production` | PR 필수 + 승인 필수 + 직접 push 금지 |

`production`은 절대 직접 push하지 않습니다. 사고의 90%가 여기서 납니다.

---

### 자주 쓰는 보조 명령어

```bash
# 현재 브랜치 확인
git branch
git branch -a              # 원격 포함 전체

# 브랜치 전환
git switch master          # checkout보다 안전한 신규 명령
git switch -c feature/new  # 생성 + 전환

# 원격 최신 상태 가져오기 (머지 없이)
git fetch origin

# master 최신 내용을 현재 feature에 반영
git switch feature/login
git merge origin/master
# 또는 히스토리 깔끔하게
git rebase origin/master

# 작업 중인 변경 잠시 치워두기
git stash
git stash pop

# 브랜치 삭제
git branch -d feature/login        # 로컬
git push origin --delete feature/login  # 원격
```

---

### 머지 충돌 해결

`stage`나 `production`에 머지할 때 충돌이 나면:

```bash
git merge origin/master
# CONFLICT 발생

# 1. 충돌 파일 확인
git status

# 2. 파일 열어서 <<<<<<< ======= >>>>>>> 직접 수정

# 3. 해결 후 스테이징
git add <충돌_파일>

# 4. 머지 완료
git commit

# 머지 자체를 취소하고 싶다면
git merge --abort
```

---

### 브랜치 전략 최종 정리

세 가지 흐름만 기억하면 됩니다.

```
일반 배포:
feature/* → master → stage → production

선택 배포:
production → release/* → stage 검증 → production

긴급 수정:
production → hotfix/* → production → stage → master
```

원칙:

1. feature는 항상 `master`에서 생성하고, 작업 후 `master`로 PR
2. `stage`는 `master`를 검증하는 브랜치
3. `production`은 운영 전용, **직접 push 금지**
4. 특정 기능만 배포할 땐 `release` 브랜치
5. 운영 긴급 수정은 `hotfix` 브랜치
6. `production`에 반영한 내용은 반드시 `stage`와 `master`에도 동기화

---

## 3부. GitHub Flow와 Pull Request

### GitHub Flow란?

GitHub Flow는 단일 `main` 브랜치를 중심으로 작동하는 단순한 협업 방식입니다.

```
main 브랜치 → feature 브랜치 분기 → 작업 → PR → 리뷰 → main 병합
```

별도의 develop, release 브랜치 없이 PR 하나로 리뷰와 병합을 처리합니다. 빠른 릴리스 주기를 가진 팀에 잘 맞습니다.

Git Flow와 비교하면:

| | Git Flow | GitHub Flow |
|---|---|---|
| 브랜치 수 | main, develop, release, feature, hotfix | main + feature |
| 릴리스 관리 | 명시적 release 브랜치 | PR로 바로 병합 |
| 적합한 환경 | 버전 관리가 엄격한 대규모 프로젝트 | 빠른 배포 주기, 소규모~중규모 팀 |

---

### PR(Pull Request) 기본 흐름

PR은 "이 브랜치를 저 브랜치에 합쳐도 되냐"고 묻는 요청입니다.

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

병합이 완료되면 로컬을 업데이트합니다.

```bash
git switch main
git pull origin main
```

---

### PR 병합 옵션 3가지

병합 방식은 팀 컨벤션에 따라 고릅니다.

| 옵션 | 동작 | 언제 쓰나 |
|------|------|----------|
| **Merge commit** | 모든 커밋 + 병합 커밋(M) 추가 | 이력을 그대로 남기고 싶을 때 |
| **Squash and merge** | 여러 커밋을 하나로 압축 후 병합 | feature 커밋이 잡다할 때 정리용 |
| **Rebase and merge** | 커밋을 직렬로 이어 붙임 | 병합 커밋 없이 선형 이력을 유지할 때 |

Squash는 커밋 이력이 사라져 추후 추적이 어렵고, Rebase는 충돌이 복잡해질 수 있어 팀 합의가 필요합니다.

---

### 코드 리뷰

PR 페이지의 [Files changed] 탭에서 변경된 코드를 줄 단위로 확인하고 댓글을 달 수 있습니다. 모든 댓글 작성이 끝나면 [Finish your review]로 최종 제출합니다.

리뷰 타입:

| 타입 | 의미 |
|------|------|
| Comment | 단순 의견, 승인 아님 |
| Approve | 병합 승인 |
| Request changes | 수정 요구, 해결 전까지 병합 블록 가능 |

리뷰는 지적보다 제안 형식으로 쓰는 게 좋습니다. "이렇게 하면 안 됨"보다 "이렇게 하면 더 좋을 것 같습니다"가 협업에 도움이 됩니다.

---

### 브랜치 보호 규칙

GitHub 저장소 [Settings] → [Rules] → [Rulesets]에서 `main` 브랜치 보호 규칙을 설정합니다.

자주 쓰는 규칙:

- **Require a pull request before merging**: 직접 push 금지, PR로만 병합 가능
- **Required approvals**: 지정한 수 이상의 승인이 있어야 병합 가능
- **Require status checks to pass**: CI 테스트 통과 후 병합 가능
- **Require conversation resolution**: 리뷰 댓글이 모두 해결돼야 병합 가능

무료 계정은 공개(Public) 저장소에서만 브랜치 규칙을 사용할 수 있습니다.

---

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

---

### 이슈로 작업 관리하기

[Issues] → [New issue]에서 이슈를 생성하면 번호(#1, #2...)가 자동 부여됩니다. 이슈를 기준으로 브랜치를 만들고 PR과 연결하면 작업 흐름이 명확해집니다.

커밋 메시지나 PR 본문에 `close #번호`를 쓰면 병합 시 이슈가 자동으로 닫힙니다.

```bash
git commit -m "feat: 로그인 오류 수정. close #12"
```

`close` 대신 `fix`, `resolve`도 동일하게 동작합니다.

**라벨(Label)**: 이슈/PR의 성격을 구분합니다. `bug`, `enhancement`, `docs` 등 기본 제공 라벨 외에 커스텀 라벨도 만들 수 있습니다.

**마일스톤(Milestone)**: 여러 이슈를 묶어 마감일과 목표를 관리합니다. 스프린트 단위 작업에 유용합니다.

---

## 4부. 삽 떴을 때 살리는 법 — Git 복구 완전정복

> **가장 먼저 알아둘 것:** Git에서 한 번이라도 `commit`된 것은 거의 다 복구됩니다.
> 진짜 위험한 건 커밋 안 한 변경사항을 `reset --hard`나 `checkout`으로 날리는 경우뿐입니다.
> 사고 났을 때 가장 먼저 할 일은 **추가 명령어를 멈추고 상황 파악**하는 것입니다.

---

### 핵심 무기 3가지

#### git reflog — Git의 블랙박스

`HEAD`가 움직인 모든 기록이 남습니다. reset, rebase, checkout, commit 전부요.

```bash
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# e4f5g6h HEAD@{1}: commit: feat: 결제 기능
# i7j8k9l HEAD@{2}: checkout: moving from main to feature
```

#### git reset — 시간을 되돌리기 (로컬 한정)

| 옵션 | 커밋 | 스테이징 | 작업 파일 | 용도 |
|------|------|---------|----------|------|
| `--soft` | 취소 | **유지** | **유지** | 커밋만 다시 하고 싶을 때 |
| `--mixed` (기본) | 취소 | 취소 | **유지** | 스테이징부터 다시 |
| `--hard` | 취소 | 취소 | **삭제** ⚠️ | 전부 없던 일로 (위험) |

#### git revert — 안전하게 되돌리기 (공유 브랜치용)

이미 push해서 공유된 커밋은 `reset`으로 지우면 안 됩니다. `revert`는 "그 커밋을 취소하는 새 커밋"을 만들어 히스토리를 깨지 않습니다.

```bash
git revert <commit_hash>
```

> **철칙:** push 전이면 `reset`, push 후면 `revert`.

---

### 상황별 복구 매뉴얼

#### 커밋 메시지를 잘못 썼다 (push 전)

```bash
git commit --amend -m "fix: 올바른 메시지"
```

push까지 했다면, 혼자 쓰는 브랜치에서만:

```bash
git commit --amend -m "fix: 올바른 메시지"
git push --force-with-lease origin feature/login
```

> `--force` 대신 `--force-with-lease`를 쓰세요. 남이 그 사이 push했으면 거부돼서 사고를 막아줍니다.

---

#### 마지막 커밋에 파일을 빠뜨렸다

```bash
git add 빠진파일.js
git commit --amend --no-edit
```

---

#### 방금 한 커밋을 취소하고 싶다 (push 전)

```bash
# 변경 내용은 살리고 커밋만 취소
git reset --soft HEAD~1

# 스테이징까지 풀고 다시 시작
git reset --mixed HEAD~1
```

---

#### push한 커밋을 되돌려야 한다

```bash
# 특정 커밋 하나 취소
git revert <commit_hash>

# 최근 3개 커밋 취소
git revert HEAD~2..HEAD

# 머지 커밋 되돌리기
git revert -m 1 <merge_commit_hash>
```

---

#### reset --hard로 커밋을 날렸다 ⚠️

```bash
# 1. reflog로 날아간 커밋 찾기
git reflog

# 2. 해당 커밋으로 복구
git reset --hard e4f5g6h
```

안전하게 확인하고 싶다면 브랜치를 새로 만들어서:

```bash
git branch recovered e4f5g6h
git switch recovered
```

---

#### 잘못된 브랜치에 커밋했다

```bash
# 1. 커밋 해시 확인
git log --oneline

# 2. 올바른 브랜치 만들고 커밋 가져오기
git switch -c feature/login
git cherry-pick <commit_hash>

# 3. 잘못된 브랜치에서 제거
git switch main
git reset --hard HEAD~1   # push 전
# push 했다면: git revert <hash>
```

---

#### 커밋 안 한 변경사항을 날렸다

`git restore .`나 `git checkout .`으로 날린 경우, 커밋/스테이징 안 된 변경은 reflog에 남지 않아 복구가 어렵습니다.

```bash
# 한 번이라도 git add 했었다면
git fsck --lost-found

# IDE의 로컬 히스토리 기능 확인 (VS Code, IntelliJ 등)
```

> 그래서 조금이라도 작업이 쌓이면 일단 커밋하는 습관이 중요합니다.
> `git commit -m "wip"` 한 줄이 미래의 나를 구합니다.

---

#### 충돌이 났다

```bash
# 1. 충돌 파일 확인
git status

# 2. 파일 열어서 마커 직접 정리
# <<<<<<< HEAD / 내 코드 / ======= / 상대 코드 / >>>>>>> branch

# 3. 정리 후 스테이징
git add 충돌파일.js

# 4. 진행 중이던 작업 완료
git commit            # merge 중이었으면
git rebase --continue # rebase 중이었으면

# 전부 취소하고 싶다면
git merge --abort
git rebase --abort
git cherry-pick --abort
```

---

#### rebase 하다가 꼬였다

```bash
# 진행 중인 rebase 즉시 취소
git rebase --abort

# 이미 끝났는데 결과가 잘못됐다면
git reflog
git reset --hard HEAD@{n}   # rebase 직전 시점
```

---

#### 강제 push로 원격 히스토리를 날렸다

```bash
# 그 커밋을 받았던 사람이 있다면, 그 사람 로컬 reflog에서 복구
git reflog
git branch recovered <lost_hash>
git push origin recovered
```

> 예방이 최선입니다. `main`/`production`은 **force push 금지 + 브랜치 보호**를 걸어두세요.

---

#### stash 한 걸 잃어버렸다

```bash
git fsck --no-reflogs | grep commit
git stash apply <stash_commit_hash>
```

---

#### 파일 하나만 특정 커밋 시점으로 되돌리고 싶다

```bash
git restore --source=<commit_hash> 파일.js
```

---

#### 민감 정보를 커밋했다

단순 삭제 커밋으로는 히스토리에 영원히 남습니다.

```bash
pip install git-filter-repo
git filter-repo --path secrets.env --invert-paths
git push origin --force --all
```

> 한 번 push된 비밀 키는 이미 노출된 것으로 간주하고 **반드시 재발급**하세요.

---

### 예방이 복구보다 낫다

```bash
# 작업 쌓이면 일단 커밋
git commit -m "wip: 작업 중"

# 위험한 작업 전 백업 브랜치
git branch backup-before-rebase

# force는 항상 --force-with-lease로
git push --force-with-lease

# main/production은 브랜치 보호 설정

# reset --hard 전에 git status로 한 번 더 확인
```

---

### 응급 치트시트

| 망한 상황 | 살리는 명령어 |
|----------|--------------|
| 커밋 메시지 오타 (push 전) | `git commit --amend` |
| 커밋에 파일 빠뜨림 | `git add . && git commit --amend --no-edit` |
| 방금 커밋 취소 (push 전) | `git reset --soft HEAD~1` |
| push한 커밋 되돌리기 | `git revert <hash>` |
| `reset --hard`로 커밋 날림 | `git reflog` → `git reset --hard HEAD@{n}` |
| 잘못된 브랜치에 커밋 | `git cherry-pick` + `git reset` |
| rebase 꼬임 | `git rebase --abort` |
| 충돌 전부 취소 | `git merge --abort` |
| stash 날림 | `git fsck --no-reflogs \| grep commit` |
| 파일 하나만 복원 | `git restore --source=<hash> 파일` |
| 커밋 안 한 변경 날림 | `git fsck --lost-found` (+ IDE 로컬 히스토리) |
| 비밀키 커밋 | `git filter-repo` + **키 재발급** |

---

## 한 줄 정리

> Git 기초는 `add → commit → push`. 브랜치 전략은 feature → master → stage → production. 급할 땐 hotfix로 운영 먼저 고치고 뒤로 동기화. 사고 나면 명령어 더 치지 말고 `git reflog`부터 보자. push 전엔 `reset`, push 후엔 `revert`.

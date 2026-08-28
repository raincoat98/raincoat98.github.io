---
categories: [Git]
title: Git 복구 가이드 — 실수로 날린 커밋 되살리기
description: 커밋 메시지 오타, 잘못된 브랜치에 커밋, reset --hard로 커밋 날림, rebase 꼬임, stash 분실까지. git reflog와 reset/revert로 사고를 복구하는 상황별 매뉴얼과 응급 치트시트를 정리합니다.
created: 2026-05-19
tags: [Git|orange, 버전관리|teal, 복구|teal]
platform: Git
readingTime: 13
---

# Git 복구 가이드

커밋을 날렸다, rebase가 꼬였다, 잘못된 브랜치에 올렸다. Git에서 실수는 흔합니다. 이 글은 그런 사고를 되돌리는 상황별 매뉴얼입니다.

다룰 내용:

- 복구의 핵심 도구: reflog, reset, revert
- 커밋 실수 · reset --hard 사고 · rebase 꼬임 복구
- push 후 되돌리기, 민감 정보 제거
- 응급 치트시트

> **가장 먼저 알아둘 것:** Git에서 한 번이라도 `commit`된 것은 거의 다 복구됩니다.
> 진짜 위험한 건 커밋 안 한 변경사항을 `reset --hard`나 `checkout`으로 날리는 경우뿐입니다.
> 사고가 났을 때 가장 먼저 할 일은 **추가 명령어 입력을 멈추고 상황을 파악**하는 것입니다.

## 복구의 핵심 무기 3가지

### git reflog — Git의 블랙박스

`HEAD`가 움직인 모든 기록이 남습니다. reset, rebase, checkout, commit 전부요.

```bash
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# e4f5g6h HEAD@{1}: commit: feat: 결제 기능
# i7j8k9l HEAD@{2}: checkout: moving from main to feature
```

### git reset — 시간 되돌리기 (로컬 전용)

| 옵션 | 커밋 | 스테이징 | 작업 파일 | 용도 |
|------|------|---------|----------|------|
| `--soft` | 취소 | **유지** | **유지** | 커밋만 다시 하고 싶을 때 |
| `--mixed` (기본) | 취소 | 취소 | **유지** | 스테이징부터 다시 시작 |
| `--hard` | 취소 | 취소 | **삭제** ⚠️ | 전부 없던 일로 (위험) |

### git revert — 안전한 되돌리기 (공유 브랜치용)

이미 push해서 공유된 커밋은 `reset`으로 지우면 안 됩니다. `revert`는 **"그 커밋을 취소하는 새 커밋"**을 만들어 히스토리를 깨지 않습니다.

```bash
git revert <commit_hash>
```

> **철칙:** push 전이면 `reset`, push 후면 `revert`.

## 상황별 복구 매뉴얼

### 커밋 메시지를 잘못 썼다 (push 전)

```bash
git commit --amend -m "fix: 올바른 메시지"
```

push까지 했다면, **혼자 쓰는 브랜치에서만**:

```bash
git commit --amend -m "fix: 올바른 메시지"
git push --force-with-lease origin feature/login
```

> `--force` 대신 `--force-with-lease`를 쓰세요. 남이 그 사이 push했으면 거부돼서 사고를 막아줍니다.

### 마지막 커밋에 파일을 빠뜨렸다

```bash
git add 빠진파일.js
git commit --amend --no-edit
```

### 방금 한 커밋을 취소하고 싶다 (push 전)

```bash
# 변경 내용은 살리고 커밋만 취소
git reset --soft HEAD~1

# 스테이징까지 풀고 다시 시작
git reset --mixed HEAD~1
```

### push한 커밋을 되돌려야 한다

```bash
# 특정 커밋 하나 취소
git revert <commit_hash>

# 최근 3개 커밋 취소
git revert HEAD~2..HEAD

# 머지 커밋 되돌리기
git revert -m 1 <merge_commit_hash>
```

### reset --hard로 커밋을 날렸다 ⚠️

```bash
# 1. reflog로 날아간 커밋 찾기
git reflog

# 2. 해당 커밋으로 복구
git reset --hard e4f5g6h
```

안전하게 확인하고 싶다면 새 브랜치를 만들어 복구하는 방법도 있습니다.

```bash
git branch recovered e4f5g6h
git switch recovered
```

### 잘못된 브랜치에 커밋했다

**상황.** 실수로 `main`에 작업 커밋을 했습니다. `feature/login`으로 옮겨야 합니다.

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

### 커밋 안 한 변경사항을 날렸다

`git restore .`나 `git checkout .`으로 날린 경우, 커밋/스테이징 안 된 변경은 reflog에 남지 않아 복구가 어렵습니다.

```bash
# 한 번이라도 git add 했었다면 시도
git fsck --lost-found

# IDE의 로컬 히스토리 기능 확인 (VS Code, IntelliJ 등)
```

> 그래서 조금이라도 작업이 쌓이면 일단 커밋하는 습관이 중요합니다.
> `git commit -m "wip"` 한 줄이 미래의 나를 구합니다.

**예시.** 파일을 열심히 고치다 `git checkout .`를 눌러 통째로 날렸다? 커밋도 스테이징도 안 된 상태면 Git이 기억하지 못합니다. 에디터의 로컬 히스토리(오토세이브)가 유일한 구원입니다. 그래서 "작업 중간 저장"이 중요한 겁니다.

### 충돌이 났다

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

### rebase 하다가 꼬였다

```bash
# 진행 중인 rebase 즉시 취소
git rebase --abort

# 이미 끝났는데 결과가 잘못됐다면
git reflog
git reset --hard HEAD@{n}   # rebase 직전 시점
```

### 강제 push로 원격 히스토리를 날렸다

```bash
# 그 커밋을 받았던 사람이 있다면, 그 사람 로컬 reflog에서 복구
git reflog
git branch recovered <lost_hash>
git push origin recovered
```

> 예방이 최선입니다. `main`/`production`은 **force push 금지 + 브랜치 보호**를 걸어두세요.

### stash 한 걸 잃어버렸다

```bash
git fsck --no-reflogs | grep commit
git stash apply <stash_commit_hash>
```

### 파일 하나만 특정 커밋 시점으로 되돌리고 싶다

```bash
git restore --source=<commit_hash> 파일.js
```

**예시.** `config.js`가 3개 커밋 전엔 정상이었는데, 그 뒤에 망가졌다면:

```bash
git log --oneline -- config.js   # 해당 파일 변경 이력만 보기
git restore --source=<과거_commit_hash> config.js
```

### 민감 정보를 커밋했다

단순히 삭제하는 커밋으로는 히스토리에 영원히 남습니다.

```bash
pip install git-filter-repo
git filter-repo --path secrets.env --invert-paths
git push origin --force --all
```

> 한 번 push된 비밀 키는 이미 노출된 것으로 간주하고 **반드시 재발급**하세요.

## 예방이 복구보다 낫다

```bash
# 작업이 쌓이면 일단 커밋
git commit -m "wip: 작업 중"

# 위험한 작업 전 백업 브랜치
git branch backup-before-rebase

# force는 항상 --force-with-lease로
git push --force-with-lease

# main/production은 브랜치 보호 설정

# reset --hard 전에 git status로 한 번 더 확인
```

## 응급 치트시트

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

## 정리

사고가 나면 명령어를 더 치지 말고 `git reflog`부터 보세요. push 전엔 `reset`, push 후엔 `revert`를 기억하면 대부분의 사고를 돌릴 수 있습니다. 브랜치 운영 전반이 궁금하다면 [Git 브랜치 전략과 GitHub Flow](./git-branch-guide)를 보세요.
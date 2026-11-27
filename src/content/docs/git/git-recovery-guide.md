---
categories: [Git]
title: Git 복구 가이드
description: Git에서 사라진 커밋을 reflog로 찾고, 공유 여부와 작업 상태에 따라 커밋이나 파일을 복구하는 방법을 설명합니다.
created: 2026-05-19
tags: [Git|orange, 버전관리|teal, 복구|teal]
platform: Git
readingTime: 6
---

# Git 복구 가이드

복구 명령을 실행하기 전에 `git status`로 진행 중인 작업을 확인합니다. 커밋을 되돌려야 한다면 먼저 다른 사람이 그 커밋을 받았는지 확인합니다. 공유된 브랜치에서는 기존 커밋을 지우기보다 변경을 취소하는 새 커밋을 만드는 편이 안전합니다.

## 사라진 커밋 찾기

`git reflog`는 로컬 저장소에서 `HEAD`나 브랜치가 가리키던 위치를 기록합니다. `reset`이나 `rebase`로 커밋이 현재 브랜치에서 보이지 않으면 이 기록을 확인합니다.

```bash
git reflog
git show <찾은-커밋>
git branch recovered <찾은-커밋>
```

해시를 찾으면 바로 `reset --hard`를 실행하지 않고 `recovered` 브랜치로 커밋을 먼저 보존합니다. 이 과정은 현재 브랜치와 작업 파일을 바꾸지 않습니다. reflog는 로컬 기록이고 만료될 수 있으므로, 강제 푸시로 커밋이 사라졌다면 해당 커밋을 받은 팀원의 저장소도 확인합니다.

## 아직 공유하지 않은 커밋 수정하기

마지막 커밋에 파일을 빠뜨렸다면 필요한 파일만 스테이징하고 `git diff --cached`로 함께 들어갈 변경을 확인합니다. `--no-edit`는 기존 메시지를 유지합니다.

```bash
git add src/login.js
git diff --cached
git commit --amend --no-edit
```

메시지만 바꾸려면 `git commit --amend -m "fix: 로그인 오류 수정"`을 사용합니다. 다른 변경이 이미 스테이징되어 있으면 함께 들어갈 수 있으므로 먼저 확인합니다.

커밋 자체를 취소해야 한다면 필요한 상태에 맞는 `reset` 옵션을 하나만 사용합니다.

| 명령 | 스테이징 영역 | 작업 파일 |
| --- | --- | --- |
| `git reset --soft HEAD~1` | 유지합니다. | 유지합니다. |
| `git reset --mixed HEAD~1` | 이전 커밋에 맞춥니다. | 유지합니다. |
| `git reset --hard HEAD~1` | 이전 커밋에 맞춥니다. | 대상 커밋으로 덮어씁니다. |

`--hard`는 커밋하지 않은 변경까지 잃을 수 있습니다. 커밋만 취소하려는 경우에는 `--soft`나 `--mixed`를 사용합니다.

### 잘못된 브랜치에 마지막 커밋을 만든 경우

아직 공유하지 않은 마지막 커밋을 `main`에서 새 작업 브랜치로 옮기는 예입니다. 커밋하지 않은 변경이 없는지 확인한 뒤 작업 브랜치를 먼저 만듭니다.

```bash
git status --short
git branch feature/login
git reset --keep HEAD~1
git switch feature/login
```

이미 작업 브랜치가 있다면 그 브랜치에서 `git cherry-pick <옮길-커밋>`을 실행해 변경을 복사한 뒤 원래 브랜치를 정리합니다. 원래 커밋을 공유한 상태라면 `reset` 대신 `revert`를 사용합니다.

## 공유한 커밋 되돌리기

`git revert`는 지정한 커밋의 변경을 취소하는 새 커밋을 만듭니다. 기존 커밋을 받은 팀원이 있어도 히스토리를 다시 쓰지 않습니다.

```bash
git revert <취소할-커밋>
```

병합 커밋은 기준으로 남길 부모를 `-m`으로 지정합니다. 예를 들어 `git revert -m 1 <병합-커밋>`은 첫 번째 부모를 기준으로 되돌립니다. 첫 번째 부모가 유지할 브랜치인지 먼저 확인합니다.

## 충돌을 정리하거나 작업 중단하기

`git status`에서 충돌 파일과 진행 중인 작업을 확인합니다. 파일에서 남길 내용을 결정하고 충돌 표시를 제거한 뒤, 수정한 파일을 `git add`로 등록합니다. 이후에는 진행 중인 작업에 해당하는 명령만 실행합니다.

| 진행 중인 작업 | 계속 | 중단 |
| --- | --- | --- |
| 병합 | `git merge --continue` | `git merge --abort` |
| 리베이스 | `git rebase --continue` | `git rebase --abort` |
| 체리픽 | `git cherry-pick --continue` | `git cherry-pick --abort` |

리베이스가 이미 끝났다면 `--abort`를 사용할 수 없습니다. reflog에서 시작 전 커밋을 찾아 별도 브랜치에 보존합니다.

## 파일이나 스태시 복구하기

파일 하나만 과거 버전으로 되돌리려면 이력을 확인한 뒤 `git restore`를 사용합니다. 아래 명령은 해당 파일의 현재 작업 내용을 덮어쓰므로 남길 변경을 먼저 백업합니다.

```bash
git log --oneline -- config.js
git restore --source=<복원할-커밋> -- config.js
```

스태시를 삭제했다면 `git fsck --no-reflogs --unreachable`로 아직 남아 있는 커밋 객체를 찾을 수 있습니다. `git show <후보-해시>`로 내용을 확인하고 맞는 항목에 `git stash apply <스태시-해시>`를 실행합니다. 객체가 이미 정리됐다면 이 방법으로 복구할 수 없습니다.

스테이징한 적이 있는 파일도 `git fsck --lost-found`로 내용이 남아 있는지 확인할 수 있습니다. 커밋하거나 스테이징한 적이 없다면 reflog에 기록이 없으므로 에디터의 로컬 이력이나 백업을 확인합니다.

## 비밀 키를 커밋한 경우

비밀 키가 원격 저장소에 올라갔다면 먼저 폐기하고 새 키를 발급합니다. 파일을 지우는 커밋만으로는 이전 커밋의 키가 없어지지 않습니다. 이력 삭제가 필요하면 팀과 작업 범위를 정한 뒤 [GitHub의 민감 데이터 제거 절차](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)를 따릅니다.

공유 브랜치의 운영 방식은 [Git 브랜치 전략과 GitHub Flow](./git-branch-guide)에서 다룹니다.
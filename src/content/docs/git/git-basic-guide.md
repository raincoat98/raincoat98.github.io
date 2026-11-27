---
categories: [Git]
title: Git 기초 가이드
description: 작업 파일과 스테이징의 차이를 확인하고, 연습 저장소에서 변경을 커밋한 뒤 GitHub의 작업 브랜치로 올리는 흐름을 익힙니다.
created: 2026-05-19
tags: [Git|orange, 버전관리|teal]
platform: Git
readingTime: 12
---

로그인 버튼을 고치다가 README의 오타도 발견했다고 가정합니다. 두 변경을 따로 기록하면 나중에 버튼 수정만 찾아보거나 되돌리기 쉽습니다. Git에서는 `git add`로 이번에 기록할 변경을 고르고, `git commit`으로 그 상태를 남깁니다.

Git은 파일 변경 이력을 관리하는 도구입니다. 인터넷에 연결하지 않아도 로컬에서 기록을 남길 수 있습니다. GitHub는 Git 저장소를 호스팅하고 코드 리뷰와 협업 기능을 제공하는 서비스입니다.

## 변경이 이동하는 네 곳

```text
작업 디렉터리 → git add → 스테이징 영역 → git commit → 로컬 저장소 → git push → 원격 저장소
```

| 위치 | 역할 |
| --- | --- |
| 작업 디렉터리 | 파일을 열고 수정하는 폴더입니다. |
| 스테이징 영역 | 다음 커밋에 넣을 파일 상태를 모아 둡니다. |
| 로컬 저장소 | 내 컴퓨터에 커밋 이력을 저장합니다. |
| 원격 저장소 | GitHub처럼 다른 곳에서 접근하는 저장소입니다. |

`git add`는 실행한 시점의 파일 상태를 스테이징합니다. 같은 파일을 다시 고쳤다면 새 변경까지 포함할지 확인한 뒤 `git add`를 다시 실행합니다.

## 연습 저장소에서 첫 커밋 만들기

### 빈 폴더 준비하기

터미널에서 새 임시 폴더를 만들고 `git init`으로 저장소를 초기화합니다. 아래 예시는 Git 2.28 이상이 필요합니다.

```bash
practice_dir="$(mktemp -d "${TMPDIR:-/tmp}/git-guide.XXXXXX")" &&
  cd "$practice_dir" &&
  git init -b main
```

다음 이름과 이메일은 연습용입니다. 초기화에 성공한 폴더에서 실행하면 이 저장소에만 적용됩니다. 실제 프로젝트에서는 커밋에 남길 이름과 이메일을 사용합니다. 여러 저장소에 같은 값을 기본으로 쓰려면 `git config --global`로 설정합니다.

```bash
git config user.name "Git Practice"
git config user.email "git-practice@example.com"
```

### 필요한 파일만 골라 커밋하기

아래의 `>`는 같은 이름의 파일이 있으면 덮어씁니다. 방금 만든 빈 연습 폴더에서만 실행합니다.

```bash
printf '# Git 연습\n' > README.md
printf '스테이징 연습 메모\n' > notes.txt
git status
```

두 파일이 아직 Git이 추적하지 않는 파일로 표시됩니다. `README.md`만 스테이징한 뒤 이번 커밋에 들어갈 내용을 확인합니다.

```bash
git add README.md
git diff --staged
git commit -m "docs: 연습 저장소 README 추가"
```

`git diff --staged`는 커밋에 들어갈 변경을 보여 줍니다. `git diff`는 Git이 추적하는 파일에서 아직 스테이징하지 않은 변경을 보여 줍니다. 추적하지 않는 새 파일은 `git status`에서 확인합니다.

메모는 별도 커밋으로 남깁니다. `git log --oneline`을 실행하면 두 커밋을 한 줄씩 볼 수 있습니다.

```bash
git add notes.txt
git diff --staged
git commit -m "docs: 스테이징 연습 메모 추가"
git log --oneline
```

`git add .`은 현재 폴더와 그 하위 폴더의 변경을 한꺼번에 스테이징합니다. 커밋할 파일이 정해져 있다면 파일 이름을 지정합니다. 특히 `.env`처럼 비밀값이 들어가는 파일은 커밋하지 않습니다.

## 기존 저장소 복제하기

이미 원격 저장소가 있다면 `git init` 대신 `git clone`을 사용합니다. 아래는 읽어 보기 위한 공개 저장소입니다. 현재 폴더 아래에 `Hello-World` 폴더가 생기며, 복제본에는 원격 저장소 주소가 `origin`이라는 이름으로 등록됩니다.

```bash
git clone https://github.com/octocat/Hello-World.git &&
  cd Hello-World &&
  git remote -v
```

내 프로젝트를 복제할 때는 GitHub 저장소의 `Code` 메뉴에서 HTTPS 주소를 복사합니다.

## GitHub에서 최신 변경을 받고 내 변경 올리기

이 단계는 앞의 연습 저장소나 공개 예제 복제본이 아닌, 쓰기 권한이 있는 프로젝트의 복제본에서 진행합니다. 예시는 원격 이름이 `origin`이고 기본 브랜치가 `main`인 경우입니다. `git remote -v`로 주소를, `git branch -a`로 알려진 로컬과 원격 브랜치 이름을 확인합니다.

`git status`에서 남은 변경이 없는지 확인합니다. 브랜치는 특정 커밋을 가리키는 이름으로, 작업을 나누는 데 씁니다. 먼저 `main`으로 이동해 원격의 변경을 반영한 다음, 새 작업 브랜치를 만듭니다. `docs/readme`가 이미 쓰이는 이름이라면 다른 작업 브랜치 이름을 고릅니다.

```bash
git switch main &&
  git pull --ff-only origin main &&
  git switch -c docs/readme
```

`git pull`은 원격 변경을 가져와 현재 브랜치에 반영합니다. `--ff-only`는 로컬과 원격에 서로 다른 커밋이 있어 브랜치 끝을 앞으로 옮기는 것만으로 합칠 수 없으면 중단합니다.

새 브랜치에서 `README.md`의 오타를 고친 뒤 다음 명령을 실행합니다. 스테이징한 변경을 검토하고 커밋에 성공한 뒤에만 푸시합니다.

```bash
git add README.md
git diff --staged
```

의도한 변경만 들어 있다면 커밋합니다.

```bash
git commit -m "docs: README 오타 수정"
```

```bash
git push -u origin HEAD
```

여기서 `HEAD`는 현재 작업 브랜치를 가리킵니다. `git push -u origin HEAD`는 같은 이름으로 브랜치를 올리고 로컬 브랜치와 연결합니다. 이후 이 브랜치에 커밋을 추가했다면 `git push`로 올릴 수 있습니다. 코드를 검토받고 합치는 방법은 [Git 브랜치 전략과 GitHub Flow](./git-branch-guide)에서, 잘못 기록한 변경을 되돌리는 방법은 [Git 복구 가이드](./git-recovery-guide)에서 다룹니다.

## 커밋 메시지 쓰기

팀에서 정한 규칙이 있다면 그 규칙을 따릅니다. `종류: 변경 내용` 형식을 사용한다면 `fix: 결제 금액 오류 수정`처럼 무엇이 달라졌는지 제목에 적습니다.

| 접두사 | 의미 | 예시 |
| --- | --- | --- |
| `feat` | 새 기능 | `feat: 로그인 페이지 추가` |
| `fix` | 버그 수정 | `fix: 결제 금액 오류 수정` |
| `docs` | 문서 변경 | `docs: README에 설치 방법 추가` |
| `style` | 동작에 영향이 없는 코드 서식 변경 | `style: 들여쓰기 정리` |
| `refactor` | 기능을 바꾸지 않는 코드 구조 개선 | `refactor: 중복 코드를 함수로 추출` |
| `test` | 테스트 추가 또는 수정 | `test: 로그인 입력 검증 테스트 추가` |
| `chore` | 설정이나 도구 관리 | `chore: 린트 설정 추가` |
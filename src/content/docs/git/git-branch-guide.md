---
categories: [Git]
title: Git 브랜치 전략과 GitHub Flow
description: GitHub Flow에서 main으로부터 작업 브랜치를 만들고, 커밋과 푸시를 거쳐 Pull Request로 병합하는 방법입니다.
created: 2026-05-19
tags: [Git|orange, GitHub|orange, 브랜치전략|teal]
platform: Git
readingTime: 4
---

# Git 브랜치 전략과 GitHub Flow

README의 오타 하나를 고칠 때도 `main`에 바로 푸시하는 대신 작업 브랜치를 만듭니다. 수정한 내용을 GitHub에 올리고 Pull Request(PR)로 검토한 뒤 `main`에 합칩니다. 이 흐름을 GitHub Flow라고 합니다.

```text
main에서 작업 브랜치 만들기 → 수정하고 커밋하기 → 푸시하기 → PR 검토 → main에 병합
```

이 예제는 GitHub에서 복제한 저장소의 기본 브랜치가 `main`이고, 작업 브랜치를 푸시할 권한이 있다고 가정합니다. 복제와 커밋이 처음이라면 [Git 기초 가이드](./git-basic-guide)를 먼저 참고합니다.

## 1. 최신 main에서 작업 브랜치 만들기

`git status`에서 아직 커밋하지 않은 변경이 없는지 확인합니다. `main`으로 이동해 최신 변경을 받은 뒤 `docs/readme-fix` 브랜치를 만듭니다.

```bash
git status
git switch main
git pull
git switch -c docs/readme-fix
```

`git switch -c`는 새 브랜치를 만들고 그 브랜치로 이동합니다. 위 명령 중 하나라도 실패하면 다음 단계로 넘어가기 전에 원인을 확인합니다.

## 2. 수정하고 GitHub에 올리기

`README.md`에서 오타를 고친 뒤 `git diff`로 바뀐 내용을 확인합니다. 수정한 파일만 커밋하고 작업 브랜치를 GitHub에 올립니다.

```bash
git diff -- README.md
git add README.md
git commit -m "docs: README 오타 수정"
git push -u origin docs/readme-fix
```

첫 푸시에 `-u`를 붙이면 로컬 작업 브랜치와 GitHub의 브랜치가 연결됩니다. 리뷰를 받고 추가로 수정했다면 같은 브랜치에 커밋한 다음 `git push`를 실행합니다. 기존 PR에 변경이 반영됩니다.

## 3. Pull Request로 검토하고 병합하기

GitHub에서 `Compare & pull request`를 선택합니다. `base`는 변경을 받을 `main`, `compare`는 작업한 `docs/readme-fix`입니다.

PR에는 무엇을 바꿨는지와 확인 방법을 적습니다. README 오타 수정이라면 수정한 문장을 적고, GitHub의 `Files changed`에서 해당 문장만 바뀌었는지 확인합니다. 저장소에서 리뷰 승인이나 자동 검사를 요구한다면 모두 통과한 뒤 저장소에서 정한 방식으로 병합합니다.

## 4. 병합 후 다음 작업 준비하기

PR이 병합되면 GitHub의 `Delete branch` 버튼으로 작업 브랜치를 정리할 수 있습니다. 다른 사람이 같은 브랜치를 사용 중이라면 먼저 확인합니다.

로컬에서는 `main`으로 돌아와 병합된 내용을 받습니다. 다음 작업도 이 상태에서 새 브랜치를 만들어 시작합니다.

```bash
git switch main
git pull
```

`main`에 직접 푸시하는 실수를 막고 싶다면 GitHub 브랜치 규칙에서 PR을 필수로 설정할 수 있습니다. PR 병합으로 자동 배포가 시작되는지는 저장소의 배포 설정에 따라 달라집니다.

병합한 변경을 검증 환경과 운영 환경에 나눠 배포하는 흐름은 [Git 배포 전략: staging과 production 나누기](./git-production-deployment)에서 다룹니다.

공식 문서: [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)
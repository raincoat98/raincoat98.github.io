---
categories: [Git]
title: Git 기초 가이드 — 개념부터 핵심 명령어까지
description: Git이 처음이라면 이 글부터. Git이 해결하는 문제, 작업 디렉터리·스테이징·로컬·원격 저장소 4개 공간, add/commit/push 5개 필수 명령어와 커밋 메시지 컨벤션을 정리합니다.
created: 2026-05-19
tags: [Git|orange, 버전관리|teal]
platform: Git
readingTime: 12
---

# Git 기초 가이드

Git이 처음이라면 여기서 시작하세요. 이 글에서는 기초 개념과 앞으로 90%의 시간 동안 쓰게 될 핵심 명령어를 다룹니다.

다룰 내용:

- Git이 해결하는 문제와 Git/GitHub 차이
- 작업 디렉터리·스테이징·로컬·원격 저장소 4개 공간
- `add → commit → push` 기본 흐름과 자주 쓰는 명령어
- 커밋 메시지 컨벤션

## Git이 해결하는 문제

Git은 **코드 변경 이력을 관리하는 도구**입니다. 이런 파일 이름, 기억나시죠?

```text
보고서_최종.docx
보고서_최종_진짜최종.docx
보고서_최종_이게진짜.docx
```

코드도 똑같습니다. 기능을 추가하다 망가지면 "어제 상태로 돌아가고 싶다"는 순간이 옵니다.

Git은 이 문제를 해결합니다. **언제든 특정 시점으로 되돌아갈 수 있고, 누가 무엇을 왜 바꿨는지 전부 기록**됩니다. 여기에 더해 여러 명이 같은 코드를 동시에 작업해도 충돌 없이 합칠 수 있게 해줍니다. 그래서 협업의 필수 도구가 됐습니다.

> 브랜치 전략과 협업 흐름이 궁금하다면 이 시리즈의 다음 글을 보세요:
> [Git 브랜치 전략과 GitHub Flow](./git-branch-guide)
> 사고 복구가 필요하다면: [Git 복구 가이드](./git-recovery-guide)

## Git과 GitHub는 다릅니다

자주 헷갈리는 부분입니다.

| | 역할 | 비유 |
|---|------|------|
| **Git** | 내 컴퓨터에서 버전을 관리하는 **프로그램** | 카메라 |
| **GitHub** | Git 저장소를 인터넷에 올려두는 **웹 서비스** | 사진을 올리는 클라우드 |

GitLab, Bitbucket도 GitHub와 같은 역할의 서비스입니다.

## 핵심 개념 4가지

명령어를 이해하려면 이 4개 공간을 알아야 합니다.

```text
작업 디렉터리 → (git add) → 스테이징 → (git commit) → 로컬 저장소 → (git push) → 원격 저장소
```

1. **작업 디렉터리 (Working Directory)** — 실제로 파일을 수정하는 공간
2. **스테이징 (Staging Area)** — "이번에 기록할 변경사항"을 골라 담는 임시 바구니
3. **로컬 저장소 (Local Repository)** — 내 컴퓨터에 저장된 커밋 기록
4. **원격 저장소 (Remote Repository)** — GitHub 등 인터넷에 올라간 저장소

> **스테이징이 왜 필요할까요?**
>
> 수정한 파일이 10개라도, 그중 관련 있는 3개만 골라 하나의 커밋으로 묶을 수 있습니다. 커밋을 "의미 단위"로 깔끔하게 만드는 장치입니다.

**예시.** 로그인 버튼 수정과 오타 수정을 섞지 않고, 각각 따로 커밋하고 싶다면.

```bash
# 로그인 관련 파일만 먼저
git add src/login.tsx
git commit -m "feat: 로그인 버튼 스타일 수정"

# 오타 수정은 그다음
git add README.md
git commit -m "docs: README 오타 수정"
```

## 새 컴퓨터에서 딱 한 번: 이름과 이메일 설정

커밋에 기록될 이름과 이메일입니다. 새 컴퓨터에서 처음 한 번만 하면 됩니다.

```bash
git config --global user.name "내 이름"
git config --global user.email "my@email.com"

# 설정 확인
git config --list
```

## 기본 흐름 — 이 5개가 90%입니다

### 시작하기: git init / git clone

```bash
# 새 프로젝트를 Git으로 관리 시작
git init

# 이미 있는 GitHub 저장소를 내 컴퓨터로 복제
git clone https://github.com/user/repo.git
```

### 현재 상태 보기: git status

가장 자주 치는 명령어입니다. 막히면 일단 이걸 칩니다.

```bash
git status
# 어떤 파일이 수정됐고, 어떤 게 스테이징 됐는지 보여줍니다
```

### 기록할 변경사항 고르기: git add

```bash
git add index.html      # 특정 파일만
git add .               # 변경된 파일 전체
```

### 변경사항 기록하기: git commit

```bash
git commit -m "feat: 로그인 페이지 추가"
```

### 원격과 주고받기: git push / git pull

```bash
git push origin main    # 내 커밋을 GitHub에 올리기
git pull origin main    # GitHub의 최신 내용을 내려받기
```

## 전체 흐름 한눈에

첫날부터 이 흐름만 익히면 됩니다.

```bash
git clone https://github.com/user/repo.git
cd repo
git status
git add .
git commit -m "feat: 메인 페이지 디자인 수정"
git push origin main
```

## 커밋 메시지 컨벤션

팀에서 가장 흔히 쓰는 형식입니다. 접두사로 커밋의 종류를 구분합니다.

| 접두사 | 의미 | 예시 |
|--------|------|------|
| `feat` | 새 기능 추가 | `feat: 로그인 페이지 추가` |
| `fix` | 버그 수정 | `fix: 결제 금액 오류 수정` |
| `docs` | 문서 수정 | `docs: README 설치법 추가` |
| `style` | 코드 포맷 (기능 변화 없음) | `style: 들여쓰기 정리` |
| `refactor` | 리팩터링 | `refactor: 중복 코드 함수로 추출` |
| `test` | 테스트 코드 | `test: 로그인 유효성 검사 추가` |
| `chore` | 빌드/설정 등 잡일 | `chore: 린트 설정 추가` |

## 자주 쓰는 명령어 요약

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

## 정리

Git 기초는 `add → commit → push` 세 단계가 전부입니다. 어디까지 진행했는지 헷갈리면 `git status`, 이력이 궁금하면 `git log --oneline`.

다음 단계: [Git 브랜치 전략과 GitHub Flow](./git-branch-guide)
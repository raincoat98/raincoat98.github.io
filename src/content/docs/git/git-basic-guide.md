---
categories: [Git]
title: "Git 기초 가이드: 설치부터 첫 커밋까지"
description: Windows, macOS, Ubuntu에서 Git을 설치하고 git add와 git commit으로 첫 변경을 기록합니다. GitHub에 올리는 방법도 설명합니다.
created: 2026-05-19
tags: [Git|orange, 버전관리|teal]
platform: Git
readingTime: 5
---

Git은 파일의 변경 이력을 남기는 도구입니다. 처음에는 Git을 설치하고, `README.md` 한 파일을 만들어 변경을 기록하는 것부터 시작합니다. 내 컴퓨터에서 기록만 남길 때는 GitHub 계정이 필요하지 않습니다.

## Git 설치하기

먼저 Windows에서는 PowerShell, macOS와 Ubuntu에서는 터미널을 열고 아래 명령을 실행합니다. Git 버전이 표시되면 설치를 건너뜁니다.

```bash
git --version
```

### Windows

[Git for Windows 공식 설치 페이지](https://git-scm.com/install/windows)에서 설치 파일을 내려받아 실행합니다. 설치가 끝나면 시작 메뉴에서 Git Bash를 열고 `git --version`을 실행합니다. 아래 실습 명령도 Git Bash에 입력합니다.

### macOS

터미널에서 다음 명령을 실행하고 화면에 표시되는 설치 안내를 따릅니다. Xcode 전체를 설치할 필요는 없습니다.

```bash
xcode-select --install
```

### Ubuntu

터미널에서 패키지 목록을 갱신한 뒤 Git을 설치합니다.

```bash
sudo apt update
sudo apt install git
```

macOS와 Ubuntu에서도 설치 후 `git --version`을 실행해 버전이 나오는지 확인합니다. 다른 Linux 배포판은 [Git 공식 설치 문서](https://git-scm.com/install/linux)를 참고합니다.

## 이름과 이메일 설정하기

Git은 커밋마다 작성자의 이름과 이메일을 기록합니다. 다음 예시를 본인의 이름과 이메일로 바꿔 입력합니다. `--global`로 설정하면 같은 컴퓨터 계정에서 만든 저장소에 기본값으로 적용됩니다. 이 설정으로 GitHub에 로그인하는 것은 아닙니다.

```bash
git config --global user.name "홍길동"
git config --global user.email "you@example.com"
```

GitHub에 커밋을 올릴 때 개인 이메일을 공개하고 싶지 않다면 [GitHub의 `noreply` 주소](https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address)를 사용할 수 있습니다.

## 첫 커밋 만들기

### 1. 연습 폴더를 Git 저장소로 만들기

터미널에서 기존 프로젝트 밖으로 이동한 뒤 새 폴더를 만듭니다. `git init`은 이 폴더의 변경 이력을 기록할 저장소를 준비합니다. `main`은 실습에 사용할 첫 브랜치 이름입니다.

```bash
mkdir git-practice
cd git-practice
git init -b main
```

`git-practice` 폴더가 이미 있다면 다른 이름으로 새 폴더를 만듭니다.

### 2. 기록할 파일 고르기

연습 폴더에 `README.md`를 만듭니다. `git status`를 실행하면 Git이 아직 추적하지 않는 새 파일로 표시됩니다.

```bash
echo "# Git 연습" > README.md
git status
```

`git add`로 다음 커밋에 넣을 파일을 고릅니다. 이 단계를 스테이징이라고 합니다. 파일을 다시 수정했다면 새 내용도 커밋에 넣도록 `git add`를 다시 실행합니다.

```bash
git add README.md
git status
```

### 3. 변경 기록 남기기

`git commit`은 선택한 파일의 상태를 내 컴퓨터에 기록합니다. `-m` 뒤에는 무엇을 바꿨는지 짧게 적습니다. `git log --oneline`에서 방금 만든 커밋을 확인합니다.

```bash
git commit -m "README 추가"
git log --oneline
```

## GitHub에 올리기

GitHub는 Git 저장소를 온라인에 보관하고 공유하는 서비스입니다. 첫 커밋을 올리려면 GitHub에서 새 저장소를 만듭니다. 이미 로컬에 `README.md`가 있으므로 GitHub의 새 저장소에는 README, `.gitignore`, 라이선스를 추가하지 않습니다.

새 저장소 화면에서 HTTPS 주소를 복사합니다. 아래 예시 주소를 복사한 주소로 바꾼 뒤 연습 폴더에서 실행합니다. `origin`은 GitHub 저장소 주소에 붙이는 이름입니다. 첫 푸시에 `-u`를 붙이면 다음부터는 같은 브랜치에서 `git push`만 실행해도 됩니다.

```bash
git remote add origin https://github.com/USERNAME/git-practice.git
git push -u origin main
```

인증을 요청하면 브라우저 로그인 안내를 따릅니다. 터미널이 비밀번호를 묻는다면 GitHub 계정 비밀번호 대신 [개인 액세스 토큰](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)을 사용합니다. 푸시가 끝나면 GitHub 저장소에서 `README.md`가 보이는지 확인합니다.

## 기존 프로젝트 가져오기

이미 GitHub에 저장소가 있다면 새로 `git init`을 할 필요가 없습니다. 저장소의 `Code` 메뉴에서 주소를 복사해 `git clone`으로 내려받습니다. 복제한 폴더 안에서 `git pull`을 실행하면 원격 브랜치의 새 변경을 가져와 현재 브랜치에 반영합니다.

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
git pull
```

명령의 주소와 폴더 이름은 실제 저장소에 맞게 바꿉니다. 팀 프로젝트에서 작업을 나누는 방법은 [Git 브랜치 전략과 GitHub Flow](/git/git-branch-guide/), 잘못 만든 커밋을 되돌리는 방법은 [Git 복구 가이드](/git/git-recovery-guide/)에서 다룹니다.
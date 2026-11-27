---
categories: [Git]
title: "Git 배포 전략: staging과 production 나누기"
description: main에 병합한 변경을 검증 환경에서 확인한 뒤 운영에 배포하는 흐름과 production 브랜치가 필요한 경우를 설명합니다.
created: 2026-11-27
tags: [Git|orange, GitHub|orange, 배포|teal]
platform: Git
readingTime: 4
---

PR을 `main`에 병합하는 시점과 실제 사용자에게 변경을 내보내는 시점은 달라도 됩니다. 병합한 코드를 먼저 검증 환경(`staging`)에 배포하면, 운영 환경(`production`)에 반영하기 전에 로그인이나 결제 같은 주요 기능을 확인할 수 있습니다.

## main 하나로 배포하기

```text
작업 브랜치 → PR → main → staging에서 검증 → production에 배포
```

이 방식에서 `main`은 Git 브랜치이고, `staging`과 `production`은 배포 환경입니다. 환경을 나눈다고 같은 이름의 브랜치를 만들 필요는 없습니다.

1. PR을 `main`에 병합하면 해당 커밋의 빌드 결과물을 `staging`에 배포합니다.
2. `staging`에서 주요 기능을 확인하고, 검증한 커밋이나 빌드 번호를 기록합니다.
3. 승인 후 같은 빌드 결과물을 `production`에 배포합니다. 검증 중 `main`에 다른 PR이 합쳐져도 새 버전이 섞이지 않도록, `main`의 최신판이 아니라 검증한 결과물을 지정합니다.

예를 들어 로그인 화면을 고쳤다면 검증 환경에서 정상 로그인과 실패 안내를 확인합니다. 두 동작을 확인한 빌드만 운영에 올립니다. GitHub Actions의 [배포 환경 설정](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)에서는 환경별 설정을 분리할 수 있습니다. 저장소 공개 여부와 요금제에 따라 운영 배포 전에 승인도 요구할 수 있습니다.

## production 브랜치를 따로 두는 경우

```text
작업 브랜치 → PR → main → staging에서 검증 → 배포 PR → production 브랜치
```

배포 도구가 `production` 브랜치의 변경을 감지해 운영 배포를 시작하거나, 팀에서 배포할 변경을 별도 PR로 승인한다면 `production` 브랜치를 둘 수 있습니다. 검증이 끝난 커밋을 기준으로 배포 PR을 열고, 병합 결과가 검증한 버전과 다르면 다시 검사합니다.

브랜치가 늘면 두 브랜치의 이력도 관리해야 합니다. 예를 들어 운영 브랜치에서만 긴급 수정하고 `main`에 반영하지 않으면 다음 배포에 같은 문제가 돌아올 수 있습니다. 별도 브랜치를 요구하는 배포 도구나 팀 규칙이 없다면, `main` 하나를 두고 배포 환경만 나누는 쪽이 관리하기 쉽습니다.

## 배포에 문제가 생기면

배포한 버전에 문제가 있고 이전 빌드가 현재 데이터베이스와 호환된다면, 이전에 정상 동작한 빌드를 다시 배포합니다. 그다음 운영에서 한 수정이나 변경을 취소하는 PR을 `main`에도 반영합니다. 코드만 이전으로 돌려도 데이터베이스 변경은 되돌아가지 않으므로, 호환 여부를 먼저 확인합니다.

작업 브랜치에서 PR을 여는 기본 흐름은 [Git 브랜치 전략과 GitHub Flow](/git/git-branch-guide/)에서 다룹니다.

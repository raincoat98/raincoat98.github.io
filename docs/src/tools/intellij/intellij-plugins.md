---
categories: [Tools]
title: IntelliJ 플러그인 추천 (Java / Spring Boot 개발자용)
description: Java / Spring Boot 개발자를 위한 IntelliJ 플러그인 추천. 실무 생산성을 높여주는 Lombok, SonarLint, GitToolBox 등 TOP 6와 용도별 전체 목록을 정리합니다.
date: 2026-05-16
updated: 2026-05-16
tags: [IntelliJ|orange, Java|orange, Spring Boot|green, Plugin|purple, 개발도구|teal]
platform: Tools
readingTime: 4
---

# IntelliJ 플러그인 추천 (Java / Spring Boot 개발자용)

IntelliJ는 기본만으로도 충분히 강력하지만, 플러그인 몇 개만 깔아두면 실무 생산성이 확연히 달라집니다.
Java / Spring Boot 개발자 기준으로 실제로 도움이 되는 것들만 정리했습니다.

## 우선순위 TOP 6

깔자마자 효과를 체감할 수 있는 순서입니다.

### 1. Lombok

`@Getter`, `@Setter`, `@Builder` 같은 어노테이션을 인식하게 해줍니다.
Lombok 쓰는 프로젝트라면 이게 없으면 에디터가 빨갛게 도배됩니다.

> 최신 IntelliJ에는 번들로 포함되어 있지만, 동작 안 하면 `Settings → Build → Compiler → Annotation Processors`에서 활성화하세요.

### 2. Spring Boot

`application.yml` 자동완성, Bean 의존성 시각화, Actuator 엔드포인트 탐색 등 Spring 작업의 90%를 편하게 만들어줍니다.
Ultimate에는 기본 포함, Community에서는 따로 설치합니다.

### 3. SonarLint

코드 작성하는 동안 실시간으로 버그·코드 스멜·보안 이슈를 잡아줍니다.
"PR 올린 다음에 코드 리뷰에서 지적받기 전에" 잡는 게 핵심입니다.

### 4. GitToolBox

Git Blame을 줄 옆에 인라인으로 표시하고, 브랜치 상태(ahead/behind)를 항상 보여줍니다.
"이 줄 누가 언제 짰지?"를 매번 누르지 않아도 됩니다.

> 무료 버전으로 충분합니다. `Settings → Plugins`에서 GitToolBox로 검색해서 설치하면 됩니다.
>
> 마켓플레이스에 **GitToolBox Pro**도 있는데, 이건 추가 기능(상세 통계, 고급 blame)이 있는 유료 확장이에요. 일반 사용에는 무료 버전만 깔아도 충분합니다.

### 5. Key Promoter X

마우스로 메뉴를 클릭할 때마다 단축키를 알림으로 띄워줍니다.
처음엔 귀찮지만 2주 정도 쓰면 단축키가 자연스럽게 손에 붙습니다.

### 6. EnvFile

`.env` 파일을 Run Configuration에 환경변수로 주입할 수 있습니다.
로컬·개발·운영 환경 분리할 때 유용합니다.

## 용도별 전체 정리

| 용도 | 플러그인 |
|---|---|
| Spring Boot 개발 | Spring Boot |
| Lombok 어노테이션 | Lombok |
| 코드 품질 검사 | SonarLint |
| 포맷·컨벤션 | Prettier, EditorConfig |
| 단축키 학습 | Key Promoter X |
| Git 시각화 | GitToolBox |
| API 테스트 | HTTP Client (내장) |
| DB 작업 | Database Tools and SQL (Ultimate 전용) |
| JSON 보기 | 내장 JSON 기능 / Json Parser |
| 환경변수 | EnvFile |
| 컨테이너 | Docker |
| React / JS / TS | IntelliJ 2026.1+ 내장 강화 |

## 내장으로 충분한 것들

새로 깔 필요 없이 IntelliJ에 이미 있는 기능들입니다.

- **Spring Initializr 연동** — New Project에서 바로 Spring Boot 프로젝트 생성
- **HTTP Client** — Postman 안 깔아도 `.http` 파일로 API 테스트 가능
- **Database Tools** — 별도 DB 클라이언트 없이 쿼리·테이블 편집 (Ultimate)
- **JSON Viewer** — 큰 JSON도 접고 펴면서 탐색

## 라이선스 주의사항

설치하기 전에 알아둘 점이 있습니다.

**유료 / Ultimate 전용**

- **Database Tools and SQL** — IntelliJ IDEA Ultimate에만 포함. Community에서는 사용 불가
- **Spring Boot** — Ultimate에는 기본 포함, Community에서는 설치는 되지만 일부 기능 제한
- **GitToolBox Pro** — 유료 확장. 기본 GitToolBox는 무료

**무료 대안**

- DB 작업: DBeaver (무료, 크로스 플랫폼)
- API 테스트: IntelliJ 내장 HTTP Client는 Community에서도 사용 가능

Community 에디션 사용자라면 위 사항을 먼저 확인하세요.

## 한 줄 정리

**Lombok · Spring Boot · SonarLint · GitToolBox · Key Promoter X · EnvFile** — 이 6개부터 깔면 됩니다.

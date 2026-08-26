---
categories: [Tools]
title: 개발이 편해지는 IntelliJ 플러그인 추천 (2026년 최신)
description: 실무에서 효과가 큰 IntelliJ 플러그인을 필수 / 권장 / 추가 추천 / 유료 / 내장으로 나눠 정리했습니다. Rainbow Brackets, GitToolBox, MyBatisX 등 바로 체감되는 플러그인을 소개합니다.
created: 2026-05-16
tags: [IntelliJ|orange, Java|orange, Spring Boot|green, Plugin|purple, 개발도구|teal]
platform: Tools
readingTime: 6
---

# 개발이 편해지는 IntelliJ 플러그인 추천 (2026년 최신)

IntelliJ는 기본만으로도 훌륭하지만, 플러그인을 더하면 작업 속도가 확 빨라집니다. 이 글에서는 실무에서 효과가 큰 플러그인을 **필수 / 권장 / 추가 추천 / 유료 / 내장** 으로 나눠 쉽게 정리했습니다.

**설치 방법은 모두 같습니다.** `Settings(Ctrl+Alt+S) → Plugins → Marketplace`에서 이름 검색 → Install → 재시작. 끝!

---

## 🔥 필수 플러그인
거의 모든 개발자에게 도움이 되는, 
"깔면 바로 체감되는" 플러그인입니다.

| 플러그인                    | 한 줄 설명                                           |
| ----------------------- | ------------------------------------------------ |
| **Rainbow Brackets**    | 괄호 `( ) [ ] { }` 를 색깔로 구분해 짝을 한눈에 보여줍니다.         |
| **Atom Material Icons** | 파일·폴더 아이콘을 예쁘고 알아보기 쉽게 바꿔줍니다.                    |
| **GitToolBox**          | 코드 옆에 "누가 언제 고쳤는지"를 표시하고 Git 상태를 알려줍니다.          |
| **CamelCase**           | 단축키 한 번으로 `camelCase ↔ snake_case` 등 표기법을 변환합니다. |
| **MyBatisX**            | MyBatis 매퍼와 XML 사이를 클릭 한 번으로 오갈 수 있게 해줍니다.       |
| **Key Promoter X**      | 마우스로 한 동작에 "이런 단축키가 있어요"라고 알려줍니다.                |
| **Grep Console**        | 콘솔 로그를 색으로 강조하고, 원하는 줄만 골라 볼 수 있습니다.             |

### 조금 더 자세히

- **Rainbow Brackets** — 중첩된 조건문이나 람다에서 괄호 짝 찾기가 쉬워집니다.
  > ⚠️ 원조 버전은 일부 기능이 **유료**로 바뀌었어요. 무료로 쓰려면 **Rainbow Brackets Lite**를 설치하세요. (같은 개발자의 무료 버전입니다.)
- **MyBatisX** — Java/Spring/MyBatis 쓰는 분에게는 사실상 필수입니다. SQL 자동완성도 됩니다.
- **Key Promoter X** — 단축키를 자연스럽게 외우게 해줘서, 시간이 지날수록 손이 빨라집니다.

---

## 👍 권장 플러그인

필수는 아니지만, 상황에 따라 큰 도움이 됩니다.

- **Continue** — 오픈소스 AI 코딩 도우미. 코드 자동완성·질문·수정을 도와줍니다.
  > ⚠️ 현재 JetBrains 플러그인은 커뮤니티가 관리 중이고, 공식적으로는 터미널용 **Continue CLI** 사용을 권장합니다. JetBrains 자체 AI(AI Assistant, Junie)도 좋은 대안입니다.
- **EnvFile** — 실행할 때 `.env` 파일의 환경 변수를 자동으로 불러옵니다.
- **.ignore** — `.gitignore` 같은 파일을 자동완성·색상 강조로 편하게 작성합니다.
- **.env files support** — `.env` 파일 편집을 도와줍니다. (위 EnvFile과 함께 쓰면 좋아요.)
- **CodeMetrics** — 메서드가 얼마나 복잡한지 숫자로 보여줘, 리팩터링 지점을 알려줍니다.
- **CodeGlance3** — VS Code처럼 코드 전체 축소 지도(미니맵)를 띄워 빠르게 이동합니다.

---

## ➕ 추가 추천 플러그인

위 목록에 더해, 많이들 쓰는 유용한 플러그인을 골라봤습니다.

- **SonarQube for IDE** (예전 이름: SonarLint) — 코드를 작성하는 동안 버그·나쁜 코드를 실시간으로 잡아줍니다. 무료입니다.
- **Maven Helper** — Maven 의존성 충돌을 트리로 보여주고, 어떤 라이브러리가 겹치는지 쉽게 찾아줍니다. (Maven 프로젝트에 강력 추천)
- **String Manipulation** — 텍스트 대소문자 변환, 정렬, 인코딩 등 문자열 작업을 단축키로 처리합니다.
- **Translation** — 코드나 주석을 그 자리에서 번역해 줍니다. 영문 문서·라이브러리 볼 때 편합니다.
- **GenerateAllSetter** — 객체의 모든 `setter` 호출 코드를 한 번에 생성해 줍니다. 테스트 코드 짤 때 유용합니다.
- **Presentation Assistant** — 단축키를 누를 때마다 화면에 표시해 줍니다. 발표·강의·페어 프로그래밍에 좋습니다.

---

## 💳 유료 (Ultimate 전용)

- **Database (데이터베이스 도구)** — IDE 안에서 바로 DB에 접속해 쿼리를 실행하고 데이터를 봅니다.
  - **Ultimate 사용자**: 이미 내장돼 있어 설치 불필요.
  - **무료(Community) 사용자**: 사용 불가. 대신 **DataGrip**(유료) 또는 **DBeaver**(무료)를 쓰면 됩니다.

---

## 📦 내장 (이미 들어 있어요)

- **Lombok** — `@Getter`, `@Setter`, `@Builder` 같은 어노테이션을 IDE가 인식하게 해줍니다.
  > ✅ 최신 IntelliJ에는 **기본 포함**이라 따로 설치할 필요가 없습니다. 단, `Settings → Build, Execution, Deployment → Compiler → Annotation Processors`에서 **annotation processing이 켜져 있는지**만 확인하세요.

---

## 마무리

플러그인은 많이 깐다고 좋은 게 아닙니다. 너무 많으면 IDE가 무거워집니다. **필요한 것부터 하나씩** 추가하세요.

처음이라면 이 3가지부터 추천합니다 👉 **Key Promoter X · GitToolBox · Atom Material Icons**
자바/스프링/MyBatis 환경이라면 **MyBatisX**와 **Maven Helper**도 꼭 챙기세요.

안 쓰는 플러그인은 `Settings → Plugins → Installed`에서 가끔 정리하면 IDE를 가볍게 유지할 수 있습니다.

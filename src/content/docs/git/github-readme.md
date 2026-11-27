---
categories: [Git]
title: "GitHub README 작성법: 소개부터 첫 실행까지"
description: GitHub README에 프로젝트 소개, 설치 조건, 실행 명령을 적는 순서를 실제 개발 블로그 예제로 설명합니다.
created: 2024-04-12
tags: [Git|orange, GitHub|orange, README|teal, 문서화|teal]
platform: GitHub
readingTime: 3
---

README를 읽은 사람이 프로젝트의 용도를 파악하고 직접 실행할 수 있으면 됩니다. 처음부터 모든 기능을 설명할 필요는 없습니다. 프로젝트 소개 한 문장과 첫 실행에 필요한 명령부터 적습니다.

## README에 먼저 적을 내용

1. 프로젝트가 무엇을 하는지 한 문장으로 설명합니다. 화면이 중요한 프로젝트라면 스크린샷이나 데모 링크를 추가합니다.
2. 설치해야 하는 도구와 버전을 적습니다. 환경 변수가 필요하면 변수 이름과 입력할 파일을 안내합니다. 실제 비밀값은 넣지 않습니다.
3. 명령을 실행할 폴더와 실행 순서를 적습니다. 명령이 성공하면 무엇이 보이는지도 안내합니다.

## README 예제

다음은 이 블로그를 로컬에서 실행하는 데 필요한 내용만 담은 예제입니다. 다른 프로젝트에 적용할 때는 명령을 그대로 복사하지 말고 저장소에 정의된 명령으로 바꿉니다.

````markdown
# Raincoat 개발 블로그

React, JavaScript, Git 등 개발 주제를 다루는 기술 블로그입니다.

## 로컬에서 실행

Node.js 24와 npm이 필요합니다. 저장소를 내려받은 뒤 `package.json`이 있는 폴더에서 실행합니다.

```bash
npm ci
npm run dev
```

터미널에 표시된 주소를 브라우저에서 열면 블로그가 표시됩니다. 서버를 종료하려면 `Ctrl+C`를 누릅니다.
````

공개 저장소라면 문의를 받는 곳과 라이선스를 필요한 만큼 덧붙입니다. 기여 절차가 길어지면 `CONTRIBUTING.md`로 분리하고, 라이선스가 있다면 `LICENSE` 파일로 연결합니다.

마지막으로 새 폴더에 저장소를 내려받아 README의 순서대로 실행해 봅니다. 이미 설치한 도구나 설정 덕분에 동작했다면, 처음 실행하는 사람에게도 필요한 조건인지 확인합니다.

공식 문서: [GitHub README 안내](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)

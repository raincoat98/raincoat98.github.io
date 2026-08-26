# Raincoat Blog (Astro)

## 프로젝트 개요

Astro 기반 기술 블로그. Content Collections(콘텐츠 컬렉션)로 마크다운을
관리하고 SEO·검색(Pagefind)·RSS·댓글(utterances)을 포함한다.

> 이 브랜치(`feat/astro-migration`)는 VitePress → Astro 이관 진행 상태입니다.

## 설치 방법

```
git clone https://github.com/raincoat98/raincoat98.github.io.git
cd raincoat98.github.io
npm install
npm run dev
```

## 스크립트

- `npm run dev` — Astro 개발 서버
- `npm run build` — Astro 빌드 → Pagefind 색인 (`dist/`)
- `npm run check` — 타입 검사 (astro check)
- `npm run preview` — 빌드 결과 미리보기

## 콘텐츠 구조

- 포스트: `src/content/docs/**/*.md` (Content Collections, `src/content.config.ts`가 스키마 정의)
- 정적 자산: `public/`
- 라우트: 홈(`/`), 포스트(`/frontend/...` 등), 태그(`/tags/`), 카테고리(`/category/`), 검색(`/search/`), RSS(`/rss.xml`)

## 배포

GitHub Actions(`.github/workflows/deploy.yml`)이 `main` 푸시 시
`npm run build` 후 GitHub Pages(`dist/`)로 배포합니다.

## 기능 설명

이 프로젝트는 기술블로그입니다.

## 커밋 컨벤션

- `Feat`: 새로운 기능이 추가될 때 사용합니다.
  - 예: `Feat: 사용자 프로필 기능 추가`
- `Fix`: 기존 서비스의 버그를 수정할 때 사용합니다.
  - 예: `Fix: 헤더 버그 수정`
- `Add`: 새로운 문서가 추가될 때 사용합니다.
  - 예: `Add: Quasar 사용 가이드 문서 추가`
- `Update`: 기존 문서의 내용을 수정할 때 사용합니다.
  - 예: `Update: Vue 설치 가이드 업데이트`
- `Remove`: 더 이상 필요 없는 문서를 삭제할 때 사용합니다.
  - 예: `Remove: Vue 설치 방법 문서 삭제`

## 라이선스

```
MIT License

Copyright (c) [2024] [wooSangWook]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
```

## 연락처

프로젝트 관련 문의사항은 다음 연락처로 문의하세요.

- 이메일: [raincoat@kakao.com]
- GitHub: [https://github.com/raincoat98]

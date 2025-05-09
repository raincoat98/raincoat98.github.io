import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/",
  title: "SangWook Blog",
  description:
    "프론트엔드 Vue.js와 백엔드 NestJS를 전문으로 하는 개발자 블로그. 웹 개발 경험, 코드 최적화, 모범 사례를 공유합니다.",
  cleanUrls: true,
  srcDir: "./src",

  // SEO 최적화 설정
  lastUpdated: true,

  // 성능 최적화 및 CSS 설정
  vite: {
    ssr: {
      noExternal: [],
    },
    optimizeDeps: {
      exclude: [],
    },
    build: {
      minify: "terser",
      cssMinify: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1024,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "docs/.vitepress/styles/custom.css";',
        },
      },
    },
  },

  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    ["link", { rel: "alternate icon", href: "/favicon.svg" }],
    ["meta", { name: "author", content: "SangWook Woo" }],

    // Canonical URL
    ["link", { rel: "canonical", href: "https://raincoat98.github.io" }],

    // 모바일 최적화
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
      },
    ],

    [
      "meta",
      {
        name: "keywords",
        content:
          "Vue.js, Vue3, JavaScript, TypeScript, NestJS, Node.js, 프론트엔드 개발, 백엔드 개발, 웹개발, 프론트엔드, UI/UX, 컴포넌트 설계, API 개발, 데이터베이스, Vuex, Pinia, Composition API, TypeORM, REST API, GraphQL",
      },
    ],
    [
      "meta",
      {
        name: "google-site-verification",
        content: "여기에_구글이_제공한_인증_코드를_넣으세요",
      },
    ],

    // 추가 SEO 메타 태그
    [
      "meta",
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
    ],
    ["meta", { name: "language", content: "Korean" }],
    ["meta", { name: "revisit-after", content: "7 days" }],
    ["meta", { name: "generator", content: "VitePress" }],

    // Open Graph / Facebook
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      {
        property: "og:title",
        content: "SangWook Blog",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "프론트엔드 Vue.js와 백엔드 NestJS를 전문으로 하는 개발자 블로그. 웹 개발 경험, 코드 최적화, 모범 사례를 공유합니다.",
      },
    ],
    [
      "meta",
      {
        property: "og:image",
        content: "https://raincoat98.github.io/og-image.jpg",
      },
    ],
    ["meta", { property: "og:url", content: "https://raincoat98.github.io" }],
    ["meta", { property: "og:site_name", content: "SangWook Blog" }],
    ["meta", { property: "og:locale", content: "ko_KR" }],

    // Twitter
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      {
        name: "twitter:title",
        content: "SangWook Blog",
      },
    ],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "프론트엔드 Vue.js와 백엔드 NestJS를 전문으로 하는 개발자 블로그. 웹 개발 경험, 코드 최적화, 모범 사례를 공유합니다.",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://raincoat98.github.io/og-image.jpg",
      },
    ],

    // Schema.org 구조화 데이터 추가 (JSON-LD)
    [
      "script",
      { type: "application/ld+json" },
      `
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "SangWook Blog",
        "description": "프론트엔드 Vue.js와 백엔드 NestJS를 전문으로 하는 개발자 블로그",
        "author": {
          "@type": "Person",
          "name": "SangWook Woo"
        },
        "publisher": {
          "@type": "Organization",
          "name": "SangWook Blog",
          "logo": {
            "@type": "ImageObject",
            "url": "https://raincoat98.github.io/favicon.svg"
          }
        },
        "image": "https://raincoat98.github.io/og-image.jpg",
        "url": "https://raincoat98.github.io",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://raincoat98.github.io"
        },
        "inLanguage": "ko-KR"
      }
    `,
    ],
  ],

  sitemap: {
    hostname: "https://raincoat98.github.io",
    transformItems: (items) => {
      // add new items or modify/filter existing items
      items.push({
        url: "/extra-page",
        changefreq: "monthly",
        priority: 0.8,
      });
      return items;
    },
  },

  themeConfig: {
    aside: true,
    outline: {
      level: [2, 3], // h2와 h3 헤딩을 TOC에 포함
      label: "On this page", // 표시할 제목을 설정할 수 있음
    },
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      {
        text: "About",
        link: "/introduce/about-me",
        activeMatch: "/introduce/about",
      },
      { text: "Examples", link: "/examples/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Introduction",
        collapsed: false,
        items: [
          { text: "About me", link: "/introduce/about-me" },
          {
            text: "careers",
            link: "/introduce/careers",
          },
          { text: "WHY 개발자?", link: "/introduce/my-develop" },
        ],
      },

      {
        text: "Frontend",
        items: [
          {
            text: "vitepress",
            collapsed: true,
            items: [
              {
                text: "vitepress 댓글 기능 구현",
                link: "/frontend/vitepress/vitepress-comment",
              },
            ],
          },
          {
            text: "Javascript",
            collapsed: true,

            items: [
              {
                text: "정규식",
                link: "/frontend/javascript/regular-expression",
              },
              {
                text: "es-toolkit",
                link: "/frontend/javascript/es-toolkit",
              },
              {
                text: "JavaScript 배열 메서드",
                link: "/frontend/javascript/array-methods",
              },
              {
                text: "객체 복사 이제는 Structured Clone !",
                link: "/frontend/javascript/structured-clone",
              },
            ],
          },
          {
            text: "Vue",
            collapsed: false,
            items: [
              {
                text: "내가 VueJS를 사용하는 이유",
                link: "/frontend/vue/my-vue",
              },
              {
                text: " Vue 라이브러리 추천",
                link: "/frontend/vue/my-vue-library",
              },
              {
                text: "Vue 코드 컨벤션",
                link: "/frontend/vue/vue-code-convention",
              },
              {
                text: "Vue 이벤트 및 이벤트 수정자",
                link: "/frontend/vue/vue-event",
              },
              {
                text: "폼 검증하기 VeeValidate",
                link: "/frontend/vue/vee-validate",
              },
              {
                text: "vue Cookie : 오늘 하루동안 보지 않기 기능 구현",
                link: "/frontend/vue/vue-cookie",
              },
              {
                text: "Quasar Tailwind 설치",
                link: "/frontend/vue/quasar-tailwind",
              },
              {
                text: "Vite Quasar에서 AOS로 애니메이션 적용하기",
                link: "/frontend/vue/vite-quasar-aos",
              },
              {
                text: "Vue Tailwind Brand Color 적용하기",
                link: "/frontend/vue/tailwind-brand-color",
              },
              {
                text: "Vue에서 dayjs로 한국 시간(KST) 처리하는 법 정리",
                link: "/frontend/vue/dayjs-korea",
              },
            ],
          },
          {
            text: "Vite",
            collapsed: true,
            items: [
              {
                text: "Vite 경로 별칭 설정",
                link: "/frontend/vite/vite-alias",
              },
              {
                text: "Vite 포트 설정",
                link: "/frontend/vite/vite-port",
              },
              {
                text: "Vite Proxy 설정",
                link: "/frontend/vite/proxy",
              },
            ],
          },
        ],
      },
      {
        text: "Backend",
        items: [
          {
            text: "NestJS",
            collapsed: true,
            items: [
              {
                text: "내가 NestJS를 사용하는 이유",
                link: "/backend/nestjs/my-nestjs",
              },
            ],
          },
        ],
      },
      {
        text: "Database",
        items: [
          {
            text: "조회한 데이터 업데이트 하기",
            link: "/database/update-in",
          },
          {
            text: "한글 정렬 하기",
            link: "/database/korean-sort",
          },
        ],
      },
      {
        text: "Git",
        items: [
          // {
          //   text: "Git",
          //   collapsed: true,
          //   items: [
          //     {
          //       text: "Git 명령어 정리",
          //       link: "/git/git-command",
          //     },
          //   ],
          // },
          {
            text: "GitHub Readme 예시",
            link: "/git/github-readme",
          },
        ],
      },
      {
        text: "Examples",
        collapsed: true,
        items: [
          { text: "Markdown Examples", link: "/examples/markdown-examples" },
          { text: "Runtime API Examples", link: "/examples/api-examples" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/raincoat98/vitepress" },
    ],

    footer: {
      message: "MIT 라이선스에 따라 릴리즈되었습니다.",
      copyright: "저작권 © 2024-현재 SangWook Woo",
    },
  },
});

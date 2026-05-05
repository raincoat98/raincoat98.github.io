import { defineConfig, type HeadConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    base: "/",
    title: "Raincoat",
    description: "프론트엔드 개발자 블로그. 웹 개발 경험과 지식을 공유합니다.",
    cleanUrls: true,
    srcDir: "./src",

    // SEO 최적화 설정
    lastUpdated: true,

    // 각 페이지별 동적 메타 태그 생성
    transformHead: ({ pageData }): HeadConfig[] => {
      const head: HeadConfig[] = [];
      // cleanUrls가 true이므로 확장자 제거 및 index 처리
      let path = pageData.relativePath
        .replace(/\.md$/, "")
        .replace(/\/index$/, "");
      if (path === "index") path = "";
      const url = `https://raincoat98.github.io${path ? `/${path}` : ""}`;

      // 페이지별 제목과 설명이 있으면 사용
      if (pageData.frontmatter.title) {
        head.push([
          "meta",
          {
            property: "og:title",
            content: `${pageData.frontmatter.title} | Raincoat`,
          },
        ] as HeadConfig);
        head.push([
          "meta",
          {
            name: "twitter:title",
            content: `${pageData.frontmatter.title} | Raincoat`,
          },
        ] as HeadConfig);
      }

      if (pageData.frontmatter.description) {
        head.push([
          "meta",
          {
            property: "og:description",
            content: pageData.frontmatter.description,
          },
        ] as HeadConfig);
        head.push([
          "meta",
          {
            name: "twitter:description",
            content: pageData.frontmatter.description,
          },
        ] as HeadConfig);
        head.push([
          "meta",
          { name: "description", content: pageData.frontmatter.description },
        ] as HeadConfig);
      }

      // 페이지별 URL
      head.push(["meta", { property: "og:url", content: url }] as HeadConfig);
      head.push(["link", { rel: "canonical", href: url }] as HeadConfig);

      // 블로그 포스트인 경우 BlogPosting 구조화 데이터 추가
      if (pageData.frontmatter.title && pageData.relativePath !== "index.md") {
        const blogPosting = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: pageData.frontmatter.title,
          description: pageData.frontmatter.description || pageData.description,
          author: {
            "@type": "Person",
            name: "SangWook Woo",
            url: "https://github.com/raincoat98",
          },
          publisher: {
            "@type": "Organization",
            name: "Raincoat",
            logo: {
              "@type": "ImageObject",
              url: "https://raincoat98.github.io/favicon.svg",
            },
          },
          url: url,
          datePublished: pageData.frontmatter.date || new Date().toISOString(),
          dateModified: pageData.lastUpdated
            ? new Date(pageData.lastUpdated).toISOString()
            : new Date().toISOString(),
          inLanguage: "ko-KR",
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
          },
        };

        head.push([
          "script",
          { type: "application/ld+json" },
          JSON.stringify(blogPosting),
        ] as HeadConfig);
      }

      return head;
    },

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
      ["script", { src: "/scroll-to-top.js" }],
      [
        "link",
        {
          rel: "stylesheet",
          as: "style",
          crossorigin: "",
          href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
        },
      ],

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
            "React, Next.js, JavaScript, TypeScript, 프론트엔드 개발, 웹개발, 프론트엔드, UI/UX, 컴포넌트 설계, React Hooks, React Query, Redux, Zustand, Tailwind CSS",
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
      ["meta", { name: "theme-color", content: "#646cff" }],
      ["meta", { name: "color-scheme", content: "light dark" }],
      ["meta", { name: "format-detection", content: "telephone=no" }],
      ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
      [
        "meta",
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      ],

      // Open Graph / Facebook
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:title", content: "Raincoat" }],
      [
        "meta",
        {
          property: "og:description",
          content: "프론트엔드 개발자 블로그. 웹 개발 경험과 지식을 공유합니다.",
        },
      ],
      [
        "meta",
        {
          property: "og:image",
          content: "https://raincoat98.github.io/og-image.svg",
        },
      ],
      ["meta", { property: "og:image:width", content: "1200" }],
      ["meta", { property: "og:image:height", content: "630" }],
      ["meta", { property: "og:image:type", content: "image/svg+xml" }],
      ["meta", { property: "og:url", content: "https://raincoat98.github.io" }],
      ["meta", { property: "og:site_name", content: "Raincoat" }],
      ["meta", { property: "og:locale", content: "ko_KR" }],

      // Twitter
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
      ["meta", { name: "twitter:title", content: "Raincoat" }],
      [
        "meta",
        {
          name: "twitter:description",
          content: "프론트엔드 개발자 블로그. 웹 개발 경험과 지식을 공유합니다.",
        },
      ],
      [
        "meta",
        {
          name: "twitter:image",
          content: "https://raincoat98.github.io/og-image.svg",
        },
      ],
      ["meta", { name: "twitter:site", content: "@raincoat98" }],
      ["meta", { name: "twitter:creator", content: "@raincoat98" }],

      // Schema.org 구조화 데이터 (JSON-LD) - WebSite
      [
        "script",
        { type: "application/ld+json" },
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Raincoat",
          alternateName: "Raincoat 개발자 블로그",
          url: "https://raincoat98.github.io",
          description: "프론트엔드 개발자 블로그. 웹 개발 경험과 지식을 공유합니다.",
          author: {
            "@type": "Person",
            name: "SangWook Woo",
            url: "https://github.com/raincoat98",
          },
          publisher: {
            "@type": "Organization",
            name: "Raincoat",
            logo: {
              "@type": "ImageObject",
              url: "https://raincoat98.github.io/favicon.svg",
            },
          },
          inLanguage: "ko-KR",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://raincoat98.github.io/?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }),
      ],
      // Blog 구조화 데이터
      [
        "script",
        { type: "application/ld+json" },
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Raincoat",
          description: "프론트엔드 개발자 블로그. 웹 개발 경험과 지식을 공유합니다.",
          url: "https://raincoat98.github.io",
          author: { "@type": "Person", name: "SangWook Woo" },
          inLanguage: "ko-KR",
        }),
      ],
    ],

    sitemap: {
      hostname: "https://raincoat98.github.io",
      transformItems: (items) => {
        return items.map((item) => {
          if (item.url === "/")
            return { ...item, changefreq: "daily", priority: 1.0 };
          if (item.url.startsWith("/introduce/"))
            return { ...item, changefreq: "monthly", priority: 0.9 };
          if (item.url.startsWith("/frontend/") || item.url.startsWith("/backend/"))
            return { ...item, changefreq: "weekly", priority: 0.8 };
          return { ...item, changefreq: "monthly", priority: 0.7 };
        });
      },
    },

    themeConfig: {
      aside: true,
      outline: {
        level: [2, 3],
        label: "On this page",
      },
      search: {
        provider: "local",
      },
      nav: [
        { text: "Home", link: "/" },
        {
          text: "About",
          link: "/introduce/my-develop",
          activeMatch: "/introduce/my-develop",
        },
        { text: "Examples", link: "/examples/markdown-examples" },
      ],

      sidebar: [
        {
          text: "Introduction",
          collapsed: false,
          items: [
            {
              text: "왜 개발자가 되었나요?",
              link: "/introduce/my-develop",
            },
            {
              text: "이력서",
              link: "/introduce/careers",
            },
          ],
        },

        {
          text: "Frontend",
          items: [
            {
              text: "VitePress",
              collapsed: true,
              items: [
                {
                  text: "댓글 기능 구현하기",
                  link: "/frontend/vitepress/vitepress-comment",
                },
              ],
            },
            {
              text: "JavaScript",
              collapsed: true,
              items: [
                {
                  text: "정규식 한 번에 정리",
                  link: "/frontend/javascript/regular-expression",
                },
                {
                  text: "ES Toolkit 훑어보기",
                  link: "/frontend/javascript/es-toolkit",
                },
                {
                  text: "배열 메서드 정리",
                  link: "/frontend/javascript/array-methods",
                },
                {
                  text: "객체 복사, 뭐가 다를까?",
                  link: "/frontend/javascript/structured-clone",
                },
                {
                  text: "IndexedDB vs LocalStorage",
                  link: "/frontend/javascript/indexeddb-vs-localstorage",
                },
                {
                  text: "소수점 반올림 제대로 하기",
                  link: "/frontend/javascript/javascript-rounding",
                },
              ],
            },
            {
              text: "AG Grid",
              collapsed: true,
              items: [
                {
                  text: "v21 → v35 마이그레이션",
                  link: "/frontend/react/ag-grid-v21-to-v35-migration",
                },
                {
                  text: "공통 래퍼 설계 (Client / Server)",
                  link: "/frontend/react/ag-grid-v35-wrapper-design",
                },
                {
                  text: "Drawer + URL 상태 동기화",
                  link: "/frontend/react/ag-grid-drawer-url-sync",
                },
              ],
            },
            {
              text: "React",
              collapsed: true,
              items: [
                {
                  text: "IndexedDB 업로드 큐 만들기",
                  link: "/frontend/react/indexeddb-upload-queue",
                },
                {
                  text: "useMemo · useCallback · memo 차이",
                  link: "/frontend/react/react-performance-optimization",
                },
                {
                  text: "OPC UA 설비 데이터 모니터링",
                  link: "/frontend/react/kepware-opcua-monitoring",
                },
              ],
            },
            {
              text: "Vue",
              collapsed: false,
              items: [
                {
                  text: "폴링 → SSE → WebSocket 전환기",
                  link: "/frontend/vue/vue-query-websocket-sync",
                },
                {
                  text: "dayjs로 KST 시간 다루기",
                  link: "/frontend/vue/dayjs-korea",
                },
                {
                  text: "VeeValidate 폼 유효성 검증",
                  link: "/frontend/vue/vee-validate",
                },
                {
                  text: "오늘 하루 보지 않기 팝업",
                  link: "/frontend/vue/vue-cookie",
                },
                {
                  text: "Quasar + TailwindCSS 같이 쓰기",
                  link: "/frontend/vue/quasar-tailwind",
                },
                {
                  text: "AOS 애니메이션 적용하기",
                  link: "/frontend/vue/vite-quasar-aos",
                },
                {
                  text: "브랜드 컬러를 Tailwind에 넣는 법",
                  link: "/frontend/vue/tailwind-brand-color",
                },
                {
                  text: "이벤트 핸들링과 수정자",
                  link: "/frontend/vue/vue-event",
                },
                {
                  text: "코드 컨벤션 가이드",
                  link: "/frontend/vue/vue-code-convention",
                },
                {
                  text: "내가 쓰는 Vue 라이브러리",
                  link: "/frontend/vue/my-vue-library",
                },
                {
                  text: "내가 Vue를 쓰는 이유",
                  link: "/frontend/vue/my-vue",
                },
              ],
            },
            {
              text: "Vite",
              collapsed: true,
              items: [
                {
                  text: "Path Alias 설정하기",
                  link: "/frontend/vite/vite-alias",
                },
                {
                  text: "포트 바꾸는 법",
                  link: "/frontend/vite/vite-port",
                },
                {
                  text: "Proxy 설정하기",
                  link: "/frontend/vite/proxy",
                },
              ],
            },
            {
              text: "Next.js",
              collapsed: true,
              items: [
                {
                  text: "Hydration 경고 없애기",
                  link: "/frontend/nextjs/suppress-hydration-warning",
                },
              ],
            },
            {
              text: "Chrome Extension",
              collapsed: true,
              items: [
                {
                  text: "MV3에서 Google 로그인 구현",
                  link: "/frontend/chrome-extension/firebase-google-login-mv3",
                },
              ],
            },
          ],
        },

        {
          text: "Backend",
          items: [
            {
              text: "Supabase",
              collapsed: true,
              items: [
                {
                  text: "무료 플랜 자동 정지 막는 법",
                  link: "/backend/supabase/supabase-keep-alive",
                },
              ],
            },
            {
              text: "Firebase",
              collapsed: true,
              items: [
                {
                  text: "CLI 설치 가이드",
                  link: "/backend/firebase/install-firebase",
                },
              ],
            },
            {
              text: "NestJS",
              collapsed: true,
              items: [
                {
                  text: "내가 NestJS를 쓰는 이유",
                  link: "/backend/nestjs/my-nestjs",
                },
                {
                  text: "윈도우 무한 루프 문제 해결",
                  link: "/backend/nestjs/nestjs-windows-startdev-loop-fix",
                },
              ],
            },
          ],
        },

        {
          text: "Database",
          items: [
            {
              text: "조회한 데이터 바로 수정하기",
              link: "/database/update-in",
            },
            {
              text: "한글 정렬이 안 될 때",
              link: "/database/korean-sort",
            },
          ],
        },

        {
          text: "Git",
          items: [
            {
              text: "README 잘 쓰는 법",
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
  })
);
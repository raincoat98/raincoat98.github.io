import { defineConfig, type HeadConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { readFileSync } from "fs";
import { resolve } from "path";

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

    transformPageData(pageData, { siteConfig }) {
      const filePath = resolve(siteConfig.srcDir, pageData.relativePath);
      try {
        const raw = readFileSync(filePath, "utf-8");
        const content = raw.replace(/^---[\s\S]*?---\s*\n/, "");
        pageData.frontmatter.charCount = content.length;
      } catch {}
    },

    // 각 페이지별 동적 메타 태그 생성
    transformHead: ({ pageData }): HeadConfig[] => {
      const head: HeadConfig[] = [];
      // cleanUrls가 true이므로 확장자 제거 및 index 처리
      let path = pageData.relativePath
        .replace(/\.md$/, "")
        .replace(/\/index$/, "");
      if (path === "index") path = "";
      const url = `https://raincoat98.github.io${path ? `/${path}` : ""}`;

      const isExamples = pageData.relativePath.startsWith("examples/");

      // examples 페이지는 검색 엔진에서 제외
      if (isExamples) {
        head.push(["meta", { name: "robots", content: "noindex, nofollow" }] as HeadConfig);
        return head;
      }

      const isPost = pageData.frontmatter.title && pageData.relativePath !== "index.md";
      const datePublished = pageData.frontmatter.date
        ? new Date(pageData.frontmatter.date).toISOString()
        : undefined;
      const dateModified = pageData.lastUpdated
        ? new Date(pageData.lastUpdated).toISOString()
        : datePublished;

      const siteTitle = "Raincoat";
      const siteDescription = "프론트엔드 개발자 블로그. 웹 개발 경험과 지식을 공유합니다.";

      // 페이지별 제목과 설명 (없으면 사이트 기본값 사용)
      const pageTitle = pageData.frontmatter.title
        ? `${pageData.frontmatter.title} | ${siteTitle}`
        : siteTitle;
      const pageDescription = pageData.frontmatter.description || siteDescription;

      head.push(["meta", { property: "og:title", content: pageTitle }] as HeadConfig);
      head.push(["meta", { name: "twitter:title", content: pageTitle }] as HeadConfig);
      head.push(["meta", { property: "og:description", content: pageDescription }] as HeadConfig);
      head.push(["meta", { name: "twitter:description", content: pageDescription }] as HeadConfig);
      head.push(["meta", { name: "description", content: pageDescription }] as HeadConfig);

      // 블로그 포스트는 og:type을 article로, 나머지는 website
      if (isPost) {
        head.push(["meta", { property: "og:type", content: "article" }] as HeadConfig);
        if (datePublished) {
          head.push(["meta", { property: "article:published_time", content: datePublished }] as HeadConfig);
        }
        if (dateModified) {
          head.push(["meta", { property: "article:modified_time", content: dateModified }] as HeadConfig);
        }
        head.push(["meta", { property: "article:author", content: "https://github.com/raincoat98" }] as HeadConfig);
      } else {
        head.push(["meta", { property: "og:type", content: "website" }] as HeadConfig);
      }

      // 페이지별 URL
      head.push(["meta", { property: "og:url", content: url }] as HeadConfig);
      head.push(["link", { rel: "canonical", href: url }] as HeadConfig);

      // og:image (frontmatter.image 우선, 없으면 기본 이미지)
      const ogImage = pageData.frontmatter.image
        ? `https://raincoat98.github.io${pageData.frontmatter.image}`
        : "https://raincoat98.github.io/og-image.png";
      const ogImageAlt = pageData.frontmatter.title || "Raincoat 개발자 블로그";
      head.push(["meta", { property: "og:image", content: ogImage }] as HeadConfig);
      head.push(["meta", { property: "og:image:alt", content: ogImageAlt }] as HeadConfig);
      head.push(["meta", { property: "og:image:width", content: "1200" }] as HeadConfig);
      head.push(["meta", { property: "og:image:height", content: "630" }] as HeadConfig);
      head.push(["meta", { property: "og:image:type", content: "image/png" }] as HeadConfig);
      head.push(["meta", { name: "twitter:image", content: ogImage }] as HeadConfig);
      head.push(["meta", { name: "twitter:image:alt", content: ogImageAlt }] as HeadConfig);

      // 포스트 태그 → article:tag + keywords
      if (isPost && Array.isArray(pageData.frontmatter.tags) && pageData.frontmatter.tags.length) {
        for (const tag of pageData.frontmatter.tags) {
          head.push(["meta", { property: "article:tag", content: tag }] as HeadConfig);
        }
        head.push(["meta", { name: "keywords", content: pageData.frontmatter.tags.join(", ") }] as HeadConfig);
      }

      // BreadcrumbList 구조화 데이터 (구글 검색 경로 표시)
      const segments = path.split("/").filter(Boolean);
      if (segments.length > 0) {
        const sectionLabels: Record<string, string> = {
          frontend: "Frontend", backend: "Backend", database: "Database",
          tools: "Tools", git: "Git", introduce: "소개",
          javascript: "JavaScript", react: "React", vue: "Vue",
          vite: "Vite", nextjs: "Next.js", nestjs: "NestJS",
          supabase: "Supabase", firebase: "Firebase", vitepress: "VitePress",
          intellij: "IntelliJ", "chrome-extension": "Chrome Extension",
        };
        const toLabel = (seg: string) =>
          sectionLabels[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        const breadcrumbItems: object[] = [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://raincoat98.github.io/" },
        ];
        let currentUrl = "https://raincoat98.github.io";
        segments.forEach((seg, i) => {
          currentUrl += `/${seg}`;
          breadcrumbItems.push({
            "@type": "ListItem",
            position: i + 2,
            name: i === segments.length - 1 ? (pageData.frontmatter.title || toLabel(seg)) : toLabel(seg),
            item: currentUrl,
          });
        });

        head.push(["script", { type: "application/ld+json" }, JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems,
        })] as HeadConfig);
      }

      // 블로그 포스트인 경우 BlogPosting 구조화 데이터 추가
      if (isPost) {
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
          datePublished: datePublished || new Date().toISOString(),
          dateModified: dateModified || new Date().toISOString(),
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
      ["link", { rel: "preconnect", href: "https://cdn.jsdelivr.net" }],
      ["link", { rel: "dns-prefetch", href: "https://cdn.jsdelivr.net" }],
      [
        "link",
        {
          rel: "stylesheet",
          as: "style",
          crossorigin: "",
          href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
        },
      ],

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

      // Open Graph / Facebook (페이지별 값은 transformHead에서 처리)
      ["meta", { property: "og:site_name", content: "Raincoat" }],
      ["meta", { property: "og:locale", content: "ko_KR" }],

      // Twitter (페이지별 값은 transformHead에서 처리)
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
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
        return items
          .filter((item) => !item.url.startsWith("/examples/"))
          .map((item) => {
            if (item.url === "/")
              return { ...item, changefreq: "daily", priority: 1.0 };
            if (item.url.startsWith("/introduce/"))
              return { ...item, changefreq: "monthly", priority: 0.9 };
            if (
              item.url.startsWith("/frontend/") ||
              item.url.startsWith("/backend/") ||
              item.url.startsWith("/database/") ||
              item.url.startsWith("/tools/") ||
              item.url.startsWith("/git/")
            )
              return { ...item, changefreq: "weekly", priority: 0.8 };
            return { ...item, changefreq: "monthly", priority: 0.7 };
          });
      },
    },

    themeConfig: {
      logo: "/favicon.svg",
      aside: true,
      outline: {
        level: [2, 3],
        label: "목차",
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
                  text: "VitePress 댓글 기능 추가",
                  link: "/frontend/vitepress/vitepress-comment",
                },
              ],
            },
            {
              text: "JavaScript",
              collapsed: true,
              items: [
                {
                  text: "JavaScript 정규식(RegExp) 완전 정리",
                  link: "/frontend/javascript/regular-expression",
                },
                {
                  text: "es-toolkit 완전 정리",
                  link: "/frontend/javascript/es-toolkit",
                },
                {
                  text: "JavaScript 배열 메서드 완전 정리",
                  link: "/frontend/javascript/array-methods",
                },
                {
                  text: "JavaScript structuredClone 완전 정리",
                  link: "/frontend/javascript/structured-clone",
                },
                {
                  text: "IndexedDB vs LocalStorage 차이점 완전 비교",
                  link: "/frontend/javascript/indexeddb-vs-localstorage",
                },
                {
                  text: "JavaScript 소수점 반올림 버그 해결",
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
                  text: "React + IndexedDB 파일 업로드 큐 구현",
                  link: "/frontend/react/indexeddb-upload-queue",
                },
                {
                  text: "React useMemo · useCallback · memo 차이",
                  link: "/frontend/react/react-performance-optimization",
                },
                {
                  text: "Kepware OPC UA + React 실시간 모니터링",
                  link: "/frontend/react/kepware-opcua-monitoring",
                },
              ],
            },
            {
              text: "Vue",
              collapsed: false,
              items: [
                {
                  text: "Vue 실시간 동기화",
                  link: "/frontend/vue/vue-query-websocket-sync",
                },
                {
                  text: "Vue + dayjs KST 한국 시간 설정 완전 가이드",
                  link: "/frontend/vue/dayjs-korea",
                },
                {
                  text: "VeeValidate + yup으로 Vue 폼 유효성 검증 완전 정리",
                  link: "/frontend/vue/vee-validate",
                },
                {
                  text: "Vue \"오늘 하루 보지 않기\" 팝업 구현",
                  link: "/frontend/vue/vue-cookie",
                },
                {
                  text: "Quasar + TailwindCSS 함께 사용하기",
                  link: "/frontend/vue/quasar-tailwind",
                },
                {
                  text: "Vue Quasar + AOS 스크롤 애니메이션 적용",
                  link: "/frontend/vue/vite-quasar-aos",
                },
                {
                  text: "Tailwind CSS 커스텀 색상(브랜드 컬러) 추가하기",
                  link: "/frontend/vue/tailwind-brand-color",
                },
                {
                  text: "Vue 이벤트 핸들링 완전 정리",
                  link: "/frontend/vue/vue-event",
                },
                {
                  text: "Vue Composition API 코드 컨벤션 가이드",
                  link: "/frontend/vue/vue-code-convention",
                },
                {
                  text: "Vue 필수 라이브러리 모음",
                  link: "/frontend/vue/my-vue-library",
                },
                {
                  text: "Vue vs React",
                  link: "/frontend/vue/my-vue",
                },
              ],
            },
            {
              text: "Vite",
              collapsed: true,
              items: [
                {
                  text: "Vite Path Alias(@) 설정",
                  link: "/frontend/vite/vite-alias",
                },
                {
                  text: "Vite 개발 서버 포트 변경하는 법",
                  link: "/frontend/vite/vite-port",
                },
                {
                  text: "Vite proxy 설정으로 CORS 해결하기",
                  link: "/frontend/vite/proxy",
                },
              ],
            },
            {
              text: "Next.js",
              collapsed: true,
              items: [
                {
                  text: "Next.js Hydration 에러 해결",
                  link: "/frontend/nextjs/suppress-hydration-warning",
                },
              ],
            },
            {
              text: "Chrome Extension",
              collapsed: true,
              items: [
                {
                  text: "Chrome Extension MV3 Firebase Google 로그인 구현",
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
                  text: "Supabase 무료 플랜 자동 정지 방지",
                  link: "/backend/supabase/supabase-keep-alive",
                },
              ],
            },
            {
              text: "Firebase",
              collapsed: true,
              items: [
                {
                  text: "Firebase CLI 설치 가이드",
                  link: "/backend/firebase/install-firebase",
                },
              ],
            },
            {
              text: "NestJS",
              collapsed: true,
              items: [
                {
                  text: "NestJS vs Express",
                  link: "/backend/nestjs/my-nestjs",
                },
                {
                  text: "NestJS start:dev 무한 루프 해결",
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
              text: "SQL UPDATE WHERE IN",
              link: "/database/update-in",
            },
            {
              text: "SQL 한글 ORDER BY 정렬 오류 해결",
              link: "/database/korean-sort",
            },
          ],
        },

        {
          text: "Tools",
          items: [
            {
              text: "IntelliJ",
              collapsed: true,
              items: [
                {
                  text: "플러그인 추천 (Java / Spring Boot)",
                  link: "/tools/intellij/intellij-plugins",
                },
              ],
            },
          ],
        },

        {
          text: "Git",
          items: [
            {
              text: "Git 완전 가이드",
              link: "/git/git-complete-guide",
            },
            {
              text: "GitHub README 잘 쓰는 법",
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
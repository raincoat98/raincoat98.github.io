import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/",
  title: "SangWook Blog",
  description: "A VitePress Site",
  cleanUrls: true,
  srcDir: "./src",
  sitemap: {
    hostname: "https://example.com",
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
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      {
        text: "About",
        link: "/introduce/about ",
        activeMatch: "/introduce/about",
      },
      { text: "Examples", link: "/examples/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Introduction",
        collapsed: false,
        items: [
          { text: "About me", link: "/introduce/about" },

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
                text: "Vue 코드 컨벤션",
                link: "/frontend/vue/vue-code-convention",
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

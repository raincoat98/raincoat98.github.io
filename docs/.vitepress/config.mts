import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/",
  title: "SangWook Blog",
  description: "A VitePress Site",
  outDir: "../public",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      {
        text: "About",
        link: "/about ",
        activeMatch: "/about",
      },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Introduction",
        collapsed: false,
        items: [
          { text: "About me", link: "/about" },

          { text: "WHY 개발자?", link: "/my-develop" },
        ],
      },
      {
        text: "Examples",
        collapsed: true,
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
      {
        text: "Frontend",
        items: [
          {
            text: "Vue",
            collapsed: false,
            items: [
              {
                text: "내가 VueJS를 사용하는 이유",
                link: "/frontend/vue/my-vue",
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
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/raincoat98/vitepress" },
    ],

    footer: {
      message: "MIT 라이선스에 따라 릴리즈되었습니다.",
      copyright: "저작권 © 2019-현재 Evan You",
    },
  },
});

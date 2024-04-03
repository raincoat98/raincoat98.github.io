import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
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
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
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

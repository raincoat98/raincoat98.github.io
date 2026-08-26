import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://raincoat98.github.io",
  base: "/",
  // 기존 VitePress cleanUrls와 동일하게 확장자 없는 URL 생성
  build: {
    format: "directory",
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/examples/"),
      customPages: undefined,
    }),
  ],
});
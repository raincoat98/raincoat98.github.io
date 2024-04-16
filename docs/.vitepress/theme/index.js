// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import Comment from "../components/Comment.vue";

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app }) {
    app.component("Comment", Comment);
  },
};

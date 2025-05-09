// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import Comment from "../components/Comment.vue";
import "../../src/public/styles/custom.css";

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app }) {
    app.component("Comment", Comment);
  },
};

// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import Comment from "../components/Comment.vue";
import Dashboard from "../components/Dashboard.vue";
import Hero from "../components/Hero.vue";
import Hero3D from "../components/Hero3D.vue";
import "../../src/public/styles/custom.css";

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app }) {
    app.component("Comment", Comment);
    app.component("Dashboard", Dashboard);
    app.component("Hero", Hero);
    app.component("Hero3D", Hero3D);
  },
};

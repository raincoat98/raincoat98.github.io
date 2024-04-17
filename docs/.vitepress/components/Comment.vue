<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useData } from "vitepress";

const { isDark } = useData();
const darkComment = ref<HTMLElement | null>(null);
const lightComment = ref<HTMLElement | null>(null);

const loadScript = (commentEl: HTMLElement | null, theme: string) => {
  if (commentEl) {
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", "raincoat98/blog_comment");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", theme);
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    commentEl.appendChild(script);
  }
};

onMounted(() => {
  loadScript(darkComment.value, "github-dark");
  loadScript(lightComment.value, "github-light");
});
</script>

<template>
  <div
    v-show="isDark"
    ref="darkComment"
    style="margin: 120px 0px 0px 0px"
  ></div>
  <div
    v-show="!isDark"
    ref="lightComment"
    style="margin: 120px 0px 0px 0px"
  ></div>
</template>

<style lang="scss" scoped></style>

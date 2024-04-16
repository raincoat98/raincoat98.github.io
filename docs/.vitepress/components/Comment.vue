<script lang="ts" setup>
import { ref, onMounted } from "vue";
const comment = ref();

onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://utteranc.es/client.js";
  script.setAttribute("repo", "raincoat98/blog_comment");
  script.setAttribute("issue-term", "pathname");
  script.setAttribute("theme", "github-light");
  script.setAttribute("crossorigin", "anonymous");
  script.async = true;

  if (comment.value) {
    comment.value.appendChild(script);
  }
});
</script>

<template>
  <div ref="comment" style="margin: 120px 0px 0px 0px"></div>
</template>

<style lang="scss" scoped></style>

<!-- <template>
  <div ref="comment"></div>
</template>
<script>
export default {
  mounted() {
    const utterances = document.createElement("script");
    utterances.type = "text/javascript";
    utterances.async = true;
    utterances.src = "https://utteranc.es/client.js";
    utterances.setAttribute("crossorigin", "anonymous");
    utterances.setAttribute("issue-term", "pathname");
    utterances.setAttribute("theme", "github-light");
    utterances.setAttribute("repo", "raincoat98/blog_comment");

    this.$refs.comment.appendChild(utterances);
  },
};
</script> -->

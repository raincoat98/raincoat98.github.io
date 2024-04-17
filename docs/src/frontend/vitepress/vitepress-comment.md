# Vitepress 테마 설정 방법 및 댓글 기능 구현 (Utterances 사용)

## 1. Utterances 설치

먼저, Vitepress 프로젝트에 Utterances를 설치하여 댓글 기능을 추가할 수 있습니다.

## 2. 댓글 컴포넌트 생성

`.vitepress/components/Comment.vue` 파일을 생성합니다.

```jsx
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
  <div ref="comment" style="margin: 120px 0 0"></div>
</template>

<style lang="scss" scoped></style>
```

## 3. 댓글 컴포넌트를 전역에 등록

`.vitepress/theme/index.js` 파일을 수정 전역 컴포넌트로 등록합니다.

```jsx
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
```

## 4. 댓글 컴포넌트를 문서 하단에 배치

문서 하단에 댓글 컴포넌트를 배치합니다.

```jsx
<script setup>
import Comment from "../components/Comment.vue";
import DefaultTheme from "vitepress/theme";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-footer-before>
      <Comment />
    </template>
  </Layout>
</template>
```

## 5. 다크모드 추가

Vitepress에 다크모드를 적용하는 방법입니다. 두 개의 div 객체를 사용하여 다크 모드가 변경될 때 문제를 방지합니다.

```jsx
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
  <div v-show="isDark" ref="darkComment" style="margin: 120px 0 0"></div>
  <div v-show="!isDark" ref="lightComment" style="margin: 120px 0 0"></div>
</template>

<style lang="scss" scoped></style>
```

### 결론

Vitepress에서 댓글 기능

을 구현하여 블로그에 소통의 장을 마련할 수 있습니다. 이를 통해 블로그가 단순한 글 게시의 장소를 넘어 사용자 간의 상호작용이 가능한 공간이 되었습니다.

블로그에 댓글을 추가하니, 더 이상 혼자가 아닌 것 같아 기분이 좋습니다 :)

<script setup>
import Comment from "../components/Comment.vue";
import PostHeader from "../components/PostHeader.vue";
import PostFooter from "../components/PostFooter.vue";
import DefaultTheme from "vitepress/theme";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-before>
      <PostHeader />
    </template>
    <template #doc-footer-before>
      <PostFooter />
      <Comment />
    </template>
  </Layout>
</template>

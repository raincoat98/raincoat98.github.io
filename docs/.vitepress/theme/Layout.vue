<script setup>
import Comment from "../components/Comment.vue";
import PostHeader from "../components/PostHeader.vue";
import DefaultTheme from "vitepress/theme";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-before>
      <PostHeader />
    </template>
    <template #doc-footer-before>
      <Comment />
    </template>
  </Layout>
</template>

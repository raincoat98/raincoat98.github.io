<script setup>
import Comment from "../components/Comment.vue";
import DocumentStats from "../components/DocumentStats.vue";
import DefaultTheme from "vitepress/theme";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-footer-before>
      <DocumentStats />
      <Comment />
    </template>
  </Layout>
</template>

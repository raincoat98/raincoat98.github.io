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

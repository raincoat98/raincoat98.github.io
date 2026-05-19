<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter, page } = useData()

const categories = computed(() => {
  const c = frontmatter.value.categories
  if (!c) return []
  return Array.isArray(c) ? c : [c]
})

const categoryLabel = computed(() =>
  categories.value.map(c => c.toUpperCase()).join(' · ')
)

const shouldShow = computed(() =>
  frontmatter.value.layout !== 'home' &&
  page.value.relativePath !== 'index.md' &&
  categories.value.length > 0
)
</script>

<template>
  <div v-if="shouldShow" class="post-header">
    <div class="post-category-pill">
      <span class="post-category-dot">●</span>
      {{ categoryLabel }}
    </div>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter, page } = useData()

const TAG_COLORS = ['green', 'blue', 'orange', 'red', 'purple', 'teal', 'pink']

const tags = computed(() => {
  const t = frontmatter.value.tags
  if (!t) return []
  return Array.isArray(t) ? t : [t]
})

const tagColors = computed(() => {
  const custom = frontmatter.value.tagColors
  return tags.value.map((_, i) =>
    custom?.[i] ?? TAG_COLORS[i % TAG_COLORS.length]
  )
})

const shouldShow = computed(() =>
  frontmatter.value.layout !== 'home' &&
  page.value.relativePath !== 'index.md' &&
  tags.value.length > 0
)
</script>

<template>
  <div v-if="shouldShow" class="post-footer-tags">
    <span
      v-for="(tag, i) in tags"
      :key="tag"
      class="post-tag-pill"
      :class="`post-tag-pill--${tagColors[i]}`"
    >{{ tag }}</span>
  </div>
</template>

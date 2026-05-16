<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter, page } = useData()

const TAG_COLORS = ['green', 'blue', 'orange', 'red', 'purple', 'teal', 'pink']

// "태그명|색상" 또는 일반 문자열 모두 지원
const tags = computed(() => {
  const t = frontmatter.value.tags
  if (!t) return []
  return (Array.isArray(t) ? t : [t]).map((tag, i) => {
    if (typeof tag === 'string' && tag.includes('|')) {
      const [name, color] = tag.split('|')
      return { name: name.trim(), color: color.trim() }
    }
    return { name: String(tag), color: frontmatter.value.tagColors?.[i] ?? null }
  })
})

const tagColors = computed(() =>
  tags.value.map((tag, i) => tag.color ?? TAG_COLORS[i % TAG_COLORS.length])
)

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
      :key="tag.name"
      class="post-tag-pill"
      :class="`post-tag-pill--${tagColors[i]}`"
    >{{ tag.name }}</span>
  </div>
</template>

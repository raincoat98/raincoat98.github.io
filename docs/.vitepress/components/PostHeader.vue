<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter, page } = useData()

const tags = computed(() => {
  const t = frontmatter.value.tags
  if (!t) return []
  return Array.isArray(t) ? t : [t]
})

const tagLabel = computed(() =>
  tags.value.map(t => t.toUpperCase()).join(' · ')
)

const year = computed(() => {
  const d = frontmatter.value.date
  return d ? new Date(d).getFullYear() : null
})

const metaItems = computed(() => {
  const items = []
  if (year.value) items.push(String(year.value))
  if (frontmatter.value.platform) items.push(frontmatter.value.platform)
  if (frontmatter.value.readingTime) items.push(`읽는 데 약 ${frontmatter.value.readingTime}분`)
  return items
})

const shouldShow = computed(() =>
  frontmatter.value.layout !== 'home' &&
  page.value.relativePath !== 'index.md' &&
  (tags.value.length > 0 || metaItems.value.length > 0)
)
</script>

<template>
  <div v-if="shouldShow" class="post-header">
    <div v-if="tags.length" class="post-tag-pill">
      <span class="post-tag-dot">●</span>
      {{ tagLabel }}
    </div>
    <div v-if="metaItems.length" class="post-meta">
      <template v-for="(item, i) in metaItems" :key="item">
        <span v-if="i > 0" class="meta-sep"> · </span>{{ item }}
      </template>
    </div>
  </div>
</template>

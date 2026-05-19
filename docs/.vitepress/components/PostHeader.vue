<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
dayjs.locale('ko')

const { frontmatter, page } = useData()

const categories = computed(() => {
  const c = frontmatter.value.categories
  if (!c) return []
  return Array.isArray(c) ? c : [c]
})

const categoryLabel = computed(() =>
  categories.value.map(c => c.toUpperCase()).join(' · ')
)

const fmt = (d) => dayjs(d).format('YYYY년 MM월 DD일')

const createdAt = computed(() => {
  const d = frontmatter.value.created || frontmatter.value.date
  return d ? fmt(d) : null
})

const updatedAt = computed(() =>
  page.value.lastUpdated ? fmt(page.value.lastUpdated) : null
)

const metaItems = computed(() => {
  const items = []
  if (createdAt.value) items.push(`생성: ${createdAt.value}`)
  if (updatedAt.value) items.push(`수정: ${updatedAt.value}`)
  if (frontmatter.value.charCount) items.push(`분량: ${frontmatter.value.charCount.toLocaleString()}`)
  if (frontmatter.value.platform) items.push(frontmatter.value.platform)
  if (frontmatter.value.readingTime) items.push(`약 ${frontmatter.value.readingTime}분`)
  return items
})

const shouldShow = computed(() =>
  frontmatter.value.layout !== 'home' &&
  page.value.relativePath !== 'index.md' &&
  (categories.value.length > 0 || metaItems.value.length > 0)
)
</script>

<template>
  <div v-if="shouldShow" class="post-header">
    <div v-if="categories.length" class="post-category-pill">
      <span class="post-category-dot">●</span>
      {{ categoryLabel }}
    </div>
    <div v-if="metaItems.length" class="post-meta">
      <template v-for="(item, i) in metaItems" :key="item">
        <span v-if="i > 0" class="meta-sep"> · </span>{{ item }}
      </template>
    </div>
  </div>
</template>

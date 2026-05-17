<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'
dayjs.extend(relativeTime)
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

const createdAt = computed(() => {
  const d = frontmatter.value.created || frontmatter.value.date
  return d ? dayjs(d).fromNow() : null
})

const updatedAt = computed(() =>
  page.value.lastUpdated
    ? dayjs(page.value.lastUpdated).fromNow()
    : null
)

const metaItems = computed(() => {
  const items = []
  if (createdAt.value) items.push(`${createdAt.value} 작성`)
  if (updatedAt.value) items.push(`${updatedAt.value} 수정`)
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

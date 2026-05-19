<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
dayjs.locale('ko')

const { frontmatter, page } = useData()

const fmt = (d) => dayjs(d).format('YYYY년 MM월 DD일')

const items = computed(() => {
  const list = []
  const created = frontmatter.value.created || frontmatter.value.date
  if (created) list.push({ label: '작성일', value: fmt(created) })
  if (page.value.lastUpdated) list.push({ label: '수정일', value: fmt(page.value.lastUpdated) })
  if (frontmatter.value.charCount) list.push({ label: '분량', value: frontmatter.value.charCount.toLocaleString() })
  if (frontmatter.value.readingTime) list.push({ label: '읽는 시간', value: `약 ${frontmatter.value.readingTime}분` })
  return list
})

const shouldShow = computed(() =>
  frontmatter.value.layout !== 'home' &&
  page.value.relativePath !== 'index.md' &&
  items.value.length > 0
)
</script>

<template>
  <div v-if="shouldShow" class="post-aside-meta">
    <div v-for="item in items" :key="item.label" class="post-aside-meta-item">
      <span class="post-aside-meta-label">{{ item.label }}</span>
      <span class="post-aside-meta-value">{{ item.value }}</span>
    </div>
  </div>
</template>

<style scoped>
.post-aside-meta {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.post-aside-meta-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.post-aside-meta-label {
  min-width: 36px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.post-aside-meta-value {
  color: var(--vp-c-text-2);
}
</style>

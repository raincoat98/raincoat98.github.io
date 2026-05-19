<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
dayjs.locale('ko')

const props = defineProps({ mobile: Boolean })

const { frontmatter, page } = useData()

const fmt = (d) => dayjs(d).format('YY.MM.DD')
const fmtFull = (d) => dayjs(d).format('YYYY년 MM월 DD일')

const created = computed(() => frontmatter.value.created || frontmatter.value.date)

const items = computed(() => {
  const list = []
  if (created.value) list.push({ label: '작성일', value: fmtFull(created.value) })
  if (page.value.lastUpdated) list.push({ label: '수정일', value: fmtFull(page.value.lastUpdated) })
  if (frontmatter.value.charCount) list.push({ label: '분량', value: frontmatter.value.charCount.toLocaleString() })
  if (frontmatter.value.readingTime) list.push({ label: '읽는 시간', value: `약 ${frontmatter.value.readingTime}분` })
  return list
})

// 모바일용 한 줄 요약
const mobileParts = computed(() => {
  const parts = []
  if (created.value) parts.push(fmt(created.value) + ' 작성')
  if (page.value.lastUpdated) parts.push(fmt(page.value.lastUpdated) + ' 수정')
  if (frontmatter.value.readingTime) parts.push(`약 ${frontmatter.value.readingTime}분`)
  return parts
})

const shouldShow = computed(() =>
  frontmatter.value.layout !== 'home' &&
  page.value.relativePath !== 'index.md' &&
  items.value.length > 0
)
</script>

<template>
  <!-- 데스크톱: 사이드바 수직 목록 -->
  <div v-if="!props.mobile && shouldShow" class="post-aside-meta">
    <div v-for="item in items" :key="item.label" class="post-aside-meta-item">
      <span class="post-aside-meta-label">{{ item.label }}</span>
      <span class="post-aside-meta-value">{{ item.value }}</span>
    </div>
  </div>

  <!-- 모바일: 한 줄 바 -->
  <div v-if="props.mobile && shouldShow" class="post-mobile-meta">
    <span v-for="(part, i) in mobileParts" :key="i" class="post-mobile-meta-part">
      <span v-if="i > 0" class="post-mobile-meta-dot">·</span>
      {{ part }}
    </span>
  </div>
</template>

<style scoped>
/* 데스크톱 사이드바 */
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

/* 모바일 한 줄 바 */
.post-mobile-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px 4px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-bottom: 20px;
}

.post-mobile-meta-dot {
  margin: 0 2px;
  color: var(--vp-c-text-3);
}

/* 모바일에서만 보이게 */
.post-mobile-meta {
  display: none;
}

@media (max-width: 1279px) {
  .post-mobile-meta {
    display: flex;
  }

  /* 모바일에서 aside-top PostMeta 숨김 */
  .post-aside-meta {
    display: none;
  }
}
</style>

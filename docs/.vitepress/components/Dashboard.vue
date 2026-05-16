<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useData } from "vitepress";

const { site, theme } = useData();

const documentsWithDates = ref<any[]>([]);
const loading = ref(true);

type SortKey = "newest-created" | "newest-modified" | "name" | "oldest-created";
const SORT_KEY_STORAGE = "dashboard-sort-key";
const sortKey = ref<SortKey>("newest-created");

watch(sortKey, (val) => {
  localStorage.setItem(SORT_KEY_STORAGE, val);
});

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "newest-created", label: "최신생성순" },
  { key: "newest-modified", label: "최신수정순" },
  { key: "name", label: "이름순" },
  { key: "oldest-created", label: "오래된순" },
];

// 3D 효과용 refs
const bgOrb1 = ref<HTMLElement | null>(null);
const bgOrb2 = ref<HTMLElement | null>(null);
const bgOrb3 = ref<HTMLElement | null>(null);

const handleMouseMove = (e: MouseEvent) => {
  const container = e.currentTarget as HTMLElement;
  const rect = container.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  const moveX = (x - 0.5) * 30;
  const moveY = (y - 0.5) * 30;

  if (bgOrb1.value) bgOrb1.value.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px) scale(1.05)`;
  if (bgOrb2.value) bgOrb2.value.style.transform = `translate(${-moveX * 0.4}px, ${-moveY * 0.4}px) scale(1.08)`;
  if (bgOrb3.value) bgOrb3.value.style.transform = `translate(${moveX * 0.5}px, ${-moveY * 0.3}px) scale(1.06)`;
};

const handleMouseLeave = () => {
  if (bgOrb1.value) bgOrb1.value.style.transform = "translate(0, 0) scale(1)";
  if (bgOrb2.value) bgOrb2.value.style.transform = "translate(0, 0) scale(1)";
  if (bgOrb3.value) bgOrb3.value.style.transform = "translate(0, 0) scale(1)";
};

const extractDocumentsFromSidebar = (sidebar: any[]): any[] => {
  const docs: any[] = [];
  const traverse = (items: any[]) => {
    if (!items) return;
    for (const item of items) {
      if (item.link && !item.link.includes("/introduce/") && !item.link.includes("/examples/") && item.link !== "/") {
        docs.push({ link: item.link, text: item.text, tag: getTagFromPath(item.link) });
      }
      if (item.items) traverse(item.items);
    }
  };
  traverse(sidebar);
  return docs;
};

const getTagFromPath = (path: string): string => {
  if (path.includes("/frontend/vue")) return "Vue";
  if (path.includes("/frontend/react")) return "React";
  if (path.includes("/frontend/javascript")) return "JavaScript";
  if (path.includes("/frontend/typescript")) return "TypeScript";
  if (path.includes("/frontend/vite")) return "Vite";
  if (path.includes("/frontend/nextjs")) return "NextJS";
  if (path.includes("/frontend/vitepress")) return "VitePress";
  if (path.includes("/frontend/chrome-extension")) return "Chrome";
  if (path.includes("/backend/nestjs")) return "NestJS";
  if (path.includes("/backend/firebase")) return "Firebase";
  if (path.includes("/backend/supabase")) return "Supabase";
  if (path.includes("/database")) return "Database";
  if (path.includes("/git")) return "Git";
  return "기타";
};

const getTimeAgo = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 30) return `${diffDays}일 전`;
  if (diffMonths < 12) return `${diffMonths}개월 전`;
  return `${diffYears}년 전`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

const cleanTitle = (title: string): string => {
  if (!title) return "";
  return title.replace(/\*\*/g, "").replace(/#/g, "").trim();
};

const allPosts = computed(() => {
  const docs = [...documentsWithDates.value];

  if (sortKey.value === "newest-created") {
    docs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } else if (sortKey.value === "oldest-created") {
    docs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Infinity;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Infinity;
      return dateA - dateB;
    });
  } else if (sortKey.value === "newest-modified") {
    docs.sort((a, b) => {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA;
    });
  } else if (sortKey.value === "name") {
    docs.sort((a, b) => {
      const titleA = cleanTitle(a.title || a.text);
      const titleB = cleanTitle(b.title || b.text);
      return titleA.localeCompare(titleB, "ko");
    });
  }

  return docs.map((doc) => ({
    link: doc.path || doc.link,
    text: cleanTitle(doc.title || doc.text),
    tag: doc.tag || getTagFromPath(doc.path || doc.link),
    date: doc.createdAt ? formatDate(doc.createdAt) : "",
    timeAgo: doc.lastModified ? getTimeAgo(doc.lastModified) : (doc.createdAt ? getTimeAgo(doc.createdAt) : ""),
  }));
});

const loadDocumentsFromStats = async () => {
  try {
    const base = site.value.base || "/";
    const possibleUrls = ["/stats.json", `${base}stats.json`.replace(/\/+/g, "/"), "./stats.json", "stats.json"];

    let statsData = null;
    for (const statsUrl of possibleUrls) {
      try {
        const response = await fetch(statsUrl, { cache: "no-cache" });
        if (response.ok) { statsData = await response.json(); break; }
      } catch { continue; }
    }

    if (statsData?.documents && Array.isArray(statsData.documents)) {
      documentsWithDates.value = statsData.documents
        .filter((doc: any) => doc?.path && !doc.path.includes("/introduce/") && !doc.path.includes("/examples/") && doc.path !== "/index")
        .map((doc: any) => ({ ...doc, tag: getTagFromPath(doc.path) }));
      loading.value = false;
      return;
    }
  } catch { /* fallback으로 진행 */ }

  try {
    const sidebar = theme.value.sidebar;
    if (sidebar && Array.isArray(sidebar)) {
      const docs = extractDocumentsFromSidebar(sidebar);
      documentsWithDates.value = docs.map((doc) => ({ ...doc, path: doc.link, title: doc.text, lastModified: null, createdAt: null }));
    }
  } catch { /* noop */ } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const saved = localStorage.getItem(SORT_KEY_STORAGE) as SortKey | null;
  if (saved && sortOptions.some((o) => o.key === saved)) {
    sortKey.value = saved;
  }
  loadDocumentsFromStats();
});
</script>

<template>
  <div class="dashboard-wrapper" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <!-- 배경 -->
    <div class="dashboard-3d-bg">
      <div class="bg-orb bg-orb-1" ref="bgOrb1"></div>
      <div class="bg-orb bg-orb-2" ref="bgOrb2"></div>
      <div class="bg-orb bg-orb-3" ref="bgOrb3"></div>
    </div>

    <div class="dashboard-container">
      <!-- 정렬 헤더 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="total-count">총 {{ allPosts.length }}개</span>
        </div>
        <div class="sort-buttons">
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            :class="['sort-btn', { active: sortKey === opt.key }]"
            @click="sortKey = opt.key"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 전체 글 그리드 -->
      <div v-if="!loading && allPosts.length > 0" class="posts-grid">
        <a
          v-for="(post, index) in allPosts"
          :key="post.link"
          :href="site.base + post.link.replace(/^\//, '')"
          class="modern-card"
          :style="{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }"
        >
          <div class="card-content">
            <div class="card-top">
              <span :class="['modern-tag', post.tag.toLowerCase().replace(/\./g, '')]">
                {{ post.tag }}
              </span>
              <span v-if="post.timeAgo" class="card-time">{{ post.timeAgo }}</span>
            </div>
            <h3 class="card-heading">{{ post.text }}</h3>
            <div class="card-footer">
              <span v-if="post.date" class="card-date">{{ post.date }}</span>
              <div class="card-arrow">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </a>
      </div>

      <div v-else-if="loading" class="empty-state">
        <div class="empty-icon">⏳</div>
        <p class="empty-text">불러오는 중...</p>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📄</div>
        <p class="empty-text">표시할 글이 없습니다</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-height: auto;
  background: transparent;
  padding: 0;
  margin-top: 4rem;
  position: relative;
  overflow: visible;
}

/* 배경 */
.dashboard-3d-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  animation: orbFloat 12s ease-in-out infinite;
}

.bg-orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent);
  top: -10%; right: 10%;
}
.bg-orb-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.35), transparent);
  bottom: -5%; left: 5%;
  animation-delay: 2s;
}
.bg-orb-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent);
  top: 60%; left: 50%;
  animation-delay: 4s;
}

/* 컨테이너 */
.dashboard-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

/* 정렬 툴바 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.total-count {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.sort-buttons {
  display: flex;
  gap: 0;
  flex-wrap: wrap;
}

.sort-btn {
  padding: 0.25rem 0.65rem;
  border-radius: 0;
  font-size: 0.8rem;
  font-weight: 500;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.sort-btn:hover {
  color: var(--vp-c-text-1);
}

.sort-btn.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* 카드 그리드 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.modern-card {
  position: relative;
  display: block;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.5s ease-out backwards;
}

.modern-card::before {
  content: "";
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.07), transparent);
  transition: left 0.5s ease;
}

.modern-card:hover::before { left: 100%; }

.modern-card:hover {
  transform: translateY(-5px) scale(1.015);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.18), 0 0 0 1px rgba(99, 102, 241, 0.08);
}

.card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.modern-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: white;
  flex-shrink: 1;
  min-width: 0;
  max-width: 55%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-time {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
  white-space: nowrap;
}

.card-heading {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  transition: color 0.25s ease;
}

.modern-card:hover .card-heading {
  color: var(--vp-c-brand-1);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--vp-c-divider);
}

.card-date {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.card-arrow {
  color: var(--vp-c-brand-1);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.25s ease;
}

.modern-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--vp-c-text-3);
}
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
.empty-text { font-size: 1rem; margin: 0; }

/* 태그 색상 */
.modern-tag.vue { background: #42b883; }
.modern-tag.react { background: #2196f3; }
.modern-tag.javascript { background: #f7df1e; color: #323330; }
.modern-tag.typescript { background: #3178c6; }
.modern-tag.nestjs { background: #ea2845; }
.modern-tag.firebase { background: #ffca28; color: #323330; }
.modern-tag.supabase { background: #3ecf8e; }
.modern-tag.database { background: #4a4a4a; }
.modern-tag.git { background: #f05033; }
.modern-tag.vite { background: #646cff; }
.modern-tag.vitepress { background: #42c2a0; }
.modern-tag.nextjs { background: #090909; }
.modern-tag.chrome { background: #4285f4; }
.modern-tag.기타 { background: #777; }

/* 애니메이션 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 30px) scale(1.1); }
}

/* 반응형 */
@media (max-width: 768px) {
  .dashboard-wrapper { margin-top: 2rem; }
  .dashboard-container { padding: 0; }
  .toolbar { flex-direction: column; align-items: flex-start; }
  .sort-buttons { flex-wrap: nowrap; overflow-x: auto; width: 100%; }
  .sort-btn { flex-shrink: 0; }
  .posts-grid { grid-template-columns: 1fr; gap: 1rem; }
}
</style>

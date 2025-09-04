<template>
  <div class="document-stats">
    <div class="stats-header">
      <div class="stats-tabs">
        <button
          :class="['tab-button', { active: activeTab === 'creation' }]"
          @click="activeTab = 'creation'"
        >
          📝 생성 통계
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'modification' }]"
          @click="activeTab = 'modification'"
        >
          🔄 수정 통계
        </button>
      </div>
    </div>

    <div class="stats-content">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>문서 통계를 불러오는 중...</p>
      </div>

      <div v-else-if="activeTab === 'creation'" class="creation-stats">
        <h3>📊 문서 생성 통계</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ totalDocuments }}</div>
            <div class="stat-label">총 문서 수</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ thisMonthCreated }}</div>
            <div class="stat-label">이번 달 생성</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ thisYearCreated }}</div>
            <div class="stat-label">올해 생성</div>
          </div>
        </div>

        <div class="recent-documents">
          <h4>최근 생성된 문서</h4>
          <ul>
            <li v-for="doc in recentCreated" :key="doc.path">
              <div class="doc-info">
                <span class="doc-title">{{ doc.title }}</span>
                <div class="doc-dates">
                  <span class="doc-date"
                    >생성: {{ formatDate(doc.createdAt) }}</span
                  >
                  <span class="doc-date"
                    >수정: {{ formatDate(doc.lastModified) }}</span
                  >
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div v-else-if="activeTab === 'modification'" class="modification-stats">
        <h3>📈 문서 수정 통계</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ totalModifications }}</div>
            <div class="stat-label">총 수정 횟수</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ thisMonthModified }}</div>
            <div class="stat-label">이번 달 수정</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ avgModificationsPerDoc }}</div>
            <div class="stat-label">문서당 평균 수정</div>
          </div>
        </div>

        <div class="most-modified">
          <h4>가장 많이 수정된 문서</h4>
          <ul>
            <li v-for="doc in mostModified" :key="doc.path">
              <span class="doc-title">{{ doc.title }}</span>
              <span class="doc-count">{{ doc.modificationCount }}회 수정</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getSampleData, calculateStats } from "../utils/gitStats.js";

const activeTab = ref("creation");
const documents = ref([]);
const loading = ref(true);

// Git 통계 데이터 로드
const loadDocumentStats = async () => {
  try {
    loading.value = true;

    // 생성된 통계 JSON 파일에서 데이터 로드 시도
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/stats.json?t=${timestamp}`, {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      if (response.ok) {
        const statsData = await response.json();
        if (statsData.documents && statsData.documents.length > 0) {
          documents.value = statsData.documents;
          console.log("📊 실제 Git 통계 데이터를 로드했습니다.");
          console.log(`🕐 생성시간: ${statsData.generatedAt}`);
          console.log(`📝 총 ${statsData.documents.length}개 문서`);
          return;
        }
      }
    } catch (fetchError) {
      console.log(
        "📊 통계 파일을 찾을 수 없어 샘플 데이터를 사용합니다.",
        fetchError
      );
    }

    // 통계 파일이 없으면 샘플 데이터 사용
    documents.value = getSampleData();
  } catch (error) {
    console.error("문서 통계를 로드하는 중 오류 발생:", error);
    // 오류 시 샘플 데이터 사용
    documents.value = getSampleData();
  } finally {
    loading.value = false;
  }
};

const totalDocuments = computed(() => documents.value.length);

const thisMonthCreated = computed(() => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  return documents.value.filter((doc) => {
    const created = new Date(doc.createdAt);
    return (
      created.getMonth() === thisMonth && created.getFullYear() === thisYear
    );
  }).length;
});

const thisYearCreated = computed(() => {
  const now = new Date();
  const thisYear = now.getFullYear();

  return documents.value.filter((doc) => {
    const created = new Date(doc.createdAt);
    return created.getFullYear() === thisYear;
  }).length;
});

const totalModifications = computed(() => {
  return documents.value.reduce((sum, doc) => sum + doc.modificationCount, 0);
});

const thisMonthModified = computed(() => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  return documents.value.filter((doc) => {
    const modified = new Date(doc.lastModified);
    return (
      modified.getMonth() === thisMonth && modified.getFullYear() === thisYear
    );
  }).length;
});

const avgModificationsPerDoc = computed(() => {
  return (
    Math.round((totalModifications.value / totalDocuments.value) * 10) / 10
  );
});

const recentCreated = computed(() => {
  return [...documents.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
});

const mostModified = computed(() => {
  return [...documents.value]
    .sort((a, b) => b.modificationCount - a.modificationCount)
    .slice(0, 5);
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  loadDocumentStats();
});
</script>

<style scoped>
.document-stats {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.stats-header {
  display: flex;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.stats-tabs {
  display: flex;
  flex: 1;
}

.tab-button {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.tab-button.active {
  background: var(--vp-c-brand);
  color: white;
}

.stats-content {
  padding: 1.5rem;
}

.stats-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: var(--vp-c-text-1);
}

.stats-content h4 {
  margin: 1.5rem 0 0.5rem 0;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--vp-c-brand);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.recent-documents ul,
.most-modified ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-documents li,
.most-modified li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.doc-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.25rem;
}

.doc-dates {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.recent-documents li:last-child,
.most-modified li:last-child {
  border-bottom: none;
}

.doc-title {
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-weight: 500;
}

.doc-date,
.doc-count {
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
}

.doc-dates .doc-date {
  font-size: 0.7rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--vp-c-divider);
  border-top: 3px solid var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stats-header {
    padding: 0.5rem;
  }

  .stats-tabs {
    width: 100%;
  }

  .tab-button {
    font-size: 0.8rem;
    padding: 0.75rem;
  }

  .stats-content {
    padding: 1rem;
  }
}
</style>

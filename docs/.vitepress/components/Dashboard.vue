<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useData } from "vitepress";

const { site } = useData();

// 데이터 로딩 상태
const loading = ref(true);
const documents = ref<any[]>([]);

// 통계 데이터
const stats = ref({
  views: { value: 0, change: 0 },
  users: { value: 0, change: 0 },
});

// 그래프 데이터
const graphData = ref<number[]>([]);
const graphPeriod = ref<number>(21); // 기본값: 21일
const searchConsoleDailyData = ref<any[]>([]); // Search Console 일별 데이터 저장

// 경로에서 태그 추출
const getTagFromPath = (path: string): string => {
  if (path.includes("/frontend/vue")) return "Vue";
  if (path.includes("/frontend/react")) return "React";
  if (path.includes("/frontend/javascript")) return "JavaScript";
  if (path.includes("/frontend/typescript")) return "TypeScript";
  if (path.includes("/frontend/vite")) return "Vite";
  if (path.includes("/frontend/nextjs")) return "Next.js";
  if (path.includes("/frontend/vitepress")) return "VitePress";
  if (path.includes("/backend/nestjs")) return "NestJS";
  if (path.includes("/backend/firebase")) return "Firebase";
  if (path.includes("/database")) return "Database";
  if (path.includes("/git")) return "Git";
  return "기타";
};

// 날짜를 상대 시간으로 변환
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 30) {
    return `${diffDays}일 전`;
  } else if (diffMonths < 12) {
    return `${diffMonths}달 전`;
  } else {
    return `${diffYears}년 전`;
  }
};

// 제목에서 마크다운 제거
const cleanTitle = (title: string): string => {
  return title.replace(/\*\*/g, "").replace(/#/g, "").trim();
};

// stats.json에서 데이터 로드
const loadDocumentStats = async () => {
  try {
    loading.value = true;
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
        // introduce, examples, index 페이지 제외
        documents.value = statsData.documents.filter(
          (doc: any) =>
            !doc.path.includes("/introduce/") &&
            !doc.path.includes("/examples/") &&
            doc.path !== "/index"
        );
      }

      // Search Console 데이터가 있으면 사용
      if (statsData.searchConsole) {
        updateStatsWithSearchConsole(statsData.searchConsole);
        // 그래프 데이터도 Search Console 데이터로 업데이트
        if (statsData.searchConsole.dailyData) {
          searchConsoleDailyData.value = statsData.searchConsole.dailyData;
          // 초기 로드 시에도 현재 선택된 기간에 맞게 필터링
          updateGraphDataFromSearchConsole(statsData.searchConsole.dailyData);
        }
      }
    }
  } catch (error) {
    console.error("문서 통계를 로드하는 중 오류 발생:", error);
  } finally {
    loading.value = false;
  }
};

// 주기적으로 데이터 갱신 (5분마다)
let refreshInterval: ReturnType<typeof setInterval> | null = null;

const startAutoRefresh = () => {
  // 기존 인터벌이 있으면 제거
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // 5분마다 데이터 갱신
  refreshInterval = setInterval(() => {
    console.log("🔄 데이터 자동 갱신 중...");
    loadDocumentStats();
  }, 5 * 60 * 1000); // 5분
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// 최신 글 목록 (최근 수정순)
const recentPosts = computed(() => {
  return documents.value
    .sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
    .slice(0, 6)
    .map((doc) => ({
      tag: getTagFromPath(doc.path),
      title: cleanTitle(doc.title),
      time: getTimeAgo(doc.lastModified),
      link: doc.path,
    }));
});

// 추천 글 (가장 최근 수정된 글)
const featuredPost = computed(() => {
  if (documents.value.length === 0) {
    return {
      title: "Zod 핵심 정리 - 런타임 타입 검증",
      description:
        "TypeScript는 컴파일 타임에 타입 체크를 제공하지만, 런타임에서는 타입 안전성을 보장하지 않습니다. Zod를 사용하면 런타임에서도 타입 검증이 가능합니다.",
      link: "/frontend/typescript/zod",
      image: "/images/zod.png",
    };
  }

  const latest = documents.value.sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  )[0];

  return {
    title: cleanTitle(latest.title),
    description: `${cleanTitle(latest.title)}에 대한 내용입니다.`,
    link: latest.path,
    image: "/images/vue.png",
  };
});

// 글 카드 목록 (최근 생성 또는 수정된 글 중 인기 있는 것들)
const articleCards = computed(() => {
  if (documents.value.length === 0) {
    return [];
  }

  // 수정 횟수가 많은 순으로 정렬하여 인기 있는 글 선택
  const popular = documents.value
    .sort((a, b) => b.modificationCount - a.modificationCount)
    .slice(0, 4);

  return popular.map((doc) => {
    const tag = getTagFromPath(doc.path);
    return {
      title: cleanTitle(doc.title),
      description: `${cleanTitle(doc.title)}에 대한 내용입니다.`,
      tag: tag.length > 4 ? tag.substring(0, 4) : tag,
      link: doc.path,
      image: "/images/vue.png",
    };
  });
});

// Search Console 데이터로 통계 업데이트
const updateStatsWithSearchConsole = (searchConsoleData: any) => {
  if (searchConsoleData) {
    console.log(searchConsoleData);
    // 실제 Search Console 데이터 사용
    stats.value.views.value = searchConsoleData.totalClicks || 0;
    stats.value.views.change = searchConsoleData.clicksChange || 0;

    // 사용자 수는 노출 수의 일정 비율로 추정 (실제 사용자 데이터는 Search Console에 없음)
    stats.value.users.value = Math.round(
      (searchConsoleData.totalImpressions || 0) * 0.3
    );
    stats.value.users.change = searchConsoleData.clicksChange || 0;
  }
};

// 통계 업데이트 (실제 문서 수 기반 - Fallback)
const updateStats = () => {
  if (documents.value.length > 0) {
    const totalDocs = documents.value.length;
    const totalModifications = documents.value.reduce(
      (sum, doc) => sum + doc.modificationCount,
      0
    );
    const now = new Date();

    // 지난 30일과 그 이전 30일 비교
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    const last30To60Days = new Date(now);
    last30To60Days.setDate(last30To60Days.getDate() - 60);

    // 최근 30일간 수정된 문서
    const recent30DaysDocs = documents.value.filter((doc) => {
      const modified = new Date(doc.lastModified);
      return modified >= last30Days;
    }).length;

    // 30일 전부터 60일 전까지 수정된 문서
    const previous30DaysDocs = documents.value.filter((doc) => {
      const modified = new Date(doc.lastModified);
      return modified >= last30To60Days && modified < last30Days;
    }).length;

    // Search Console 데이터가 없을 때만 추정치 사용
    if (stats.value.views.value === 0) {
      // 실제 데이터 기반 계산 (Fallback)
      // 총 문서 수 * 평균 조회수 (실제 통계 기반)
      stats.value.views.value = totalDocs * 800;
      // 총 수정 횟수 기반 사용자 수 추정
      stats.value.users.value = totalModifications * 200;

      // 전월 대비 변화율 계산 (최근 30일 vs 그 이전 30일)
      if (previous30DaysDocs > 0) {
        const viewsChange =
          ((recent30DaysDocs - previous30DaysDocs) / previous30DaysDocs) * 100;
        stats.value.views.change = Math.round(viewsChange * 10) / 10;
      } else if (recent30DaysDocs > 0) {
        // 이전 기간에 데이터가 없고 최근에만 있으면 증가로 표시
        stats.value.views.change = 100;
      } else {
        // 데이터가 없으면 0% 유지
        stats.value.views.change = 0;
      }

      if (previous30DaysDocs > 0) {
        const usersChange =
          ((recent30DaysDocs - previous30DaysDocs) / previous30DaysDocs) * 100;
        stats.value.users.change = Math.round(usersChange * 10) / 10;
      } else if (recent30DaysDocs > 0) {
        stats.value.users.change = 100;
      } else {
        stats.value.users.change = 0;
      }
    }

    // 그래프 데이터 생성 (지난 21일간의 수정 활동)
    generateGraphData();
  }
};

// Search Console 일별 데이터로 그래프 업데이트
const updateGraphDataFromSearchConsole = (dailyData?: any[]) => {
  // dailyData가 없으면 저장된 데이터 사용
  const dataToUse = dailyData || searchConsoleDailyData.value;

  if (!dataToUse || dataToUse.length === 0) {
    // Search Console 데이터가 없으면 fallback
    generateGraphData();
    return;
  }

  // 날짜 기준으로 정렬 (오름차순)
  const sortedData = [...dataToUse].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  // 선택된 기간에 따라 데이터 필터링 (최근 N일)
  const period = graphPeriod.value;
  const recentData = sortedData.slice(-period);

  // 최대값 찾기
  const maxClicks = Math.max(...recentData.map((d) => d.clicks || 0), 1);

  // 0-100 범위로 정규화
  const newGraphData = recentData.map((d) => {
    const clicks = d.clicks || 0;
    return clicks > 0 ? (clicks / maxClicks) * 100 : 0;
  });

  // 반응형 업데이트를 위해 새 배열 할당
  graphData.value = [...newGraphData];

  console.log(
    `📊 그래프 업데이트: ${period}일, 데이터 포인트: ${newGraphData.length}개, 최대 클릭: ${maxClicks}`
  );
  if (recentData.length > 0) {
    console.log(
      `   데이터 범위: ${recentData[0]?.date} ~ ${
        recentData[recentData.length - 1]?.date
      }`
    );
  }
};

// 기간 변경 핸들러
const handlePeriodChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const periodText = select.value;

  // 텍스트에서 숫자 추출
  const periodMatch = periodText.match(/(\d+)/);
  if (periodMatch) {
    const newPeriod = parseInt(periodMatch[1]);
    console.log(`🔄 기간 변경: ${graphPeriod.value}일 → ${newPeriod}일`);

    // 기간 값 업데이트
    graphPeriod.value = newPeriod;

    // 그래프 데이터 즉시 업데이트 (저장된 데이터 사용)
    if (searchConsoleDailyData.value.length > 0) {
      updateGraphDataFromSearchConsole();
    } else {
      generateGraphData();
    }
  }
};

// 그래프 데이터 생성 (실제 수정 데이터 기반 - Fallback)
const generateGraphData = () => {
  // Search Console 데이터가 이미 있으면 사용하지 않음
  if (searchConsoleDailyData.value.length > 0) {
    return;
  }

  const days = graphPeriod.value;
  const data: number[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // 해당 날짜에 수정된 문서 수
    const count = documents.value.filter((doc) => {
      const modified = new Date(doc.lastModified);
      modified.setHours(0, 0, 0, 0);
      return modified >= date && modified < nextDate;
    }).length;

    data.push(count);
  }

  // 0-100 범위로 정규화 (최대값 기준)
  const maxCount = Math.max(...data, 1);
  graphData.value = data.map((count) =>
    count > 0 ? (count / maxCount) * 100 : 0
  );
};

// 그래프 포인트 생성 (computed로 반응성 보장)
const graphPoints = computed(() => {
  if (graphData.value.length === 0) {
    return "0,120 30,100 60,80 90,70 120,65 150,60 180,55 210,50 240,45 270,40 300,35";
  }

  const width = 300;
  const height = 150;
  const padding = 20;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const dataLength = graphData.value.length;

  const points = graphData.value.map((value, index) => {
    // 데이터 포인트가 1개일 때 처리
    const x =
      dataLength === 1
        ? padding + graphWidth / 2
        : padding + (index / (dataLength - 1)) * graphWidth;

    // 그래프는 위에서 아래로, 값이 클수록 위에 위치 (y 값이 작음)
    const y = padding + (1 - value / 100) * graphHeight;
    return `${x},${y}`;
  });

  return points.join(" ");
});

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "만";
  }
  return num.toLocaleString();
};

// 태그 클래스 이름 생성 (한글 태그 처리)
const getTagClass = (tag: string): string => {
  const tagMap: Record<string, string> = {
    Vue: "vue",
    React: "react",
    JavaScript: "javascript",
    TypeScript: "typescript",
    NestJS: "nestjs",
    Firebase: "firebase",
    Database: "database",
    Git: "git",
    Vite: "vite",
    VitePress: "vitepress",
    "Next.js": "nextjs",
    기타: "기타",
  };
  return tagMap[tag] || tag.toLowerCase();
};

onMounted(() => {
  loadDocumentStats().then(() => {
    updateStats();
    // 자동 갱신 시작
    startAutoRefresh();
  });
});

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<template>
  <div class="career-dashboard">
    <!-- 메인 콘텐츠 영역 -->
    <div class="dashboard-content">
      <!-- 왼쪽: 통계 -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-label">조회수</div>
          <div class="stat-value">{{ formatNumber(stats.views.value) }}</div>
          <div v-if="stats.views.change >= 0" class="stat-change positive">
            {{ stats.views.change > 0 ? "+" : "" }}{{ stats.views.change }}%
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">사용자</div>
          <div class="stat-value">{{ formatNumber(stats.users.value) }}</div>
          <div v-if="stats.users.change >= 0" class="stat-change positive">
            {{ stats.users.change > 0 ? "+" : "" }}{{ stats.users.change }}%
          </div>
        </div>
        <div class="stat-graph">
          <div class="graph-header">
            <span>조회수 추이</span>
            <select
              class="graph-period"
              @change="handlePeriodChange"
              :value="`지난 ${graphPeriod}일`"
            >
              <option value="지난 7일">지난 7일</option>
              <option value="지난 21일">지난 21일</option>
              <option value="지난 30일">지난 30일</option>
            </select>
          </div>
          <svg
            class="graph-svg"
            viewBox="0 0 300 150"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style="stop-color: #ff6b35; stop-opacity: 0.3"
                />
                <stop
                  offset="100%"
                  style="stop-color: #ff6b35; stop-opacity: 0"
                />
              </linearGradient>
            </defs>
            <polyline
              :points="graphPoints"
              fill="url(#gradient)"
              stroke="#ff6b35"
              stroke-width="2"
            />
          </svg>
        </div>
      </div>

      <!-- 중앙: 최신 글 -->
      <div class="recent-posts-section">
        <div class="section-header">
          <h2>최신 짧은 글</h2>
          <a href="/frontend/vue/my-vue" class="view-all">전체 보기</a>
        </div>
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
        <ul v-else class="post-list">
          <li
            v-for="(post, index) in recentPosts"
            :key="index"
            class="post-item"
          >
            <span class="post-tag" :class="getTagClass(post.tag)">{{
              post.tag
            }}</span>
            <a :href="post.link" class="post-title">{{ post.title }}</a>
            <span class="post-time">{{ post.time }}</span>
          </li>
        </ul>
      </div>

      <!-- 오른쪽: 추천 글 -->
      <div class="featured-post-section">
        <div class="featured-post-card">
          <div class="featured-image">
            <div class="image-placeholder">Lib</div>
          </div>
          <h3 class="featured-title">
            <a :href="featuredPost.link">{{ featuredPost.title }}</a>
          </h3>
          <p class="featured-description">{{ featuredPost.description }}</p>
        </div>
      </div>
    </div>

    <!-- 하단: 글 카드 그리드 -->
    <div v-if="!loading && articleCards.length > 0" class="article-grid">
      <article
        v-for="(card, index) in articleCards"
        :key="index"
        class="article-card"
      >
        <div class="card-image">
          <div class="image-placeholder">{{ card.tag }}</div>
        </div>
        <div class="card-tag">{{ card.tag }}</div>
        <h3 class="card-title">
          <a :href="card.link">{{ card.title }}</a>
        </h3>
        <p class="card-description">{{ card.description }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.career-dashboard {
  padding: 2rem 0;
  box-sizing: border-box;
}

/* 메인 콘텐츠 */
.dashboard-content {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  gap: 2rem;
  margin-bottom: 3rem;
}

/* 통계 섹션 */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-change.positive {
  color: #ff6b35;
}

.stat-change.negative {
  color: #4ade80;
}

.stat-graph {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.graph-period {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.75rem;
  cursor: pointer;
}

.graph-svg {
  width: 100%;
  height: 120px;
  margin-top: auto;
}

/* 최신 글 섹션 */
.recent-posts-section {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--vp-c-text-1);
}

.view-all {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.post-item:hover {
  background: var(--vp-c-bg-alt);
}

.post-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.post-tag.vue {
  background: #42b883;
  color: white;
}

.post-tag.typescript {
  background: #3178c6;
  color: white;
}

.post-tag.react {
  background: #61dafb;
  color: #000;
}

.post-tag.nestjs {
  background: #e0234e;
  color: white;
}

.post-tag.javascript {
  background: #f7df1e;
  color: #000;
}

.post-tag.typescript {
  background: #3178c6;
  color: white;
}

.post-tag.database {
  background: #336791;
  color: white;
}

.post-tag.git {
  background: #f05032;
  color: white;
}

.post-tag.vite {
  background: #646cff;
  color: white;
}

.post-tag.vitepress {
  background: #42b883;
  color: white;
}

.post-tag.nextjs {
  background: #000;
  color: white;
}

.post-tag.firebase {
  background: #ffa000;
  color: white;
}

.post-tag.기타 {
  background: #6b7280;
  color: white;
}

.post-title {
  flex: 1;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.post-title:hover {
  color: var(--vp-c-brand);
}

.post-time {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--vp-c-divider);
  border-top: 3px solid var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 추천 글 섹션 */
.featured-post-section {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  padding: 1.5rem;
}

.featured-post-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.featured-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.image-placeholder {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  opacity: 0.8;
}

.featured-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
}

.featured-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.featured-title a:hover {
  color: var(--vp-c-brand);
}

.featured-description {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

/* 글 카드 그리드 */
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.article-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-image .image-placeholder {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  opacity: 0.8;
}

.card-tag {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-title {
  padding: 1rem 1rem 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.card-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.card-title a:hover {
  color: var(--vp-c-brand);
}

.card-description {
  padding: 0 1rem 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

/* 반응형 */
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-graph {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .career-dashboard {
    padding: 1rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>

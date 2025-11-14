<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useData } from "vitepress";

const { site, theme } = useData();

// 모든 문서 목록 추출 (sidebar에서)
const allDocuments = ref<any[]>([]);
const documentsWithDates = ref<any[]>([]);
const loading = ref(true);

// 3D 효과용 refs
const bgOrb1 = ref<HTMLElement | null>(null);
const bgOrb2 = ref<HTMLElement | null>(null);
const bgOrb3 = ref<HTMLElement | null>(null);

// 마우스 움직임에 따른 3D 효과
const handleMouseMove = (e: MouseEvent) => {
  const container = e.currentTarget as HTMLElement;
  const rect = container.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  const moveX = (x - 0.5) * 30;
  const moveY = (y - 0.5) * 30;

  if (bgOrb1.value) {
    bgOrb1.value.style.transform = `translate(${moveX * 0.3}px, ${
      moveY * 0.3
    }px) scale(1.05)`;
  }
  if (bgOrb2.value) {
    bgOrb2.value.style.transform = `translate(${-moveX * 0.4}px, ${
      -moveY * 0.4
    }px) scale(1.08)`;
  }
  if (bgOrb3.value) {
    bgOrb3.value.style.transform = `translate(${moveX * 0.5}px, ${
      -moveY * 0.3
    }px) scale(1.06)`;
  }

  // 파티클 움직임
  const particles = container.querySelectorAll(".code-particle");
  particles.forEach((particle, index) => {
    const depth = (index + 1) * 0.1;
    (particle as HTMLElement).style.transform = `translate(${
      moveX * depth
    }px, ${moveY * depth}px)`;
  });

  // 미니 아이콘 움직임
  const miniIcons = container.querySelectorAll(".mini-icon");
  miniIcons.forEach((icon, index) => {
    const rotateX = (y - 0.5) * 10 * (index % 2 === 0 ? 1 : -1);
    const rotateY = (x - 0.5) * 10 * (index % 2 === 0 ? 1 : -1);
    (
      icon as HTMLElement
    ).style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  });
};

const handleMouseLeave = () => {
  if (bgOrb1.value) bgOrb1.value.style.transform = "translate(0, 0) scale(1)";
  if (bgOrb2.value) bgOrb2.value.style.transform = "translate(0, 0) scale(1)";
  if (bgOrb3.value) bgOrb3.value.style.transform = "translate(0, 0) scale(1)";

  const container = document.querySelector(".dashboard-wrapper") as HTMLElement;
  if (container) {
    const particles = container.querySelectorAll(".code-particle");
    particles.forEach((particle) => {
      (particle as HTMLElement).style.transform = "translate(0, 0)";
    });

    const miniIcons = container.querySelectorAll(".mini-icon");
    miniIcons.forEach((icon) => {
      (icon as HTMLElement).style.transform =
        "rotateX(0) rotateY(0) translateZ(0)";
    });
  }
};

// sidebar에서 모든 문서 링크 추출
const extractDocumentsFromSidebar = (sidebar: any[]): any[] => {
  const docs: any[] = [];

  const traverse = (items: any[]) => {
    if (!items) return;

    for (const item of items) {
      if (
        item.link &&
        !item.link.includes("/introduce/") &&
        !item.link.includes("/examples/") &&
        item.link !== "/"
      ) {
        docs.push({
          link: item.link,
          text: item.text,
          tag: getTagFromPath(item.link),
        });
      }

      if (item.items) {
        traverse(item.items);
      }
    }
  };

  traverse(sidebar);
  return docs;
};

// 경로에서 태그 추출
const getTagFromPath = (path: string): string => {
  if (path.includes("/frontend/vue")) return "Vue";
  if (path.includes("/frontend/react")) return "React";
  if (path.includes("/frontend/javascript")) return "JavaScript";
  if (path.includes("/frontend/typescript")) return "TypeScript";
  if (path.includes("/frontend/vite")) return "Vite";
  if (path.includes("/frontend/nextjs")) return "NextJS";
  if (path.includes("/frontend/vitepress")) return "VitePress";
  if (path.includes("/backend/nestjs")) return "NestJS";
  if (path.includes("/backend/firebase")) return "Firebase";
  if (path.includes("/database")) return "Database";
  if (path.includes("/git")) return "Git";
  return "기타";
};

// 날짜를 상대 시간으로 변환
const getTimeAgo = (dateString: string): string => {
  if (!dateString) return "최근";
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
    return `${diffMonths}개월 전`;
  } else {
    return `${diffYears}년 전`;
  }
};

// 제목에서 마크다운 제거
const cleanTitle = (title: string): string => {
  if (!title) return "";
  return title.replace(/\*\*/g, "").replace(/#/g, "").trim();
};

// 최신 글 (lastModified 기준으로 정렬)
const recentPosts = computed(() => {
  const sorted = [...documentsWithDates.value].sort((a, b) => {
    const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
    const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
    return dateB - dateA; // 최신순
  });

  return sorted.slice(0, 6).map((doc) => ({
    link: doc.path,
    text: cleanTitle(doc.title || doc.text),
    tag: doc.tag || getTagFromPath(doc.path),
    time: getTimeAgo(doc.lastModified),
  }));
});

// 추천 글 (인기 있는 글들 - Vue, NestJS 관련 우선, 수정 횟수 많은 순)
const featuredPosts = computed(() => {
  const sorted = [...documentsWithDates.value].sort((a, b) => {
    // 수정 횟수가 많은 순
    const modA = a.modificationCount || 0;
    const modB = b.modificationCount || 0;
    if (modB !== modA) return modB - modA;
    // 수정 횟수가 같으면 최신순
    const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
    const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
    return dateB - dateA;
  });

  const featured = sorted
    .filter(
      (doc) =>
        (doc.tag || getTagFromPath(doc.path)) === "React" ||
        (doc.tag || getTagFromPath(doc.path)) === "NextJS" ||
        (doc.tag || getTagFromPath(doc.path)) === "JavaScript" ||
        (doc.tag || getTagFromPath(doc.path)) === "TypeScript"
    )
    .slice(0, 4);

  return featured.length > 0
    ? featured.map((doc) => ({
        link: doc.path,
        text: cleanTitle(doc.title || doc.text),
        tag: doc.tag || getTagFromPath(doc.path),
      }))
    : sorted.slice(0, 4).map((doc) => ({
        link: doc.path,
        text: cleanTitle(doc.title || doc.text),
        tag: doc.tag || getTagFromPath(doc.path),
      }));
});

// stats.json에서 문서 데이터 로드
const loadDocumentsFromStats = async () => {
  try {
    const base = site.value.base || "/";
    const possibleUrls = [
      "/stats.json",
      `${base}stats.json`.replace(/\/+/g, "/"),
      "./stats.json",
      "stats.json",
    ];

    let statsData = null;
    for (const statsUrl of possibleUrls) {
      try {
        const response = await fetch(statsUrl, { cache: "no-cache" });
        if (response.ok) {
          statsData = await response.json();
          console.log(`✅ stats.json 로드 성공: ${statsUrl}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (
      statsData &&
      statsData.documents &&
      Array.isArray(statsData.documents)
    ) {
      // stats.json의 문서 데이터 사용
      documentsWithDates.value = statsData.documents
        .filter(
          (doc: any) =>
            doc &&
            doc.path &&
            !doc.path.includes("/introduce/") &&
            !doc.path.includes("/examples/") &&
            doc.path !== "/index"
        )
        .map((doc: any) => ({
          ...doc,
          tag: getTagFromPath(doc.path),
        }));

      console.log(
        "📚 stats.json에서 로드된 문서 수:",
        documentsWithDates.value.length
      );
      loading.value = false;
      return;
    }
  } catch (error) {
    console.warn("⚠️ stats.json 로드 실패:", error);
  }

  // stats.json이 없으면 sidebar에서 추출
  try {
    const sidebar = theme.value.sidebar;
    if (sidebar && Array.isArray(sidebar)) {
      const docs = extractDocumentsFromSidebar(sidebar);
      allDocuments.value = docs;
      documentsWithDates.value = docs.map((doc) => ({
        ...doc,
        path: doc.link,
        title: doc.text,
        lastModified: null,
        modificationCount: 0,
      }));
      console.log("📚 sidebar에서 로드된 문서 수:", docs.length);
    } else {
      // fallback: 직접 문서 목록 생성
      const fallbackDocs = [
        {
          link: "/frontend/vue/my-vue",
          text: "내가 VueJS를 사용하는 이유",
          tag: "Vue",
        },
        {
          link: "/frontend/vue/my-vue-library",
          text: "Vue 라이브러리 추천",
          tag: "Vue",
        },
        {
          link: "/frontend/vue/vue-code-convention",
          text: "Vue 코드 컨벤션",
          tag: "Vue",
        },
        {
          link: "/frontend/vue/vue-event",
          text: "Vue 이벤트 및 이벤트 수정자",
          tag: "Vue",
        },
        {
          link: "/frontend/vue/vee-validate",
          text: "폼 검증하기 VeeValidate",
          tag: "Vue",
        },
        {
          link: "/frontend/vue/vue-cookie",
          text: "vue Cookie : 오늘 하루동안 보지 않기 기능 구현",
          tag: "Vue",
        },
        {
          link: "/frontend/vue/quasar-tailwind",
          text: "Quasar Tailwind 설치",
          tag: "Vue",
        },
        {
          link: "/frontend/vue/vite-quasar-aos",
          text: "Vite Quasar에서 AOS로 애니메이션 적용하기",
          tag: "Vue",
        },
        {
          link: "/frontend/vue/tailwind-brand-color",
          text: "Vue Tailwind Brand Color 적용하기",
          tag: "Vue",
        },
        {
          link: "/frontend/vue/dayjs-korea",
          text: "Vue에서 dayjs로 한국 시간(KST) 처리하는 법 정리",
          tag: "Vue",
        },
        {
          link: "/frontend/javascript/regular-expression",
          text: "정규식",
          tag: "JavaScript",
        },
        {
          link: "/frontend/javascript/es-toolkit",
          text: "es-toolkit",
          tag: "JavaScript",
        },
        {
          link: "/frontend/javascript/array-methods",
          text: "JavaScript 배열 메서드",
          tag: "JavaScript",
        },
        {
          link: "/frontend/javascript/structured-clone",
          text: "객체 복사 이제는 Structured Clone !",
          tag: "JavaScript",
        },
        {
          link: "/frontend/javascript/indexeddb-vs-localstorage",
          text: "IndexedDB vs LocalStorage 차이 정리",
          tag: "JavaScript",
        },
        {
          link: "/frontend/vitepress/vitepress-comment",
          text: "vitepress 댓글 기능 구현",
          tag: "VitePress",
        },
        {
          link: "/frontend/vite/vite-alias",
          text: "Vite 경로 별칭 설정",
          tag: "Vite",
        },
        {
          link: "/frontend/vite/vite-port",
          text: "Vite 포트 설정",
          tag: "Vite",
        },
        { link: "/frontend/vite/proxy", text: "Vite Proxy 설정", tag: "Vite" },
        {
          link: "/frontend/react/performance-optimization",
          text: "성능 최적화 - useMemo, useCallback, React.memo",
          tag: "React",
        },
        {
          link: "/frontend/nextjs/suppress-hydration-warning",
          text: "suppressHydrationWarning 에러 해결법",
          tag: "NextJS",
        },
        {
          link: "/backend/nestjs/my-nestjs",
          text: "내가 NestJS를 사용하는 이유",
          tag: "NestJS",
        },
        {
          link: "/backend/nestjs/nestjs-windows-startdev-loop-fix",
          text: "NestJS Dev 명령어 루프 문제 해결",
          tag: "NestJS",
        },
        {
          link: "/backend/firebase/install-firebase",
          text: "Firebase 설치",
          tag: "Firebase",
        },
        {
          link: "/database/update-in",
          text: "조회한 데이터 업데이트 하기",
          tag: "Database",
        },
        {
          link: "/database/korean-sort",
          text: "한글 정렬 하기",
          tag: "Database",
        },
        { link: "/git/github-readme", text: "GitHub Readme 예시", tag: "Git" },
      ];

      allDocuments.value = fallbackDocs;
      documentsWithDates.value = fallbackDocs.map((doc) => ({
        ...doc,
        path: doc.link,
        title: doc.text,
        lastModified: null,
        modificationCount: 0,
      }));
      console.log("📚 Fallback 문서 목록 사용:", fallbackDocs.length, "개");
    }
  } catch (error) {
    console.error("❌ 문서 목록 로드 실패:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDocumentsFromStats();
});
</script>

<template>
  <div
    class="dashboard-wrapper"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- 3D 배경 요소 -->
    <div class="dashboard-3d-bg">
      <div class="bg-orb bg-orb-1" ref="bgOrb1"></div>
      <div class="bg-orb bg-orb-2" ref="bgOrb2"></div>
      <div class="bg-orb bg-orb-3" ref="bgOrb3"></div>
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
      <div class="bg-shape bg-shape-3"></div>
      <div class="bg-shape bg-shape-4"></div>
      <div class="bg-shape bg-shape-5"></div>

      <!-- 코드 파티클 -->
      <div class="code-particle particle-1"></div>
      <div class="code-particle particle-2"></div>
      <div class="code-particle particle-3"></div>
      <div class="code-particle particle-4"></div>
      <div class="code-particle particle-5"></div>
      <div class="code-particle particle-6"></div>

      <!-- 작은 아이콘들 -->
      <div class="mini-icon mini-icon-1">⚡</div>
      <div class="mini-icon mini-icon-2">✨</div>
      <div class="mini-icon mini-icon-3">🚀</div>
      <div class="mini-icon mini-icon-4">💡</div>

      <!-- 그라데이션 라인 -->
      <div class="gradient-line line-1"></div>
      <div class="gradient-line line-2"></div>
      <div class="gradient-line line-3"></div>
    </div>

    <div class="dashboard-container">
      <!-- 최신 글 섹션 -->
      <section class="posts-section">
        <div class="section-title-wrapper">
          <h2 class="section-title">최신 글</h2>
          <p class="section-description">
            최근에 작성하거나 수정한 글들을 확인해보세요
          </p>
        </div>

        <div v-if="recentPosts.length > 0" class="posts-grid">
          <a
            v-for="(post, index) in recentPosts"
            :key="post.link"
            :href="site.base + post.link.replace(/^\//, '')"
            class="modern-card"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div class="card-content">
              <div class="card-top">
                <span
                  :class="[
                    'modern-tag',
                    post.tag.toLowerCase().replace(/\./g, ''),
                  ]"
                >
                  {{ post.tag }}
                </span>
                <span class="card-time">{{ post.time }}</span>
              </div>
              <h3 class="card-heading">{{ post.text }}</h3>
              <div class="card-arrow">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </a>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">📄</div>
          <p class="empty-text">표시할 글이 없습니다</p>
        </div>
      </section>

      <!-- 추천 글 섹션 -->
      <section class="featured-section">
        <div class="section-title-wrapper">
          <h2 class="section-title">추천 글</h2>
          <span class="featured-badge">Featured</span>
        </div>

        <div v-if="featuredPosts.length > 0" class="featured-grid">
          <a
            v-for="(post, index) in featuredPosts"
            :key="post.link"
            :href="site.base + post.link.replace(/^\//, '')"
            class="featured-card"
            :style="{ animationDelay: `${index * 0.08}s` }"
          >
            <div class="featured-card-inner">
              <div class="featured-tag-wrapper">
                <span
                  :class="[
                    'featured-tag',
                    post.tag.toLowerCase().replace(/\./g, ''),
                  ]"
                >
                  {{ post.tag }}
                </span>
              </div>
              <h4 class="featured-title">{{ post.text }}</h4>
              <div class="featured-footer">
                <span class="featured-link">
                  자세히 보기
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">✨</div>
          <p class="empty-text">표시할 추천 글이 없습니다</p>
        </div>
      </section>
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
  overflow: hidden;
}

/* 3D 배경 요소 */
.dashboard-3d-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent);
  top: -10%;
  right: 10%;
  animation-delay: 0s;
}

.bg-orb-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.35), transparent);
  bottom: -5%;
  left: 5%;
  animation-delay: 2s;
}

.bg-shape {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    rgba(139, 92, 246, 0.08)
  );
  border: 1px solid rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(10px);
  animation: shapeFloat 8s ease-in-out infinite;
  opacity: 0.6;
}

.bg-shape-1 {
  top: 20%;
  right: 15%;
  animation-delay: 0s;
  border-radius: 50%;
  width: 80px;
  height: 80px;
}

.bg-shape-2 {
  bottom: 30%;
  left: 10%;
  animation-delay: 1.5s;
  border-radius: 15px;
  width: 60px;
  height: 60px;
}

.bg-shape-3 {
  top: 50%;
  right: 5%;
  animation-delay: 3s;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  width: 70px;
  height: 70px;
}

.bg-shape-4 {
  top: 70%;
  left: 20%;
  animation-delay: 2s;
  border-radius: 50%;
  width: 50px;
  height: 50px;
}

.bg-shape-5 {
  bottom: 20%;
  right: 25%;
  animation-delay: 4s;
  border-radius: 12px;
  width: 65px;
  height: 65px;
}

.bg-orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent);
  top: 60%;
  left: 50%;
  animation-delay: 4s;
}

/* 코드 파티클 */
.code-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(99, 102, 241, 0.5);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
  animation: particleFloat 5s ease-in-out infinite;
  transition: transform 0.3s ease;
}

.particle-1 {
  top: 15%;
  left: 8%;
  animation-delay: 0s;
}

.particle-2 {
  top: 35%;
  right: 12%;
  animation-delay: 0.8s;
  width: 3px;
  height: 3px;
}

.particle-3 {
  bottom: 40%;
  left: 15%;
  animation-delay: 1.6s;
  width: 5px;
  height: 5px;
}

.particle-4 {
  top: 55%;
  right: 8%;
  animation-delay: 2.4s;
  width: 3px;
  height: 3px;
}

.particle-5 {
  bottom: 25%;
  right: 20%;
  animation-delay: 3.2s;
  width: 4px;
  height: 4px;
}

.particle-6 {
  top: 75%;
  left: 12%;
  animation-delay: 4s;
  width: 3px;
  height: 3px;
}

/* 미니 아이콘 */
.mini-icon {
  position: absolute;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 46, 0.4);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: iconFloat 6s ease-in-out infinite;
  transform-style: preserve-3d;
  opacity: 0.7;
}

.mini-icon:hover {
  transform: scale(1.2) rotateZ(10deg) !important;
  opacity: 1;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.mini-icon-1 {
  top: 25%;
  left: 5%;
  animation-delay: 0s;
}

.mini-icon-2 {
  top: 45%;
  right: 10%;
  animation-delay: 1s;
}

.mini-icon-3 {
  bottom: 35%;
  left: 8%;
  animation-delay: 2s;
}

.mini-icon-4 {
  top: 65%;
  right: 15%;
  animation-delay: 3s;
}

/* 그라데이션 라인 */
.gradient-line {
  position: absolute;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.3),
    transparent
  );
  animation: lineMove 8s ease-in-out infinite;
  opacity: 0.4;
}

.line-1 {
  top: 30%;
  left: 0;
  right: 0;
  width: 100%;
  animation-delay: 0s;
  transform: rotate(-2deg);
}

.line-2 {
  top: 60%;
  left: 0;
  right: 0;
  width: 100%;
  animation-delay: 2s;
  transform: rotate(1deg);
}

.line-3 {
  bottom: 20%;
  left: 0;
  right: 0;
  width: 100%;
  animation-delay: 4s;
  transform: rotate(-1.5deg);
}

.dashboard-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

/* 섹션 공통 스타일 */
.posts-section,
.featured-section {
  margin-bottom: 5rem;
}

.posts-section:last-child,
.featured-section:last-child {
  margin-bottom: 0;
}

/* 섹션 타이틀 */
.section-title-wrapper {
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease-out;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.01em;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-title-wrapper:hover .section-title::after,
.posts-section:hover .section-title::after,
.featured-section:hover .section-title::after {
  width: 100%;
}

.section-description {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  margin: 0.5rem 0 0 0;
  font-weight: 400;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.section-title-wrapper:hover .section-description {
  opacity: 1;
}

/* 최신 글 그리드 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.modern-card {
  position: relative;
  display: block;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 0;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out backwards;
}

.modern-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.modern-card:hover::before {
  left: 100%;
}

.modern-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 16px 32px rgba(99, 102, 241, 0.2),
    0 0 0 1px rgba(99, 102, 241, 0.1);
}

.modern-card:hover .card-arrow {
  transform: translateX(4px);
  opacity: 1;
}

.card-content {
  position: relative;
  padding: 1.75rem;
  z-index: 1;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

.modern-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 라이트모드에서 태그 가시성 향상 */
:root:not(.dark) .modern-tag,
:root:not(.dark) .featured-tag {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modern-tag::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.modern-card:hover .modern-tag::before {
  width: 200px;
  height: 200px;
}

.modern-card:hover .modern-tag {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-time {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
  white-space: nowrap;
}

.card-heading {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.modern-card:hover .card-heading {
  color: var(--vp-c-brand-1);
  transform: translateX(2px);
}

.card-heading {
  transition: all 0.3s ease;
}

.card-arrow {
  position: absolute;
  bottom: 1.75rem;
  right: 1.75rem;
  color: var(--vp-c-brand-1);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 추천 글 섹션 타이틀 */
.featured-section .section-title-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.featured-section .section-title {
  margin: 0;
}

.featured-badge {
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.featured-card {
  position: relative;
  display: block;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 24px;
  padding: 0;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out backwards;
}

.featured-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.05) 0%,
    rgba(139, 92, 246, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.featured-card:hover {
  transform: translateY(-8px) scale(1.03);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.25);
}

.featured-card:hover::before {
  transform: scaleX(1);
}

.featured-card:hover::after {
  opacity: 1;
}

.featured-card-inner {
  position: relative;
  padding: 2rem;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 180px;
}

.featured-tag-wrapper {
  margin-bottom: 1rem;
}

.featured-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.9rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.featured-tag::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.featured-card:hover .featured-tag::before {
  width: 200px;
  height: 200px;
}

.featured-card:hover .featured-tag {
  transform: scale(1.08) rotate(2deg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.featured-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 auto 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  transition: all 0.3s ease;
}

.featured-card:hover .featured-title {
  color: var(--vp-c-brand-1);
  transform: translateX(2px);
}

.featured-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
}

.featured-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.featured-link svg {
  transition: transform 0.3s ease;
}

.featured-card:hover .featured-link {
  gap: 0.75rem;
  color: var(--vp-c-brand-2);
}

.featured-card:hover .featured-link svg {
  transform: translateX(4px);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--vp-c-text-3);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1rem;
  margin: 0;
}

/* 태그 색상 */
.modern-tag.vue,
.featured-tag.vue {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
}
.modern-tag.react,
.featured-tag.react {
  background: linear-gradient(135deg, #61dafb 0%, #20232a 100%);
  color: white;
}
.modern-tag.javascript,
.featured-tag.javascript {
  background: linear-gradient(135deg, #f7df1e 0%, #f0db4f 100%);
  color: #323330;
}
.modern-tag.typescript,
.featured-tag.typescript {
  background: linear-gradient(135deg, #3178c6 0%, #235a97 100%);
}
.modern-tag.nestjs,
.featured-tag.nestjs {
  background: linear-gradient(135deg, #ea2845 0%, #c1223a 100%);
}
.modern-tag.firebase,
.featured-tag.firebase {
  background: linear-gradient(135deg, #ffca28 0%, #ffa000 100%);
  color: #323330;
}
.modern-tag.database,
.featured-tag.database {
  background: linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 100%);
}
.modern-tag.git,
.featured-tag.git {
  background: linear-gradient(135deg, #f05033 0%, #c93c24 100%);
}
.modern-tag.vite,
.featured-tag.vite {
  background: linear-gradient(135deg, #646cff 0%, #4f56d8 100%);
}
.modern-tag.vitepress,
.featured-tag.vitepress {
  background: linear-gradient(135deg, #42c2a0 0%, #2fa085 100%);
}
.modern-tag.nextjs,
.featured-tag.nextjs {
  background: linear-gradient(135deg, #090909 0%, #333333 100%);
  color: white;
}

.modern-tag.기타,
.featured-tag.기타 {
  background: linear-gradient(135deg, #777 0%, #555 100%);
}

/* 다크모드 대응 - 모든 태그가 다크모드에서도 잘 보이도록 */
:root.dark .modern-tag,
:root.dark .featured-tag {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 라이트모드에서 어두운 태그들의 가시성 향상 */
:root:not(.dark) .modern-tag.nextjs,
:root:not(.dark) .featured-tag.nextjs,
:root:not(.dark) .modern-tag.git,
:root:not(.dark) .featured-tag.git,
:root:not(.dark) .modern-tag.database,
:root:not(.dark) .featured-tag.database {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 애니메이션 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-30px, 30px) scale(1.1);
  }
}

@keyframes shapeFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

@keyframes particleFloat {
  0%,
  100% {
    transform: translate(0, 0);
    opacity: 0.5;
  }
  50% {
    transform: translate(-10px, -15px);
    opacity: 1;
  }
}

@keyframes iconFloat {
  0%,
  100% {
    transform: translateY(0) rotateZ(0deg);
  }
  50% {
    transform: translateY(-8px) rotateZ(5deg);
  }
}

@keyframes lineMove {
  0%,
  100% {
    opacity: 0.2;
    transform: translateX(0);
  }
  50% {
    opacity: 0.6;
    transform: translateX(20px);
  }
}

/* 카드 진입 애니메이션 */
.modern-card {
  animation: fadeInUp 0.6s ease-out backwards;
}

.featured-card {
  animation: fadeInUp 0.6s ease-out backwards;
}

/* 스크롤 애니메이션을 위한 준비 */
@supports (animation-timeline: scroll()) {
  .modern-card,
  .featured-card {
    animation-timeline: view();
    animation-range: entry 0% entry 50%;
  }
}

/* 반응형 */
@media (max-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  .featured-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-wrapper {
    margin-top: 2rem;
  }
  .dashboard-container {
    padding: 0 1rem;
  }
  .posts-section,
  .featured-section {
    margin-bottom: 3rem;
  }
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .featured-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .section-title {
    font-size: 1.5rem;
  }
  .card-content {
    padding: 1.5rem;
  }
  .featured-card-inner {
    padding: 1.5rem;
  }
  .featured-section .section-title-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

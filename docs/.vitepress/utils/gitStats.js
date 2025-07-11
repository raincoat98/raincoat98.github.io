// Git 히스토리를 분석하여 문서 통계를 가져오는 유틸리티

/**
 * Git 로그에서 문서 통계를 추출하는 함수
 * @param {string} repoPath - Git 저장소 경로
 * @returns {Promise<Array>} 문서 통계 배열
 */
export async function getDocumentStats(repoPath = ".") {
  try {
    // Git 명령어를 실행하여 문서 파일들의 히스토리를 가져옴
    const { execSync } = require("child_process");

    // 먼저 모든 Markdown 파일 목록을 가져옴
    const mdFiles = execSync(`find docs/src -name "*.md" -type f`, {
      cwd: repoPath,
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);

    const documents = [];

    // 각 파일별로 Git 히스토리 분석
    for (const filePath of mdFiles) {
      try {
        // 파일의 첫 번째 커밋 (생성일)
        const firstCommit = execSync(
          `git log --follow --format="%H|%an|%ad|%s" --date=short --reverse "${filePath}" | head -1`,
          { cwd: repoPath, encoding: "utf8" }
        ).trim();

        // 파일의 마지막 커밋 (최종 수정일)
        const lastCommit = execSync(
          `git log --follow --format="%H|%an|%ad|%s" --date=short "${filePath}" | head -1`,
          { cwd: repoPath, encoding: "utf8" }
        ).trim();

        // 파일의 총 커밋 수 (수정 횟수)
        const commitCount = execSync(
          `git log --follow --oneline "${filePath}" | wc -l`,
          { cwd: repoPath, encoding: "utf8" }
        ).trim();

        if (firstCommit && lastCommit) {
          const [firstHash, firstAuthor, firstDate, firstSubject] =
            firstCommit.split("|");
          const [lastHash, lastAuthor, lastDate, lastSubject] =
            lastCommit.split("|");

          // 파일 경로를 웹 경로로 변환
          const webPath = filePath.replace("docs/src/", "/").replace(".md", "");

          documents.push({
            path: webPath,
            title: getTitleFromPath(filePath),
            createdAt: firstDate,
            lastModified: lastDate,
            modificationCount: parseInt(commitCount),
            author: firstAuthor,
            firstCommit: firstHash,
            lastCommit: lastHash,
          });
        }
      } catch (fileError) {
        console.warn(`파일 ${filePath} 분석 중 오류:`, fileError.message);
      }
    }

    return documents;
  } catch (error) {
    console.error("Git 통계를 가져오는 중 오류 발생:", error);
    return [];
  }
}

/**
 * 파일 경로에서 제목을 추출하는 함수
 * @param {string} filePath - 파일 경로
 * @returns {string} 문서 제목
 */
function getTitleFromPath(filePath) {
  // 파일명에서 확장자 제거
  const fileName = filePath.replace(/\.md$/, "");

  // 경로의 마지막 부분 (파일명) 추출
  const pathParts = fileName.split("/");
  const fileNameOnly = pathParts[pathParts.length - 1];

  // 파일명을 제목으로 변환
  const title = fileNameOnly
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return title;
}

/**
 * 문서 통계를 계산하는 함수
 * @param {Array} documents - 문서 배열
 * @returns {Object} 통계 객체
 */
export function calculateStats(documents) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const stats = {
    totalDocuments: documents.length,
    thisMonthCreated: 0,
    thisYearCreated: 0,
    totalModifications: 0,
    thisMonthModified: 0,
    avgModificationsPerDoc: 0,
    recentCreated: [],
    mostModified: [],
  };

  documents.forEach((doc) => {
    const created = new Date(doc.createdAt);
    const modified = new Date(doc.lastModified);

    // 이번 달 생성
    if (
      created.getMonth() === thisMonth &&
      created.getFullYear() === thisYear
    ) {
      stats.thisMonthCreated++;
    }

    // 올해 생성
    if (created.getFullYear() === thisYear) {
      stats.thisYearCreated++;
    }

    // 이번 달 수정
    if (
      modified.getMonth() === thisMonth &&
      modified.getFullYear() === thisYear
    ) {
      stats.thisMonthModified++;
    }

    // 총 수정 횟수
    stats.totalModifications += doc.modificationCount;
  });

  // 평균 수정 횟수
  if (stats.totalDocuments > 0) {
    stats.avgModificationsPerDoc =
      Math.round((stats.totalModifications / stats.totalDocuments) * 10) / 10;
  }

  // 최근 생성된 문서 (최대 5개)
  stats.recentCreated = [...documents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // 가장 많이 수정된 문서 (최대 5개)
  stats.mostModified = [...documents]
    .sort((a, b) => b.modificationCount - a.modificationCount)
    .slice(0, 5);

  return stats;
}

/**
 * 샘플 데이터를 반환하는 함수 (개발용)
 * @returns {Array} 샘플 문서 데이터
 */
export function getSampleData() {
  return [
    {
      path: "/frontend/vue/my-vue",
      title: "내가 VueJS를 사용하는 이유",
      createdAt: "2024-01-15",
      lastModified: "2024-12-20",
      modificationCount: 5,
      author: "SangWook Woo",
    },
    {
      path: "/frontend/javascript/array-methods",
      title: "JavaScript 배열 메서드",
      createdAt: "2024-02-10",
      lastModified: "2024-12-18",
      modificationCount: 8,
      author: "SangWook Woo",
    },
    {
      path: "/backend/nestjs/my-nestjs",
      title: "내가 NestJS를 사용하는 이유",
      createdAt: "2024-03-05",
      lastModified: "2024-12-15",
      modificationCount: 3,
      author: "SangWook Woo",
    },
    {
      path: "/frontend/vue/vue-code-convention",
      title: "Vue 코드 컨벤션",
      createdAt: "2024-04-12",
      lastModified: "2024-12-10",
      modificationCount: 12,
      author: "SangWook Woo",
    },
    {
      path: "/database/update-in",
      title: "조회한 데이터 업데이트 하기",
      createdAt: "2024-05-20",
      lastModified: "2024-12-05",
      modificationCount: 6,
      author: "SangWook Woo",
    },
    {
      path: "/frontend/vue/vee-validate",
      title: "폼 검증하기 VeeValidate",
      createdAt: "2024-06-08",
      lastModified: "2024-12-03",
      modificationCount: 4,
      author: "SangWook Woo",
    },
    {
      path: "/frontend/javascript/regular-expression",
      title: "정규식",
      createdAt: "2024-07-12",
      lastModified: "2024-12-01",
      modificationCount: 7,
      author: "SangWook Woo",
    },
    {
      path: "/frontend/vue/vue-event",
      title: "Vue 이벤트 및 이벤트 수정자",
      createdAt: "2024-08-15",
      lastModified: "2024-11-28",
      modificationCount: 9,
      author: "SangWook Woo",
    },
    {
      path: "/frontend/vue/vue-cookie",
      title: "vue Cookie : 오늘 하루동안 보지 않기 기능 구현",
      createdAt: "2024-09-20",
      lastModified: "2024-11-25",
      modificationCount: 6,
      author: "SangWook Woo",
    },
    {
      path: "/database/korean-sort",
      title: "한글 정렬 하기",
      createdAt: "2024-10-05",
      lastModified: "2024-11-20",
      modificationCount: 5,
      author: "SangWook Woo",
    },
  ];
}

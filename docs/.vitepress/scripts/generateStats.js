#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Git 히스토리를 분석하여 문서 통계를 생성하는 스크립트
 */

function getDocumentStats() {
  try {
    // 모든 Markdown 파일 목록을 가져옴
    const mdFiles = execSync(`find docs/src -name "*.md" -type f`, {
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
          { encoding: "utf8" }
        ).trim();

        // 파일의 마지막 커밋 (최종 수정일)
        const lastCommit = execSync(
          `git log --follow --format="%H|%an|%ad|%s" --date=short "${filePath}" | head -1`,
          { encoding: "utf8" }
        ).trim();

        // 파일의 총 커밋 수 (수정 횟수)
        const commitCount = execSync(
          `git log --follow --oneline "${filePath}" | wc -l`,
          { encoding: "utf8" }
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

function generateStatsFile() {
  console.log("📊 문서 통계 생성 중...");

  const documents = getDocumentStats();

  if (documents.length === 0) {
    console.log("⚠️  Git 히스토리에서 문서를 찾을 수 없습니다.");
    return;
  }

  // 통계 데이터를 JSON 파일로 저장
  const statsData = {
    generatedAt: new Date().toISOString(),
    documents: documents,
    totalDocuments: documents.length,
    totalModifications: documents.reduce(
      (sum, doc) => sum + doc.modificationCount,
      0
    ),
  };

  const outputPath = path.join(__dirname, "../public/stats.json");

  // 디렉토리가 없으면 생성
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(statsData, null, 2));

  console.log(`✅ 문서 통계가 생성되었습니다: ${outputPath}`);
  console.log(`📝 총 ${documents.length}개의 문서가 분석되었습니다.`);

  // 요약 정보 출력
  const recentDocs = documents
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  console.log("\n📈 최근 생성된 문서:");
  recentDocs.forEach((doc) => {
    console.log(`  - ${doc.title} (${doc.createdAt})`);
  });

  const mostModified = documents
    .sort((a, b) => b.modificationCount - a.modificationCount)
    .slice(0, 3);

  console.log("\n🔄 가장 많이 수정된 문서:");
  mostModified.forEach((doc) => {
    console.log(`  - ${doc.title} (${doc.modificationCount}회 수정)`);
  });
}

// 스크립트 실행
if (require.main === module) {
  generateStatsFile();
}

module.exports = { generateStatsFile, getDocumentStats };

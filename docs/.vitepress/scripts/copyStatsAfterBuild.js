#!/usr/bin/env node

/**
 * 빌드 후 stats.json이 제대로 복사되었는지 확인하고,
 * 복사되지 않았다면 수동으로 복사하는 스크립트
 */

const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "../../src/public/stats.json");
const distPath = path.join(__dirname, "../../dist/stats.json");
const vitepressDistPath = path.join(
  __dirname,
  "../../.vitepress/dist/stats.json"
);

function copyStatsAfterBuild() {
  console.log("🔍 빌드 후 stats.json 확인 중...");

  // 소스 파일이 존재하는지 확인
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ 소스 파일을 찾을 수 없습니다: ${sourcePath}`);
    return false;
  }

  // 빌드 디렉토리 확인
  const distDirs = [distPath, vitepressDistPath];
  let copied = false;

  for (const targetPath of distDirs) {
    const targetDir = path.dirname(targetPath);

    if (fs.existsSync(targetDir)) {
      // 디렉토리가 존재하면 파일 복사
      try {
        const statsContent = fs.readFileSync(sourcePath, "utf8");
        fs.writeFileSync(targetPath, statsContent);
        console.log(`✅ 복사 완료: ${targetPath}`);
        copied = true;
      } catch (error) {
        console.error(`❌ 복사 실패 (${targetPath}):`, error.message);
      }
    }
  }

  if (!copied) {
    console.warn(
      "⚠️  빌드 디렉토리를 찾을 수 없습니다. 빌드가 완료된 후 실행하세요."
    );
  }

  return copied;
}

// 직접 실행 시
if (require.main === module) {
  copyStatsAfterBuild();
}

module.exports = { copyStatsAfterBuild };

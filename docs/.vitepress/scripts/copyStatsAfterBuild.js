#!/usr/bin/env node

/**
 * 빌드 후 stats.json이 제대로 복사되었는지 확인하고,
 * 복사되지 않았다면 수동으로 복사하는 스크립트
 */

const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "../../src/public/stats.json");
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

  const targetDir = path.dirname(vitepressDistPath);

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ 빌드 디렉토리를 찾을 수 없습니다: ${targetDir}`);
    console.error("   → 빌드가 완료된 후 실행하세요.");
    return false;
  }

  // 이미 파일이 존재하는지 확인
  if (fs.existsSync(vitepressDistPath)) {
    console.log(`✅ stats.json이 이미 존재합니다: ${vitepressDistPath}`);

    // 파일 크기 비교로 확인
    const sourceSize = fs.statSync(sourcePath).size;
    const targetSize = fs.statSync(vitepressDistPath).size;

    if (sourceSize === targetSize) {
      console.log("   → 파일이 동일합니다. 복사할 필요가 없습니다.");
      return true;
    } else {
      console.log(
        `   → 파일 크기가 다릅니다 (소스: ${sourceSize}, 대상: ${targetSize}). 복사합니다.`
      );
    }
  }

  // 파일 복사
  try {
    const statsContent = fs.readFileSync(sourcePath, "utf8");
    fs.writeFileSync(vitepressDistPath, statsContent);
    console.log(`✅ 복사 완료: ${vitepressDistPath}`);

    // 복사 확인
    if (fs.existsSync(vitepressDistPath)) {
      const copiedSize = fs.statSync(vitepressDistPath).size;
      console.log(`   → 파일 크기: ${copiedSize} bytes`);
      return true;
    } else {
      console.error("   → 복사 후 파일을 찾을 수 없습니다.");
      return false;
    }
  } catch (error) {
    console.error(`❌ 복사 실패:`, error.message);
    return false;
  }
}

// 직접 실행 시
if (require.main === module) {
  const success = copyStatsAfterBuild();
  process.exit(success ? 0 : 1);
}

module.exports = { copyStatsAfterBuild };

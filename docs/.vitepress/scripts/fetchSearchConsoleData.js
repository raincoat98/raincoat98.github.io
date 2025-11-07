#!/usr/bin/env node

const { google } = require("googleapis");
const { readFileSync } = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.resolve(process.cwd(), ".env"),
});
const dayjs = require("dayjs");

/**
 * Google Search Console API를 사용하여 실제 검색 데이터를 가져오는 스크립트
 * JWT (서비스 계정) 인증 사용
 */

function resolveCredentials() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (clientEmail && rawPrivateKey) {
    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
    console.log("🔑 환경변수로 제공된 Google 서비스 계정 사용");
    return {
      type: "env",
      clientEmail,
      privateKey,
    };
  }

  const fs = require("fs");
  const possiblePaths = [
    process.env.GOOGLE_KEY_FILE_PATH,
    path.join(__dirname, "../raincoat-401705-cd43ebde98aa.json"),
    path.join(__dirname, "../../raincoat-401705-cd43ebde98aa.json"),
    path.join(process.cwd(), "raincoat-401705-cd43ebde98aa.json"),
  ];

  for (const possiblePath of possiblePaths) {
    if (possiblePath && fs.existsSync(possiblePath)) {
      console.log(`🔑 키 파일 사용: ${possiblePath}`);
      return { type: "file", keyFilePath: possiblePath };
    }
  }

  console.warn("⚠️  Google API 자격증명을 찾을 수 없습니다.");
  console.warn(
    "   GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY 환경 변수를 설정하거나 키 파일 경로를 지정하세요."
  );
  console.warn("   시도한 경로:", possiblePaths.filter(Boolean).join(", "));
  return null;
}

async function fetchSearchConsoleData() {
  let key = null;
  try {
    const credentialSource = resolveCredentials();
    if (!credentialSource) {
      return null;
    }

    let jwt;
    if (credentialSource.type === "env") {
      key = { client_email: credentialSource.clientEmail };
      jwt = new google.auth.JWT({
        email: credentialSource.clientEmail,
        key: credentialSource.privateKey,
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
      });
    } else {
      jwt = new google.auth.JWT({
        keyFile: credentialSource.keyFilePath,
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
      });
      key = JSON.parse(readFileSync(credentialSource.keyFilePath, "utf8"));
    }

    // JWT 토큰 발급
    console.log("🔐 JWT 토큰 발급 중...");
    const token = await jwt.authorize();
    if (!token || !token.access_token) {
      throw new Error("JWT 토큰 발급 실패: access_token이 없습니다.");
    }
    console.log("✅ JWT 토큰 발급 완료");

    const webmasters = google.webmasters({ version: "v3", auth: jwt });

    // 사이트 URL 확인 (여러 형식 시도)
    // Search Console에서 사용 가능한 형식:
    // - sc-domain:example.com (도메인 속성)
    // - https://www.example.com/ (URL 접두어 속성)
    const siteUrl =
      process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ||
      process.env.SITE_URL ||
      "https://raincoat98.github.io/";

    console.log(`🌐 사이트 URL: ${siteUrl}`);

    // 사이트 목록 확인 (디버깅용)
    try {
      const sites = await webmasters.sites.list();
      console.log("📋 Search Console에 등록된 사이트:");
      if (sites.data.siteEntry && sites.data.siteEntry.length > 0) {
        sites.data.siteEntry.forEach((site) => {
          console.log(`   - ${site.siteUrl} (권한: ${site.permissionLevel})`);
        });
      } else {
        console.log("   → 등록된 사이트가 없거나 권한이 없습니다.");
      }
    } catch (listError) {
      console.warn("⚠️  사이트 목록을 가져오지 못했습니다:", listError.message);
    }

    // 최근 30일 데이터 가져오기 (어제까지, Search Console은 최신 데이터가 하루 늦게 반영됨)
    // 30일을 선택할 수 있으므로 여유있게 30일 데이터 가져오기
    const endDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    const startDate = dayjs().subtract(30, "day").format("YYYY-MM-DD");

    console.log("📊 Google Search Console 데이터를 가져오는 중...");
    console.log(`   기간: ${startDate} ~ ${endDate}`);

    // 1) 전체 합계 데이터 가져오기
    const totals = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        // dimensions 없으면 전체 합계 반환
        type: "web",
      },
    });

    if (!totals.data.rows || totals.data.rows.length === 0) {
      console.warn("⚠️  Search Console 데이터가 없습니다.");
      return null;
    }

    const totalRow = totals.data.rows[0];
    const totalClicks = parseInt(totalRow.clicks || 0);
    const totalImpressions = parseInt(totalRow.impressions || 0);
    const ctr = parseFloat(totalRow.ctr || 0);
    const position = parseFloat(totalRow.position || 0);

    // 2) 이전 28일 데이터 가져오기 (변화율 계산용)
    const prevEndDate = dayjs(startDate)
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    const prevStartDate = dayjs(prevEndDate)
      .subtract(28, "day")
      .format("YYYY-MM-DD");

    let previousClicks = 0;
    try {
      const prevTotals = await webmasters.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: prevStartDate,
          endDate: prevEndDate,
          type: "web",
        },
      });

      if (prevTotals.data.rows && prevTotals.data.rows.length > 0) {
        previousClicks = parseInt(prevTotals.data.rows[0].clicks || 0);
      }
    } catch (error) {
      console.warn("⚠️  이전 기간 데이터를 가져오지 못했습니다.");
    }

    // 3) 일별 조회수 데이터 가져오기 (그래프용)
    let dailyData = [];
    try {
      const byDate = await webmasters.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["date"],
          rowLimit: 10000,
          type: "web",
        },
      });

      if (byDate.data.rows) {
        dailyData = byDate.data.rows.map((row) => ({
          date: row.keys?.[0] || "",
          clicks: parseInt(row.clicks || 0),
          impressions: parseInt(row.impressions || 0),
          ctr: parseFloat(row.ctr || 0),
          position: parseFloat(row.position || 0),
        }));
      }
      console.log(`   - 일별 데이터: ${dailyData.length}일`);
    } catch (error) {
      console.warn("⚠️  일별 데이터를 가져오지 못했습니다:", error.message);
    }

    // 4) 페이지별 Top 데이터 가져오기 (선택사항)
    let pageData = {};
    try {
      const byPage = await webmasters.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: 50,
          type: "web",
          aggregationType: "auto",
        },
      });

      if (byPage.data.rows) {
        byPage.data.rows.forEach((row) => {
          const page = row.keys?.[0];
          if (page) {
            pageData[page] = {
              clicks: parseInt(row.clicks || 0),
              impressions: parseInt(row.impressions || 0),
              ctr: parseFloat(row.ctr || 0),
              position: parseFloat(row.position || 0),
            };
          }
        });
      }
    } catch (error) {
      console.warn("⚠️  페이지별 데이터를 가져오지 못했습니다.");
    }

    // 변화율 계산
    const clicksChange =
      previousClicks > 0
        ? ((totalClicks - previousClicks) / previousClicks) * 100
        : totalClicks > 0
        ? 100
        : 0;

    const result = {
      totalClicks,
      totalImpressions,
      ctr,
      position,
      clicksChange: Math.round(clicksChange * 10) / 10,
      dailyData, // 일별 조회수 데이터 (그래프용)
      pageData,
      period: {
        startDate,
        endDate,
      },
      fetchedAt: new Date().toISOString(),
    };

    console.log(`✅ Search Console 데이터를 가져왔습니다:`);
    console.log(`   - 총 클릭: ${totalClicks.toLocaleString()}`);
    console.log(`   - 총 노출: ${totalImpressions.toLocaleString()}`);
    console.log(
      `   - 변화율: ${clicksChange >= 0 ? "+" : ""}${clicksChange.toFixed(1)}%`
    );

    return result;
  } catch (error) {
    console.error(
      "❌ Search Console 데이터를 가져오는 중 오류:",
      error.message
    );

    if (error.message.includes("403") || error.code === 403) {
      console.error(
        "   → Search Console API가 활성화되지 않았거나 권한이 없습니다."
      );
      console.error(
        "   → 1. Google Cloud Console에서 Search Console API를 활성화하세요:"
      );
      console.error(
        "      https://console.cloud.google.com/apis/library/searchconsole.googleapis.com"
      );
      console.error(
        "   → 2. Search Console에서 서비스 계정을 사용자로 추가하세요:"
      );
      console.error(
        "      https://search.google.com/search-console → 속성 설정 → 사용자 및 권한"
      );
      console.error(
        `      서비스 계정 이메일: ${key.client_email || "확인 필요"}`
      );
    } else if (error.message.includes("401") || error.code === 401) {
      console.error("   → 인증 오류가 발생했습니다.");
      console.error(
        "   → 서비스 계정 키 파일을 확인하거나 JWT 토큰 발급에 실패했습니다."
      );
    } else if (error.message.includes("authentication credential")) {
      console.error("   → 인증 자격 증명이 없습니다.");
      console.error(
        "   → JWT 토큰 발급 실패 또는 서비스 계정 설정 문제일 수 있습니다."
      );
      console.error(
        "   → 서비스 계정이 Search Console에 등록되어 있는지 확인하세요."
      );
    }

    if (error.response) {
      console.error("   → 응답 상태:", error.response.status);
      console.error(
        "   → 응답 데이터:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    return null;
  }
}

// 모듈로 export
module.exports = { fetchSearchConsoleData };

// 직접 실행 시
if (require.main === module) {
  fetchSearchConsoleData()
    .then((data) => {
      if (data) {
        console.log("\n📄 데이터:", JSON.stringify(data, null, 2));
      }
    })
    .catch(console.error);
}

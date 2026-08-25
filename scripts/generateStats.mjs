#!/usr/bin/env node
/**
 * 문서 통계 생성 — Astro 이관판
 * src/content/docs 아래 마크다운을 Git 히스토리로 분석해 public/stats.json 작성.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "src/content/docs");
const OUTPUT = path.join(ROOT, "public/stats.json");

function mdFiles() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md")) out.push(p);
    }
  };
  walk(CONTENT_DIR);
  return out;
}

function frontmatterField(filePath, field) {
  try {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    if (!lines[0].startsWith("---")) return null;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "---") break;
      if (lines[i].startsWith(`${field}:`)) {
        return lines[i].replace(new RegExp(`^${field}:\\s*`), "").replace(/^["']|["']$/g, "").trim() || null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function titleFromPath(filePath) {
  try {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      if (line.startsWith("# ")) return line.replace(/^#\s+/, "").trim();
    }
    const fm = frontmatterField(filePath, "title");
    if (fm) return fm;
  } catch {}
  return path.basename(filePath, ".md");
}

function collect() {
  const docs = [];
  for (const file of mdFiles()) {
    try {
      const webPath = "/" + path.relative(CONTENT_DIR, file).replace(/\.md$/, "").replace(/\/index$/, "");
      const firstCommit = execSync(
        `git log --follow --format="%an|%ad" --date=short --reverse "${file}" | head -1`,
        { encoding: "utf8", cwd: ROOT }
      ).trim();
      if (!firstCommit) continue;
      const commitCount = parseInt(
        execSync(`git log --follow --oneline "${file}" | wc -l`, { encoding: "utf8", cwd: ROOT }).trim(),
        10
      );
      const [author, createdAt] = firstCommit.split("|");
      const fmDate = frontmatterField(file, "created");
      const lastCommit = execSync(`git log -1 --format="%aI" "${file}"`, { encoding: "utf8", cwd: ROOT }).trim();
      docs.push({
        path: webPath,
        title: titleFromPath(file),
        createdAt: fmDate || createdAt,
        lastModified: lastCommit || fmDate || createdAt,
        modificationCount: commitCount,
        author,
      });
    } catch (e) {
      console.warn(`분석 실패 ${file}:`, e.message);
    }
  }
  return docs;
}

function writeStats(docs, error) {
  const empty = { generatedAt: new Date().toISOString(), documents: [], totalDocuments: 0, totalModifications: 0 };
  const data = error
    ? { ...empty, error }
    : {
        generatedAt: new Date().toISOString(),
        documents: docs,
        totalDocuments: docs.length,
        totalModifications: docs.reduce((s, d) => s + d.modificationCount, 0),
      };
  const buf = JSON.stringify(data, null, 2) + "\n";
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, buf);
  return data;
}

(function main() {
  try {
    const docs = collect();
    if (docs.length === 0) throw new Error("Git 히스토리에서 문서를 찾을 수 없습니다.");
    const data = writeStats(docs);
    console.log(`✅ stats.json 생성: 총 ${data.totalDocuments}개 문서`);
  } catch (err) {
    console.error("❌ 통계 생성 오류:", err.message);
    writeStats([], err.message);
  }
})();
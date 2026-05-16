#!/usr/bin/env node

if (!process.env.UPDATE) process.exit(0);

const { execSync } = require("child_process");
const fs = require("fs");

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

const staged = execSync("git diff --cached --name-only", { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter((f) => f.startsWith("docs/src/") && f.endsWith(".md"));

for (const filePath of staged) {
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  if (!lines[0].startsWith("---")) continue;

  let endIdx = -1, updatedIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith("---")) { endIdx = i; break; }
    if (lines[i].startsWith("updated:")) updatedIdx = i;
  }
  if (endIdx === -1 || updatedIdx === -1) continue;

  lines[updatedIdx] = `updated: ${today}`;
  fs.writeFileSync(filePath, lines.join("\n"));
  execSync(`git add "${filePath}"`);
  console.log(`updated: ${filePath} → ${today}`);
}

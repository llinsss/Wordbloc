#!/usr/bin/env node

"use strict";

const { execFileSync } = require("node:child_process");

const forbidden = [
  { pattern: /(^|\/)\.env(?:$|\.(?!example$))/, reason: "environment files may contain secrets" },
  { pattern: /(^|\/)node_modules\//, reason: "dependencies must not be committed" },
];

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const violations = [];
for (const file of files) {
  for (const rule of forbidden) {
    if (rule.pattern.test(file)) violations.push(`${file}: ${rule.reason}`);
  }
}

if (violations.length) {
  console.error("Repository hygiene violations:");
  for (const violation of violations) console.error(`  - ${violation}`);
  process.exit(1);
}

console.log(`Repository hygiene passed (${files.length} tracked files checked).`);

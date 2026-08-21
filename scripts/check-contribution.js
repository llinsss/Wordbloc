#!/usr/bin/env node

"use strict";

const { spawnSync } = require("node:child_process");

const checks = [
  ["Repository hygiene", process.execPath, ["scripts/check-repository.js"]],
  ["JavaScript syntax", process.execPath, ["--check", "server.js"]],
  ["Smart-contract compilation", "npx", ["hardhat", "compile"]],
  ["Test suite", "npx", ["hardhat", "test"]],
];

for (const [label, command, args] of checks) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });

  if (result.error) {
    console.error(`Unable to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`\nContribution check failed: ${label}`);
    process.exit(result.status || 1);
  }
}

console.log("\nAll contribution checks passed.");

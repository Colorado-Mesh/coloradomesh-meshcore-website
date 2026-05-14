#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const submodulePath = path.join(repoRoot, 'vendor', 'CoreScope');
const relativeSubmodulePath = path.relative(repoRoot, submodulePath);

const requiredFiles = [
  'Dockerfile',
  'LICENSE',
  'config.example.json',
  'channel-rainbow.json',
  'cmd/server/go.mod',
  'cmd/ingestor/go.mod',
  'public/index.html',
  'public/app.js',
  'public/live.js',
  'public/map.js',
  'public/style.css',
];

function fail(message) {
  console.error(`CoreScope submodule check failed: ${message}`);
  console.error(`Run: git submodule update --init --recursive ${relativeSubmodulePath}`);
  process.exit(1);
}

if (!existsSync(submodulePath)) {
  fail(`${relativeSubmodulePath} does not exist.`);
}

if (readdirSync(submodulePath).length === 0) {
  fail(`${relativeSubmodulePath} is empty.`);
}

const missingFiles = requiredFiles.filter((file) => !existsSync(path.join(submodulePath, file)));
if (missingFiles.length > 0) {
  fail(`${relativeSubmodulePath} is missing required upstream files: ${missingFiles.join(', ')}`);
}

let commit;
try {
  commit = execFileSync('git', ['-C', submodulePath, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
} catch {
  fail(`${relativeSubmodulePath} is not a readable git checkout.`);
}

if (!/^[0-9a-f]{40}$/i.test(commit)) {
  fail(`${relativeSubmodulePath} did not report a valid commit SHA.`);
}

console.log(`CoreScope submodule ready: ${relativeSubmodulePath} @ ${commit}`);

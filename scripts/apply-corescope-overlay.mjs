#!/usr/bin/env node

/**
 * Apply Colorado Mesh overlay assets into CoreScope's public/ dir.
 *
 * The overlay lives in /corescope-overlay so it survives upstream
 * CoreScope submodule updates (we never edit vendor files). This script
 * is idempotent: re-running it on an already-patched index.html only
 * re-copies asset files.
 *
 * Inputs:
 *   argv[2] / $CORESCOPE_PUBLIC_DIR : target public dir (default
 *                                     /app/corescope/public)
 *   argv[3]                         : overlay source dir (default
 *                                     <cwd>/corescope-overlay)
 *
 * Assets (each must exist in the overlay source dir):
 *   - denvermc-default-route.js  early <head> redirect /map -> #/live
 *   - denvermc-shell.css         minimal/fullscreen Colorado Mesh shell
 *   - denvermc-shell.js          shell DOM + state + a11y controls
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const publicDir = process.argv[2] || process.env.CORESCOPE_PUBLIC_DIR || '/app/corescope/public';
const overlayDir = process.argv[3] || path.resolve(process.cwd(), 'corescope-overlay');
const indexPath = path.join(publicDir, 'index.html');

const HEAD_ASSETS = [
  { kind: 'script', name: 'denvermc-default-route.js' },
  { kind: 'style', name: 'denvermc-shell.css' },
];
const BODY_ASSETS = [
  { kind: 'script', name: 'denvermc-shell.js' },
];
const ALL_ASSETS = [...HEAD_ASSETS, ...BODY_ASSETS];

function tagFor(asset) {
  const v = '?v=denvermc';
  if (asset.kind === 'style') return `  <link rel="stylesheet" href="${asset.name}${v}">`;
  return `  <script src="${asset.name}${v}" defer></script>`;
}

// Stable "denvermc overlay region" markers so re-runs only manage our own tags.
const HEAD_BEGIN = '<!-- denvermc-overlay:head:begin -->';
const HEAD_END = '<!-- denvermc-overlay:head:end -->';
const BODY_BEGIN = '<!-- denvermc-overlay:body:begin -->';
const BODY_END = '<!-- denvermc-overlay:body:end -->';

function injectRegion(html, beginMarker, endMarker, contents, anchor) {
  const region = `${beginMarker}\n${contents}\n  ${endMarker}`;
  // Existing region? Replace it.
  const existing = new RegExp(
    `${escapeRegex(beginMarker)}[\\s\\S]*?${escapeRegex(endMarker)}`,
    'm'
  );
  if (existing.test(html)) {
    return html.replace(existing, region);
  }
  // Otherwise insert just before the anchor (e.g. </head> or </body>).
  if (!html.includes(anchor)) {
    throw new Error(`CoreScope overlay: index.html is missing ${anchor}`);
  }
  return html.replace(anchor, `  ${region}\n${anchor}`);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
  mkdirSync(publicDir, { recursive: true });

  for (const asset of ALL_ASSETS) {
    copyFileSync(path.join(overlayDir, asset.name), path.join(publicDir, asset.name));
  }

  let html;
  try {
    html = readFileSync(indexPath, 'utf8');
  } catch (err) {
    console.error(`CoreScope overlay failed: cannot read ${indexPath}: ${err.message}`);
    process.exit(1);
  }

  const headBlock = HEAD_ASSETS.map(tagFor).join('\n');
  const bodyBlock = BODY_ASSETS.map(tagFor).join('\n');

  let next = html;
  // Strip the legacy single-tag injection so it can't double up next to
  // the new managed region.
  next = next.replace(/^\s*<script src="denvermc-default-route\.js[^"]*"><\/script>\s*\n?/gm, '');
  next = injectRegion(next, HEAD_BEGIN, HEAD_END, headBlock, '</head>');
  next = injectRegion(next, BODY_BEGIN, BODY_END, bodyBlock, '</body>');

  if (next !== html) {
    writeFileSync(indexPath, next);
  }

  console.log(`CoreScope overlay applied: ${publicDir}`);
}

main();

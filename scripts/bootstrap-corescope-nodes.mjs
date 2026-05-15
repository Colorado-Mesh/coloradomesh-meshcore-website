#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const env = process.env;
const enabled = !/^(0|false|no|off)$/i.test(env.CORESCOPE_BOOTSTRAP_NODES || 'true');
const sourceUrl = env.CORESCOPE_BOOTSTRAP_NODES_URL || 'https://analyzer.meshcore.coloradomesh.org/api/nodes?limit=1000';
const safeSourceUrl = redactUrl(sourceUrl);
const dbPath = env.CORESCOPE_DB_PATH || '/app/corescope/data/meshcore.db';
const timeoutMs = Number.parseInt(env.CORESCOPE_BOOTSTRAP_NODES_TIMEOUT_MS || '10000', 10);
const maxNodes = Number.parseInt(env.CORESCOPE_BOOTSTRAP_NODES_MAX || '1000', 10);

if (!enabled || sourceUrl === '') {
  process.exit(0);
}

function redactUrl(value) {
  try {
    const url = new URL(value);
    if (url.username !== '') url.username = 'redacted';
    if (url.password !== '') url.password = 'redacted';
    for (const key of Array.from(url.searchParams.keys())) {
      if (/(api[_-]?key|token|password|secret|credential|auth)/i.test(key)) {
        url.searchParams.set(key, 'redacted');
      }
    }
    return url.toString();
  } catch {
    return value;
  }
}

function fail(message) {
  console.error(`CoreScope node bootstrap skipped: ${message}`);
  process.exit(0);
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function normalizeNode(node) {
  const publicKey = typeof node.public_key === 'string' ? node.public_key : node.publicKey;
  const lat = Number(node.lat);
  const lon = Number(node.lon);
  if (typeof publicKey !== 'string' || publicKey.trim() === '' || !Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) {
    return null;
  }

  return {
    public_key: publicKey.trim().toLowerCase(),
    name: typeof node.name === 'string' ? node.name : null,
    role: typeof node.role === 'string' ? node.role : null,
    lat,
    lon,
    last_seen: typeof node.last_seen === 'string' ? node.last_seen : (typeof node.last_heard === 'string' ? node.last_heard : null),
    first_seen: typeof node.first_seen === 'string' ? node.first_seen : null,
    advert_count: Number.isFinite(Number(node.advert_count)) ? Math.max(0, Number.parseInt(node.advert_count, 10)) : 0,
    battery_mv: Number.isFinite(Number(node.battery_mv)) ? Number.parseInt(node.battery_mv, 10) : null,
    temperature_c: Number.isFinite(Number(node.temperature_c)) ? Number(node.temperature_c) : null,
  };
}

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 10000);
let payload;
try {
  const response = await fetch(sourceUrl, { signal: controller.signal });
  if (!response.ok) fail(`${safeSourceUrl} returned HTTP ${response.status}`);
  payload = await response.json();
} catch (error) {
  const reason = error.name === 'AbortError' ? 'timed out' : 'could not be fetched';
  fail(`${safeSourceUrl} ${reason}`);
} finally {
  clearTimeout(timer);
}

const rows = (Array.isArray(payload?.nodes) ? payload.nodes : [])
  .map(normalizeNode)
  .filter(Boolean)
  .slice(0, Number.isFinite(maxNodes) && maxNodes > 0 ? maxNodes : 1000);

if (rows.length === 0) {
  fail(`${safeSourceUrl} returned no nodes with coordinates`);
}

const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'corescope-nodes-'));
const jsonPath = path.join(tmpDir, 'nodes.json');
writeFileSync(jsonPath, JSON.stringify(rows));

const sql = `
CREATE TABLE IF NOT EXISTS nodes (
  public_key TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  lat REAL,
  lon REAL,
  last_seen TEXT,
  first_seen TEXT,
  advert_count INTEGER DEFAULT 0,
  battery_mv INTEGER,
  temperature_c REAL,
  foreign_advert INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_nodes_last_seen ON nodes(last_seen);
CREATE INDEX IF NOT EXISTS idx_nodes_foreign_advert ON nodes(foreign_advert) WHERE foreign_advert = 1;
WITH source AS (
  SELECT value FROM json_each(readfile(${sqlString(jsonPath)}))
)
INSERT INTO nodes (
  public_key,
  name,
  role,
  lat,
  lon,
  last_seen,
  first_seen,
  advert_count,
  battery_mv,
  temperature_c,
  foreign_advert
)
SELECT
  json_extract(value, '$.public_key'),
  json_extract(value, '$.name'),
  json_extract(value, '$.role'),
  json_extract(value, '$.lat'),
  json_extract(value, '$.lon'),
  COALESCE(json_extract(value, '$.last_seen'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  COALESCE(json_extract(value, '$.first_seen'), json_extract(value, '$.last_seen'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  COALESCE(json_extract(value, '$.advert_count'), 0),
  json_extract(value, '$.battery_mv'),
  json_extract(value, '$.temperature_c'),
  0
FROM source
WHERE true
ON CONFLICT(public_key) DO UPDATE SET
  name = COALESCE(nodes.name, excluded.name),
  role = COALESCE(nodes.role, excluded.role),
  lat = COALESCE(nodes.lat, excluded.lat),
  lon = COALESCE(nodes.lon, excluded.lon),
  first_seen = COALESCE(nodes.first_seen, excluded.first_seen),
  last_seen = CASE
    WHEN nodes.last_seen IS NULL OR excluded.last_seen > nodes.last_seen THEN excluded.last_seen
    ELSE nodes.last_seen
  END,
  advert_count = CASE
    WHEN excluded.advert_count > nodes.advert_count THEN excluded.advert_count
    ELSE nodes.advert_count
  END,
  battery_mv = COALESCE(nodes.battery_mv, excluded.battery_mv),
  temperature_c = COALESCE(nodes.temperature_c, excluded.temperature_c);
SELECT COUNT(*) FROM nodes;
`;

try {
  const result = spawnSync('sqlite3', [dbPath], { input: sql, encoding: 'utf8' });
  if (result.status !== 0) fail((result.stderr || result.stdout || 'sqlite3 failed').trim());
  const total = result.stdout.trim().split(/\s+/).at(-1) || '0';
  console.log(`CoreScope node bootstrap loaded ${rows.length} source nodes (${total} local nodes total)`);
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}

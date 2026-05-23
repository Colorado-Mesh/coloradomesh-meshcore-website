#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const env = process.env;
const dbPath = env.CORESCOPE_DB_PATH || '/app/corescope/data/meshcore.db';

function fail(message) {
  console.error(`CoreScope retention prune failed: ${message}`);
  process.exit(1);
}

function days(name, fallback) {
  const raw = env[name] == null || env[name] === '' ? String(fallback) : env[name];
  if (!/^-?\d+$/.test(raw)) fail(`${name} must be an integer`);
  return Number.parseInt(raw, 10);
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function cutoff(daysAgo) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

const nodeDays = days('CORESCOPE_RETENTION_NODE_DAYS', 7);
const observerDays = days('CORESCOPE_RETENTION_OBSERVER_DAYS', 14);
const packetDays = days('CORESCOPE_RETENTION_PACKET_DAYS', 1);
const metricsDays = days('CORESCOPE_RETENTION_METRICS_DAYS', 30);

const statements = [];

if (nodeDays > 0) {
  const nodeCutoff = sqlString(cutoff(nodeDays));
  statements.push(`
    CREATE TEMP TABLE IF NOT EXISTS retention_stale_nodes(public_key TEXT PRIMARY KEY);
    DELETE FROM retention_stale_nodes;
    INSERT INTO retention_stale_nodes
      SELECT public_key FROM nodes WHERE last_seen IS NOT NULL AND last_seen < ${nodeCutoff};
    INSERT OR REPLACE INTO inactive_nodes (
      public_key, name, role, lat, lon, last_seen, first_seen, advert_count, battery_mv, temperature_c
    )
    SELECT public_key, name, role, lat, lon, last_seen, first_seen, advert_count, battery_mv, temperature_c
      FROM nodes
      WHERE public_key IN (SELECT public_key FROM retention_stale_nodes);
    DELETE FROM nodes WHERE public_key IN (SELECT public_key FROM retention_stale_nodes);
    SELECT 'nodes|' || changes();
  `);
}

if (observerDays > -1) {
  const observerCutoff = sqlString(cutoff(observerDays));
  statements.push(`
    UPDATE observers
      SET inactive = 1
      WHERE last_seen IS NOT NULL AND last_seen < ${observerCutoff} AND (inactive IS NULL OR inactive = 0);
    SELECT 'observers|' || changes();
    DELETE FROM observer_metrics WHERE observer_id IN (SELECT id FROM observers WHERE inactive = 1);
  `);
}

if (packetDays > 0) {
  const packetCutoff = sqlString(cutoff(packetDays));
  statements.push(`
    CREATE TEMP TABLE IF NOT EXISTS retention_old_transmissions(id INTEGER PRIMARY KEY);
    DELETE FROM retention_old_transmissions;
    INSERT INTO retention_old_transmissions
      SELECT id FROM transmissions WHERE first_seen IS NOT NULL AND first_seen < ${packetCutoff};
    DELETE FROM observations WHERE transmission_id IN (SELECT id FROM retention_old_transmissions);
    DELETE FROM transmissions WHERE id IN (SELECT id FROM retention_old_transmissions);
    SELECT 'packets|' || changes();
  `);
}

if (metricsDays > 0) {
  const metricsCutoff = sqlString(cutoff(metricsDays));
  statements.push(`
    DELETE FROM observer_metrics WHERE timestamp IS NOT NULL AND timestamp < ${metricsCutoff};
    SELECT 'metrics|' || changes();
  `);
}

if (statements.length === 0) {
  console.log('CoreScope retention prune skipped: all retention windows disabled');
  process.exit(0);
}

const result = spawnSync('sqlite3', [dbPath], { input: statements.join('\n'), encoding: 'utf8' });
if (result.status !== 0) fail((result.stderr || result.stdout || 'sqlite3 failed').trim());

const counts = new Map(
  result.stdout
    .trim()
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => {
      const [key, value] = line.split('|');
      return [key, Number.parseInt(value, 10) || 0];
    })
);

console.log(
  `CoreScope retention prune complete: ${counts.get('nodes') || 0} node(s) inactive, ${counts.get('observers') || 0} observer(s) inactive, ${counts.get('packets') || 0} packet transmission(s) pruned, ${counts.get('metrics') || 0} metric row(s) pruned`
);

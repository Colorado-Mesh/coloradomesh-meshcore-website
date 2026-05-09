#!/usr/bin/env node

const baseUrl = process.argv[2] ?? process.env.MAP_VERIFY_BASE_URL ?? 'http://127.0.0.1:3000';

async function readApi(path) {
  const response = await fetch(new URL(path, baseUrl));
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);

  const body = await response.json();
  if (body?.success !== true || body.data === undefined) {
    throw new Error(`${path} did not return ApiResponse success data`);
  }

  return body.data;
}

const runtime = await readApi('/api/map/runtime');
const snapshot = await readApi('/api/map/snapshot');

if (runtime.sampleData || snapshot.connection?.sampleData || snapshot.source?.type === 'sample') {
  throw new Error('Map is serving sample data, not real data.');
}

if (!['live_map_api', 'mqtt'].includes(snapshot.source?.type)) {
  throw new Error(`Map source is ${snapshot.source?.type ?? 'unknown'}, not real live data.`);
}

if (!snapshot.connection?.configured) {
  throw new Error('Map data source is not configured.');
}

if (snapshot.connection?.state === 'error') {
  throw new Error(snapshot.connection?.message ?? 'Map data source returned an error.');
}

if (!Array.isArray(snapshot.nodes) || snapshot.nodes.length === 0) {
  throw new Error('Map real-data source returned zero nodes.');
}

console.log(JSON.stringify({
  ok: true,
  source: snapshot.source.type,
  connectionState: snapshot.connection.state,
  nodeCount: snapshot.nodes.length,
  lastUpdated: snapshot.source.lastUpdated,
}, null, 2));

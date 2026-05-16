#!/usr/bin/env node

const baseUrl = process.argv[2] ?? process.env.MAP_VERIFY_BASE_URL ?? 'http://127.0.0.1:3000';

async function readApi(path) {
  const response = await fetch(new URL(path, baseUrl));
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

const [health, stats, nodes] = await Promise.all([
  readApi('/api/healthz'),
  readApi('/api/stats'),
  readApi('/api/nodes?limit=1000'),
]);

if (health.ready !== true) {
  throw new Error('CoreScope health endpoint did not report ready=true.');
}

if (typeof stats.totalNodes !== 'number' || typeof stats.totalPackets !== 'number') {
  throw new Error('CoreScope stats endpoint did not return numeric network counters.');
}

if (!Array.isArray(nodes.nodes) || nodes.nodes.length === 0) {
  throw new Error('CoreScope nodes endpoint returned zero nodes.');
}

console.log(JSON.stringify({
  ok: true,
  source: 'corescope',
  nodeCount: nodes.nodes.length,
  totalNodes: stats.totalNodes,
  totalPackets: stats.totalPackets,
}, null, 2));

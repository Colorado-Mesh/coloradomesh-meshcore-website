#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const args = process.argv.slice(2);
const imageArgIndex = args.indexOf('--image');
const image = imageArgIndex >= 0 ? args[imageArgIndex + 1] : process.env.DOCKER_SMOKE_IMAGE;

if (!image) {
  console.error('Usage: npm run docker:smoke -- --image <image-tag>');
  process.exit(1);
}

const containerName = `colorado-meshcore-smoke-${process.pid}`;
const port = Number(process.env.DOCKER_SMOKE_PORT ?? 3300);
const baseUrl = `http://127.0.0.1:${port}`;

function docker(args, options = {}) {
  return spawnSync('docker', args, {
    stdio: options.stdio ?? 'pipe',
    encoding: 'utf8',
  });
}

async function waitFor(url, timeoutMs = 30_000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(500);
  }
  throw lastError ?? new Error(`${url} was not ready`);
}

async function expectOk(path) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response;
}

async function expectApiSuccess(path) {
  const response = await expectOk(path);
  const body = await response.json();
  if (body?.success !== true || body.data === undefined) {
    throw new Error(`${path} did not return ApiResponse success data`);
  }
  return body.data;
}

function hasWarning(warnings, id) {
  return Array.isArray(warnings) && warnings.some((warning) => warning?.id === id);
}

try {
  const existing = docker(['ps', '-aq', '--filter', `name=^/${containerName}$`]);
  if (existing.status === 0 && existing.stdout.trim()) {
    docker(['rm', '-f', containerName], { stdio: 'ignore' });
  }

  const run = docker([
    'run',
    '--rm',
    '-d',
    '--name',
    containerName,
    '-p',
    `${port}:3000`,
    '-e',
    'MESHCORE_LIVE_MAP_API_URL=',
    '-e',
    'MESHCORE_MAP_SAMPLE_DATA=true',
    '-e',
    'MESHCORE_MAP_DEMO_MODE=true',
    image,
  ]);

  if (run.status !== 0) {
    throw new Error(run.stderr || run.stdout || 'docker run failed');
  }

  await waitFor(`${baseUrl}/api/map/runtime`);
  await expectOk('/');
  const runtime = await expectApiSuccess('/api/map/runtime');
  const snapshot = await expectApiSuccess('/api/map/snapshot');

  if (!Array.isArray(snapshot.nodes)) {
    throw new Error('/api/map/snapshot data.nodes is not an array');
  }

  if (runtime.sampleData !== true || runtime.demoMode !== true) {
    throw new Error('/api/map/runtime did not report sampleData=true and demoMode=true under smoke env');
  }

  if (runtime.sourceLabel !== 'Demo map data') {
    throw new Error('/api/map/runtime did not report the demo source label under smoke env');
  }

  if (!hasWarning(runtime.warnings, 'map-demo-data')) {
    throw new Error('/api/map/runtime did not include the demo-data warning under smoke env');
  }

  if (hasWarning(runtime.warnings, 'map-production-sample-data')) {
    throw new Error('/api/map/runtime included a production sample-data warning while demo mode is enabled');
  }

  if (snapshot.source?.type !== 'sample' || snapshot.connection?.sampleData !== true) {
    throw new Error('/api/map/snapshot did not report sample source and connection state under smoke env');
  }

  if (!hasWarning(snapshot.warnings, 'map-demo-data')) {
    throw new Error('/api/map/snapshot did not include the demo-data warning under smoke env');
  }

  if (hasWarning(snapshot.warnings, 'map-production-sample-data')) {
    throw new Error('/api/map/snapshot included a production sample-data warning while demo mode is enabled');
  }

  console.log(`Docker smoke passed for ${image} on ${baseUrl}`);
} finally {
  docker(['rm', '-f', containerName], { stdio: 'ignore' });
}

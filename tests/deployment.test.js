import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { selectDirectory, uploadBuild, deploy } from '../deploy-ftp.js';
import { verifyDeployment } from '../scripts/verify-deployment.js';

function directoryClient(directories, code = 550) {
  return {
    current: '/',
    visited: [],
    async cd(directory) {
      this.visited.push(directory);
      if (!directories.includes(directory)) throw Object.assign(new Error('Directory unavailable'), { code });
      this.current = directory;
    },
    async pwd() { return this.current; },
  };
}

test('selects Joytun addon domain instead of the primary public_html', async () => {
  const domain = '/domains/joytunchemicals.com/public_html';
  const client = directoryClient([domain, '/public_html']);
  assert.equal(await selectDirectory(client), domain);
  assert.deepEqual(client.visited, [domain]);
});

test('supports the original FTP web root, but never falls back to account root', async () => {
  assert.equal(await selectDirectory(directoryClient(['/public_html'])), '/public_html');
  await assert.rejects(selectDirectory(directoryClient(['/'])), /web root was not found/);
});

test('an explicit destination failure or connection failure stops deployment', async () => {
  const client = directoryClient(['/public_html']);
  await assert.rejects(selectDirectory(client, '/wrong/path'), /unavailable/);
  assert.deepEqual(client.visited, ['/wrong/path']);
  await assert.rejects(selectDirectory(client, '/public_html/../'), /without/);
  await assert.rejects(selectDirectory(directoryClient([], 'ECONNRESET')), /unavailable/);
});

test('missing credentials fail before connecting', async () => {
  await assert.rejects(deploy({}), /Missing GitHub Actions secret: FTP_SERVER/);
});

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'joytun-deployment-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, 'assets'));
  const html = '<html><script src="/assets/app.js"></script><link href="/assets/app.css" rel="stylesheet"></html>';
  const files = {
    'index.html': html,
    'index.php': '<?php include "index.html";',
    '.htaccess': 'DirectoryIndex index.html',
    'deployment.json': JSON.stringify({ releaseId: 'release-1', sha: 'commit-1' }),
    'assets/app.js': 'console.log("ready");',
    'assets/app.css': 'body { color: black; }',
  };
  for (const [file, contents] of Object.entries(files)) await writeFile(path.join(directory, file), contents);
  return { directory, files, html };
}

test('asset transfer failure leaves live entry points untouched', async t => {
  const { directory } = await fixture(t);
  const uploaded = [];
  await assert.rejects(uploadBuild({
    async cd() {}, async ensureDir() {},
    async uploadFrom(local, remote) { uploaded.push(remote); throw new Error('Transfer interrupted'); },
  }, directory, '/public_html', 'test'), /Transfer interrupted/);
  assert(uploaded.length > 0);
  assert(uploaded.every(file => !file.startsWith('index.html')));
});

test('uploads and verifies assets before atomically replacing entry points', async t => {
  const { directory } = await fixture(t);
  const published = [];
  let uploaded;
  await uploadBuild({
    async cd() {}, async ensureDir() {},
    async uploadFrom(local) { uploaded = await readFile(local); },
    async size() { return uploaded.length; },
    async rename(from, to) { assert(from.endsWith('.upload-test')); published.push(to); },
  }, directory, '/public_html', 'test');
  assert(published.indexOf('app.js') < published.indexOf('index.html'));
  assert(published.indexOf('app.css') < published.indexOf('index.html'));
  assert.equal(published.at(-1), 'deployment.json');
});

test('rejects truncated uploads before replacing a live file', async t => {
  const { directory } = await fixture(t);
  let renamed = false;
  await assert.rejects(uploadBuild({
    async cd() {}, async ensureDir() {}, async uploadFrom() {},
    async size() { return 0; }, async rename() { renamed = true; },
  }, directory, '/public_html', 'test'), /size mismatch/);
  assert.equal(renamed, false);
});

test('live check accepts the current build and rejects 403, stale HTML, broken routes and assets', async t => {
  const { directory, files, html } = await fixture(t);
  let mode = 'ok';
  const server = createServer((req, res) => {
    const file = new URL(req.url, 'http://localhost').pathname.slice(1);
    const isHtml = ['', 'index.html', 'products', 'admin/login'].includes(file);
    if (mode === '403') { res.writeHead(403); res.end('Forbidden'); return; }
    res.setHeader('Content-Type', isHtml ? 'text/html' : file.endsWith('.json') ? 'application/json' : file.endsWith('.js') ? 'text/javascript' : 'text/css');
    if (mode === 'stale' && isHtml) res.end('<html>old version</html>');
    else if (mode === 'route' && file === 'products') { res.writeHead(404); res.end('Not found'); }
    else if (mode === 'asset' && file.endsWith('.js')) res.end('old code');
    else res.end(isHtml ? html : files[file]);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const url = `http://127.0.0.1:${server.address().port}`;
  await verifyDeployment(url, directory);
  for (const [failure, message] of [['403', /HTTP 403/], ['stale', /current build/], ['route', /HTTP 404/], ['asset', /differs from the build/]]) {
    mode = failure;
    await assert.rejects(verifyDeployment(url, directory), message);
  }
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export async function verifyDeployment(siteUrl, distDir) {
  const expected = (await readFile(path.join(distDir, 'index.html'), 'utf8')).trim();
  const release = JSON.parse(await readFile(path.join(distDir, 'deployment.json'), 'utf8'));
  const base = new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`);
  async function get(relative) {
    const url = new URL(relative, base);
    url.searchParams.set('deployment', release.releaseId);
    const response = await fetch(url, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(20_000),
    });
    assert.equal(response.status, 200, `${relative || '/'} returned HTTP ${response.status}`);
    return response;
  }

  const liveRelease = await (await get('deployment.json')).json();
  assert.equal(liveRelease.releaseId, release.releaseId, 'The live domain serves a different release. Check FTP_SERVER_DIR and Hostinger cache.');
  for (const route of ['', 'index.html', 'products', 'admin/login']) {
    const response = await get(route);
    assert.match(response.headers.get('content-type') || '', /text\/html/, `${route || '/'} is not HTML`);
    const html = (await response.text()).trim();
    if (route === 'index.html') assert.equal(html, expected, 'Static entry does not match the current build');
    else {
      assert(html.includes(`joytun-release: ${release.releaseId}`), `${route || '/'} does not serve the current release`);
      assert.match(html, /rel="canonical"/, 'Server-rendered canonical is missing');
      assert(!html.includes('AHN Tower'), 'An obsolete address is still present');
    }
    console.log(`Verified ${new URL(route, base).pathname}`);
  }

  const assets = [...expected.matchAll(/(?:src|href)="(\/assets\/[^"?#]+\.(?:js|css))"/g)].map(match => match[1]);
  assert(assets.some(asset => asset.endsWith('.js')), 'Built HTML has no JavaScript asset');
  for (const asset of new Set(assets)) {
    const response = await get(asset);
    assert.match(response.headers.get('content-type') || '', asset.endsWith('.css') ? /text\/css/ : /javascript/, `Wrong content type for ${asset}`);
    const live = Buffer.from(await response.arrayBuffer());
    const local = await readFile(path.join(distDir, asset.slice(1)));
    assert(live.equals(local), `Live asset differs from the build: ${asset}`);
    console.log(`Verified ${asset}`);
  }
  console.log(`Live release verified: ${release.sha}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await verifyDeployment(process.env.SITE_URL || 'https://www.joytunchemicals.com', distDir);
      break;
    } catch (error) {
      console.error(`Verification attempt ${attempt}/4: ${error.message}`);
      if (attempt === 4) process.exitCode = 1;
      else await delay(10_000);
    }
  }
}

import { Client } from 'basic-ftp';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));

export async function selectDirectory(client, configuredDirectory) {
  if (configuredDirectory) {
    if (!configuredDirectory.startsWith('/') || configuredDirectory.split('/').includes('..')) {
      throw new Error('FTP_SERVER_DIR must be an absolute FTP path without .. segments.');
    }
    // Never create or silently fall back from an explicitly configured destination.
    await client.cd(configuredDirectory);
    return client.pwd();
  }

  // Hostinger keeps addon domains here. The old script only used /public_html,
  // which can belong to the hosting account's primary website.
  for (const directory of ['/domains/joytunchemicals.com/public_html', '/public_html']) {
    try {
      await client.cd(directory);
      return await client.pwd();
    } catch (error) {
      if (error.code !== 550) throw error;
    }
  }
  throw new Error('Joytun web root was not found. Set FTP_SERVER_DIR to the path shown in Hostinger.');
}

async function collectFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path.join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Unsupported build entry: ${relative}`);
  }
  return files;
}

export async function uploadBuild(client, distDir, destination, releaseId) {
  const files = await collectFiles(distDir);
  // Publish the entry points only after every asset has finished uploading.
  const entryPoints = ['.htaccess', 'index.html', 'index.php', 'deployment.json'];
  const assets = files.filter(file => !entryPoints.includes(file));
  for (const file of [...assets, ...entryPoints]) {
    const directory = path.posix.dirname(file);
    await client.cd(destination);
    if (directory !== '.') await client.ensureDir(directory);
    const name = path.posix.basename(file);
    const local = path.join(distDir, file);
    const temporary = `${name}.upload-${releaseId}`;
    await client.uploadFrom(local, temporary);
    if (await client.size(temporary) !== (await stat(local)).size) {
      throw new Error(`Upload size mismatch: ${file}`);
    }
    await client.rename(temporary, name);
    console.log(`Published ${file}`);
  }
  await client.cd(destination);
  // Existing files and previous hashed assets are kept for visitors with older pages.
}

export async function deploy(env = process.env) {
  for (const name of ['FTP_SERVER', 'FTP_USERNAME', 'FTP_PASSWORD']) {
    if (!env[name]) throw new Error(`Missing GitHub Actions secret: ${name}`);
  }
  const distDir = path.join(projectDir, 'dist');
  for (const file of ['index.html', 'index.php', '.htaccess']) {
    if (!(await stat(path.join(distDir, file))).size) throw new Error(`Build file is empty: ${file}`);
  }
  const sha = env.GITHUB_SHA || 'local';
  const releaseId = `${sha.slice(0, 12)}-${env.GITHUB_RUN_ID || Date.now()}`;
  const htmlFile = path.join(distDir, 'index.html');
  const html = (await readFile(htmlFile, 'utf8')).replace(/\n<!-- joytun-release:.*? -->\n?/g, '\n');
  await writeFile(htmlFile, `${html.trimEnd()}\n<!-- joytun-release: ${releaseId} -->\n`);
  await writeFile(path.join(distDir, 'deployment.json'), JSON.stringify({ sha, releaseId, deployedAt: new Date().toISOString() }) + '\n');

  const client = new Client(60_000);
  try {
    await client.access({
      host: env.FTP_SERVER,
      user: env.FTP_USERNAME,
      password: env.FTP_PASSWORD,
      // Keep the existing account's FTP setting; FTPS can be enabled in repository variables.
      secure: env.FTP_SECURE === 'true',
    });
    const destination = await selectDirectory(client, env.FTP_SERVER_DIR);
    console.log(`Hostinger destination: ${destination}`);
    await uploadBuild(client, distDir, destination, releaseId);
    console.log('Upload completed. Live HTTP verification runs next.');
  } finally {
    client.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  deploy().catch(error => {
    console.error(`Deployment failed: ${error.message}`);
    process.exitCode = 1;
  });
}

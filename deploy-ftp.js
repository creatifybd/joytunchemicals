import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
	async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.timeout = 60000;
  
  try {
    console.log('Connecting to Hostinger FTP server...');
    await client.access({
      host: process.env.FTP_SERVER,
      user: process.env.FTP_USERNAME,
      password: process.env.FTP_PASSWORD,
      secure: false
    });
    console.log('Successfully connected to Hostinger FTP!');

    console.log('Navigating to public_html...');
    await client.ensureDir('public_html');
    await client.clearWorkingDir();
    console.log('public_html directory cleared for clean deployment.');

    const distPath = path.resolve(__dirname, 'dist');
    console.log('Uploading build files from ' + distPath + ' to public_html...');
    await client.uploadFromDir(distPath);
    console.log('All files uploaded successfully!');

    console.log('Verifying files in public_html;');
    const files = await client.list();
    for (const f of files) {
      console.log(` - ${f.isDirectory ? '[DIR] ' : '[FILE] '}${f.name} (${f.size} bytes)`);
    }

    console.log('Deployment to Hostinger completed successfully!');
  } catch (err) {
    console.error('Deployment error:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();

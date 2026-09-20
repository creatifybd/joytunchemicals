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

    console.log('Initial PWD:', await client.pwd());
    console.log('Listing initial directory:');
    const rootList = await client.list();
    for (const f of rootList) {
      console.log(` - ${f.isDirectory ? '[DIR] ' : '[FILE] '}${f.name} (${f.size} bytes)`);
    }

    try {
      await client.cd('/');
      console.log('PWD after cd /:', await client.pwd());
      const rootCdList = await client.list();
      console.log('Listing /:');
      for (const f of rootCdList) {
        console.log(` - ${f.isDirectory ? '[DIR] ' : '[FILE] '}${f.name} (${f.size} bytes)`);
      }
    } catch(e) {
      console.log('Could not cd /:', e.message);
    }

    try {
      await client.cd('/public_html');
      console.log('PWD after cd /public_html:', await client.pwd());
    } catch (e) {
      console.log('Could not cd /public_html, staying in current:', e.message);
    }

    const distPath = path.resolve(__dirname, 'dist');
    console.log('Uploading build files from ' + distPath + ' to ' + (await client.pwd()) + '...');
    await client.uploadFromDir(distPath);
    console.log('All files uploaded successfully!');

    console.log('Final verification of files in ' + (await client.pwd()) + ':');
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

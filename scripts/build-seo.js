import { writeFile, readFile } from 'node:fs/promises'
import { loadEnv } from 'vite'
import { defaultSite, SITE_URL } from '../src/data/site.js'
import { approvedProducts } from '../src/data/catalogue.js'
const env={...loadEnv('production',process.cwd(),''),...process.env}
const project=env.VITE_FIREBASE_PROJECT_ID||''
await writeFile('dist/seo-defaults.json',JSON.stringify({site:defaultSite,products:approvedProducts,project,origin:SITE_URL}))
await writeFile('dist/robots.txt',`User-agent: *\nDisallow: /admin\nDisallow: /index.html\nDisallow: /*?preview=\nSitemap: ${SITE_URL}/sitemap.xml\n`)
console.log('✓ Public SEO defaults and robots generated')

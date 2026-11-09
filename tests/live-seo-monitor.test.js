import test from 'node:test'
import assert from 'node:assert/strict'
import {expectedPaths,extractLiveSchema,extractCanonical,extractRobots,sitemapLocations} from '../scripts/monitor-live-seo.js'
test('scheduled public SEO monitor covers 24 product pages and seven care guides',()=>{
 assert.equal(expectedPaths.length,38)
 assert.equal(new Set(expectedPaths).size,38)
 assert.equal(expectedPaths.filter(v=>v.startsWith('/care/')).length,7)
 assert.equal(expectedPaths.filter(v=>v.startsWith('/products/')).length,24)
})
test('robots, canonical and crawler structured-data parsers detect expected public metadata',()=>{
 const h='<title>Example</title><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="https://www.joytunchemicals.com/care/hand-wash"><script id="joytun-schema" type="application/ld+json">{"@graph":[{"@type":"CollectionPage"}]}</script>'
 assert.equal(extractRobots(h),'index,follow,max-image-preview:large')
 assert.equal(extractCanonical(h),'https://www.joytunchemicals.com/care/hand-wash')
 assert.equal(extractLiveSchema(h)['@graph'][0]['@type'],'CollectionPage')
 assert.equal(extractLiveSchema('broken'),null)
})
test('sitemap parser distinguishes canonical urls from image extension loc elements',()=>{
 const xml='<urlset><url><loc>https://www.joytunchemicals.com/products</loc><image:image><image:loc>https://www.joytunchemicals.com/image.png</image:loc></image:image></url></urlset>'
 assert.deepEqual(sitemapLocations(xml),['https://www.joytunchemicals.com/products'])
})

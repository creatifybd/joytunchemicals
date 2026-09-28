import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSite,mergeSite,validateSite,resolveProductImage} from '../src/data/site.js';
import {approvedProducts} from '../src/data/catalogue.js';
import {access} from 'node:fs/promises';
test('legacy saved content receives six category banners without losing content',()=>{
 const site=mergeSite({home:{title:'Saved title'},slides:[]});
 assert.equal(site.home.title,'Saved title');assert.equal(site.heroSlides.length,6);assert.deepEqual(site.slides,[]);
});
test('every default hero category uses valid original product assets and a shipped background',async()=>{
 for(const slide of defaultSite.heroSlides){
 await access(new URL('../public'+slide.background,import.meta.url));
 for(const slug of slide.images){const p=approvedProducts.find(p=>p.slug===slug);assert.ok(p,slug);assert.equal(p.category,slide.category);assert.ok(resolveProductImage(slug,approvedProducts));}
 }
});
test('hero publishing rejects invalid timing, missing backgrounds and empty enabled selections',()=>{
 for(const seconds of [0,4,21,NaN]){const s=structuredClone(defaultSite);s.slideshow.intervalSeconds=seconds;assert.match(validateSite(s),/timing/)}
 const s=structuredClone(defaultSite);s.heroSlides.forEach(x=>x.enabled=false);assert.match(validateSite(s),/enabled/);
 const b=structuredClone(defaultSite);b.heroSlides[0].background='javascript:alert(1)';assert.match(validateSite(b),/banner/);
 assert.equal(validateSite(structuredClone(defaultSite)),null);
});

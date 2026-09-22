import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { approvedProducts, mergeCatalogue, filterCatalogue, careCategories } from '../src/data/catalogue.js';

test('the approved catalogue contains 22 unique products across six care categories', () => {
  assert.equal(approvedProducts.length,22);
  assert.equal(new Set(approvedProducts.map(p=>p.id)).size,22);
  assert.equal(new Set(approvedProducts.map(p=>p.img)).size,22);
  const counts=Object.fromEntries(careCategories.map(c=>[c.id,filterCatalogue(approvedProducts,c.id).length]));
  assert.deepEqual(counts,{laundry:3,hand:8,kitchen:6,floor:2,glass:2,bathroom:1});
});

test('all product PNGs are byte-for-byte identical to the approved archive originals',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../src/data/product-assets.json',import.meta.url),'utf8'));
  const directory=new URL('../public/images/products/',import.meta.url);
  assert.equal((await readdir(directory)).length,22);
  for(const entry of manifest){
    const data=await readFile(new URL(`${entry.slug}.png`,directory));
    assert.equal(createHash('sha256').update(data).digest('hex'),entry.sha256,entry.slug);
  }
});

test('legacy family cards and baby products cannot reappear from the remote collection',()=>{
  const merged=mergeCatalogue([{id:'tWAIvhaR4gpd53qA4OaE',name:'n’Olive Hand Wash',status:'active'},{id:'baby-pink',name:'Baby Detergent Pink',status:'active'},{id:'baby-blue',name:'Baby Detergent Blue',status:'active'}]);
  assert.equal(merged.length,22);
  assert(!merged.some(p=>/baby/i.test(p.name)));
});

test('admin changes override an approved product, and archived products stay hidden',()=>{
  const merged=mergeCatalogue([{id:approvedProducts[0].id,status:'archived'},{id:approvedProducts[1].id,desc:'Updated description'},{id:'new-product',name:'New home cleaner',cat:'Floor Cleaner',status:'active'}]);
  assert.equal(merged.find(p=>p.id===approvedProducts[1].id).desc,'Updated description');
  assert(!filterCatalogue(merged).some(p=>p.id===approvedProducts[0].id));
  assert(filterCatalogue(merged).some(p=>p.id==='new-product'));
});

test('search works with apostrophe variants, fragrance plus format, and care filters',()=>{
  assert.equal(filterCatalogue(approvedProducts,'all',"n'Olive").length,8);
  assert.equal(filterCatalogue(approvedProducts,'all','nolive').length,8);
  assert.equal(filterCatalogue(approvedProducts,'hand','apple refill').length,1);
  assert.equal(filterCatalogue(approvedProducts,'kitchen','orange').length,3);
  assert.equal(filterCatalogue(approvedProducts,'all','baby').length,0);
  assert.equal(filterCatalogue(approvedProducts,'all','not-a-product').length,0);
});

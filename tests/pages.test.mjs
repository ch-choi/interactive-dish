import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const data=JSON.parse(await readFile('data.json','utf8'));
const slugs=[...new Set(data.desktop.map(item=>item.data.collectionSlug))];
const pages=[...slugs.map(slug=>`collections/${slug}/index.html`),'about/index.html','contact/index.html'];
for(const file of pages){
 const html=await readFile(file,'utf8');
 assert.ok(html.includes('<h1'),`${file}: heading exists`);
 assert.ok(!/<(?:img|script)[^>]*\ssrc=["']https?:/i.test(html),`${file}: no remote media or scripts`);
 assert.ok(!/href=["']https:\/\/(?:www\.)?palmer-dinnerware\.com\/(?:about|contact|collections)/i.test(html),`${file}: navigation stays local`);
 for(const match of html.matchAll(/(?:src|href)=["'](\/(?:assets\/[^"']+|[^"']+\.(?:js|css)))["']/g))await access('.'+match[1]);
 for(const match of html.matchAll(/url\((?:&quot;|["'])?(\/assets\/[^)'"&]+)(?:&quot;|["'])?\)/g))await access('.'+match[1]);
 if(file.startsWith('collections/')){
  assert.ok(html.includes('gallery-item__button'),`${file}: product gallery exists`);
  assert.ok(html.includes('/collection-pages.js'),`${file}: interactions loaded`);
 }
}
assert.ok((await readFile('app.js','utf8')).includes("const collectionUrl=name=>'/collections/'+name+'/'"));
console.log(`Page checks passed: ${pages.length} internal pages, local assets and navigation.`);

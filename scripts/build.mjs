import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
const files=['index.html','app.css','app.js','explorer.js','cookie.css','cookie.js','data.json','collection-pages.js','collection-pages.css','about-contact.js','about-contact.css'];
await mkdir('dist',{recursive:true});
for(const file of files){
 const text=await readFile(file,'utf8');
 if(file.endsWith('.js')){const {spawnSync}=await import('node:child_process');const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status)throw new Error(r.stderr);}
 await writeFile(`dist/${file}`,text);
}
await cp('assets','dist/assets',{recursive:true});
for(const directory of ['collections','about','contact'])await cp(directory,`dist/${directory}`,{recursive:true});
const data=JSON.parse(await readFile('data.json','utf8'));
const paths=new Set([...data.desktop,...data.mobile].map(p=>p.src));
for(const collection of data.collections)for(const image of collection.images)paths.add(image);
for(const p of paths){if(!p.startsWith('/assets/'))throw new Error(`External media: ${p}`);await readFile('.'+p);}
console.log(`Build passed: ${data.desktop.length} products, ${data.collections.length} collections, ${paths.size} verified product assets.`);

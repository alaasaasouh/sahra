import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const file='dist/index.html';const original=await readFile(file);
const scenarios=[
 {name:'GitHub Pages subdirectory',env:{},expected:'https://alaasaasouh.github.io/sahra/'},
 {name:'Vercel production hostname',env:{VERCEL_PROJECT_PRODUCTION_URL:'sahra-production.example'},expected:'https://sahra-production.example/'},
 {name:'Vercel preview keeps production canonical',env:{VERCEL_PROJECT_PRODUCTION_URL:'sahra-production.example',VERCEL_URL:'sahra-preview.example'},expected:'https://sahra-production.example/'},
 {name:'Vercel deployment fallback',env:{VERCEL_URL:'sahra-preview.example'},expected:'https://sahra-preview.example/'},
 {name:'Custom domain override',env:{SITE_URL:'https://menu.example/kitchen?tracking=remove#menu',VERCEL_PROJECT_PRODUCTION_URL:'sahra-production.example'},expected:'https://menu.example/kitchen/'}
];
try{
 for(const scenario of scenarios){
  const result=spawnSync(process.execPath,['scripts/build-static.mjs'],{env:{...process.env,SITE_URL:'',VERCEL_PROJECT_PRODUCTION_URL:'',VERCEL_URL:'',...scenario.env},encoding:'utf8'});
  assert.equal(result.status,0,`${scenario.name}: ${result.stderr}`);const html=await readFile(file,'utf8');
  assert(html.includes(`<link rel="canonical" href="${scenario.expected}">`),scenario.name+' canonical');
  assert(html.includes(`<meta property="og:url" content="${scenario.expected}">`),scenario.name+' sharing URL');
  assert(html.includes(`<meta property="og:image" content="${new URL('brand/social-card.png',scenario.expected).href}">`),scenario.name+' sharing artwork');
  assert.equal([...html.matchAll(/data-card="/g)].length,27);console.log('PASS: '+scenario.name);
 }
 const result=spawnSync(process.execPath,['scripts/build-static.mjs'],{env:{...process.env,SITE_URL:'ftp://menu.example/',VERCEL_PROJECT_PRODUCTION_URL:'',VERCEL_URL:''},encoding:'utf8'});assert.notEqual(result.status,0,'Unsupported URL protocols are rejected');console.log('PASS: invalid website URL rejected');
}finally{await writeFile(file,original)}

import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {setTimeout as sleep} from 'node:timers/promises';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
const cwd=process.cwd();await mkdir('qa-results',{recursive:true});
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--no-sandbox','--disable-gpu','--disable-software-rasterizer','--no-first-run','--remote-debugging-port=9337',`--user-data-dir=${cwd}/qa-results/browser`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;let id=0;const pending=new Map();
try{
 let targets;for(let i=0;i<100;i++){try{targets=await(await fetch('http://127.0.0.1:9337/json')).json();if(targets.length)break}catch{}await sleep(100)}
 assert(targets?.length,'Chrome debugging endpoint ready');ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(msg.error):p.resolve(msg.result)}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:new URL('./dist/index.html',`file:///${cwd.replaceAll('\\','/')}/`).href});
 for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-dish]').length===27"))break;await sleep(100)}
 assert.equal(await evaluate("document.querySelectorAll('[data-dish]').length"),27);
 await evaluate("document.fonts.ready");await evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')");if(!process.argv.includes('--structure-only')){for(let i=0;i<100;i++){if(await evaluate("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"))break;await sleep(100)}}
 assert.equal(await evaluate("document.images.length"),27,'Every dish has its own photo');
 assert.equal(await evaluate("new Set([...document.images].map(i=>i.src)).size"),27,'Every dish has a distinct photo');
 if(!process.argv.includes('--structure-only'))assert(await evaluate("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"),'All 27 images load');
 assert(await evaluate("!(/demo|fictional|illustrative|concept|ai-created/i.test(document.body.innerText))"),'No demo wording in the menu');
 assert(await evaluate("!!document.querySelector('.category-indicator')&&!!window.sahraMotion"),'Animation controls initialized');
 await sleep(600);await writeFile('qa-results/desktop.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate("document.querySelector('[data-cat=sweet]').click()");assert.equal(await evaluate("document.querySelectorAll('[data-dish]').length"),3);
 await evaluate("document.querySelector('#reset').click();document.querySelector('#search').value='cardamom';document.querySelector('#search').dispatchEvent(new Event('input'))");assert(await evaluate("document.querySelectorAll('[data-dish]').length>0&&document.querySelectorAll('[data-dish]').length<27"));
 await evaluate("document.querySelector('#reset').click();document.querySelector('#veg').click()");assert(await evaluate("!document.querySelector('[data-dish=mandi]')&&!!document.querySelector('[data-dish=shafoot]')"));
 await evaluate("document.querySelector('#reset').click();document.querySelector('[data-dish=mandi]').click()");assert(await evaluate("document.querySelector('dialog').open&&document.querySelector('#dialog-title').textContent==='Chicken Mandi'"));
 assert(await evaluate("!!document.querySelector('dialog img')&&!(/demo|fictional|illustrative|concept|ai-created/i.test(document.querySelector('dialog').innerText))"),'Dish detail contains photo without demo wording');
 await evaluate("document.querySelector('#dialog-save').click();document.querySelector('.close').click()");await sleep(250);assert(await evaluate("!document.querySelector('dialog').open"),'Animated dialog closes');
 await evaluate("document.querySelector('#saved-toggle').click()");assert.equal(await evaluate("document.querySelectorAll('[data-dish]').length"),1);
 await evaluate("document.querySelector('[data-save=mandi]').click()");assert(await evaluate("!document.querySelector('.empty').hidden"));
 await evaluate("document.querySelector('#empty-reset').click();document.querySelector('#search').value='no-such-dish';document.querySelector('#search').dispatchEvent(new Event('input'))");assert(await evaluate("!document.querySelector('.empty').hidden"));
 await evaluate("document.querySelector('#empty-reset').click();document.querySelector('[data-dish=fish]').click()");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await sleep(250);
 assert(await evaluate("!document.querySelector('dialog').open"),'Escape dismisses the animated dialog');
 await evaluate("window.scrollTo(0,0)");
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await sleep(600);
 assert(await evaluate("document.documentElement.scrollWidth<=window.innerWidth"),'No horizontal overflow on mobile');await writeFile('qa-results/mobile.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await sleep(200);
 assert(await evaluate("!document.body.classList.contains('motion-ready')"),'Reduced motion disables reveal effects');
 assert(await evaluate("getComputedStyle(document.querySelector('.rail-star')).animationName==='none'"),'Reduced motion disables continuous animation');
 console.log('PASS: '+(process.argv.includes('--structure-only')?'structure checks; image loading deferred':'all 27 distinct photos loaded')+', category transitions, ingredient search, vegetarian filter, animated details modal, saved dishes, empty state, no demo wording, desktop/mobile layout, reduced motion.');
 if(!process.argv.includes('--structure-only')){
  const menuData=runInNewContext((await readFile('dist/app.js','utf8')).split('let stored=[]')[0]+';dishes');
  const gallery=`<!doctype html><meta charset="utf-8"><title>Food photo review</title><style>body{margin:0;padding:20px;background:#f5f1e7;display:grid;grid-template-columns:repeat(5,1fr);gap:15px;font:14px sans-serif;color:#21221d}article{margin:0}img{width:100%;height:185px;object-fit:cover}p{margin:7px 0 12px}</style>${menuData.map(d=>`<article><img src="../dist/assets/${d.img}.jpg" alt="${d.name}"><p>${d.name}</p></article>`).join('')}`;
  await writeFile('qa-results/gallery.html',gallery);await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1480,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:new URL('./qa-results/gallery.html',`file:///${cwd.replaceAll('\\','/')}/`).href});
  for(let i=0;i<100;i++){if(await evaluate("document.images.length===27&&[...document.images].every(i=>i.complete&&i.naturalWidth>0)"))break;await sleep(100)}
  await writeFile('qa-results/all-photos.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 }
 await send('Browser.close');
}finally{ws?.close();chrome.kill()}

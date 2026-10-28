import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {setTimeout as sleep} from 'node:timers/promises';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
const cwd=process.cwd();await mkdir('qa-results',{recursive:true});
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--no-sandbox','--disable-gpu','--disable-software-rasterizer','--no-first-run','--remote-debugging-port=9337',`--user-data-dir=${cwd}/qa-results/browser`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;let id=0;const pending=new Map();const browserErrors=[];
try{
 let targets;for(let i=0;i<100;i++){try{targets=await(await fetch('http://127.0.0.1:9337/json')).json();if(targets.length)break}catch{}await sleep(100)}
 assert(targets?.length,'Chrome debugging endpoint ready');ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.method==='Runtime.exceptionThrown')browserErrors.push(msg.params.exceptionDetails);if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(msg.error):p.resolve(msg.result)}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:new URL('./dist/index.html',`file:///${cwd.replaceAll('\\','/')}/`).href});
 for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-dish]').length===27"))break;await sleep(100)}
 assert.equal(await evaluate("document.querySelectorAll('[data-dish]').length"),27);
 await evaluate("document.fonts.ready");await evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')");if(!process.argv.includes('--structure-only')){for(let i=0;i<100;i++){if(await evaluate("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"))break;await sleep(100)}}
 assert.equal(await evaluate("document.querySelectorAll('.photo-card img').length"),27,'Every dish has its own photo');
 assert.equal(await evaluate("new Set([...document.querySelectorAll('.photo-card img')].map(i=>i.src)).size"),27,'Every dish has a distinct photo');
 if(!process.argv.includes('--structure-only'))assert(await evaluate("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"),'All 27 images load');
 assert(await evaluate("!(/demo|fictional|illustrative|concept|ai-created/i.test(document.body.innerText))"),'No demo wording in the menu');
 assert(await evaluate("!!document.querySelector('.category-indicator')&&!!window.sahraMotion"),'Animation controls initialized');
 assert(await evaluate("document.querySelector('.wordmark img').naturalWidth>0"),'Custom logo loads');
 assert(await evaluate("!document.querySelector('link[href*=\"googleapis\"]')"),'Fonts are self-hosted');
 await evaluate("document.querySelector('#motion-toggle').click()");assert(await evaluate("document.body.classList.contains('motion-paused')"),'Visitor can turn motion off');
 await evaluate("document.querySelector('#motion-toggle').click()");assert(await evaluate("!document.body.classList.contains('motion-paused')"),'Visitor can turn motion on');
 await sleep(800);await writeFile('qa-results/desktop.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate("document.querySelector('[data-cat=sweet]').click()");assert.equal(await evaluate("document.querySelectorAll('[data-dish]').length"),3);
 await evaluate("document.querySelector('#reset').click();document.querySelector('#search').value='cardamom';document.querySelector('#search').dispatchEvent(new Event('input'))");assert(await evaluate("document.querySelectorAll('[data-dish]').length>0&&document.querySelectorAll('[data-dish]').length<27"));
 await evaluate("document.querySelector('#reset').click();document.querySelector('#veg').click()");assert(await evaluate("!document.querySelector('[data-dish=mandi]')&&!!document.querySelector('[data-dish=shafoot]')"));
 await evaluate("document.querySelector('#reset').click();document.querySelector('[data-dish=mandi]').click()");assert(await evaluate("document.querySelector('dialog').open&&document.querySelector('#dialog-title').textContent==='Chicken Mandi'"));
 assert(await evaluate("document.activeElement.id==='dialog-title'"),'Dish dialog has deliberate initial focus');
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 assert(await evaluate("document.querySelector('dialog').contains(document.activeElement)"),'Focus stays inside the dish dialog');
 assert(await evaluate("!!document.querySelector('dialog img')&&!(/demo|fictional|illustrative|concept|ai-created/i.test(document.querySelector('dialog').innerText))"),'Dish detail contains photo without demo wording');
 await evaluate("document.querySelector('#dialog-save').click();document.querySelector('.close').click()");await sleep(250);assert(await evaluate("!document.querySelector('dialog').open"),'Animated dialog closes');
 await evaluate("document.querySelector('#saved-toggle').click()");assert.equal(await evaluate("document.querySelectorAll('[data-dish]').length"),1);
 await evaluate("document.querySelector('[data-save=mandi]').click()");assert(await evaluate("!document.querySelector('.empty').hidden"));
 await evaluate("document.querySelector('#empty-reset').click();document.querySelector('#search').value='no-such-dish';document.querySelector('#search').dispatchEvent(new Event('input'))");assert(await evaluate("!document.querySelector('.empty').hidden"));
 await evaluate("document.querySelector('#empty-reset').click();document.querySelector('[data-dish=fish]').click()");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await sleep(250);
 assert(await evaluate("!document.querySelector('dialog').open"),'Escape dismisses the animated dialog');
 assert(await evaluate("document.activeElement.dataset.dish==='fish'"),'Focus returns to the dish after Escape');
 await evaluate("document.querySelector('[data-cat=sips]').click();document.querySelector('#sort').value='price-up';document.querySelector('#sort').dispatchEvent(new Event('change'))");assert.equal(await evaluate("document.querySelector('[data-dish]').dataset.dish"),'water','Price sorting puts cheapest drink first');
 await evaluate("document.querySelector('#reset').click()");
 await evaluate("window.scrollTo(0,0)");
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await sleep(600);
 assert(await evaluate("document.documentElement.scrollWidth<=window.innerWidth"),'No horizontal overflow on mobile');
 assert(await evaluate("document.querySelector('#category-select').getBoundingClientRect().height>=44"),'Mobile category selector is touch friendly');
 await evaluate("document.querySelector('#category-select').value='sweet';document.querySelector('#category-select').dispatchEvent(new Event('change'))");assert.equal(await evaluate("document.querySelectorAll('[data-dish]').length"),3,'Mobile category selection works');
 await evaluate("document.querySelector('#reset').click();window.scrollTo(0,0)");await sleep(750);await writeFile('qa-results/mobile.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await sleep(200);
 assert(await evaluate("!document.body.classList.contains('motion-ready')"),'Reduced motion disables reveal effects');
 assert(await evaluate("getComputedStyle(document.querySelector('.rail-star')).animationName==='none'"),'Reduced motion disables continuous animation');
 for(const width of [320,768]){await send('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width===320});await sleep(100);assert(await evaluate("document.documentElement.scrollWidth<=innerWidth"),`No overflow at ${width}px`)}
 assert.equal(browserErrors.length,0,'No browser JavaScript errors');
 console.log('PASS: '+(process.argv.includes('--structure-only')?'structure checks; image loading deferred':'all 27 distinct photos loaded')+', original logo, local fonts, category selection, sorting, search, saved dishes, modal keyboard focus, 320/390/768/1440px layouts, motion controls and reduced motion.');
 if(!process.argv.includes('--structure-only')){
  await evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')");
  const pdf=await send('Page.printToPDF',{printBackground:true,paperWidth:8.27,paperHeight:11.69,preferCSSPageSize:true,displayHeaderFooter:false});await writeFile('dist/sahra-menu.pdf',Buffer.from(pdf.data,'base64'));
  const social=`<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="../dist/fonts/fonts.css"><style>*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;background:#263128;color:#f8f5ed;font-family:Manrope,sans-serif}.logo{position:absolute;left:66px;top:45px;width:355px;height:auto}.food{position:absolute;right:0;top:0;width:455px;height:630px;object-fit:cover}.shade{position:absolute;right:430px;top:0;width:70px;height:630px;background:linear-gradient(90deg,#263128,transparent);z-index:1}h1{position:absolute;left:73px;top:220px;margin:0;font:600 98px/.96 'Barlow Condensed',sans-serif;letter-spacing:-1px}h1 span{color:#eac16c}.note{position:absolute;left:76px;bottom:53px;margin:0;font-size:19px;letter-spacing:.5px;color:#eac16c}.mark{position:absolute;left:500px;top:80px;width:160px;height:260px;opacity:.08}</style><img class="mark" src="../dist/brand/sahra-mark.svg"><img class="food" src="../dist/assets/mandi.jpg"><div class="shade"></div><img class="logo" src="../dist/brand/sahra-logo-dark.svg"><h1>FIRE. SPICE.<br><span>GOOD COMPANY.</span></h1><p class="note">Explore the Sahra menu ↗</p>`;
  await writeFile('qa-results/social.html',social);await send('Emulation.setDeviceMetricsOverride',{width:1200,height:630,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:new URL('./qa-results/social.html',`file:///${cwd.replaceAll('\\','/')}/`).href});
  for(let i=0;i<100;i++){if(await evaluate("document.images.length===3&&[...document.images].every(i=>i.complete&&i.naturalWidth>0)"))break;await sleep(100)}await evaluate("document.fonts.ready");await sleep(100);await writeFile('dist/brand/social-card.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await writeFile('qa-results/icon.html','<!doctype html><style>body{margin:0;background:#263128}img{display:block;width:180px;height:180px}</style><img src="../dist/logo.svg">');await send('Emulation.setDeviceMetricsOverride',{width:180,height:180,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:new URL('./qa-results/icon.html',`file:///${cwd.replaceAll('\\','/')}/`).href});for(let i=0;i<100;i++){if(await evaluate("document.images[0]?.complete&&document.images[0].naturalWidth>0"))break;await sleep(50)}await writeFile('dist/brand/apple-touch-icon.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  console.log('Created branded PDF menu, social sharing card, and 180px touch icon.');
 }
 if(!process.argv.includes('--structure-only')){
  const menuData=runInNewContext((await readFile('dist/app.js','utf8')).split('let stored=[]')[0]+';dishes');
  const gallery=`<!doctype html><meta charset="utf-8"><title>Food photo review</title><style>body{margin:0;padding:20px;background:#f5f1e7;display:grid;grid-template-columns:repeat(5,1fr);gap:15px;font:14px sans-serif;color:#21221d}article{margin:0}img{width:100%;height:185px;object-fit:cover}p{margin:7px 0 12px}</style>${menuData.map(d=>`<article><img src="../dist/assets/${d.img}.jpg" alt="${d.name}"><p>${d.name}</p></article>`).join('')}`;
  await writeFile('qa-results/gallery.html',gallery);await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1480,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:new URL('./qa-results/gallery.html',`file:///${cwd.replaceAll('\\','/')}/`).href});
  for(let i=0;i<100;i++){if(await evaluate("document.images.length===27&&[...document.images].every(i=>i.complete&&i.naturalWidth>0)"))break;await sleep(100)}
  await writeFile('qa-results/all-photos.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 }
 if(!process.argv.includes('--structure-only')){
  await send('Emulation.setScriptExecutionDisabled',{value:true});await send('Page.navigate',{url:new URL('./dist/index.html?nojs=1',`file:///${cwd.replaceAll('\\','/')}/`).href});await sleep(500);
  const tree=await send('DOM.getDocument',{depth:1});const cards=await send('DOM.querySelectorAll',{nodeId:tree.root.nodeId,selector:'.photo-card'});assert.equal(cards.nodeIds.length,27,'All dishes are readable without JavaScript');
  const htmlNode=await send('DOM.querySelector',{nodeId:tree.root.nodeId,selector:'html'});const attributes=await send('DOM.getAttributes',{nodeId:htmlNode.nodeId});assert(attributes.attributes.includes('no-js'),'No-JavaScript fallback remains active');
  console.log('PASS: all 27 dishes available with JavaScript disabled.');
  await send('Emulation.setScriptExecutionDisabled',{value:false});
 }
 await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);
}finally{ws?.close();chrome.kill()}

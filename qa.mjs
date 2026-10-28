import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {setTimeout as sleep} from 'node:timers/promises';
import assert from 'node:assert/strict';
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
 await evaluate("document.fonts.ready");await evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')");for(let i=0;i<100;i++){if(await evaluate("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"))break;await sleep(100)}
 assert(await evaluate("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"),'Six images load');
 await sleep(600);await writeFile('qa-results/desktop.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate("document.querySelector('[data-cat=sweet]').click()");assert.equal(await evaluate("document.querySelectorAll('[data-dish]').length"),3);
 await evaluate("document.querySelector('#reset').click();document.querySelector('#search').value='cardamom';document.querySelector('#search').dispatchEvent(new Event('input'))");assert(await evaluate("document.querySelectorAll('[data-dish]').length>0&&document.querySelectorAll('[data-dish]').length<27"));
 await evaluate("document.querySelector('#reset').click();document.querySelector('#veg').click()");assert(await evaluate("!document.querySelector('[data-dish=mandi]')&&!!document.querySelector('[data-dish=shafoot]')"));
 await evaluate("document.querySelector('#reset').click();document.querySelector('[data-dish=mandi]').click()");assert(await evaluate("document.querySelector('dialog').open&&document.querySelector('#dialog-title').textContent==='Chicken Mandi'"));
 await evaluate("document.querySelector('#dialog-save').click();document.querySelector('.close').click();document.querySelector('#saved-toggle').click()");assert.equal(await evaluate("document.querySelectorAll('[data-dish]').length"),1);
 await evaluate("document.querySelector('[data-save=mandi]').click()");assert(await evaluate("!document.querySelector('.empty').hidden"));
 await evaluate("document.querySelector('#empty-reset').click();document.querySelector('#search').value='no-such-dish';document.querySelector('#search').dispatchEvent(new Event('input'))");assert(await evaluate("!document.querySelector('.empty').hidden"));
 await evaluate("document.querySelector('#empty-reset').click();window.scrollTo(0,0)");
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await sleep(600);
 assert(await evaluate("document.documentElement.scrollWidth<=window.innerWidth"),'No horizontal overflow on mobile');await writeFile('qa-results/mobile.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 console.log('PASS: 27 dishes, six loaded images, categories, ingredient search, vegetarian filter, details modal, saved dishes, empty state, reset, desktop and mobile layout.');
 await send('Browser.close');
}finally{ws?.close();chrome.kill()}

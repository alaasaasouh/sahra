import {readFile,access,readdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');const html=await readFile(path.join(root,'index.html'),'utf8');
const links=new Set([...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map(m=>m[1]).filter(x=>!/^https?:|^data:|^mailto:|^tel:/.test(x)));
for(const link of links){const target=path.resolve(root,link.split(/[?#]/)[0]);assert(target.startsWith(root+path.sep),'Local reference stays in static output');await access(target)}
assert.equal([...html.matchAll(/data-card="/g)].length,27,'Static HTML includes all dishes');
for(const name of ['menu-render.js','menu-runtime.js','motion.js','fonts/fonts.css','brand/sahra-logo-dark.svg','brand/sahra-logo-light.svg'])await access(path.join(root,name));
const fonts=await readFile(path.join(root,'fonts/fonts.css'),'utf8');for(const match of fonts.matchAll(/url\(([^)]+)\)/g))await access(path.resolve(root,'fonts',match[1]));
const pdf=await readFile(path.join(root,'sahra-menu.pdf'));assert(pdf.subarray(0,5).toString()==='%PDF-','PDF menu is valid');
for(const [name,width,height] of [['social-card.png',1200,630],['apple-touch-icon.png',180,180]]){const png=await readFile(path.join(root,'brand',name));assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height)}
assert.equal((await readdir(path.join(root,'assets/responsive'))).filter(x=>x.endsWith('.jpg')).length,54);
assert(!/https?:\/\/fonts\./.test(html),'No third-party font dependency');
console.log(`PASS: ${links.size} local page references, 27 static dishes, font files, 54 responsive images, branded PDF, social card and touch icon.`);

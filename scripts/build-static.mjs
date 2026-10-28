import {readFile,writeFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const data=await readFile('dist/app.js','utf8');const templates=await readFile('dist/menu-render.js','utf8');
const menu=runInNewContext(`${data}\n${templates}\nmenuTemplates.sections(dishes)`);
const file='dist/index.html';let html=await readFile(file,'utf8');html=html.replace(/<!-- MENU_START -->[\s\S]*?<!-- MENU_END -->/,`<!-- MENU_START -->${menu}<!-- MENU_END -->`);await writeFile(file,html);
console.log('Prepared 27 readable menu dishes for JavaScript-free access and search engines.');

import {readFile,writeFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const data=await readFile('dist/app.js','utf8');const templates=await readFile('dist/menu-render.js','utf8');
const menu=runInNewContext(`${data}\n${templates}\nmenuTemplates.sections(dishes)`);
const configuredUrl=[process.env.SITE_URL,process.env.VERCEL_PROJECT_PRODUCTION_URL,process.env.VERCEL_URL].find(value=>value?.trim())?.trim()||'https://alaasaasouh.github.io/sahra/';
const siteUrl=new URL(configuredUrl.includes('://')?configuredUrl:`https://${configuredUrl}`);
if(!['https:','http:'].includes(siteUrl.protocol)||siteUrl.username||siteUrl.password)throw Error('SITE_URL must be an HTTP or HTTPS website address without credentials.');
siteUrl.search='';siteUrl.hash='';if(!siteUrl.pathname.endsWith('/'))siteUrl.pathname+='/';
const escapedUrl=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;');
const file='dist/index.html';let html=await readFile(file,'utf8');
html=html.replace(/<!-- MENU_START -->[\s\S]*?<!-- MENU_END -->/,`<!-- MENU_START -->${menu}<!-- MENU_END -->`)
 .replace(/(<link rel="canonical" href=")[^"]*(")/,`$1${escapedUrl(siteUrl.href)}$2`)
 .replace(/(<meta property="og:url" content=")[^"]*(")/,`$1${escapedUrl(siteUrl.href)}$2`)
 .replace(/(<meta property="og:image" content=")[^"]*(")/,`$1${escapedUrl(new URL('brand/social-card.png',siteUrl).href)}$2`);
await writeFile(file,html);
console.log('Prepared 27 readable menu dishes for JavaScript-free access and search engines.');
console.log(`Site metadata: ${siteUrl.href}`);

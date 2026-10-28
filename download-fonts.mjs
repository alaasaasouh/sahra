import {mkdir,writeFile} from 'node:fs/promises';
const folder='dist/fonts';await mkdir(folder,{recursive:true});
const endpoint='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Manrope:wght@400..800&family=Noto+Sans+Arabic:wght@400..700&display=swap';
const response=await fetch(endpoint,{headers:{'User-Agent':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'}});if(!response.ok)throw Error('Font stylesheet request failed');
let css=await response.text();const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))];
for(let i=0;i<urls.length;i++){const res=await fetch(urls[i]);if(!res.ok)throw Error('Font download failed');const bytes=Buffer.from(await res.arrayBuffer());const ext=bytes.subarray(0,4).toString()==='wOF2'?'woff2':'ttf';const name=`sahra-${i+1}.${ext}`;await writeFile(`${folder}/${name}`,bytes);css=css.replaceAll(urls[i],`./${name}`)}
await writeFile(`${folder}/fonts.css`,css);
for(const family of ['barlowcondensed','manrope','notosansarabic']){const res=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`);if(!res.ok)throw Error('Font license request failed: '+family);await writeFile(`${folder}/${family}-OFL.txt`,await res.text())}
console.log(`Self-hosted ${urls.length} font files with their licenses.`);

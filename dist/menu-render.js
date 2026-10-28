const menuTemplates=(()=>{
 const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const money=price=>`$${price.toFixed(0)}`;
 function card(d,saved=new Set()){
  const isSaved=saved.has(d.id);
  return `<article class="photo-card" data-card="${d.id}"><button class="save" data-save="${d.id}" aria-label="${isSaved?'Unsave':'Save'} ${escape(d.name)}" aria-pressed="${isSaved}"><span aria-hidden="true">${isSaved?'♥':'♡'}</span></button><button class="dish-open" data-dish="${d.id}" aria-label="View ${escape(d.name)}, ${money(d.price)}"><div class="photo-wrap"><img src="assets/${d.img}.jpg" srcset="assets/responsive/${d.img}-480.jpg 480w, assets/responsive/${d.img}-800.jpg 800w, assets/${d.img}.jpg 1254w" sizes="(max-width:359px) 90vw, (max-width:800px) 43vw, (max-width:1100px) 29vw, 27vw" width="1024" height="1024" alt="${escape(d.name)}" decoding="async" ${d.id==='mandi'?'fetchpriority="high"':'loading="lazy"'}>${d.badge?`<span class="photo-tag">${escape(d.badge)}</span>`:''}<span class="photo-cta" aria-hidden="true">A closer look ↗</span></div><div class="dish-info"><div class="item-top"><h3>${escape(d.name)}</h3><span class="price">${money(d.price)}</span></div><span class="arabic-name" lang="ar" dir="rtl">${d.ar}</span><p class="dish-copy">${escape(d.desc)}</p><div class="tags">${d.tags.map(t=>`<span>${escape(t)}</span>`).join('')}<b class="dish-arrow" aria-hidden="true">↗</b></div></div></button></article>`;
 }
 function sections(list,saved=new Set()){
  return categories.map((category,index)=>{const items=list.filter(d=>d.cat===category.id);if(!items.length)return '';return `<section class="menu-section" aria-labelledby="section-${category.id}"><div class="section-title"><div><span class="section-number" aria-hidden="true">0${index+1}</span><h2 id="section-${category.id}">${escape(category.name)}</h2><span class="section-count">${items.length} dishes</span></div><span lang="ar" dir="rtl">${category.ar}</span></div><p class="section-description">${escape(category.note)}</p><div class="photo-grid">${items.map(d=>card(d,saved)).join('')}</div></section>`}).join('');
 }
 return {card,sections,money,escape};
})();

const field = (name, label, max = 200, multiline = false, optional = false) => ({ name, label, max, multiline, optional });
export const schemas = {
  seo: [field('title', '搜尋標題', 160), field('description', '搜尋摘要', 500, true), field('shareTitle', '分享標題（留白沿用搜尋標題）', 160, false, true), field('shareDescription', '分享說明（留白沿用搜尋摘要）', 500, true, true), field('image', '分享圖片網址', 1000)],
  landing: [field('heroTag', '小標'), field('h1', '主標題 H1'), field('intro', '首段說明', 2000, true), { name:'blocks', label:'內容段落', type:'list', maxItems:30, fields:[field('title','段落標題'),field('text','段落內文',5000,true)] }, field('ctaTitle','詢價引導標題'),field('ctaText','詢價引導說明',2000,true)],
  faq: [{ name:'items', label:'常見問題', type:'list', maxItems:30, fields:[field('question','問題',300),field('answer','回答',5000,true)] }],
  services: [field('pageTitle','頁面主標題'),field('pageDescription','頁面介紹',2000,true),{ name:'items',label:'表演項目',type:'list',fixed:true,maxItems:20,fields:[field('title','名稱'),field('tags','標籤'),field('description','介紹',5000,true),field('alt','圖片說明',300)] }],
  pricing: [{ name:'factors',label:'報價因素',type:'list',fixed:true,maxItems:20,fields:[field('title','標題'),field('text','說明',5000,true)] },field('ctaTitle','詢價引導標題'),field('ctaText','詢價引導說明',2000,true)]
};

const seoPages = [
  ['home','首頁','/'],
  ...[['about','關於南仙'],['contact','聯絡我們'],['dragon-lion-introduction','龍獅介紹'],['privacy','隱私政策'],['services','表演項目']].map(([key,label])=>[`pages-${key}`,label,`/pages/${key}`]),
  ['gallery-index','活動案例總覽','/gallery/'],
  ...[['banquet','春酒尾牙'],['festival-retail','百貨春節'],['funeral','追思儀式'],['groundbreaking','動土上樑'],['opening','開幕活動'],['performance','展演服務'],['school','校園活動'],['temple','廟會慶典'],['tourism','觀光活動']].map(([key,label])=>[`gallery-${key}`,`${label}案例`,`/gallery/${key}`]),
  ...[['company-event-lion-dance','企業活動'],['dragon-lion-dance-performance','舞龍舞獅表演'],['lion-dance-performance','舞獅表演'],['lion-dance-price-guide','價格指南'],['opening-lion-dance','開幕舞獅'],['year-end-party-lion-dance','尾牙春酒']].map(([key,label])=>[`landing-${key}`,label,`/landing/${key}`])
];
export const entries = [
  ...seoPages.map(([key,label,url])=>({id:`seo/${key}`,label,kind:'seo',url,path:`src/_data/seo/${key}.json`})),
  ...seoPages.filter(([key])=>key.startsWith('landing-')).map(([key,label,url])=>({id:`landing/${key.slice(8)}`,label,kind:'landing',url,path:`src/_data/landing/${key.slice(8)}.json`})),
  {id:'faq',label:'龍獅介紹常見問題',kind:'faq',url:'/pages/dragon-lion-introduction',path:'src/_data/faq.json'},
  {id:'services',label:'表演項目介紹',kind:'services',url:'/pages/services',path:'src/_data/services.json'},
  {id:'pricing',label:'報價因素與詢價引導',kind:'pricing',url:'/landing/lion-dance-price-guide',path:'src/_data/pricing.json'}
];
// Price factors and CTA are rendered from pricing.json, not its landing record.
export function fieldsFor(entry) {
  return entry.id === 'landing/lion-dance-price-guide' ? schemas.landing.filter(f=>!['blocks','ctaTitle','ctaText'].includes(f.name)) : schemas[entry.kind];
}

export function mergeContent(fields, values, current) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('文案資料格式不正確。');
  if (Object.keys(values).some(key=>!fields.some(f=>f.name===key))) throw new Error('包含不可編輯的欄位。');
  const result = {...current};
  for (const f of fields) {
    const value = values[f.name];
    if (f.type === 'list') {
      if (!Array.isArray(value) || !value.length || value.length > f.maxItems || (f.fixed && value.length !== current[f.name].length)) throw new Error(`${f.label}的項目數量不正確。`);
      result[f.name] = value.map((item,i)=>mergeContent(f.fields,item,f.fixed ? current[f.name][i] : {}));
    } else {
      if (typeof value !== 'string' || (!f.optional && !value.trim()) || value.length > f.max) throw new Error(`請檢查「${f.label}」：必填欄位不可空白，最多 ${f.max} 字元。`);
      result[f.name] = value.trim();
    }
  }
  if (fields === schemas.seo && !/^(\/images\/[^\s]+|https:\/\/[^\s]+)$/.test(result.image)) throw new Error('分享圖片請使用站內 /images/ 路徑或 HTTPS 網址。');
  return result;
}

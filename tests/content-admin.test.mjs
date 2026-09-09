import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createRequire } from 'node:module';
import { entries, fieldsFor, schemas, mergeContent } from '../supabase/functions/_shared/content-schema.mjs';
import { createContentHandler } from '../supabase/functions/_shared/content-handler.mjs';

const require=createRequire(import.meta.url);
const filters={};
require('../.eleventy.js')({on(){},addPassthroughCopy(){},addFilter(name,fn){filters[name]=fn;},addTransform(){}});
const source=JSON.parse(fs.readFileSync('src/_data/seo/home.json','utf8'));
const values=Object.fromEntries(schemas.seo.map(f=>[f.name,source[f.name]]));
const origin='https://nansiengtaiwan.com';
const request=(id='seo/home',method='GET',body,auth=true)=>new Request(`https://test.invalid/content-api?entry=${encodeURIComponent(id)}`,{method,headers:{origin,...(auth?{Authorization:'Bearer editor-token'}:{})},...(body?{body:JSON.stringify(body)}:{})});
function handler(options={}) {
  const calls=[];
  const fetchImpl=async(url,init)=>{
    calls.push({url,init});
    return init.method==='PUT'?Response.json({content:{sha:'new-sha'},commit:{sha:'commit-sha'}}):Response.json({sha:'old-sha',content:Buffer.from(JSON.stringify(source)).toString('base64')});
  };
  return {calls,run:createContentHandler({authenticate:async token=>token==='editor-token'?{id:'editor',email:'editor@example.invalid'}:null,githubToken:'server-only',repo:'owner/site',origins:[origin],fetchImpl,...options})};
}

test('all editable records exist and validate while preserving immutable metadata',()=>{
  for(const entry of entries){
    const current=JSON.parse(fs.readFileSync(entry.path,'utf8'));
    const fields=fieldsFor(entry);
    const pick=(fields,data)=>Object.fromEntries(fields.map(f=>[f.name,f.type==='list'?data[f.name].map(item=>pick(f.fields,item)):data[f.name]]));
    assert.deepEqual(mergeContent(fields,pick(fields,current),current),current,entry.id);
  }
  assert.equal(entries.filter(e=>e.kind==='seo').length,22);
});

test('rejects hidden fields, blank required text and unsafe sharing URLs',()=>{
  assert.throws(()=>mergeContent(schemas.seo,{...values,path:'/evil'},source));
  assert.throws(()=>mergeContent(schemas.seo,{...values,title:'  '},source));
  assert.throws(()=>mergeContent(schemas.seo,{...values,image:'javascript:alert(1)'},source));
  assert.throws(()=>mergeContent(schemas.seo,null,source));
});

test('unauthenticated and non-editor users cannot read or publish',async()=>{
  for(const method of ['GET','PUT']){
    const {run,calls}=handler();assert.equal((await run(request('seo/home',method,null,false))).status,401);assert.equal(calls.length,0);
    const denied=handler({authenticate:async()=>null});assert.equal((await denied.run(request('seo/home',method))).status,401);assert.equal(denied.calls.length,0);
  }
});

test('origin and content allowlists block untrusted requests before repository access',async()=>{
  const {run,calls}=handler();
  assert.equal((await run(new Request('https://test.invalid',{headers:{origin:'https://evil.invalid'}}))).status,403);
  for(const id of ['../../backend.json','seo/../../backend','src/_data/backend.json','seo/new-page'])assert.equal((await run(request(id))).status,404);
  assert.equal(calls.length,0);
});

test('read exposes editable fields and current content without repository credentials',async()=>{
  const {run}=handler();const res=await run(request());const text=await res.text();const data=JSON.parse(text);
  assert.equal(data.sha,'old-sha');assert.equal(data.values.title,source.title);assert.equal(text.includes('server-only'),false);assert.equal(res.headers.get('cache-control'),'no-store');
});

test('publishing preserves fixed route and labels and correctly encodes Chinese copy',async()=>{
  const {run,calls}=handler();const title='南仙「新文案」 & 新演出';
  const res=await run(request('seo/home','PUT',{sha:'old-sha',values:{...values,title}}));assert.equal(res.status,200);
  const put=JSON.parse(calls[1].init.body);const saved=JSON.parse(Buffer.from(put.content,'base64').toString());
  assert.equal(saved.title,title);assert.equal(saved.path,source.path);assert.equal(saved.label,source.label);assert.equal(put.sha,'old-sha');assert.equal(put.branch,'main');
});

test('stale edit never overwrites a newer version',async()=>{
  const {run,calls}=handler();assert.equal((await run(request('seo/home','PUT',{sha:'stale',values}))).status,409);assert.equal(calls.length,1);
});

test('concurrent repository conflicts and provider failures never report success',async()=>{
  for(const code of [409,500]){
    const {run}=handler({fetchImpl:async(url,init)=>init.method==='PUT'?new Response('',{status:code}):Response.json({sha:'old-sha',content:Buffer.from(JSON.stringify(source)).toString('base64')})});
    assert.equal((await run(request('seo/home','PUT',{sha:'old-sha',values}))).status,code===409?409:502);
  }
});

test('malformed or oversized publication is rejected',async()=>{
  const {run}=handler();assert.equal((await run(request('seo/home','PUT',{sha:'old-sha',values:null}))).status,422);
  assert.equal((await run(request('seo/home','PUT',{sha:'old-sha',values:{...values,description:'x'.repeat(160000)}}))).status,413);
});

test('schema JSON remains parseable without allowing script termination',()=>{
  const dangerous='引號 " </script><script>alert(1)</script> & 換行\n';
  assert.equal(JSON.parse(filters.jsonScript(dangerous)),dangerous);assert.equal(filters.jsonScript(dangerous).includes('<'),false);
  const faq=filters.faqJsonLd({items:[{question:dangerous,answer:dangerous}]});assert.equal(faq.includes('</script>'),false);assert.equal(JSON.parse(faq).mainEntity[0].name,dangerous);
});

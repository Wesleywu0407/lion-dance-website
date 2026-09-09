import { entries, fieldsFor, mergeContent } from './content-schema.mjs';

export function createContentHandler({authenticate, githubToken, repo, branch = 'main', origins, fetchImpl = fetch}) {
  return async (request) => {
    const origin = request.headers.get('origin') || '';
    const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':origins.includes(origin) ? origin : '', 'Vary':'Origin','Access-Control-Allow-Headers':'authorization, content-type, apikey','Access-Control-Allow-Methods':'GET, PUT, OPTIONS'};
    const respond = (body,status=200)=>new Response(JSON.stringify(body),{status,headers});
    if (!origins.includes(origin)) return respond({message:'此網站無法存取管理服務。'},403);
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
    if (!['GET','PUT'].includes(request.method)) return respond({message:'不支援此操作。'},405);
    try {
      const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i,'');
      if (!token) return respond({message:'請先登入。'},401);
      const user = await authenticate(token);
      if (!user) return respond({message:'登入已失效或此帳號沒有文案管理權限。'},401);
      if (!githubToken || !/^[\w.-]+\/[\w.-]+$/.test(repo || '')) return respond({message:'發布服務尚未設定，請聯絡網站管理者。'},503);
      const id = new URL(request.url).searchParams.get('entry');
      if (!id && request.method === 'GET') return respond({email:user.email,entries:entries.map(({path,...entry})=>entry)});
      const entry = entries.find(item=>item.id===id);
      if (!entry) return respond({message:'找不到可編輯頁面。'},404);
      const endpoint = `https://api.github.com/repos/${repo}/contents/${entry.path}`;
      const ghHeaders = {Authorization:`Bearer ${githubToken}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
      const source = await fetchImpl(`${endpoint}?ref=${encodeURIComponent(branch)}`,{headers:ghHeaders});
      if (!source.ok) return respond({message:'無法讀取最新文案，請稍後再試。'},502);
      const file = await source.json();
      const current = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0))));
      const fields = fieldsFor(entry);
      if (request.method === 'GET') return respond({entry:{id:entry.id,label:entry.label,kind:entry.kind,url:entry.url},fields,values:current,sha:file.sha});
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > 150000) return respond({message:'內容過長，請縮短文案。'},413);
      let body, updated;
      try {
        body = JSON.parse(raw);
        if (!body || typeof body.sha !== 'string') throw new Error('缺少版本資料，請重新載入。');
        updated = mergeContent(fields,body.values,current);
      } catch (error) { return respond({message:error.message || '資料格式不正確。'},422); }
      if (body.sha !== file.sha) return respond({message:'另一位管理員已更新此頁。請先複製保留你的文案，再重新載入最新版本。'},409);
      const content = btoa(Array.from(new TextEncoder().encode(JSON.stringify(updated,null,2)+'\n'),b=>String.fromCharCode(b)).join(''));
      const saved = await fetchImpl(endpoint,{method:'PUT',headers:ghHeaders,body:JSON.stringify({message:`文案更新：${entry.label}（${user.id}）`,content,sha:file.sha,branch})});
      if ([409,422].includes(saved.status)) return respond({message:'版本已變更或目前無法發布。請保留文案並重新載入。'},409);
      if (!saved.ok) return respond({message:'尚未確認發布成功，請保留文案並重新載入檢查。'},502);
      const result = await saved.json();
      return respond({ok:true,sha:result.content.sha,commit:result.commit.sha,message:'文案已提交，等待網站完成部署。請稍後查看網站確認。'});
    } catch {
      return respond({message:'暫時無法完成操作。文案可能尚未發布，請保留內容並重新載入檢查。'},503);
    }
  };
}

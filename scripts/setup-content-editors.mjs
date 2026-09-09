import fs from 'node:fs';

// Auth users and passwords are created by the owner in the Supabase dashboard.
// This script only enables content membership; it never handles passwords or sends email.
const settings = JSON.parse(fs.readFileSync(process.argv[2] || '.cache/content-admin-setup.json','utf8'));
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in this shell; never add them to public config.');
const emails = [...new Set(settings.emails.map(value=>value.trim().toLowerCase()))];
if (!emails.length || emails.some(email=>!/^\S+@\S+\.\S+$/.test(email))) throw new Error('Invalid editor email list.');
const headers = {apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
async function api(path,options={}) {
  const response=await fetch(new URL(path,url),{...options,headers:{...headers,...options.headers}});
  const body=await response.json().catch(()=>null);
  if(!response.ok) throw new Error(`Setup failed (${response.status}). Check project, migration and administrator permissions.`);
  return body;
}
const users=[];
for(let page=1;;page++) {
  const data=await api(`/auth/v1/admin/users?page=${page}&per_page=100`);
  users.push(...data.users);
  if(data.users.length<100)break;
}
for(const email of emails) {
  const user=users.find(user=>user.email?.toLowerCase()===email);
  if(!user) throw new Error(`Create the Auth user and password in the Supabase dashboard first: ${email}`);
  await api('/rest/v1/content_editors?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:user.id,active:true})});
  console.log(`Content editor enabled: ${email}`);
}

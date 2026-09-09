import { createClient } from 'npm:@supabase/supabase-js@2';
import { createContentHandler } from '../_shared/content-handler.mjs';

const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', { auth: { persistSession: false } });
Deno.serve(createContentHandler({
  githubToken: Deno.env.get('CONTENT_GITHUB_TOKEN'),
  repo: Deno.env.get('CONTENT_GITHUB_REPO'),
  branch: Deno.env.get('CONTENT_GITHUB_BRANCH') || 'main',
  origins: (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(value=>value.trim()).filter(Boolean),
  authenticate: async (token: string) => {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    const { data: editor } = await supabase.from('content_editors').select('user_id').eq('user_id',user.id).eq('active',true).maybeSingle();
    return editor ? {id:user.id,email:user.email} : null;
  }
}));

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, requestOrigin, sha256 } from '../_shared/http.ts';

const allowedEvents = new Set(['cta_click', 'form_start', 'form_error', 'form_submit']);
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  { auth: { persistSession: false } }
);

Deno.serve(async (request) => {
  const { origin, allowed } = requestOrigin(request);
  if (request.method === 'OPTIONS') {
    return allowed ? new Response(null, { status: 204, headers: corsHeaders(origin) }) : new Response(null, { status: 403 });
  }
  if (!allowed) return jsonResponse({ ok: false }, 403, origin);
  if (request.method !== 'POST') return jsonResponse({ ok: false }, 405, origin);

  const ip = (request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const bucket = await sha256(`events:${ip || 'unknown'}`);
  const { data: rateAllowed } = await supabase.rpc('consume_rate_limit', {
    bucket_key: bucket,
    window_seconds: 60,
    max_requests: 30
  });
  if (!rateAllowed) return jsonResponse({ ok: false }, 429, origin);

  const input = await request.json().catch(() => ({}));
  const eventName = typeof input.eventName === 'string' ? input.eventName : '';
  const page = typeof input.page === 'string' ? input.page.slice(0, 500) : '';
  const rawProperties = input.properties && typeof input.properties === 'object'
    ? JSON.stringify(input.properties)
    : '{}';
  const properties = rawProperties.length <= 3000 ? input.properties : {};
  if (!allowedEvents.has(eventName) || !page) return jsonResponse({ ok: false }, 422, origin);

  const { error } = await supabase.from('analytics_events').insert({
    event_name: eventName,
    page,
    properties,
    occurred_at: input.occurredAt || new Date().toISOString()
  });
  return error ? jsonResponse({ ok: false }, 503, origin) : jsonResponse({ ok: true }, 202, origin);
});

import { createClient } from 'npm:@supabase/supabase-js@2';
import { normalizeInquiry, validateInquiry } from '../_shared/validation.mjs';
import { corsHeaders, jsonResponse, requestOrigin, sha256 } from '../_shared/http.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  { auth: { persistSession: false } }
);

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY') || '';
  if (!secret) return true;
  if (!token) return false;

  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body
  });
  const result = await response.json();
  return result.success === true;
}

Deno.serve(async (request) => {
  const { origin, allowed } = requestOrigin(request);
  if (request.method === 'OPTIONS') {
    return allowed ? new Response(null, { status: 204, headers: corsHeaders(origin) }) : new Response(null, { status: 403 });
  }
  if (!allowed) return jsonResponse({ ok: false, message: 'Request not allowed.' }, 403, origin);
  if (request.method !== 'POST') return jsonResponse({ ok: false, message: 'Method not allowed.' }, 405, origin);

  const ip = (request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const ipHash = await sha256(`inquiry:${ip || 'unknown'}`);
  const { data: rateAllowed, error: rateError } = await supabase.rpc('consume_rate_limit', {
    bucket_key: ipHash,
    window_seconds: 600,
    max_requests: 8
  });
  if (rateError) return jsonResponse({ ok: false, message: 'Service temporarily unavailable.' }, 503, origin);
  if (!rateAllowed) return jsonResponse({ ok: false, message: 'Too many requests. Please try again later.' }, 429, origin);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: 'Invalid request.' }, 400, origin);
  }

  const inquiry = normalizeInquiry(raw);
  const validation = validateInquiry(inquiry);
  if (!validation.valid) {
    return jsonResponse({ ok: false, message: 'Please check the form fields.', fields: validation.errors }, 422, origin);
  }

  if (!await verifyTurnstile(inquiry.turnstileToken, ip)) {
    return jsonResponse({ ok: false, message: 'Verification failed. Please retry.' }, 422, origin);
  }

  const idempotencyKey = request.headers.get('idempotency-key') || '';
  const dedupeKey = await sha256(JSON.stringify({
    idempotencyKey,
    name: inquiry.name,
    contact: inquiry.phone || inquiry.lineId || inquiry.email,
    eventDate: inquiry.eventDate,
    eventCity: inquiry.eventCity,
    message: inquiry.message
  }));

  const { data, error } = await supabase.rpc('create_inquiry', {
    payload: inquiry,
    request_dedupe_key: dedupeKey
  });
  if (error || !data?.[0]) {
    console.error('create_inquiry_failed', error?.code);
    return jsonResponse({ ok: false, message: 'Service temporarily unavailable.' }, 503, origin);
  }

  return jsonResponse({ ok: true, inquiryId: data[0].public_id, duplicate: data[0].duplicate }, 200, origin);
});

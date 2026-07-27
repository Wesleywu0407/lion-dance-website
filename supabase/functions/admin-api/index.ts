import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, requestOrigin } from '../_shared/http.ts';

const url = Deno.env.get('SUPABASE_URL') || '';
const service = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', {
  auth: { persistSession: false }
});

const statuses = new Set(['NEW','CONTACTED','QUALIFIED','QUOTING','WON','LOST','SPAM','ARCHIVED']);
const editable = new Set(['status', 'assigned_to', 'next_follow_up_at', 'lost_reason']);

async function currentAdmin(request: Request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data: { user } } = await service.auth.getUser(token);
  if (!user) return null;
  const { data } = await service.from('admin_users')
    .select('id,email,display_name,role,active')
    .eq('id', user.id)
    .eq('active', true)
    .maybeSingle();
  return data;
}

async function audit(actorId: string, action: string, entityId: string, changes: unknown) {
  await service.from('audit_logs').insert({
    actor_id: actorId,
    action,
    entity_type: 'lead',
    entity_id: entityId,
    changes
  });
}

function leadQuery(search: URLSearchParams) {
  let query = service.from('leads').select(`
    id,public_id,status,name,company,phone,line_id,email,preferred_contact,
    event_date,date_flexible,event_city,venue,event_type,services,budget_range,
    guest_count,message,source_page,referrer,utm_source,utm_medium,utm_campaign,
    assigned_to,first_contacted_at,next_follow_up_at,won_at,lost_reason,created_at,updated_at
  `, { count: 'exact' });
  const status = search.get('status');
  const eventType = search.get('eventType');
  const city = search.get('city');
  const keyword = (search.get('q') || '').replace(/[%(),]/g, '').slice(0, 80);
  if (status && statuses.has(status)) query = query.eq('status', status);
  if (eventType) query = query.eq('event_type', eventType.slice(0, 40));
  if (city) query = query.ilike('event_city', `%${city.slice(0, 80)}%`);
  if (keyword) query = query.or(`name.ilike.%${keyword}%,company.ilike.%${keyword}%,public_id.ilike.%${keyword}%`);
  return query;
}

Deno.serve(async (request) => {
  const { origin, allowed } = requestOrigin(request);
  if (request.method === 'OPTIONS') {
    return allowed ? new Response(null, { status: 204, headers: corsHeaders(origin) }) : new Response(null, { status: 403 });
  }
  if (!allowed) return jsonResponse({ ok: false }, 403, origin);

  const admin = await currentAdmin(request);
  if (!admin) return jsonResponse({ ok: false, message: 'Unauthorized.' }, 401, origin);

  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname.replace(/^.*\/admin-api\/?/, '').replace(/\/$/, '');

  if (request.method === 'GET' && path === 'me') {
    await service.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', admin.id);
    return jsonResponse({ ok: true, admin }, 200, origin);
  }

  if (request.method === 'GET' && path === 'dashboard') {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [newLeads, overdue, quoting, won, recent] = await Promise.all([
      service.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()).not('status', 'in', '("SPAM","ARCHIVED")'),
      service.from('leads').select('*', { count: 'exact', head: true }).lt('next_follow_up_at', now.toISOString()).not('status', 'in', '("WON","LOST","SPAM","ARCHIVED")'),
      service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'QUOTING'),
      service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'WON').gte('won_at', monthStart.toISOString()),
      service.from('leads').select('event_type,source_page,status,created_at').neq('status', 'SPAM').order('created_at', { ascending: false }).limit(500)
    ]);
    const summarize = (field: string) => Object.entries((recent.data || []).reduce((result, row) => {
      const key = row[field] || '未標示';
      result[key] = (result[key] || 0) + 1;
      return result;
    }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return jsonResponse({
      ok: true,
      metrics: { newThisWeek: newLeads.count || 0, overdue: overdue.count || 0, quoting: quoting.count || 0, wonThisMonth: won.count || 0 },
      byEventType: summarize('event_type'),
      bySource: summarize('source_page')
    }, 200, origin);
  }

  if (request.method === 'GET' && path === 'leads/export.csv') {
    if (admin.role !== 'OWNER') return jsonResponse({ ok: false, message: 'Owner permission required.' }, 403, origin);
    const { data, error } = await leadQuery(requestUrl.searchParams).order('created_at', { ascending: false }).limit(5000);
    if (error) return jsonResponse({ ok: false }, 503, origin);
    const columns = ['public_id','status','name','company','phone','line_id','email','event_date','event_city','event_type','budget_range','source_page','next_follow_up_at','created_at'];
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [columns.join(','), ...(data || []).map((row) => columns.map((column) => escape(row[column])).join(','))].join('\n');
    await audit(admin.id, 'EXPORT_CSV', 'filtered', { count: data?.length || 0 });
    return new Response(`\uFEFF${csv}`, {
      status: 200,
      headers: { ...corsHeaders(origin), 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="nansien-leads.csv"' }
    });
  }

  if (request.method === 'GET' && path === 'leads') {
    const page = Math.max(Number(requestUrl.searchParams.get('page') || 1), 1);
    const size = Math.min(Math.max(Number(requestUrl.searchParams.get('size') || 30), 1), 100);
    const { data, count, error } = await leadQuery(requestUrl.searchParams)
      .order('created_at', { ascending: false })
      .range((page - 1) * size, page * size - 1);
    return error ? jsonResponse({ ok: false }, 503, origin) : jsonResponse({ ok: true, leads: data, total: count }, 200, origin);
  }

  const detailMatch = path.match(/^leads\/([0-9a-f-]+)$/i);
  if (request.method === 'GET' && detailMatch) {
    const [lead, activities, admins] = await Promise.all([
      service.from('leads').select('*').eq('id', detailMatch[1]).maybeSingle(),
      service.from('lead_activities').select('*').eq('lead_id', detailMatch[1]).order('created_at', { ascending: false }),
      service.from('admin_users').select('id,display_name,email,role').eq('active', true)
    ]);
    if (!lead.data) return jsonResponse({ ok: false, message: 'Not found.' }, 404, origin);
    return jsonResponse({ ok: true, lead: lead.data, activities: activities.data || [], admins: admins.data || [] }, 200, origin);
  }

  if (request.method === 'PATCH' && detailMatch) {
    const input = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    Object.entries(input).forEach(([key, value]) => {
      if (!editable.has(key)) return;
      updates[key] = key === 'lost_reason' ? String(value || '').trim().slice(0, 1000) : value || null;
    });
    if (updates.status && !statuses.has(String(updates.status))) return jsonResponse({ ok: false, message: 'Invalid status.' }, 422, origin);
    if (updates.status === 'LOST' && !String(updates.lost_reason || '').trim()) {
      return jsonResponse({ ok: false, message: 'Lost reason is required.' }, 422, origin);
    }
    const { data: before } = await service.from('leads').select('status').eq('id', detailMatch[1]).single();
    if (updates.status === 'CONTACTED' && before?.status === 'NEW') updates.first_contacted_at = new Date().toISOString();
    if (updates.status === 'WON') updates.won_at = new Date().toISOString();
    const { data, error } = await service.from('leads').update(updates).eq('id', detailMatch[1]).select().single();
    if (error) return jsonResponse({ ok: false, message: 'Update failed.' }, 422, origin);
    if (updates.status && updates.status !== before?.status) {
      await service.from('lead_activities').insert({
        lead_id: detailMatch[1], type: 'STATUS_CHANGED', from_status: before?.status,
        to_status: updates.status, note: updates.status === 'LOST' ? String(updates.lost_reason || '') : '', created_by: admin.id
      });
    }
    await audit(admin.id, 'UPDATE_LEAD', detailMatch[1], updates);
    return jsonResponse({ ok: true, lead: data }, 200, origin);
  }

  const activityMatch = path.match(/^leads\/([0-9a-f-]+)\/activities$/i);
  if (request.method === 'POST' && activityMatch) {
    const input = await request.json().catch(() => ({}));
    const type = String(input.type || '');
    const note = String(input.note || '').trim().slice(0, 3000);
    if (!['PHONE','LINE','EMAIL','NOTE','FOLLOW_UP'].includes(type) || !note) {
      return jsonResponse({ ok: false, message: 'Type and note are required.' }, 422, origin);
    }
    const { data, error } = await service.from('lead_activities').insert({
      lead_id: activityMatch[1], type, note, created_by: admin.id
    }).select().single();
    if (error) return jsonResponse({ ok: false }, 422, origin);
    await audit(admin.id, 'ADD_ACTIVITY', activityMatch[1], { type });
    return jsonResponse({ ok: true, activity: data }, 201, origin);
  }

  return jsonResponse({ ok: false, message: 'Not found.' }, 404, origin);
});

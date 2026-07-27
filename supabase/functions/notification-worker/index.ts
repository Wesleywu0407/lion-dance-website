import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  { auth: { persistSession: false } }
);

async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY') || '';
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('FROM_EMAIL') || '',
      to: [to],
      subject,
      text
    })
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { data: jobs, error } = await supabase
    .from('notification_queue')
    .select('id,kind,attempts,lead:leads(public_id,name,email,event_date,date_flexible,event_city,event_type)')
    .eq('status', 'PENDING')
    .lte('available_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(20);
  if (error) return new Response('Queue unavailable', { status: 503 });

  let sent = 0;
  for (const job of jobs || []) {
    const lead = Array.isArray(job.lead) ? job.lead[0] : job.lead;
    try {
      if (job.kind === 'INTERNAL_NEW_LEAD') {
        await sendEmail(
          Deno.env.get('NOTIFICATION_EMAIL') || '',
          `南仙官網新詢價 ${lead.public_id}`,
          `案件編號：${lead.public_id}\n姓名：${lead.name}\n活動：${lead.event_type}\n地區：${lead.event_city}\n日期：${lead.date_flexible ? '未定' : lead.event_date}\n\n請登入 CRM 查看完整資料。`
        );
      } else if (lead.email) {
        await sendEmail(
          lead.email,
          `已收到您的南仙演出洽詢 ${lead.public_id}`,
          `${lead.name} 您好：\n\n我們已收到您的演出洽詢，案件編號為 ${lead.public_id}。團隊會盡快與您聯繫，謝謝。`
        );
      }
      await supabase.from('notification_queue').update({
        status: 'SENT', sent_at: new Date().toISOString(), attempts: job.attempts + 1, last_error: ''
      }).eq('id', job.id);
      sent += 1;
    } catch (sendError) {
      const attempts = job.attempts + 1;
      await supabase.from('notification_queue').update({
        status: attempts >= 5 ? 'FAILED' : 'PENDING',
        attempts,
        last_error: String(sendError).slice(0, 500),
        available_at: new Date(Date.now() + Math.min(60 * 2 ** attempts, 3600) * 1000).toISOString()
      }).eq('id', job.id);
    }
  }

  return Response.json({ ok: true, processed: jobs?.length || 0, sent });
});

import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'supabase/config.toml',
  'supabase/migrations/202607270001_crm.sql',
  'supabase/functions/inquiries/index.ts',
  'supabase/functions/events/index.ts',
  'supabase/functions/admin-api/index.ts',
  'supabase/functions/notification-worker/index.ts',
  '_site/backend-config.js',
  '_site/crm/index.html',
  '_site/crm/crm.css',
  '_site/crm/crm.js',
  '_site/pages/privacy.html'
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error(`Missing backend/CRM artifacts:\n${missing.join('\n')}`);
  process.exit(1);
}

const publicConfig = fs.readFileSync('_site/backend-config.js', 'utf8');
if (publicConfig.includes('&quot;')) {
  console.error('Public backend config is HTML-escaped and is not valid JavaScript.');
  process.exit(1);
}
new Function(publicConfig);
for (const forbidden of ['SERVICE_ROLE', 'service_role', 'TURNSTILE_SECRET', 'DATABASE_URL']) {
  if (publicConfig.includes(forbidden)) {
    console.error(`Public backend config contains forbidden server secret marker: ${forbidden}`);
    process.exit(1);
  }
}

const migration = fs.readFileSync('supabase/migrations/202607270001_crm.sql', 'utf8');
for (const table of ['leads', 'lead_activities', 'admin_users', 'audit_logs', 'rate_limit_buckets']) {
  if (!migration.includes(`alter table public.${table} enable row level security`)) {
    console.error(`RLS declaration missing for ${table}`);
    process.exit(1);
  }
}

console.log(`Backend contract check passed (${requiredFiles.length} required artifacts, public config contains no server secret markers).`);

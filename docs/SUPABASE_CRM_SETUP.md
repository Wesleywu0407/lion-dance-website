# Supabase CRM 啟用手冊

目前程式已完成，但 `src/_data/backend.json` 故意保持空白，因此正式站仍使用 FormSubmit 備援，不會連到尚未建立的資料庫。以下步驟需由網站擁有者或獲授權的管理員完成。

## 1. 先做決策

- 分別建立測試與正式 Supabase 專案。
- 確認 `OWNER` 與 `SALES` 管理員 Email。
- 確認案件保存期限、定期刪除方式與備份責任人。
- 建立 Cloudflare Turnstile site key / secret key。
- 建立 Resend 寄件網域與 API key，或決定暫不啟用 Email 通知。

## 2. 連接專案並部署資料庫

安裝 Supabase CLI 後，在專案根目錄執行：

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push --dry-run
supabase db push
```

Migration 位於 `supabase/migrations/202607270001_crm.sql`，會建立案件、活動紀錄、管理員、通知佇列、分析事件、速率限制與稽核資料表，並啟用 RLS。

## 3. 設定伺服器秘密

複製 `supabase/.env.example` 為不提交 Git 的本機環境檔，填入正式值。這些值只能存在 Supabase Edge Function secrets：

```bash
supabase secrets set --env-file supabase/.env.production
```

禁止把 `SUPABASE_SERVICE_ROLE_KEY`、`TURNSTILE_SECRET_KEY` 或 `RESEND_API_KEY` 放進 `src/_data/backend.json`。

## 4. 部署 Edge Functions

```bash
supabase functions deploy inquiries
supabase functions deploy events
supabase functions deploy admin-api
supabase functions deploy notification-worker
```

- `inquiries`：公開詢價入口，執行 Origin、速率、honeypot、Turnstile、欄位與重複送出驗證。
- `events`：只接收固定名稱的轉換事件，不接收表單個資。
- `admin-api`：只允許已登入且存在於 `admin_users` 的使用者。
- `notification-worker`：從通知佇列寄信；寄信失敗不會刪除案件，最多重試五次。

在 Supabase Cron / Scheduled Functions 將 `notification-worker` 設為每 1–5 分鐘呼叫一次。先在測試專案驗證，再設定正式專案。

## 5. 建立第一位管理員

1. 在 Supabase Auth 建立或邀請管理員。
2. 複製該使用者 UUID。
3. 在 SQL Editor 執行（換成真實 UUID 與 Email）：

```sql
insert into public.admin_users (id, email, display_name, role)
values ('AUTH_USER_UUID', 'owner@example.com', '負責人姓名', 'OWNER');
```

`OWNER` 可匯出 CSV；`SALES` 可查看與跟進，但不能匯出。

## 6. 設定登入回跳

在 Supabase Auth URL Configuration：

- Site URL：`https://nansiengtaiwan.com`
- Redirect URL：`https://nansiengtaiwan.com/crm/`
- 測試環境另加入測試站 `/crm/` URL。

只有收到 magic link 不代表有案件權限；使用者還必須存在於 `admin_users` 且 `active = true`。

## 7. 啟用前台連線

只把可公開的值填入 `src/_data/backend.json`：

```json
{
  "inquiryApiUrl": "https://YOUR_PROJECT.supabase.co/functions/v1/inquiries",
  "analyticsApiUrl": "https://YOUR_PROJECT.supabase.co/functions/v1/events",
  "turnstileSiteKey": "PUBLIC_SITE_KEY",
  "crmSupabaseUrl": "https://YOUR_PROJECT.supabase.co",
  "crmSupabaseAnonKey": "PUBLIC_ANON_OR_PUBLISHABLE_KEY",
  "crmAdminApiUrl": "https://YOUR_PROJECT.supabase.co/functions/v1/admin-api"
}
```

再執行 `npm test`、提交並部署 GitHub Pages。未填 `inquiryApiUrl` 時，表單會繼續使用既有 FormSubmit；填入後改走資料庫 API。

## 8. 測試環境驗收

- 合法詢價回傳 `NS-YYYYMMDD-####`，CRM 10 秒內可見。
- 同一個請求重送只建立一筆案件。
- 未填電話、LINE、Email 時前端與 API 都拒絕。
- 日期與「日期未定」符合二選一。
- Turnstile 失敗、錯誤 Origin 與超過速率限制的請求被拒絕。
- 通知服務故障時，案件仍在資料庫且佇列保留錯誤。
- 未登入、非管理員、停用管理員均無法讀案件。
- `SALES` 不能匯出，`OWNER` 可以。
- `LOST` 沒有原因時不能儲存。
- iOS Safari、Android Chrome、桌機 Chrome / Safari 完成實機測試。

## 9. 正式上線與復原

1. 匯出測試結果與管理員清單供業主確認。
2. 正式專案執行 migration、secrets 與 functions 部署。
3. 用測試案件完成 NEW → CONTACTED → QUALIFIED → QUOTING → WON。
4. 確認 Email 通知與訪客收件確認。
5. 設定 Supabase 備份並執行一次還原演練。
6. 觀察 Edge Function 錯誤、通知失敗與 SPAM 比率至少 24 小時。
7. 如需緊急回退，將 `src/_data/backend.json` 的 API URL 清空並重新部署，前台即回到 FormSubmit 備援；資料庫案件不受影響。

官方參考：

- [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase Edge Function Deployment](https://supabase.com/docs/guides/functions/deploy)
- [Supabase Auth Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

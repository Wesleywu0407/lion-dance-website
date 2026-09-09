# Email 文案後台啟用

## 已完成與尚未啟用

`/admin/` 是 Email 登入的文案後台；不需要 GitHub 帳號。`/admin/?preview=1` 可試用公開文案的編輯介面，但無法儲存。原有 Sveltia CMS 留在 `/admin/technical.html`，供技術管理者使用。

已實作 22 頁 SEO、6 個到達頁、龍獅介紹 FAQ、表演項目文字、報價因素。可預覽、確認發布，伺服器以檔案 SHA 防止覆寫其他人的更新。文案編輯者不能讀取詢價 CRM。

Supabase 專案已建立，兩位 Auth 使用者與啟用中的文案權限已由擁有者完成。公開連線金鑰已接入，函式已部署為 `clever-responder`。來源白名單、GitHub 發布 secrets 與驗證開關已設定；未登入請求會被函式拒絕。網站改動部署後，仍須由編輯者完成實際登入與發布驗收。兩位指定編輯者的 Email 放在本機 `.cache/content-admin-setup.json`（gitignore，不會進入網站輸出）。

## 1. 建立 Supabase 專案

由網站擁有者登入 https://supabase.com/dashboard，建立專案。帳號註冊、服務條款與資料庫密碼由擁有者操作。此後台只需要 Supabase Auth、資料表與 Edge Functions，與 CRM 可共用專案，也可用獨立專案。

記下 Project URL、publishable/anon key、Project Ref。service-role key 是伺服器密鑰，不能放進 `src/`、聊天訊息或 Git。

## 2. 建立文案權限表

若只啟用文案後台，在 Supabase SQL Editor 執行 `supabase/migrations/202609090001_content_editors.sql` 即可；不必先建立 CRM。此表開啟 RLS，瀏覽器的 anon/authenticated 角色沒有直接存取權限。

## 3. 設定 Email＋密碼登入

在 Authentication 的 URL Configuration 設定：

- Site URL：`https://nansiengtaiwan.com`
- Redirect URLs：`https://nansiengtaiwan.com/admin/`
- 本機測試才加入：`http://localhost:8123/admin/`

啟用 Email provider。由擁有者在 Authentication → Users 建立兩位使用者、設定後台密碼並確認 Email。前端使用 `signInWithPassword`，沒有自行註冊入口；API 另外檢查 `content_editors.active`。未加入文案名單的帳號即使通過 Auth，也不能讀寫文案。

目前密碼登入不依賴 SMTP。忘記密碼暫由擁有者在 Supabase 管理端協助重設，不提供自助重設信。未來若開放 Email 邀請或重設密碼信，需要先設定自訂 SMTP。前述 URL 白名單保留供未來需要的 Auth 跳轉使用。

## 4. 設定發布服務

網站擁有者建立 GitHub fine-grained token，僅允許 `Wesleywu0407/lion-dance-website`，權限為 Contents read/write。Token 只存 Supabase Edge Function secrets。

設定 secrets：

- `CONTENT_GITHUB_TOKEN`：上述 token
- `CONTENT_GITHUB_REPO`：`Wesleywu0407/lion-dance-website`
- `CONTENT_GITHUB_BRANCH`：`main`
- `ALLOWED_ORIGINS`：`https://nansiengtaiwan.com`，需要本機測試時另外加 `http://localhost:8123`

Supabase 託管環境提供 `SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY`。部署：

```sh
npx supabase functions deploy clever-responder --project-ref cxrcooaysmtlomihdzvh
```

正式函式 slug 為 `clever-responder`，在 `config.toml` 透過 entrypoint 指向 `content-api/index.ts`。設定 `verify_jwt = false`，因為函式內會用 Supabase Auth 的 `getUser(token)` 驗證身分，再檢查啟用中的文案管理員。它不是公開寫入 API。來源白名單僅補充保護，不取代身分驗證。

API 只允許修改 `content-schema.mjs` 清單中的 JSON 文案。更新會保留不可編輯的網址、系統代碼、圖片尺寸與服務 ID。每次發布保留 Git 記錄與編輯者 ID。版本衝突回傳 409，不會覆寫。

## 5. 啟用兩位管理員

把 Supabase URL 與 service-role key 放在目前 shell 的環境變數，或權限適當、被 gitignore 的本機 env 檔，再執行：

```sh
node scripts/setup-content-editors.mjs
```

預設读取 `.cache/content-admin-setup.json`；其他環境可傳入自己的 JSON 路徑，格式是 `{ "emails": ["editor@example.com"] }`。

先在 Supabase 管理端建立 Auth 使用者與密碼；這支腳本只啟用既有使用者的 `content_editors` 權限，不建立帳號、不處理密碼，也不寄信。可以重複執行。

撤銷權限：在 Supabase Table Editor 把對應 `content_editors.active` 設為 false。之後所有 API 請求都會被拒絕，不需要等待登入憑證到期。

## 6. 設定前端並部署網站

在 `src/_data/backend.json` 只填公開設定：

```json
{
  "contentSupabaseUrl": "https://YOUR_PROJECT_REF.supabase.co",
  "contentSupabaseAnonKey": "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY",
  "contentApiUrl": "https://YOUR_PROJECT_REF.supabase.co/functions/v1/clever-responder"
}
```

保留其他欄位。不要填入 service-role key 或 GitHub token。執行 `npm test`，部署這次網站改動後再交給編輯者。

發布文案時 API 回覆表示 GitHub 已接受更新，**不表示網站已部署成功**。須等 Netlify 的建置完成再查看網頁。受保護分支若禁止 token 寫入 main，應先由擁有者決定發布流程，不要直接解除保護。

## 驗收

1. 兩位編輯者能用 Email 與後台密碼登入，錯誤密碼與其他未授權帳號無法編輯。
2. 改一頁 SEO，預覽正確，確認發布後正式網站的 title、description、分享標籤及頁面 schema 同步。
3. 同時開兩個視窗：A 發布後，B 的舊版本應顯示衝突。
4. 到達頁、FAQ、服務文案與價格說明能更新；不能修改系統設定或詢價資料。
5. 改完內容離開或重新載入會提示未發布修改；發布失敗保留內容。
6. 手機上能選頁、編輯、預覽及發布。

參考：[Supabase 密碼登入](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)、[SMTP 限制與設定](https://supabase.com/docs/guides/auth/auth-smtp)、[GitHub Contents API](https://docs.github.com/en/rest/repos/contents)。

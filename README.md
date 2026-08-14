# 臺灣南仙龍獅體育會官網 · Taiwan Nan Sieng Dragon &amp; Lion Dance

舞龍舞獅演出團隊的官方網站與詢價系統。以 Eleventy 建置靜態網站，搭配 Sveltia CMS 管理內容，並以 Supabase 提供詢價後端與 CRM。

Official website and inquiry system for a Taiwanese dragon &amp; lion dance troupe. Static site built with Eleventy, content managed through Sveltia CMS, with a Supabase-backed inquiry pipeline and CRM.

🌐 <https://nansiengtaiwan.com>

**[中文](#中文) · [English](#english)**

---

# 中文

## 這個網站要做什麼

這不是單純的形象網站，而是南仙的「接案入口」。

網站的主要任務是讓活動主辦人快速確認三件事：

1. 南仙是否適合這場活動。
2. 南仙能提供哪些演出與現場規劃。
3. 如何用最少步驟確認檔期與取得報價。

## 品牌與銷售原則

這幾條是內容決策的依據，改文案或版面前請先確認沒有違反：

- 首頁先建立「南仙自己的專業」，再用活動案例補充證據。
- 台北 101 等知名場域只能放在對應案例內容中，不作為首頁品牌主角。
- 未取得授權的客戶 Logo、成果數字與推薦語不得上線。
- 每個主要頁面都要有一個清楚的主要行動：LINE 詢問檔期、電話洽詢或填寫需求。
- 手機是主要接案入口；電話、LINE、預約按鈕必須可見且不遮住內容。

## 技術架構

| 項目 | 使用 |
| --- | --- |
| 靜態網站產生器 | Eleventy 3（`.eleventy.js`） |
| 模板 | Nunjucks / HTML |
| 樣式 | 原生 CSS，依區塊拆檔（`css/`） |
| 前端腳本 | 原生 JavaScript（`src/script.js.njk`） |
| 內容管理 | Sveltia CMS（`/admin/`） |
| 圖片管線 | `@11ty/eleventy-img` + `sharp`（建置前自動最佳化） |
| 表單後端 | Supabase Edge Functions；未啟用時退回 FormSubmit |
| 資料庫 | Supabase（migration 位於 `supabase/migrations/`） |
| 案件管理 | `/crm/` 靜態介面 + `admin-api` Edge Function |
| 部署 | Netlify（正式站）＋ GitHub Pages（次要副本），見[部署](#部署) |

## 環境需求

- Node.js 20 以上（`package.json` 的 `engines`）
- CI 與 Netlify 設定使用 Node 24

## 本機啟動

```bash
npm install
npm run build     # 產生 _site/
npm run serve     # Eleventy 開發伺服器（含熱更新）
```

若要用其他方式預覽建置成果：

```bash
npm run build
python3 -m http.server 8123 --directory _site
```

> **注意**：一定要以 `_site/` 為根目錄啟動伺服器。直接開專案根目錄會看到錯誤的路徑結構。
> VS Code Live Server 已設定為以 `_site/` 為網站根目錄。

## npm scripts

| 指令 | 作用 |
| --- | --- |
| `npm run build` | 執行 Eleventy 建置到 `_site/`（`prebuild` 會先跑圖片最佳化） |
| `npm run serve` | Eleventy 開發伺服器 |
| `npm run test:unit` | 單元測試（詢價驗證、SEO 路由） |
| `npm run check:links` | 檢查 `_site/` 內的本機連結是否有死連結 |
| `npm run check:backend` | 檢查前端與後端 API 的欄位契約是否一致 |
| `npm test` | 上述全部：單元測試 → 建置 → 連結檢查 → 契約檢查 |

CI 在每次 push 與 PR 都會跑 `npm test`，沒通過不會部署。

## 目錄結構

```
src/                   ← 網站來源檔（要編輯的地方）
  index.html             首頁
  pages/                 關於、表演項目、舞龍舞獅介紹、聯絡、隱私政策
  gallery/               活動案例總覽與 9 個分類相簿
  landing/               搜尋引擎到達頁（6 頁）
  _includes/             共用模板片段
  _data/                 CMS 可編輯的結構化資料（見下方）
  admin/                 Sveltia CMS 介面
  crm/                   案件管理介面
  script.js.njk          全站互動、手機快速聯絡列
  backend-config.js.njk  後端設定注入前端

css/                   ← 樣式（passthrough 複製，是實際來源）
  style.css              入口檔，以 @import 匯入以下各檔
  base.css               變數、重置、排版基礎
  header.css             導覽列
  components.css         按鈕、卡片等共用元件
  sections/              各頁面區塊樣式（home / about / services / contact / gallery / process）
  pages/                 單一頁面專用樣式
  utilities.css          工具類別、進場動畫
  responsive.css         斷點覆寫

images/  assets/  models/   ← 靜態資源（passthrough 複製，是實際來源）
scripts/               ← 建置與檢查用的 Node 腳本
tests/                 ← 單元測試
supabase/              ← 資料庫 migration 與 Edge Functions
docs/                  ← 規格、稽核、操作手冊
_site/                 ← 建置產物（已 gitignore，不要編輯）
```

### 編輯規則

- **只編輯 `src/`、`css/`、`images/`、`assets/`、`models/`。** 後四個雖然在專案根目錄，但會被 passthrough 複製到輸出，是實際的來源檔。
- **不要編輯 `_site/`。** 每次建置都會整個刪除重建。
- **改完 CSS 或 `assets/js/*` 要更新快取 token。** `css/style.css` 有 11 個 `@import`、每個 `src/**/*.html` 有一個 `?v=` 參數，全部要換成同一個新值，否則瀏覽器會沿用舊快取，改動看起來像沒生效：

  ```bash
  grep -rl "20260813-contact4" src css | xargs sed -i '' 's/20260813-contact4/新的token/g'
  ```

  （Linux 的 `sed` 不需要 `-i` 後面的 `''`。）

## 內容管理

### CMS

`/admin/` 是 Sveltia CMS，直接讀寫這個 repo 的 `main` 分支。目前使用 GitHub token 登入；改為 OAuth 的步驟見 [`docs/OAUTH_SETUP.md`](docs/OAUTH_SETUP.md)。

圖片上傳至 `images/uploads/`。上傳規格與命名慣例見 [`docs/ADMIN_IMAGE_GUIDE.md`](docs/ADMIN_IMAGE_GUIDE.md)。

### 結構化資料

`src/_data/` 內的 JSON 會被模板讀取，改這裡就會同步更新所有引用的頁面：

| 檔案 | 內容 |
| --- | --- |
| `site.json` | 團名、電話、LINE ID、Facebook、網址等全站共用資訊 |
| `services.json` | 表演項目 |
| `faq.json` | 常見問題（同時產生 FAQ 結構化資料） |
| `pricing.json` | 報價資訊 |
| `galleries/` | 各分類相簿內容 |
| `galleryContexts.json` | 相簿分類的說明文字 |
| `landing/` | 各到達頁文案 |
| `backend.json` | 後端 API 端點與金鑰（見下方） |

一般編輯者的操作說明見 [`docs/EDITOR_GUIDE.md`](docs/EDITOR_GUIDE.md)。

## 詢價後端與 CRM

### 目前狀態

`src/_data/backend.json` 的欄位**全部為空**，因此網站現在走**備援路徑**：聯絡表單直接送到 FormSubmit，寄信到團長信箱。

填入 API URL 後，表單會自動改走 Supabase。前端不需要改程式。

```jsonc
{
  "inquiryApiUrl": "",      // 詢價送出端點
  "analyticsApiUrl": "",    // 事件追蹤端點
  "turnstileSiteKey": "",   // Cloudflare Turnstile 人機驗證
  "crmSupabaseUrl": "",     // CRM 用的 Supabase 專案網址
  "crmSupabaseAnonKey": "", // CRM 用的 anon key
  "crmAdminApiUrl": ""      // CRM 管理 API 端點
}
```

### 組成

| 位置 | 作用 |
| --- | --- |
| `supabase/migrations/` | 資料表、RLS 權限、索引 |
| `supabase/functions/inquiries/` | 接收詢價、驗證、寫入資料庫 |
| `supabase/functions/admin-api/` | CRM 讀寫 API（需驗證） |
| `supabase/functions/events/` | 前端事件追蹤 |
| `supabase/functions/notification-worker/` | 通知佇列處理 |
| `supabase/functions/_shared/` | 共用驗證邏輯（與前端共用同一套規則） |
| `src/crm/` | 案件 Dashboard：篩選、詳細資料、跟進紀錄、狀態、CSV 匯出 |

程式已完成，但**尚未建立業主的 Supabase 專案與 secrets**。啟用步驟見 [`docs/SUPABASE_CRM_SETUP.md`](docs/SUPABASE_CRM_SETUP.md)，規格見 [`docs/BACKEND_SYSTEM_README.md`](docs/BACKEND_SYSTEM_README.md)。

正式啟用前仍需業主確認：管理員名單、資料保存期限、Email 寄件網域、備份與復原方式。

## 部署

這個 repo 同時有**兩套**部署，各自產生一個公開網址。

### 正式站：Netlify

`netlify.toml`：`command = "npm run build"`、`publish = "_site"`，另外定義約 35 條舊網址的 301 轉址（`/about.html` → `/pages/about` 等）。

Netlify App 已連結此 repo，PR 會產生 deploy preview（狀態檢查來自 `netlify/resilient-marigold-1f9b23`），`main` 更新後部署到 <https://nansiengtaiwan.com>。

**這是對外的正式網址**，`sitemap.xml`、`robots.txt` 與所有頁面的 canonical 都指向這個網域。

### CI：GitHub Actions

`.github/workflows/ci.yml`：push 到 `main` 與每個 PR 都會跑 `npm test`（單元測試 → 建置 → 連結檢查 → 契約檢查）。**這個 workflow 不部署**，只做驗證。

> **注意**：`netlify.toml` 的 301 轉址只在 Netlify 生效，正式站走 Netlify，所以舊網址正常運作。

<details>
<summary>已移除的 GitHub Pages 部署</summary>

原本 `deploy-pages.yml` 會另外把 `_site/` 部署到 GitHub Pages。但它沒有設定自訂網域，網址是 <https://wesleywu0407.github.io/lion-dance-website/> 這個**子路徑**，而站內約 870 個連結是根目錄絕對路徑（`href="/pages/about"`、`href="/"`），在子路徑下會指向站外，導覽整個是壞的。既然正式站走 Netlify，該 job 已移除，只保留驗證用的 `build`。

移除 workflow **不會**讓已發布的 Pages 站自動下線 —— 需到 **Settings → Pages** 把 Source 改為 None。

</details>

## 測試與驗證

```bash
npm test
```

包含四個階段：

1. **單元測試** — `tests/inquiry-validation.test.mjs`（詢價欄位驗證）、`tests/seo-routes.test.mjs`（SEO 路由與 canonical）
2. **建置** — Eleventy 產生 `_site/`
3. **連結檢查** — `scripts/check-local-links.mjs` 掃描輸出的本機連結
4. **契約檢查** — `scripts/check-backend-contract.mjs` 確認前後端欄位一致

改動 UI 時，除了語法正確，請實際確認手機寬度（360–430px）的版面。

## 文件

| 文件 | 內容 |
| --- | --- |
| [`docs/SITE_STRUCTURE.md`](docs/SITE_STRUCTURE.md) | 網站結構與頁面清單 |
| [`docs/PAGE_README.md`](docs/PAGE_README.md) | 每一頁的任務與驗收標準 |
| [`docs/UIUX_SALES_AUDIT.md`](docs/UIUX_SALES_AUDIT.md) | UI/UX 與接案漏斗稽核 |
| [`docs/BACKEND_SYSTEM_README.md`](docs/BACKEND_SYSTEM_README.md) | 詢價後台與 CRM 規格 |
| [`docs/BUILD_ROADMAP.md`](docs/BUILD_ROADMAP.md) | 完整實作步驟與完成條件 |
| [`docs/SUPABASE_CRM_SETUP.md`](docs/SUPABASE_CRM_SETUP.md) | Supabase CRM 啟用手冊 |
| [`docs/EDITOR_GUIDE.md`](docs/EDITOR_GUIDE.md) | 一般編輯者操作說明 |
| [`docs/ADMIN_IMAGE_GUIDE.md`](docs/ADMIN_IMAGE_GUIDE.md) | 圖片上傳規格 |
| [`docs/OAUTH_SETUP.md`](docs/OAUTH_SETUP.md) | CMS OAuth 登入設定 |
| [`docs/ai-system/`](docs/ai-system/) | AI 協作規則、模型路由、判斷檢查表 |

## 現況

- 靜態網站建置、圖片管線、本機連結檢查、CI 部署皆可運作。
- 手機有固定的電話 / LINE / 預約快速列。
- 聯絡表單具備日期、地區、活動類型、演出項目、預算、來源追蹤、跨欄位驗證，以及成功／失敗／離線狀態處理。
- 資料庫、Edge Functions 與 CRM 程式已完成，尚未建立業主的 Supabase 專案。
- 未設定 `backend.json` 前，表單走 FormSubmit 備援。

後續開發依 [`docs/BUILD_ROADMAP.md`](docs/BUILD_ROADMAP.md) 分階段執行。

## 給 AI 協作工具

`CLAUDE.md` 是給 Claude / Codex 等工具的規則入口，包含編輯前檢查、UI 規則、何時該詢問使用者、以及模型路由規則。修改本專案前請先讀該檔與其連結的文件。

---

# English

## What this site is for

This is not a brochure site — it is the troupe's booking funnel.

Its job is to let an event organiser quickly answer three questions:

1. Is Nan Sieng a good fit for this event?
2. What performances and on-site planning can they provide?
3. What is the shortest path to checking availability and getting a quote?

## Brand and sales rules

These constrain content decisions. Check any copy or layout change against them:

- The homepage establishes the troupe's own expertise first; case studies are supporting evidence.
- Famous venues (e.g. Taipei 101) may only appear inside the relevant case study, never as homepage branding.
- No client logos, result figures, or testimonials may ship without permission.
- Every major page has one clear primary action: ask about availability on LINE, call, or submit the form.
- Mobile is the primary booking entry point. Phone, LINE, and booking buttons must stay visible without covering content.

## Tech stack

| Area | Tool |
| --- | --- |
| Static site generator | Eleventy 3 (`.eleventy.js`) |
| Templating | Nunjucks / HTML |
| Styling | Plain CSS, split by section (`css/`) |
| Client script | Plain JavaScript (`src/script.js.njk`) |
| Content management | Sveltia CMS (`/admin/`) |
| Image pipeline | `@11ty/eleventy-img` + `sharp`, run before each build |
| Form backend | Supabase Edge Functions, falling back to FormSubmit |
| Database | Supabase (migrations in `supabase/migrations/`) |
| Lead management | `/crm/` static UI + `admin-api` Edge Function |
| Deployment | Netlify (production) + GitHub Pages (secondary copy) — see [Deployment](#deployment) |

## Requirements

- Node.js 20+ (per `package.json` `engines`)
- CI and the Netlify config both pin Node 24

## Local development

```bash
npm install
npm run build     # outputs to _site/
npm run serve     # Eleventy dev server with live reload
```

To preview a production build another way:

```bash
npm run build
python3 -m http.server 8123 --directory _site
```

> **Important:** always serve `_site/` as the web root. Serving the project root produces the wrong path structure.
> VS Code Live Server is already configured with `_site/` as the root.

## npm scripts

| Command | Purpose |
| --- | --- |
| `npm run build` | Eleventy build into `_site/` (`prebuild` runs image optimisation first) |
| `npm run serve` | Eleventy dev server |
| `npm run test:unit` | Unit tests (inquiry validation, SEO routes) |
| `npm run check:links` | Scan `_site/` for broken local links |
| `npm run check:backend` | Verify the frontend/backend field contract matches |
| `npm test` | All of the above: unit → build → links → contract |

CI runs `npm test` on every push and PR; a failure blocks deployment.

## Directory layout

```
src/                   ← site source (edit here)
  index.html             homepage
  pages/                 about, services, dragon & lion intro, contact, privacy
  gallery/               case-study index and 9 category albums
  landing/               SEO landing pages (6)
  _includes/             shared template partials
  _data/                 structured data editable via CMS (see below)
  admin/                 Sveltia CMS
  crm/                   lead management UI
  script.js.njk          site-wide interactions, mobile quick-contact bar
  backend-config.js.njk  injects backend config into the client

css/                   ← styles (passthrough-copied; this IS the source)
  style.css              entry point, @imports the files below
  base.css               tokens, reset, typography
  header.css             navigation
  components.css         buttons, cards, shared components
  sections/              per-section styles (home / about / services / contact / gallery / process)
  pages/                 page-specific styles
  utilities.css          utility classes, reveal animations
  responsive.css         breakpoint overrides

images/  assets/  models/   ← static assets (passthrough-copied; also source)
scripts/               ← Node scripts for build and verification
tests/                 ← unit tests
supabase/              ← database migrations and Edge Functions
docs/                  ← specs, audits, operator guides
_site/                 ← build output (gitignored, never edit)
```

### Editing rules

- **Only edit `src/`, `css/`, `images/`, `assets/`, `models/`.** The last four sit at the project root but are passthrough-copied into the output — they are real source directories.
- **Never edit `_site/`.** It is deleted and regenerated on every build.
- **Bump the cache token after changing any CSS or `assets/js/*`.** The token appears in 11 `@import` rules in `css/style.css` and once in every `src/**/*.html`. All of them must move to the same new value, or browsers keep serving the cached stylesheet and your change silently does nothing:

  ```bash
  grep -rl "20260813-contact4" src css | xargs sed -i 's/20260813-contact4/new-token/g'
  ```

  (On macOS, `sed -i` needs an empty argument: `sed -i ''`.)

## Content management

### CMS

`/admin/` runs Sveltia CMS, committing directly to this repo's `main` branch. It currently authenticates with a GitHub token; see [`docs/OAUTH_SETUP.md`](docs/OAUTH_SETUP.md) to switch to OAuth.

Uploads go to `images/uploads/`. Sizing and naming conventions are in [`docs/ADMIN_IMAGE_GUIDE.md`](docs/ADMIN_IMAGE_GUIDE.md).

### Structured data

JSON files in `src/_data/` are read by the templates — editing one updates every page that references it:

| File | Contents |
| --- | --- |
| `site.json` | Troupe name, phone, LINE ID, Facebook, site URL |
| `services.json` | Performance offerings |
| `faq.json` | FAQs (also generates FAQ structured data) |
| `pricing.json` | Pricing information |
| `galleries/` | Album contents per category |
| `galleryContexts.json` | Descriptions for each album category |
| `landing/` | Copy for each landing page |
| `backend.json` | Backend endpoints and keys (see below) |

Day-to-day editing instructions live in [`docs/EDITOR_GUIDE.md`](docs/EDITOR_GUIDE.md).

## Inquiry backend and CRM

### Current state

Every field in `src/_data/backend.json` is **empty**, so the site runs on the **fallback path**: the contact form posts to FormSubmit, which emails the troupe leader.

Filling in the API URLs switches the form to Supabase automatically — no frontend code changes needed.

```jsonc
{
  "inquiryApiUrl": "",      // inquiry submission endpoint
  "analyticsApiUrl": "",    // event tracking endpoint
  "turnstileSiteKey": "",   // Cloudflare Turnstile site key
  "crmSupabaseUrl": "",     // Supabase project URL for the CRM
  "crmSupabaseAnonKey": "", // anon key for the CRM
  "crmAdminApiUrl": ""      // CRM admin API endpoint
}
```

### Components

| Location | Role |
| --- | --- |
| `supabase/migrations/` | Tables, RLS policies, indexes |
| `supabase/functions/inquiries/` | Receive, validate, and store inquiries |
| `supabase/functions/admin-api/` | Authenticated CRM read/write API |
| `supabase/functions/events/` | Frontend event tracking |
| `supabase/functions/notification-worker/` | Notification queue processing |
| `supabase/functions/_shared/` | Shared validation (same rules as the frontend) |
| `src/crm/` | Lead dashboard: filtering, detail view, follow-ups, status, CSV export |

The code is complete, but **the owner's Supabase project and secrets have not been created yet**. Follow [`docs/SUPABASE_CRM_SETUP.md`](docs/SUPABASE_CRM_SETUP.md) to enable it; the spec is in [`docs/BACKEND_SYSTEM_README.md`](docs/BACKEND_SYSTEM_README.md).

Before going live, the owner still needs to confirm: admin accounts, data retention period, email sending domain, and backup/restore procedure.

## Deployment

This repo has **two** deployments, each producing its own public URL.

### Production: Netlify

`netlify.toml`: `command = "npm run build"`, `publish = "_site"`, plus roughly 35 legacy-URL 301 redirects (`/about.html` → `/pages/about`, etc.).

Netlify is connected to this repo: PRs get a deploy preview (status check from `netlify/resilient-marigold-1f9b23`) and `main` deploys to <https://nansiengtaiwan.com>.

**This is the public production URL.** `sitemap.xml`, `robots.txt`, and every page's canonical tag point at this domain.

### CI: GitHub Actions

`.github/workflows/ci.yml`: runs `npm test` (unit tests → build → link check → contract check) on pushes to `main` and on every PR. **It does not deploy** — verification only.

> **Note:** the 301 redirects in `netlify.toml` only apply on Netlify. Production runs on Netlify, so legacy URLs work.

<details>
<summary>Removed: the GitHub Pages deployment</summary>

`deploy-pages.yml` used to publish `_site/` to GitHub Pages as well. No custom domain was configured, so it deployed to <https://wesleywu0407.github.io/lion-dance-website/> — a **subpath**. The site contains roughly 870 root-absolute links (`href="/pages/about"`, `href="/"`), which under that subpath resolve off-site, leaving that copy's navigation broken. Since production runs on Netlify, the deploy job was removed and only the verification `build` job kept.

Removing the workflow does **not** take the already-published Pages site offline — set Source to None under **Settings → Pages** to do that.

</details>

## Testing

```bash
npm test
```

Four stages:

1. **Unit tests** — `tests/inquiry-validation.test.mjs` (form field validation), `tests/seo-routes.test.mjs` (routes and canonicals)
2. **Build** — Eleventy generates `_site/`
3. **Link check** — `scripts/check-local-links.mjs` scans the output for broken local links
4. **Contract check** — `scripts/check-backend-contract.mjs` verifies frontend/backend fields agree

For UI changes, verify the actual layout at mobile widths (360–430px), not just that the syntax is valid.

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/SITE_STRUCTURE.md`](docs/SITE_STRUCTURE.md) | Site structure and page inventory |
| [`docs/PAGE_README.md`](docs/PAGE_README.md) | Each page's job and acceptance criteria |
| [`docs/UIUX_SALES_AUDIT.md`](docs/UIUX_SALES_AUDIT.md) | UI/UX and booking-funnel audit |
| [`docs/BACKEND_SYSTEM_README.md`](docs/BACKEND_SYSTEM_README.md) | Inquiry backend and CRM spec |
| [`docs/BUILD_ROADMAP.md`](docs/BUILD_ROADMAP.md) | Implementation steps and completion criteria |
| [`docs/SUPABASE_CRM_SETUP.md`](docs/SUPABASE_CRM_SETUP.md) | Supabase CRM setup guide |
| [`docs/EDITOR_GUIDE.md`](docs/EDITOR_GUIDE.md) | Content editor instructions |
| [`docs/ADMIN_IMAGE_GUIDE.md`](docs/ADMIN_IMAGE_GUIDE.md) | Image upload specifications |
| [`docs/OAUTH_SETUP.md`](docs/OAUTH_SETUP.md) | CMS OAuth login setup |
| [`docs/ai-system/`](docs/ai-system/) | AI collaboration rules, model routing, judgment checklists |

## Status

- Static build, image pipeline, link checking, and CI deployment all work.
- Mobile has a fixed phone / LINE / booking quick bar.
- The contact form covers date, region, event type, performance type, budget, source tracking, cross-field validation, and success/failure/offline states.
- Database, Edge Functions, and CRM code are complete; the owner's Supabase project has not been created.
- Until `backend.json` is configured, the form uses the FormSubmit fallback.

Further development follows the phases in [`docs/BUILD_ROADMAP.md`](docs/BUILD_ROADMAP.md).

## For AI coding tools

`CLAUDE.md` is the entry point for Claude / Codex-style agents: pre-edit checks, UI rules, when to ask the user, and model routing. Read it and its linked documents before modifying this project.

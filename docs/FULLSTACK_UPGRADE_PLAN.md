# 全站升級計畫：編輯後台 + 手機動畫 + 部署管線

> 建立日期：2026-07-18
> 狀態：**本機實作完成；OAuth、首次 Pages 部署與真機驗收待網站擁有者執行**
> 原則：**桌機版視覺與行為完全不動**；所有改動以 `max-width: 760px` media query 或 JS 寬度判斷隔離。

---

## 目標總覽

| # | 目標 | 現況問題 | 解法方向 |
|---|------|----------|----------|
| 1 | 編輯家方便編輯內容 | 內容寫死在 ~20 個 HTML 檔，改一個價格要動多處原始碼 | 內容抽成資料檔 + 靜態產生器 + 網頁版 CMS 後台 |
| 2 | 手機動畫太卡 | 龍獅介紹頁用 iframe + WebGL 逐格滾動驅動，手機掉幀嚴重 | 手機改用「時間驅動自動播放」或靜態海報，桌機不變 |
| 3 | 完整部署管線 | 手動 push 到 GitHub Pages，無建置步驟、無圖片優化 | GitHub Actions 自動建置 + 圖片管線 + 部署 |

---

## 現況盤點（2026-07-18 調查結果）

- **架構**：純靜態 HTML/CSS/JS，無框架、無建置步驟。
- **部署**：GitHub Pages（repo：`Wesleywu0407/lion-dance-website`，`script.js` 內有 `/lion-dance-website/` base path 處理）。
- **頁面**：`index.html` + `pages/` 5 頁 + `landing/` 6 個 SEO 到達頁 + `gallery/` 10 個相簿頁。
- **表單**：`pages/contact.html` 送到 formsubmit.co（`?submitted=1` 回跳顯示成功訊息）。
- **圖片**：`images/` 共 26MB，131 張 webp、63 張 jpg/png 未轉檔。
- **手機動畫瓶頸**（實際程式碼定位）：
  - `pages/dragon-lion-introduction.html:183-185`：`.ink-scroll-space` 內嵌全螢幕 iframe（`ink-dragon-scroll.html`），由 `assets/js/ink-scroll-bridge.js` 把父頁滾動進度打進 iframe 的 `__inkLion` API。
  - `pages/ink-dragon-scroll.html`：WebGL 畫 46 格水墨獅（手機用 `assets/ink-run/m/` 720px 影格），DPR 上限 2，滾動掃描（scroll-scrub）驅動。
  - 手機卡頓主因：**滾動事件 → 跨 iframe postMessage 等級的同步 → WebGL 重繪** 這條鏈在 iOS Safari 的滾動節流下天生掉幀；再加上 DPR 2 的 canvas 解析度與滾動鎖定區（pinned section）造成的長頁面。
  - 其他次要因素：`.reveal` / `.ctb` 進場動畫在低階手機同時觸發多個 transition；hero 輪播 6.4s 換圖。
- **已有的良好基礎**（保留）：`prefers-reduced-motion` 全站支援、IntersectionObserver 進場、hero 首圖 LCP 保護、quickbar 全站注入。

---

## 技術選型（建議，實作前請確認）

| 決策點 | 建議 | 理由 | 替代方案 |
|--------|------|------|----------|
| 靜態產生器 | **Eleventy (11ty)** | 模板就是 HTML（Nunjucks），現有 20 個頁面可幾乎原樣搬入；輸出仍是純靜態，SEO/JSON-LD 全保留 | Astro（較現代但遷移成本高）；純 Node 腳本（太陽春，長期難維護） |
| CMS 後台 | **Sveltia CMS**（Decap 相容） | 單一 JS 檔掛在 `/admin/`，中文介面佳、活躍維護；編輯家在瀏覽器改內容 → 自動 commit 到 GitHub | Decap CMS（較舊）；TinaCMS（要跑服務）；直接教編輯家改 Markdown（門檻高） |
| 主機 | **維持 GitHub Pages** + Cloudflare Worker 做 OAuth 中繼 | 不動現有網址與 DNS；Sveltia 的 GitHub 登入只需要一個免費的小型 OAuth proxy | 整站搬 Cloudflare Pages（免 OAuth proxy，但網址、`siteBasePath`、Google Search Console 都要重弄） |
| 表單 | 維持 formsubmit.co | 已運作正常，非本次重點 | Cloudflare Worker 自建（之後再說） |

**編輯家前置條件**：每位編輯需要一個免費 GitHub 帳號，加入 repo 為 collaborator（CMS 用它登入與存檔）。

---

## Phase 0：基準測量與防護網（半天）

先量化「多卡」，之後每個 Phase 都能對照驗收。

1. 用 Lighthouse（mobile 模擬 + 4x CPU throttle）跑 `index.html`、`pages/dragon-lion-introduction.html`、一個 landing 頁，記錄 Performance / LCP / CLS / TBT。
2. 真機（或 DevTools 375px + CPU throttle）錄 `dragon-lion-introduction` 滾動 FPS。
3. 把數字寫進 `docs/perf-baseline.md`。
4. 桌機截圖存檔（1280px 各主要頁面），作為「桌機不變」的比對基準。

**驗收**：baseline 文件存在，含改善前數字。

---

## Phase 1：手機動畫急救（1–2 天，效益最大、風險最低）

**全部改動以 `min(width,height) < 700` 或 `max-width: 760px` 隔離，桌機路徑一行都不碰。**

### 1a. 龍獅介紹頁：手機改「時間驅動」取代「滾動掃描」
- 手機上不再把滾動進度打進 iframe。改為：iframe 進入視口（IntersectionObserver）→ 水墨獅以固定速度自動跑圈（`f9–f45` 迴圈已存在，`LOOP_START/LOOP_END` 直接可用）；離開視口 → 暫停 rAF。
- 敘事文字節拍（`.ink-story-beat`）在手機改成一般 IntersectionObserver 進場（淡入即可），不再綁滾動進度。
- 手機取消 pinned 長滾動區（`.ink-scroll-space` 高度改為單屏），頁面長度大幅縮短，滾動立即變順。
- 桌機：完全維持現有 scroll-scrub 手卷體驗。

### 1b. WebGL 降載（只在手機生效）
- DPR 上限由 2 降為 1.5（720px 影格在手機寬度下視覺無損）。
- `powerPreference` 手機改 `'low-power'`。
- 頁面 `visibilitychange` / 離開視口時停止 rAF（記憶體與電量）。

### 1c. 全站進場動畫手機減量
- `.reveal` / `.ctb` / `.about-fade-paragraph` 在 ≤760px：位移距離 24px→12px、duration 縮短、同屏 stagger 上限 3 個，只動 `transform/opacity`（現況已符合，維持）。
- hero 輪播手機維持（成本低），但確認 `content-visibility: auto` 可套在首屏以下區塊。

### 1d. 快速勝利
- `touch-action: manipulation` 套用互動元件（消除 300ms 延遲疑慮）。
- 補齊 63 張 jpg/png → webp（`images/` 26MB 是手機載入痛點的一半）。
- 確認所有非首屏 `<img>` 有 `loading="lazy"` + `width/height`（防 CLS）。

**驗收**：真機/模擬 375px 滾動 60fps 或接近；Lighthouse mobile Performance 較 baseline 提升；桌機截圖比對無差異；`?debug3d` / `?inkp=` 除錯把手仍可用。

---

## Phase 2：內容抽離（2–3 天）— 編輯體驗的地基

把「編輯家會改的內容」從 HTML 抽成資料檔，HTML 變成模板。

1. 建立 Eleventy 專案結構（不改網址）：
   ```
   src/
     _data/          ← 編輯家的世界（之後 CMS 只碰這裡 + 圖片）
       site.json         (電話 0922-140-496、LINE lion6869、地址、社群連結)
       services.json     (服務項目：標題、說明、標籤、對應圖片)
       pricing.json      (價格指南內容)
       faq.json          (常見問題)
       galleries/        (每本相簿一個 json：標題、描述、照片清單、alt)
       landing/          (每個到達頁一個 json：H1、段落、CTA 文案)
     _includes/      ← 模板（header/footer/quickbar/head 各一份，消滅重複）
     (各頁 .njk 模板，輸出路徑與現在的 .html 完全相同)
   ```
2. 逐頁搬遷順序（風險由低到高）：gallery 10 頁（結構最重複）→ landing 6 頁 → services/about/contact → index（JSON-LD 最多，最後搬）。
3. 每搬一頁就 `diff` 建置輸出與原 HTML，確保逐字節相同或僅空白差異。
4. `css/`、`script.js`、`assets/` 原樣通過（passthrough copy），**不改任何樣式與行為**。

**驗收**：`npx @11ty/eleventy` 輸出的站與現網 diff 乾淨；本地 `http.server` 全站點擊走查；sitemap.xml、JSON-LD、og tags 逐頁比對無異。

---

## Phase 3：編輯後台 CMS（1–2 天）

1. `admin/index.html` 掛 Sveltia CMS + `admin/config.yml`。
2. Cloudflare Worker 部署 GitHub OAuth 中繼（免費方案即可，一次性 30 分鐘設定）。
3. Collections 對應 Phase 2 的資料檔，全部中文標籤：
   - 「基本資料」（電話/LINE/地址）— 單檔
   - 「服務項目」「價格指南」「常見問題」— 列表編輯
   - 「演出相簿」— 每本相簿可上傳照片、填 alt 與說明（media library 直接進 `images/`）
   - 「到達頁文案」— 每頁的標題與段落
4. 欄位加 `hint`（中文說明）與必填驗證，例如 alt 必填、電話格式。
5. 寫一頁 `docs/EDITOR_GUIDE.md`：截圖教學「登入 → 改文字 → 按發布 → 等 2 分鐘自動上線」。

**編輯家的最終體驗**：開 `https://<網址>/admin/` → GitHub 登入 → 表單式介面改文字/換照片 → 按「發布」→ CI 自動建置部署，全程不碰程式碼。

**驗收**：用一個測試編輯帳號實際改一筆服務說明 + 上傳一張照片，2 分鐘內上線且版面正確。

---

## Phase 4：部署與圖片管線（1 天）

1. GitHub Actions workflow：push to `main` → Eleventy build → 部署 GitHub Pages（`actions/deploy-pages`，取代現在的直接 push 靜態檔）。
2. 建置時圖片處理（`@11ty/eleventy-img` 或 sharp）：
   - 自動產 webp + 多尺寸 srcset（編輯家上傳原圖即可，不用會壓圖）。
   - 上傳的大圖自動縮到上限 1920px。
3. CSS/JS 檔名帶 hash 或沿用現有 `?v=` 版本參數策略（避開已知的 JS 快取陷阱）。
4. PR preview（optional）：Actions 對 PR 產 artifact 供預覽。

**驗收**：編輯家在 CMS 按發布 → Actions 綠燈 → 線上站更新；上傳 5MB 原圖，線上輸出為多尺寸 webp。

---

## Phase 5：驗收與上線（半天）

- [ ] Lighthouse mobile：三個代表頁面對照 Phase 0 baseline，目標 Performance ≥ 85。
- [ ] 真機 iOS Safari + Android Chrome：龍獅介紹頁滾動順暢、水墨獅自動播放正常。
- [ ] 375px、landscape、`prefers-reduced-motion` 三種情境走查。
- [ ] 桌機 1280px 截圖比對 Phase 0 基準：**零視覺差異**。
- [ ] SEO 回歸：sitemap.xml 網址不變、JSON-LD 驗證通過、Search Console 無新錯誤。
- [ ] quickbar 的 tel: / LINE 連結真機點擊測試。
- [ ] 編輯家實際操作一輪並回饋（教學文件是否看得懂）。

---

## 時程總覽

| Phase | 內容 | 預估 | 可獨立上線 |
|-------|------|------|-----------|
| 0 | 基準測量 | 0.5 天 | — |
| 1 | 手機動畫急救 | 1–2 天 | ✅（最先上，立即有感）|
| 2 | 內容抽離（Eleventy） | 2–3 天 | ✅ |
| 3 | CMS 後台 | 1–2 天 | ✅ |
| 4 | 部署與圖片管線 | 1 天 | ✅ |
| 5 | 驗收上線 | 0.5 天 | — |

---

## 技術決策（2026-07-18 已與業主確認）

1. **靜態產生器：Eleventy** ✅
2. **主機：維持 GitHub Pages**（+ Cloudflare Worker OAuth 中繼）✅
3. **編輯家使用 GitHub 帳號登入 CMS** ✅

實作與驗收結果：請見 [`UPGRADE_VERIFICATION.md`](UPGRADE_VERIFICATION.md)。

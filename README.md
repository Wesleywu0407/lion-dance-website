# 臺灣南仙龍獅體育會官網

這不是單純的形象網站，而是南仙的「接案入口」。

網站的主要任務是讓活動主辦人快速確認三件事：

1. 南仙是否適合這場活動。
2. 南仙能提供哪些演出與現場規劃。
3. 如何用最少步驟確認檔期與取得報價。

## 品牌與銷售原則

- 首頁先建立「南仙自己的專業」，再用活動案例補充證據。
- 台北 101 等知名場域只能放在對應案例內容中，不作為首頁品牌主角。
- 未取得授權的客戶 Logo、成果數字與推薦語不得上線。
- 每個主要頁面都要有一個清楚的主要行動：LINE 詢問檔期、電話洽詢或填寫需求。
- 手機是主要接案入口；電話、LINE、預約按鈕必須可見且不遮住內容。

## 技術架構

- Eleventy 3 靜態網站產生器
- Nunjucks / HTML / CSS / JavaScript
- Sveltia CMS：管理網站內容與圖片
- GitHub Pages：目前的靜態網站部署方向
- FormSubmit：後端尚未啟用時的表單備援
- Supabase migration / Auth / Edge Functions：詢價資料、權限、API、速率限制與通知佇列
- `/crm/`：案件 Dashboard、篩選、詳細資料、跟進、狀態與 OWNER CSV 匯出

重要：請編輯 `src/` 內的來源檔，不要直接修改 `_site/`。`_site/` 是每次建置重新產生的成果。

## 本機啟動

需要 Node.js 20 以上版本。

```bash
npm install
npm run build
npm run serve
```

VS Code Live Server 已設定以 `_site/` 為網站根目錄；使用前先執行
`npm run build`，即可預覽與正式部署相同的建置成果。

建置與本機連結檢查：

```bash
npm test
```

## 內容位置

- `src/index.html`：首頁
- `src/pages/`：關於、服務、介紹、聯絡頁
- `src/gallery/`：活動案例與分類相簿
- `src/landing/`：搜尋引擎到達頁
- `src/_data/`：CMS 可編輯的聯絡資料、服務、FAQ、相簿與到達頁文案
- `src/admin/`：Sveltia CMS
- `src/crm/`：案件 CRM 靜態介面
- `css/`：全站樣式
- `src/script.js.njk`：全站互動與手機快速聯絡列
- `supabase/`：資料庫 migration 與 Edge Functions
- `tests/`：公開詢價驗證單元測試

## 本次規劃文件

- [UI/UX 與接案漏斗稽核](docs/UIUX_SALES_AUDIT.md)
- [每一頁的任務與驗收標準](docs/PAGE_README.md)
- [詢價後台與 CRM 規格](docs/BACKEND_SYSTEM_README.md)
- [完整實作步驟與完成條件](docs/BUILD_ROADMAP.md)
- [Supabase CRM 啟用手冊](docs/SUPABASE_CRM_SETUP.md)

## 現況

- 靜態網站建置、圖片管線與本機連結檢查已可運作。
- 手機有固定電話、LINE 與預約快速列。
- 聯絡表單已具備日期、地區、活動類型、演出項目、預算、來源追蹤、跨欄位驗證與成功／失敗／離線狀態。
- 未設定 `src/_data/backend.json` 時，表單送至既有 FormSubmit；設定公開 API URL 後改走 Supabase。
- 資料庫、Edge Functions 與 CRM 程式已完成，但尚未建立／部署業主的 Supabase 專案與 secrets。
- 正式啟用前仍需業主確認管理員、資料保存期限、Email 寄件網域與備份復原。

後續開發一律依 [完整實作步驟與完成條件](docs/BUILD_ROADMAP.md) 執行，每完成一階段才進入下一階段。

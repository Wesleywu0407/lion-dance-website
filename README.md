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
- FormSubmit：目前的表單收件方式，將由自有詢價後台取代

重要：請編輯 `src/` 內的來源檔，不要直接修改 `_site/`。`_site/` 是每次建置重新產生的成果。

## 本機啟動

需要 Node.js 20 以上版本。

```bash
npm install
npm run build
npm run serve
```

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
- `css/`：全站樣式
- `src/script.js.njk`：全站互動與手機快速聯絡列

## 本次規劃文件

- [UI/UX 與接案漏斗稽核](docs/UIUX_SALES_AUDIT.md)
- [每一頁的任務與驗收標準](docs/PAGE_README.md)
- [詢價後台與 CRM 規格](docs/BACKEND_SYSTEM_README.md)
- [完整實作步驟與完成條件](docs/BUILD_ROADMAP.md)

## 現況

- 靜態網站建置、圖片管線與本機連結檢查已可運作。
- 手機有固定電話、LINE 與預約快速列。
- 聯絡表單目前會送至第三方 FormSubmit 與電子郵件。
- 尚未有「詢價案件資料庫、案件狀態、跟進紀錄、來源追蹤與後台報表」。

後續開發一律依 [完整實作步驟與完成條件](docs/BUILD_ROADMAP.md) 執行，每完成一階段才進入下一階段。

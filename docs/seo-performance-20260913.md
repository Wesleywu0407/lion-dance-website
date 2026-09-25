# SEO 效能調整驗證 — 2026-09-13

## 已完成的調整

- 關於南仙頁五個章節標題由段落改為 H2，文字和既有樣式保留。
- 使用 esbuild 在 Eleventy 建置結束後合併並壓縮 CSS；原本 12 次本機 CSS 請求縮為 1 次。來源分檔、套用順序和背景圖片網址保留。
- 共用中文字型設定改為相同字型的可變字重範圍，採非阻塞載入；停用 JavaScript 時由 noscript 載入。
- 更新公開頁面的 CSS 快取版本；沒有新增南仙以外的案例、價格或業務宣稱。

## 測量方式及限制

- 調整前版本：aac4f07；調整後：本次尚未提交的工作目錄。
- Lighthouse 12.8.2，預設 Mobile 模擬、simulated throttling、headless Chrome。
- 使用同一部電腦及同一個本機 Python HTTP 伺服器（127.0.0.1:8123），每個頁面／版本各一輪，依序測試。未與其他 Lighthouse 測試同時執行。
- 本機伺服器未啟用 HTTP 壓縮；Google Fonts 與廣告資源仍經外部網路載入。這些是實驗室對照結果，並非正式站、真機或 Search Console 的使用者數據，也不是多次測試的中位數。
- 四份報告均沒有 Lighthouse runtime error 或 run warning。字型改成延後載入，初次顯示可能先使用既有系統備援字型，再切換至 Noto。

| 頁面 | 版本 | Performance | FCP | LCP | TBT | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 首頁 | 調整前 | 55 | 13.64 s | 17.17 s | 0 ms | 0.000 |
| 首頁 | 調整後 | 93 | 1.50 s | 3.15 s | 22 ms | 0.000 |
| 舞獅服務頁 | 調整前 | 55 | 13.81 s | 15.58 s | 0 ms | 0.000 |
| 舞獅服務頁 | 調整後 | 97 | 1.65 s | 2.40 s | 26 ms | 0.000 |

## 驗證

- `npm test` 通過：25 項單元測試、Eleventy 建置、1,045 個本機資源／連結檢查、後端契約檢查與 22 頁 SEO 檢查。
- CSS 打包測試覆蓋巢狀模組圖片路徑、百分比編碼、query/hash、data URL、模組順序與保留來源分檔。
- 手機 375 × 667：關於頁五個 H2 正確、字型完成載入、無水平溢出、選單可開啟並前往活動案例，案例圖片正常。
- 桌面 1280 × 800：首頁字型完成載入、圖片及按鈕正常、無水平溢出。
- 無 JavaScript 備援由建置內容檢查確認，未另做停用 JavaScript 的瀏覽器測試。

原始 JSON 報告保存在本機 `.cache/seo-performance-20260913/`：`home-before.json`、`home-after.json`、`service-before.json`、`service-after.json`。測試完整輸出為同目錄的 `verification.log`。`.cache/` 不提交至 Git。

## 方法參考

- [Google：改善資源載入及避免 CSS @import](https://web.dev/learn/performance/optimize-resource-loading)
- [Google Fonts CSS2 可變字型範圍](https://developers.google.com/fonts/docs/css2)
- [esbuild CSS bundling](https://esbuild.github.io/content-types/#css)

# 全站升級驗收紀錄

> 驗收日期：2026-07-18  
> 基準 commit：`a13a907`  
> 驗收範圍：本機建置、產物完整性、響應式行為、CMS 介面與圖片管線

> 正式站託管確認：`nansiengtaiwan.com` 目前由 Netlify 提供；repository 已加入 `netlify.toml`，以 `npm run build` 建置並發布 `_site`。

## 已完成

- `npm test` 通過：Eleventy 產出 24 個 HTML 頁面與 `script.js`，並檢查 863 個本機參照、JSON-LD、重複 ID 與 fragment。
- `npm audit --audit-level=high` 通過：0 個已知漏洞。
- 公開網址維持原有 `.html` 路徑；`sitemap.xml` 建置前後逐位元相同，`_site/.nojekyll` 存在。
- 375 × 812 瀏覽器走查：龍獅介紹頁無水平溢位，動畫 stage 與敘事 beat 均回到一般文件流。
- 1280 × 900 瀏覽器走查：龍獅介紹頁維持 sticky / scroll-scrub 桌機路徑，桌機基準截圖已保留於 `docs/perf-baseline/`。
- 直式手機與短螢幕橫向模式均由隔離 media query 處理；`prefers-reduced-motion` 保留靜態內容與停用轉場規則。
- CMS 本機載入成功，六個中文 collection、欄位提示、必填規則及圖片上傳路徑已設定。
- GitHub Actions workflow 與 CMS YAML 均通過語法解析；workflow 在 PR 建置 artifact，在 `main` push 建置並部署 Pages。
- 圖片管線以 3.4 MB、2560 × 1920 JPEG 實測，輸出：
  - 720 × 540 WebP：約 53 KB
  - 1440 × 1080 WebP：約 202 KB
  - 1920 × 1440 WebP：約 340 KB
- 65 張既有 JPG/PNG 中，60 張已有對應的內容 WebP；其餘是社群分享圖、圖示或已有不同命名 WebP 的資產。內容頁實際圖片已使用 720/1440 WebP，新的 CMS 上傳圖會由建置管線自動產生三種尺寸。

## 效能狀態

Phase 0 Lighthouse 數字在 `docs/perf-baseline.md`。Phase 1 已移除手機 scroll-scrub、降低 DPR、限制載入併發並在離開視口時暫停 rAF；本機瀏覽器確認手機文件流與桌機隔離路徑正確。

本輪重跑龍獅 WebGL 頁時，Lighthouse headless Chrome 無法產生 FCP 報告；因此不宣稱已達 Performance 85。這個分數與真機 FPS 應在部署後，以實際 iOS Safari / Android Chrome 補測。

## 上線前需要網站擁有者完成

1. 依 `docs/OAUTH_SETUP.md` 建立 GitHub OAuth App 與 Cloudflare Worker，填入真正的 `base_url`，再把 CMS `auth_methods` 切換為 `oauth`。
2. 確認 Netlify 專案連接此 GitHub repository 的 `main` branch，首次建置成功。
3. 以編輯者帳號修改一筆服務文字並上傳圖片，確認 commit、Netlify Deploy 與線上更新完整串接。
4. 在 iOS Safari、Android Chrome 測試直式、橫式、減少動態效果、電話與 LINE 快捷列。
5. 部署後檢查 Search Console；這是外部索引狀態，無法由本機建置驗證。

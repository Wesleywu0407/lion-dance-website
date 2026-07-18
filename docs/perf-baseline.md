# 效能基準（Phase 0）

> 測量日期：2026-07-18  
> 測量環境：本機 `python3 -m http.server 8123`、Lighthouse 12.8.2、Mobile 模擬（Lighthouse 預設 simulated throttling / CPU slowdown 4x）  
> Git 基準：`a13a907 Expand service content and landing pages`

## Lighthouse Mobile

| 代表頁面 | Performance | FCP | LCP | TBT | CLS | Speed Index |
|---|---:|---:|---:|---:|---:|---:|
| 首頁 `index.html` | 57 | 6.1 s | 8.4 s | 0 ms | 0 | 9.7 s |
| 龍獅介紹 `pages/dragon-lion-introduction.html` | 59 | 6.1 s | 12.8 s | 0 ms | 0 | 6.6 s |
| 到達頁 `landing/lion-dance-performance.html` | 62 | 6.0 s | 7.0 s | 0 ms | 0 | 6.0 s |

## 資產基準

- `images/`：38 MB。
- `assets/`：4.0 MB。
- `images/` 內 WebP：131 張。
- `images/` 內 JPG/JPEG/PNG：63 張（後續圖片管線需處理）。
- 公開 HTML：23 頁。

## 視覺基準

以下截圖由同一個本機伺服器與瀏覽器工作階段產生，桌機 viewport 為 1280 × 900，手機 viewport 為 375 × 667：

- `perf-baseline/desktop-1280-index.png`
- `perf-baseline/desktop-1280-dragon-lion-introduction.png`
- `perf-baseline/desktop-1280-landing-lion-dance.png`
- `perf-baseline/mobile-375-dragon-lion-introduction.png`

## 已知限制

- 本輪可重現的是模擬行動裝置 Lighthouse 與瀏覽器視覺基準；真機 iOS Safari / Android Chrome 的滾動 FPS 必須在 Phase 5 由實機補測。
- Phase 1 驗收時會以相同 Lighthouse 版本與頁面重新測量，避免工具版本差異污染前後比較。

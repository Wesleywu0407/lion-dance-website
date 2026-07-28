# 設計檢查與改造計畫（2026-07-28）

範圍：`舞龍舞獅介紹` 頁的版面破洞、全站手機版靜態化、打破「AI 味」的重複節奏。

使用者已確認的三個方向：

1. **桌機版 hero 不動** — 430vh 的 WebGL 水墨跑獅維持現狀，問題只在手機版跑不動。
2. **全站一致靜態** — 手機版（≤760px）不再依賴進場動畫與持續播放的動畫。
3. **打破重複節奏** — 保留現有色票與字體，改版面結構與 CSS，不動品牌色。

---

## 一、診斷

### A. 手機版跑不動的真正原因

`pages/dragon-lion-introduction.html` 內嵌 `ink-dragon-scroll.html` 作為 hero。手機版時
`assets/js/ink-scroll-bridge.js` 會呼叫 `api.setMode('autoplay')`，讓 iframe 進入**無限
時間驅動的 rAF 迴圈**。每一幀同時發生四件昂貴的事：

| 來源 | 每幀成本 |
|---|---|
| `assets/ink-run/m/` 46 張 WebP 影格 | 首次載入 **1.2 MB**，全部 decode 成 ImageBitmap 常駐記憶體 |
| 全螢幕 `<canvas>` + `mix-blend-mode: multiply` | 每幀一次全螢幕合成 |
| `#mist1` / `#mist2` 橢圓的 `cx` 每幀變動，且掛 `filter="url(#washSoft)"`（`feGaussianBlur stdDeviation="14"`） | **每幀重算一次全螢幕 SVG 高斯模糊** ← 主要兇手 |
| `#blooms` 掛 `filter="url(#bloom)"`（`feTurbulence` + `feDisplacementMap` + `feGaussianBlur`） | 即使 autoplay 時 opacity 為 0，濾鏡仍在 filter region 內求值 |

`feGaussianBlur` / `feTurbulence` / `feDisplacementMap` 在行動裝置 GPU 上是軟體路徑，
逐幀重算必然掉幀。這不是 CSS 動畫太多，而是**一個逐幀重算的 SVG 濾鏡鏈**。

### B. 手機版的「空」

手機版 `.ink-scroll-stage` 使用 `padding-top: 100dvh` 把敘事推到下面，所以：

| 捲動位置 | 內容 |
|---|---|
| 0 – 812px（第 1 屏） | 只有跑獅動畫 + 標題 + 一句話 |
| 812 – 2103px | 4 段水墨敘事（起／神／勢／請） |
| 2103px 起 | 章節導覽列（目錄） |
| ~2870px 起 | 才進入「文化精神」正文 |

也就是**滾過 2.6 個螢幕才看到第一段正文**，而前 2.6 屏講的內容與下方正文高度重疊
（醒聚納、龍獅差異在上下各講了一次）。

### C. 三套互相打架的進場系統

同一頁同時掛著：

| 系統 | 檔案 | 加的 class |
|---|---|---|
| `.reveal` → `.is-visible` | `src/script.js.njk:559` | opacity 0 → 1 |
| `.ink-text-reveal` → `.is-ink-visible` | `assets/js/ink-text-reveal.js` | opacity 0 + `clip-path: circle(0)` → 1 |
| `.ink-anim` 捲動 scrub | `assets/js/ink-scroll-bridge.js` | inline opacity |

`.intro-section-heading`、`.intro-comparison-heading`、`.intro-process-heading`、
`.intro-faq-heading` **同時掛到前兩套**，等於被兩個獨立的 IntersectionObserver
雙重 gate（threshold 0.12 + rootMargin `-7%` / `-12%`）。任一個沒觸發，標題就是全透明。
實測跳轉捲動時確實出現標題 `opacity: 0` 但已在視窗內的狀態 —— 這就是「有些地方是空的」。

另外 `css/responsive.css:836` 已經把 ≤760px 的進場動畫全部關掉了，
但**明確排除了 `.intro-page`**：

```css
.js body:not(.intro-page) .reveal, ... { opacity: 1 !important; ... }
```

所以舞龍舞獅頁是全站唯一還在手機版跑動畫的頁面。

### D. 「AI 味」來源盤點

| # | 症狀 | 出現次數 | 位置 |
|---|---|---|---|
| 1 | `kicker`（金色 34px 短線 + 小標）+ 大襯線 h2 + 灰段落，一模一樣的三件組 | **5** | overview / comparison / process / faq / contact |
| 2 | 每個 h2 下方同一條 `skewX(-14deg)` 模糊筆刷 `::after` | **5** | 同上 |
| 3 | `01 / 02 / 03` 編號清單 | **2** | `.intro-values`、`.intro-process-list` |
| 4 | 背景巨大淡色書法字 | **2** | `.intro-process::after`「醒 聚 納」、`.intro-contact-band::before`「福」 |
| 5 | 「詢問檔期 / 查看表演項目」按鈕對 | **3** | 章節導覽、最後一段敘事、contact band |
| 6 | 三欄 `dl` 規格列 | 2（比較區，屬合理對仗，**保留**） | `.intro-practice-facts` |

第 3 點最關鍵：`.intro-values` 講的是**醒、聚、納**三個字，內文自己就寫了
「以硃砂點睛…」「鼓、鑼、鈸…」「採青、吐聯…」，卻用 `01/02/03` 這種通用編號蓋掉。
把真正的文化符號換成通用編號 —— 這正是 AI 版面的典型特徵。

---

## 二、改造計畫

### P1 — 手機版靜態化（最高優先，解決「跑不動」）

**P1-1. iframe 新增 `static` 模式**（`src/pages/ink-dragon-scroll.html`）

- `loadFrames()` 接受只載入第 0 格的模式 → 手機省下 **45 張影格 / 約 1.2 MB**。
  第 0 格本身就是「原始水墨畫」（見原始碼註解），最適合當靜態海報。
- `frame()` 在 `mode === 'static'` 時：以 `D=0, introT=1, settle=0, time=0` 畫**一次**，
  結尾不呼叫 `requestFrame()` —— 完全停掉 rAF。
- 靜態模式下把 `#mist`、`#blooms`、`#fardragon` 直接設為 `display:none`，
  讓昂貴的 `feGaussianBlur` / `feTurbulence` 濾鏡鏈**完全不進 render tree**。
- 沿用既有的 `reduced` 分支寫法，不新增架構。

**P1-2. bridge 改叫 static**（`assets/js/ink-scroll-bridge.js`）

- 手機由 `api.setMode('autoplay')` 改為 `api.setMode('static')`。
- iframe 的 `src` 加上 `&static=1`，讓 iframe 在**載入當下**就知道不要抓 46 張影格
  （不能等 bridge 事後通知，那時 fetch 已經發出去了）。

**P1-3. 拿掉 `.intro-page` 的動畫豁免**（`css/responsive.css`）

- `body:not(.intro-page)` → 涵蓋所有頁面，讓 `.reveal` / `.ink-text-reveal` /
  `.ink-anim` 在 ≤760px 一律直接可見。
- 移除 `.ink-scroll-hint i` 的 `restoredInkPulse` 無限動畫（手機）。

**P1-4. 首頁 hero 輪播手機靜態化**（`css/sections/home.css`）

- `heroSlideBreathe` 18s 無限 `scale()` 迴圈在 ≤760px 關閉。
- 交叉淡化 `transition: opacity 1.8s` 保留（那是換圖必要，不是裝飾迴圈）。

**P1-5. 手機版砍掉重複的前導**（`css/pages/dragon-lion-introduction.css`）

- `.ink-scroll-stage` 的 `padding-top` 由 `100dvh` 降為 `62dvh`，
  讓靜態水墨畫仍是主視覺，但第一屏底部就能看到敘事開頭。
- 手機版隱藏 `.intro-chapter-nav`（目錄列）—— 手機上直接捲比點目錄快，
  而且它跟下方章節標題內容完全重複。桌機維持顯示。

### P2 — 修掉雙重 gate（解決「空白」）

**P2-1.** `assets/js/ink-text-reveal.js` 的 target 清單與 `.reveal` 重疊。
改為：如果元素已經有 `.reveal`，就**不再**加 `ink-text-reveal`，交給 `.reveal` 單獨負責。
一個元素只由一套系統控制。

**P2-2.** `.ink-text-reveal` 的 `clip-path: circle()` 動畫成本高且是 5 個標題共用的
「同一個特效」，本身也是 AI 味來源之一 → 改為只留 opacity + translateY，
與站上其他頁面的 `.reveal` 一致。

### P3 — 打破重複節奏（解決「像 AI 做的」）

以下都只動 `src/pages/dragon-lion-introduction.html` 與
`css/pages/dragon-lion-introduction.css`，不動 `base.css`、不動品牌色。

**P3-1. `.intro-values` 從編號改成文化符號**
`01 / 02 / 03` → `醒 / 聚 / 納` 三個書法字（`--font-calligraphy`，硃砂色）。
內文本來就在講這三個字，改完之後編號清單全站只剩「演出流程」一處，
而那一處是真的有先後順序的。

**P3-2. h2 筆刷底線只留一處**
`::after` 的斜筆刷從 5 個標題縮到 **1 個**（開場的「醒、聚、納」）。
其餘標題改用各自不同的收尾方式，避免五段長得一樣。

**P3-3. kicker 三件組差異化**
- `.intro-overview`：kicker 保留金色短線（作為全頁第一個，建立語彙）。
- `.intro-comparison`：kicker 改為與 `獅／龍` 對仗呼應的置中細線分隔。
- `.intro-process`：深色區塊，kicker 改為與流程軸線對齊的起點記號。
- `.intro-faq`：kicker 去掉裝飾線，純文字小標。
- `.intro-contact-band`：去掉 kicker，讓最後一段直接以大標開場（收尾要乾脆）。

**P3-4. 背景巨大書法字只留一個**
保留 `.intro-process::after` 的「醒 聚 納」（跟該區內容直接相關），
移除 `.intro-contact-band::before` 的「福」（純裝飾、與文案無關）。

**P3-5. 移除重複 CTA**
`.intro-chapter-nav` 內的 `.intro-chapter-actions`（詢問檔期／查看表演項目）移除。
同一頁的同一組 CTA 從 3 次降為 2 次（敘事結尾 1 次 + 頁尾 contact band 1 次）。

**P3-6. FAQ 版面**
`.intro-faq-layout` 的 `0.72fr / 1.28fr` + sticky 標題會在左欄留下大片空白。
改為標題橫跨整寬、FAQ 清單在下方兩欄以外的單欄，消除空白區。

---

## 三、不做的事

- 不動桌機版 hero 的 430vh 捲動敘事（使用者明確指定）。
- 不動 `css/base.css` 的 design token 與品牌色。
- 不動 `_site/`（建置產物）與根目錄的舊 HTML 複本（那些是 legacy，實際來源是 `src/`）。
- 不刪除 `assets/ink-run/` 任何影格（桌機仍在用 `d/`；手機只是不再下載 `m/` 的 45 張）。

---

## 四、驗證結果（已完成）

| # | 檢查項 | 結果 |
|---|---|---|
| 1 | `npm test`（unit + build + links + backend） | ✅ 5 tests pass／938 local refs／backend contract pass |
| 2 | 375px：iframe 影格請求數 | ✅ **46 → 1**（只抓 f00，省約 1.2 MB） |
| 3 | 375px：`__inkLion.mode` | ✅ `static`，`frame()` 不再排下一幀 |
| 4 | 375px：`#mist` / `#blooms` | ✅ `display: none`（濾鏡鏈離開 render tree） |
| 5 | 375px：`.reveal` opacity | ✅ 11/11 皆為 `1`，不靠捲動 |
| 6 | 375px：`.ink-text-reveal` 元素數 | ✅ 0（第二套系統已移除） |
| 7 | 375px：首頁 `document.getAnimations()` | ✅ `0`（Ken Burns 迴圈已關，交叉淡化保留） |
| 8 | 375px：橫向溢出／<44px 觸控目標 | ✅ 皆無 |
| 9 | 375px：捲到「文化精神」的距離 | ✅ **2869px → 1794px（−37%）**；全頁 8074 → 6999 |
| 10 | 1280px：`__inkLion.mode` | ✅ `scrub`、46 格、`.ink-scroll-space` 3440px —— 桌機未受影響 |
| 11 | 全頁對比稽核（WCAG AA） | ✅ **0 failures**（修掉 3 處，見下） |

### 實作過程中額外發現並修掉的問題

1. **`序` 印章對比 1.79:1** —— 我新加的印章被該區既有的
   `.intro-process .intro-section-kicker::before { background: #ddb77b }` 蓋掉背景色，
   變成米白字壓金底。改為金底＋墨色字，**8.60:1**。
   （同時避開專案規範「硃砂只給 CTA」。）
2. **contact band 內文 4.46:1** —— `--ink-soft` 壓在較深的 `#e9ded1` 上差一點沒過 AA，
   該段改用 `#594f47`。
3. **水墨獅頭圖說英文 2.43:1** —— `rgba(76,51,41,0.45)` @ 10.5px，
   改為 `--ink-soft` @ 0.72rem，**5.70:1**。
4. **第四套進場系統** —— 首頁 `index.html` 內嵌的 `.about-fade-paragraph`
   （另一個 IntersectionObserver）不在原本的手機靜態規則內，已補進 `responsive.css`。

### 與原計畫的差異

- **P2-2 做得比計畫更徹底**：原計畫是把 `.ink-text-reveal` 的 `clip-path` 簡化。
  實作時發現它的 10 個 target **全部**都在 `.reveal` 內（或本身就是 `.reveal`），
  也就是這套系統從頭到尾都是多餘的第二層 gate。因此直接移除
  `<script src="ink-text-reveal.js">` 與相關 CSS，統一交給站上共用的 `.reveal`。
  → `assets/js/ink-text-reveal.js` 已於使用者確認後刪除（`git rm`）。
  建置產物由 316 → 315 檔，`check:links` 938 refs 全通過，頁面 console 無錯誤。
  唯一殘留引用在根目錄 `pages/dragon-lion-introduction.html`——那是 pre-Eleventy 的
  過期複本，不建置也不部署（見下）。
- **`.claude/launch.json` 改為 `--directory _site`**，`CLAUDE.md` 的 Project 段同步更新：
  原本寫「Main files: `*.html`, `script.js`」並要求從專案根目錄起 server，
  但那些根目錄檔案是 pre-Eleventy 的過期複本，實際來源已是 `src/` → `_site/`。
  已改寫成「該編輯什麼／不該編輯什麼」，並補上 `?v=` cache token 的 bump 規則。
- 快取版本 token 全站由 `20260727-mobile1` / `20260718-mobile1` 統一 bump 為
  `20260728-static1`（`css/style.css` 的 11 個 `@import` + 22 個 HTML）。

### 已知限制

- 桌機版 `.ink-scroll-space`（430vh + sticky）在瀏覽器面板截圖會拍成空白，
  WebGL canvas 則一律拍成純黑（`preserveDrawingBuffer: false`）。
  兩者皆為截圖工具假象：已用 `gl.readPixels()`（同 task 內先 render）確認
  實際輸出為紙白 255,255,255 + 墨色 184,181,188，渲染正常。
  桌機 layout 改以 `getBoundingClientRect()` 幾何斷言驗證。
- 首頁 hero 標題的 `--hero-progress` 捲動視差**保留**：它是 rAF-throttled 且
  只動 opacity/transform，屬於 compositor-only，不是造成手機掉幀的那類迴圈。

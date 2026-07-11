# 水墨獅 AI 影格替換計畫

狀態：等待 Higgsfield 充值（2026-07-10 記錄，當時餘額 1 credit / free plan）。
目標頁：`pages/ink-dragon-scroll.html`（水墨手卷，已完成整頁結構與向量佔位獅）。

## 已完成、不需重做的部分

- 500vh 卷軸 + sticky 舞台、lerp 阻尼捲動（`__inkLion` 除錯把手，`snap(v)` 可跳進度）
- 開場墨暈現身遮罩（`#reveal`）、遠山/中山/雲霧視差、地面筆觸、遠龍掠空、朱紅印章收勢
- 速度曲線（起步→巡航→減速）與世界距離 D；騰躍段 runT 0.43–0.59
- 章節錨點：現身 0.06 / 起步 0.30 / 騰躍 0.50 / 收勢 0.92（未來歷史文字掛這裡）

## 充值後的製作流程

1. **風格參考**：用 `images/獅頭側面-1024.webp`（自家獅頭）當 image ref。
2. **生成**：`generate_image` 做一張「水墨大寫意南獅側面全身、面向左、宣紙底 #F5F0E6」定風格
   → `generate_video` 生成 2–3 秒側面奔跑循環（鏡頭固定、背景乾淨紙色）。
3. **抽影格**：`ffmpeg -i run.mp4 -vf fps=12 frame_%02d.png`，約 24–36 幀，
   去背或保留紙色底皆可（紙色一致就不用去背），轉 webp 存 `images/ink-lion-frames/`。
4. **接入頁面**：把 `#lion` 內容換成一個 `<image width≈520 height≈420>`，
   每幀 `href = frames[Math.floor(D / STRIDE) % N]`（D 已存在於主迴圈）；
   外層的 bob / lean / jump transform 與 `#reveal` 遮罩不動。
   立定（stance）用第 0 幀，騰躍段可另生成 4–6 幀跳躍姿勢或沿用跑姿 + jump 位移。

## 驗證備忘

- preview 分頁隱藏時 rAF 凍結：截圖前先 `__inkLion.snap(進度)` 再截。
- 手機驗 375×812：`lionScale` 會自動收縮（autofit 除數 660，換影格後依圖寬調整）。

# 每一頁的任務與驗收標準

本文件是所有公開頁與管理頁的產品規格。每頁都要回答：

1. 這一頁服務哪一種訪客？
2. 訪客看完要做什麼？
3. 需要記錄哪個轉換事件？
4. 什麼情況才算完成？

## 全站共通規則

- 主 CTA：`LINE 詢問檔期與報價`。
- 次 CTA：依頁面情境使用電話、填寫需求或查看案例。
- CTA 文案要說明下一步，不使用只有「了解更多」的模糊文字。
- 101 等知名場域只出現在相關案例中，不放入全站共通信任列。
- 所有公開表單都要保留無 JavaScript 的可理解失敗狀態。
- 手機 390px 與桌機 1280px 不可水平溢出。
- 手機固定快速列不可遮住最後一段內容或送出按鈕。
- 每頁只保留一個 H1，圖片有符合內容的替代文字。

## 頁面總表

| 路徑 | 頁面任務 | 主要 CTA | 後台／分析需求 |
|---|---|---|---|
| `/` | 讓新訪客在 10 秒內理解南仙提供什麼、服務哪裡、如何詢價 | LINE 詢問檔期與報價 | `home_cta_click`、活動情境點擊 |
| `/pages/about.html` | 建立團隊、訓練、文化與現場執行的信任 | 聯絡洽詢 | `about_cta_click` |
| `/pages/services.html` | 幫訪客選擇適合的演出項目 | 洽詢此項目 | 記錄 `service` 並預填表單 |
| `/pages/dragon-lion-introduction.html` | 教育第一次接觸龍獅演出的訪客 | 詢問檔期 | `intro_cta_click`、FAQ 展開 |
| `/pages/ink-dragon-scroll.html` | 水墨互動的技術支援頁，不作為獨立到達頁 | 無 | `noindex`、效能與降級驗收 |
| `/pages/contact.html` | 蒐集可直接判斷檔期與報價的完整需求 | 送出洽詢 | 建立 Lead、通知、成功頁 |
| `/pages/privacy.html` | 說明詢價資料如何蒐集、使用與刪除 | 聯絡資料窗口 | 保存期限需業主確認 |
| `/gallery/` | 依活動類型找到相似案例 | 查看案例／洽詢相似活動 | 案例分類點擊 |
| `/gallery/opening.html` | 證明開幕開工與儀式流程經驗 | 洽詢開幕演出 | 預填 `eventType=opening` |
| `/gallery/banquet.html` | 證明春酒尾牙的炒場與流程配合 | 洽詢尾牙演出 | 預填 `eventType=banquet` |
| `/gallery/tourism.html` | 證明觀光與定點展演能力 | 洽詢觀光展演 | 預填 `eventType=tourism` |
| `/gallery/funeral.html` | 說明追思儀式的莊重尺度與流程 | 洽詢追思儀式 | 預填 `eventType=memorial` |
| `/gallery/groundbreaking.html` | 證明動土上樑儀式與場地配合 | 洽詢動土演出 | 預填 `eventType=groundbreaking` |
| `/gallery/festival-retail.html` | 呈現百貨、春節與週年慶案例；101 案例放在此處 | 洽詢商場節慶 | 預填 `eventType=retail` |
| `/gallery/temple.html` | 證明廟會、繞境與祝壽流程經驗 | 洽詢廟會演出 | 預填 `eventType=temple` |
| `/gallery/school.html` | 呈現校園、社團與企業教學 | 洽詢教學活動 | 預填 `eventType=education` |
| `/gallery/performance.html` | 呈現遊行、造勢、演唱會與拍攝支援 | 洽詢展演服務 | 預填 `eventType=production` |
| `/landing/dragon-lion-dance-performance.html` | 承接「舞龍舞獅表演」搜尋需求 | 聯絡洽詢 | 保留搜尋關鍵字來源 |
| `/landing/lion-dance-performance.html` | 承接「舞獅表演」搜尋需求 | 聯絡洽詢 | 預填 `service=lion_dance` |
| `/landing/opening-lion-dance.html` | 承接「開幕舞獅」高意圖需求 | 詢問開幕檔期 | 預填活動類型與服務 |
| `/landing/company-event-lion-dance.html` | 承接企業活動主辦人 | 洽詢企業方案 | 預填 `eventType=company` |
| `/landing/year-end-party-lion-dance.html` | 承接尾牙春酒季節需求 | 詢問尾牙檔期 | 預填 `eventType=banquet` |
| `/landing/lion-dance-price-guide.html` | 解釋報價因素並篩選有效詢價 | 取得個別報價 | `price_guide_cta_click` |
| `/admin/` | 管理網站文案、服務、FAQ、相簿與圖片 | 發布內容 | Sveltia CMS，不存業務案件 |
| `/admin/image-guide.html` | 教編輯者準備與上傳圖片 | 返回內容後台 | 不需公開索引 |
| `/crm/` | 管理詢價、跟進、狀態、匯出與銷售指標 | 處理待跟進案件 | Auth、RLS、稽核與 OWNER 匯出 |
| `/googlec17fc805b7cef4a4.html` | Google 站點驗證 | 無 | 不改內容 |

## 首頁 `/`

### 內容順序

1. 南仙品牌與演出現場 Hero。
2. 「台北／全台服務」與主要 CTA。
3. 南仙自身的四項能力證據。
4. 依活動情境選擇演出。
5. 代表案例與演出項目。
6. 四步預約流程。
7. LINE、電話、表單 CTA。

### 驗收

- 首屏不使用 101 作為品牌信任標題。
- 首屏能直接看到服務類型、服務區域與 LINE CTA。
- 主要 CTA 帶入 `sourcePage=/`。
- 代表案例至少涵蓋兩種不同活動情境。

## 服務頁 `/pages/services.html`

每個服務卡必須包含：

- 適合場合。
- 場地或流程提醒。
- 可搭配的其他節目。
- 「洽詢這個項目」按鈕，將服務代碼帶到聯絡頁。

避免每張卡都只寫抽象的氣勢與文化形容詞。

## 案例頁 `/gallery/*`

每個案例分類除了照片，至少要有：

- 活動情境。
- 常見場地條件。
- 建議演出組合。
- 主辦人需要先準備的資訊。
- 洽詢相似活動 CTA。

101 可以出現在 `/gallery/festival-retail.html` 或相關開幕案例中；文案描述南仙做了什麼，不把場域名稱當成唯一賣點。

## SEO 到達頁 `/landing/*`

- 搜尋意圖必須與 H1、首段、案例與 CTA 一致。
- 不堆砌重複關鍵字。
- CTA 將活動類型、服務與 `sourcePage` 預填到聯絡頁。
- 每頁至少連到一個服務頁、一個案例頁與報價指南。

## 聯絡頁 `/pages/contact.html`

### 必填欄位

- 姓名
- 電話、LINE 或 Email 至少一項
- 活動日期；未知時可勾選「日期未定」
- 活動縣市／地區
- 活動類型
- 需求說明
- 個資與聯絡同意

### 選填欄位

- 公司／單位
- 預計演出項目
- 場地類型
- 預算區間
- 偏好的回覆方式

### 成功狀態

- 顯示案件編號。
- 說明預計回覆時間；具體時間需由業主確認後才能上線。
- 提供 LINE 快速聯絡。
- 不因通知 Email 失敗而遺失案件。

## 內容後台 `/admin/`

用途只包含內容與圖片，不和案件 CRM 混為同一個資料模型。需要：

- 清楚標示「內容管理」。
- 提供前台預覽與圖片規範。
- 發布後顯示建置狀態或說明等待時間。

## 案件後台 `/crm/`

介面與 API 已建立；未設定公開 Supabase URL 時顯示安全的設定引導，不會假裝登入或顯示測試案件。詳細規格見 [BACKEND_SYSTEM_README.md](BACKEND_SYSTEM_README.md)，啟用步驟見 [SUPABASE_CRM_SETUP.md](SUPABASE_CRM_SETUP.md)。它負責詢價案件、跟進、狀態、搜尋、匯出與報表，不負責改網站內容。

## 隱私政策 `/pages/privacy.html`

- 說明蒐集欄位、使用目的、分享範圍、資料安全與聯絡窗口。
- 正式保存期限與定期刪除流程不得由開發者猜測，必須由業主確認。
- 聯絡表單同意文字直接連到此頁。

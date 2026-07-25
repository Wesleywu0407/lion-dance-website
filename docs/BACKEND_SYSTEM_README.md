# 詢價後台與 CRM 規格

## 目標

把網站從「寄一封表單信」升級為「每筆詢價都能被保存、跟進與成交分析」的接案系統。

內容後台與業務後台分開：

- `/admin/`：既有 Sveltia CMS，管理網站內容。
- `/crm/`：新案件後台，管理詢價與跟進。

## 建議架構

前台繼續使用 Eleventy 與靜態部署。後端建議採用：

- Supabase Postgres：案件資料庫。
- Supabase Auth：後台 Email magic link 登入。
- Supabase Edge Function：接收公開表單，避免前台持有高權限金鑰。
- Row Level Security：只有已授權管理員能讀寫案件。
- Cloudflare Turnstile：防垃圾表單。
- Email 服務：寄送新案件通知與訪客收件確認。

此為技術建議；建立雲端專案、金鑰與正式部署前需要網站擁有者確認。

## 案件狀態

```text
NEW
→ CONTACTED
→ QUALIFIED
→ QUOTING
→ WON

任一階段也可轉為 LOST、SPAM 或 ARCHIVED
```

狀態定義：

- `NEW`：新送出、尚未處理。
- `CONTACTED`：已第一次聯絡。
- `QUALIFIED`：日期、地點與需求足以評估。
- `QUOTING`：已提供或準備報價。
- `WON`：已確認合作。
- `LOST`：未成交，需記錄原因。
- `SPAM`：垃圾內容。
- `ARCHIVED`：不再顯示於日常工作列。

## 資料模型

### Lead

```text
id
publicId
status
name
company
phone
lineId
email
preferredContact
eventDate
dateFlexible
eventCity
venue
eventType
services[]
budgetRange
guestCount
message
sourcePage
referrer
utmSource
utmMedium
utmCampaign
consentAt
assignedTo
firstContactedAt
nextFollowUpAt
wonAt
lostReason
createdAt
updatedAt
```

### LeadActivity

```text
id
leadId
type
note
fromStatus
toStatus
createdBy
createdAt
```

活動類型包含：建立、狀態變更、電話、LINE、Email、備註、安排跟進、匯出。

### AdminUser

```text
id
email
displayName
role
active
createdAt
lastLoginAt
```

第一版角色：

- `OWNER`：查看、編輯、匯出、管理使用者。
- `SALES`：查看與跟進案件。

## 公開表單 API

### `POST /api/inquiries`

輸入：

```json
{
  "name": "王先生",
  "phone": "0912345678",
  "lineId": "",
  "email": "",
  "company": "活動公司",
  "eventDate": "2026-09-18",
  "dateFlexible": false,
  "eventCity": "台北市",
  "eventType": "opening",
  "services": ["lion_dance", "war_drum"],
  "budgetRange": "discuss",
  "preferredContact": "line",
  "message": "上午開幕，希望有採青流程",
  "sourcePage": "/landing/opening-lion-dance.html",
  "utm": {
    "source": "google",
    "medium": "organic",
    "campaign": ""
  },
  "consent": true,
  "turnstileToken": "..."
}
```

成功回應：

```json
{
  "ok": true,
  "inquiryId": "NS-20260725-0001"
}
```

### 驗證規則

- 姓名、活動地區、活動類型、需求說明必填。
- 電話、LINE 或 Email 至少一項。
- 日期或「日期未定」必須二選一。
- 同意聯絡與個資使用必填。
- 所有字串有長度上限。
- 伺服器驗證 Turnstile、Origin、速率與 honeypot。
- Email 通知失敗不能回滾已成功寫入的案件。

## 管理 API

- `GET /api/admin/leads`：搜尋、狀態、日期、活動類型、地區與負責人篩選。
- `GET /api/admin/leads/:id`：案件與完整活動紀錄。
- `PATCH /api/admin/leads/:id`：更新欄位、狀態與下次跟進日。
- `POST /api/admin/leads/:id/activities`：新增電話、LINE、Email 或備註紀錄。
- `GET /api/admin/leads/export.csv`：依目前篩選條件匯出。
- `GET /api/admin/dashboard`：新案件、待跟進、報價中、成交與來源統計。

## `/crm/` 頁面

### 登入

- Email magic link。
- 未授權 Email 即使收到連結也不能讀資料。
- 登入失敗不顯示帳號是否存在。

### Dashboard

- 今日／本週新案件。
- 超過跟進日期的案件。
- 報價中案件。
- 本月成交案件。
- 來源頁與活動類型分布。

### 案件列表

- 預設先顯示 `NEW` 與逾期跟進。
- 支援關鍵字、狀態、日期、地區、類型、負責人篩選。
- 每列顯示姓名、活動日、地區、類型、狀態、負責人、下次跟進。

### 案件詳細頁

- 左側：客戶與活動資料。
- 右側：狀態、負責人、下次跟進。
- 下方：依時間排列的活動紀錄。
- 電話與 LINE 可直接點擊。
- 所有狀態變更寫入活動紀錄。

## 通知

新案件建立後：

1. 立即寫入資料庫。
2. 寄送內部通知給指定管理員。
3. 寄送訪客收件確認。
4. 通知失敗寫入系統紀錄並可重試。

不要在通知信中暴露不必要的個資；後台連結需登入。

## 安全與隱私

- 前台只使用公開 API URL 與 Turnstile site key。
- Service role、資料庫密碼與 Email API key 只存在伺服器環境。
- Supabase 所有案件表啟用 RLS。
- 公開端點使用 durable rate limit，不使用只存在單一記憶體的計數器。
- 管理操作寫入稽核紀錄。
- CSV 匯出僅限 `OWNER`。
- 隱私政策說明蒐集目的、欄位、使用方式、保存期限與聯絡窗口。
- 保存期限與刪除流程必須由業主確認後上線。

## 第一版不做

- 線上付款。
- 自動產生正式報價單。
- 自動承諾可接檔期。
- 直接同步私人 LINE 對話。
- 未經確認的 AI 自動回覆。

第一版先確保「不漏案、看得懂、跟得到、能統計」。

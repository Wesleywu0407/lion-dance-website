# Sveltia CMS GitHub 登入設定

網站後台已可用 GitHub Personal Access Token 測試。要讓編輯者直接按「使用 GitHub 登入」，需完成一次 Cloudflare Worker 與 GitHub OAuth 設定。

## 1. 部署官方驗證器

1. 開啟 [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth)。
2. 使用頁面上的 **Deploy to Cloudflare Workers**，或依官方說明以 Wrangler 部署。
3. 記下 Worker 網址，例如 `https://sveltia-cms-auth.example.workers.dev`。

## 2. 建立 GitHub OAuth App

在 GitHub 的 **Settings → Developer settings → OAuth Apps → New OAuth App** 建立應用程式：

- Application name：`南仙網站內容管理`
- Homepage URL：`https://nansiengtaiwan.com/admin/`
- Authorization callback URL：`<Worker 網址>/callback`

建立後產生 Client Secret，記下 Client ID 與 Client Secret。

## 3. 設定 Worker 環境變數

在 Cloudflare Worker 的 **Settings → Variables and Secrets** 設定：

- `GITHUB_CLIENT_ID`：GitHub OAuth App 的 Client ID。
- `GITHUB_CLIENT_SECRET`：以 Secret 形式儲存，絕對不要提交到 Git。
- `ALLOWED_DOMAINS`：`nansiengtaiwan.com,www.nansiengtaiwan.com`

儲存後重新部署 Worker。

## 4. 啟用 CMS OAuth

編輯 `src/admin/config.yml` 的 `backend`：

```yaml
backend:
  name: github
  repo: Wesleywu0407/lion-dance-website
  branch: main
  auth_methods: [oauth]
  base_url: https://sveltia-cms-auth.<你的 Cloudflare 子網域>.workers.dev
```

執行 `npm test`，提交並推送到 `main`。部署完成後，以無痕視窗開啟 `https://nansiengtaiwan.com/admin/` 測試 GitHub 登入。

## 5. 加入編輯者

每位編輯者需要 GitHub 帳號，並由 repository 管理者將帳號加入 `Wesleywu0407/lion-dance-website` 的 collaborator。只授予完成內容編輯所需的最低權限。

## 驗收

- 編輯者不需建立 Token，可直接以 GitHub 登入。
- 修改一筆服務說明並發布後，GitHub Actions 成功完成。
- 線上頁面在兩分鐘左右更新，版面與連結正常。

官方參考：

- [Sveltia CMS GitHub backend](https://sveltiacms.app/en/docs/backends/github)
- [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth)

# GitHub Pages + Render：台南市即時環境資訊（隱藏 API Key）

## 架構
- GitHub Pages：只放 `public/index.html`，提供公開網頁。
- Render：執行 `server.js`，保管 API Key，提供 `/api/cwa` 與 `/api/aqi`。
- 前端的 API_BASE_URL 必須改成 Render 實際提供的服務網址。

## A. GitHub Pages 前端
1. 將 `public/index.html` 放進 GitHub repository。
2. 在 `index.html` 找到：
   `const API_BASE_URL = "https://YOUR-RENDER-SERVICE.onrender.com";`
3. 部署 Render 後，把它改成 Render 真正提供的網址（不要加結尾斜線）。
4. GitHub Pages 設定完成後，記下網站來源，例如 `https://YOUR-USERNAME.github.io`。
   - 如果網址是 `https://YOUR-USERNAME.github.io/REPOSITORY/`，CORS 的 origin 仍然只填 `https://YOUR-USERNAME.github.io`，不含路徑。

## B. Render 後端
1. 建立一個 GitHub repository，放入 `server.js` 和 `package.json`（也可用同一 repository，但要確認 Render Root Directory 設定正確）。
2. 在 Render 建立 Web Service，連接該 repository。
3. Build Command：`npm install`
4. Start Command：`npm start`
5. 在 Render 的 Environment Variables 設定：
   - `CWA_API_KEY` = 你的中央氣象署 API Key
   - `MOENV_API_KEY` = 你的環境部 API Key
   - `FRONTEND_ORIGIN` = 你的 GitHub Pages 網域來源，例如 `https://YOUR-USERNAME.github.io`
6. 部署後，測試 `https://YOUR-RENDER-SERVICE.onrender.com/api/aqi` 與 `/api/cwa` 是否回傳 JSON。

## C. 安全提醒
- 不要把真實 API Key 放在 HTML、公開 GitHub repository、提交紀錄或 README。
- 只把金鑰填入 Render 的 Environment Variables。
- GitHub Pages 是靜態主機，不能執行 `server.js`；後端必須部署到支援 Node.js 的服務。
- CORS 只是限制哪些瀏覽器來源可讀取回應，並不是身分驗證。公開代理端點仍可能被其他程式直接呼叫，因此公開上線前應考慮請求頻率限制與快取。
- 若金鑰曾經公開，建議在供應商平台檢查使用情況，並視情況輪替金鑰。

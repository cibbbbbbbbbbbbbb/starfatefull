STAR FATE｜星命籤｜商業化內容與 UTF-8 完整升級版

本版本直接在原 STAR FATE 專案上升級，保留原本的深色星空、命運之星、單人占卜、會員與雙人 OUR FATE 核心體驗。

本次重點
1. 全站統一 UTF-8、zh-TW，HTML charset 位於 head 第一個宣告。
2. 全面掃描 HTML / CSS / JS / JSON / TXT / XML，移除常見中文亂碼與錯誤轉碼。
3. 分享資料改用 TextEncoder / TextDecoder，避免 Latin-1、Big5、GBK 轉碼造成的中文損壞。
4. 新增探索內容入口：10 個分類、每類 5 篇，共 50 篇正式繁體中文內容；每篇都有標題、副標題、分類、閱讀時間、日期、封面、摘要、正文、重點、思考問題、測驗／解析／推薦服務入口。
5. 新增 5 項付費產品完整詳情：個人深度命盤解析 NT$299、感情深度解析 NT$399、雙人關係深度解析 NT$599、年度人生趨勢解析 NT$499、人生方向探索 NT$699。
6. 新增產品詳情、確認訂單、付款、付款結果、完整解析結果頁。
7. 新增開發環境限定測試付款；正式環境不會偽造付款成功。
8. 雙人動畫縮短至約 3.2 秒，兩側不同色光線高速匯聚至中央命運星並爆發光芒，保留雙人結果星星由原 deterministic engine 決定。
9. 出生日期統一限制 1900-01-01 至今日；前端與後端皆驗證。
10. Google OAuth 保留真正 OAuth 架構，Client Secret 僅存在伺服器環境變數。

啟動
A. 純前端預覽：在專案目錄執行任何靜態伺服器，例如 `python -m http.server 8000`，開啟 http://localhost:8000/。
B. Google OAuth / API：先 `npm install`，再設定 GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、GOOGLE_REDIRECT_URI、SESSION_SECRET，最後 `npm start`。

正式啟用前
- 付款：替換 /api/orders/checkout 或串接正式金流，並由後端建立訂單與付款狀態；目前測試付款只允許 localhost。
- Google：在 Google Cloud Console 建立 OAuth Client，設定授權重新導向 URI。
- 資料庫：目前 server.js 使用記憶體 Map 作為 OAuth 示範儲存，正式環境應改成資料庫與持久 Session。
- 管理員：目前 admin.html 仍是前端示範閘門，正式環境必須改成後端 RBAC / IAM。
- 退款：正式金流上線後，依實際退款政策與交易狀態實作，不預先虛構退款承諾。

重要
星命籤內容屬娛樂、自我探索與反思用途，不是醫療、法律或財務專業建議。

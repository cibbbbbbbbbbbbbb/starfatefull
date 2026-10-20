# STAR FATE 完整升級檢查表

## UTF-8 / 中文品質
- [x] 全部 HTML 改為 `lang="zh-TW"`
- [x] 所有 HTML `meta charset="UTF-8"` 位於 head 第一個宣告
- [x] HTML / JS / CSS / JSON / TXT / XML 以 UTF-8 儲存
- [x] 全站掃描 `Ã Â æ ç å é �`，目前無命中
- [x] 移除 Lorem ipsum、XXXX、測試內容等正式內容禁詞
- [x] 分享資料由 TextEncoder / TextDecoder 處理
- [x] API JSON Response 明確標示 `application/json; charset=utf-8`
- [x] API HTML / text 錯誤訊息改為繁體中文

## 探索
- [x] 10 個內容分類
- [x] 每類 5 篇，共 50 篇
- [x] 每篇含標題、副標題、分類、閱讀時間、日期、封面、摘要、正文、重點、思考問題
- [x] 每篇含「開始測驗」「查看完整解析」「推薦服務」
- [x] 新增 article.html 詳細文章頁

## 產品
- [x] 個人深度命盤解析 NT$299
- [x] 感情深度解析 NT$399
- [x] 雙人關係深度解析 NT$599
- [x] 年度人生趨勢解析 NT$499
- [x] 人生方向探索 NT$699
- [x] 每個產品都有詳情、適合誰、內容、資料需求、完成後結果、FAQ、購買入口
- [x] 新增 product-detail.html

## 訂單 / 付款
- [x] 產品詳情 → 確認訂單 → 付款 → 付款結果 → 生成解析 → 會員中心
- [x] 測試付款僅限 localhost / 127.0.0.1
- [x] 正式環境沒有假付款成功
- [x] 測試訂單與結果可保存於本機示範資料

## 命運引擎
- [x] 單人 deterministic engine 保留
- [x] 1900-01-01 至今日日期驗證
- [x] 雙人前端日期驗證
- [x] 雙人後端日期驗證
- [x] 雙人動畫約 3.2 秒、手機可用

## 會員 / OAuth
- [x] Email 登入、註冊、忘記密碼保留
- [x] Google 登入介面存在
- [x] OAuth Client Secret 不在前端
- [x] MY FATE 顯示解析、訂單、收藏、帳戶、重新查看、登出

## 技術驗證
- [x] JavaScript `node --check` 通過
- [x] JSON 語法檢查通過
- [x] HTML script src 全部可解析到現有檔案
- [x] 50 篇探索資料由程式驗證
- [x] 日期驗證測試：200 / 300 / 500 年全部拒絕
- [x] 1900-01-01 可通過
- [ ] 正式 Node API 執行：需先 `npm install` 安裝 Express / google-auth-library

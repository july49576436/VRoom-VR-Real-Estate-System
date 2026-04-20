# VRoom VR Real Estate System

VRoom 是一套以看屋決策為核心的房地產資訊系統，整合建案資料、價格資訊、社區規劃、最新消息、周邊資訊，以及 3D / VR 沉浸式導覽。

## 專題核心成果

- 專題名稱：VRoom-VR 看房系統
- 專題成果：中原大學資訊管理學系專題初賽第一名
- 競賽成果：第 29 屆大專校院資訊應用服務創新競賽入圍決賽
- 應用價值：結合 3D 建模與 VR 技術，對應實際看屋與資訊判斷情境

## 個人主責與能力說明

我負責前後端開發與資料庫整合。透過 Node.js 串接 MySQL，完成建案主資料、圖片、價格紀錄、社區規劃、最新消息、周邊設施與搜尋條件等模組的 CRUD 流程。實作內容包含 API 路由規劃、請求參數處理、資料新增與更新邏輯、關聯資料刪除處理，以及查詢結果格式化，讓前端頁面可以正常顯示與操作。

在實作過程中，我也持續進行整合測試與錯誤情境檢查，例如欄位缺漏、ID 無效、查無資料與資料庫回應錯誤等情況，並盡量維持一致的 API 訊息格式，提升除錯效率與後續維護性。

透過本專題，累積從需求分析、系統設計、資料庫建模、前後端整合到最終展示驗收的完整專案實作經驗。

## 技術棧

- Backend：Node.js, Express
- Database：MySQL (mysql2)
- Frontend：HTML, CSS, JavaScript, jQuery
- 3D / VR：Three.js, WebXR, GLTFLoader, OrbitControls

## 專案結構

```text
vr/
├─ server.js                # Express 入口與 API 路由
├─ database.js              # MySQL 連線設定
├─ dynamicContent.js        # 內容查詢與資料整合
├─ search.js                # 建案搜尋邏輯
├─ package.json
├─ public/
│  ├─ index.html            # 首頁
│  ├─ house.html            # 建案詳細頁
│  ├─ VR.html               # VR 看屋主頁
│  ├─ VR_acene.html         # 360 熱點位置編輯頁
│  ├─ add_house2.html       # 登入後導向頁
│  ├─ test.html             # 測試頁
│  ├─ 3D_data/              # GLB 模型
│  ├─ 360_Photo_test/       # 360 全景素材
│  ├─ css/
│  ├─ javascript/
│  └─ image/
└─ VRoomDB/
   ├─ vroom_house.sql
   ├─ vroom_house_images.sql
   ├─ vroom_price.sql
   ├─ vroom_community_planning.sql
   ├─ vroom_latest_news.sql
   ├─ vroom_surrounding_fac.sql
   ├─ vroom_searchfilters.sql
   └─ vroom_auth_and_vr_tables.sql
```

## 執行環境需求

- Node.js 18+
- npm 9+
- MySQL 5.7+ 或 8.x

## 快速啟動

### 1. 安裝套件

```bash
npm install
```

### 2. 建立資料庫與匯入 SQL

先建立資料庫 `vroom`，再匯入以下檔案：

1. `VRoomDB/vroom_house.sql`
2. `VRoomDB/vroom_house_images.sql`
3. `VRoomDB/vroom_price.sql`
4. `VRoomDB/vroom_community_planning.sql`
5. `VRoomDB/vroom_latest_news.sql`
6. `VRoomDB/vroom_surrounding_fac.sql`
7. `VRoomDB/vroom_searchfilters.sql`
8. `VRoomDB/vroom_auth_and_vr_tables.sql`

### 3. 設定資料庫連線

請修改 `database.js`：

- host
- user
- password
- database

### 4. 啟動服務

```bash
npm start
```

啟動後可使用：

- http://localhost:3000

## 核心頁面

- `public/index.html`：系統首頁與登入入口
- `public/house.html`：建案主資料、價格、社區規劃、最新消息、周邊資訊
- `public/VR.html`：3D 模型瀏覽與 VR 進入
- `public/VR_acene.html`：360 熱點編輯與儲存
- `public/test.html`：測試用熱點編輯頁

## API 一覽

### 建案資料

- `GET /api/house?houseID=1`
- `GET /api/house/images?houseID=1`
- `GET /api/house/price?houseID=1`
- `GET /api/house/community-planning?houseID=1`
- `GET /api/house/latest-news?houseID=1`
- `GET /api/house/surrounding-facilities?houseID=1`
- `GET /api/search-filters`

### 首頁卡片清單

- `GET /api/recommendations`
- `GET /api/new-arrivals`
- `GET /api/price-drop`

### 搜尋

- `GET /search?city=...&district=...&priceRange=...&houseType=...`

### 3D / VR

- `GET /api/test/model?houseID=...`
- `GET /api/VR/model?houseID=...`
- `GET /api/VR-acene/model?houseID=...`
- `POST /api/savePosition`

### 登入

- `POST /login`

### 管理端 CRUD API

- House
1. `GET /api/admin/houses`
2. `POST /api/admin/houses`
3. `PUT /api/admin/houses/:houseID`
4. `DELETE /api/admin/houses/:houseID`

- House Images
1. `GET /api/admin/houses/:houseID/images`
2. `POST /api/admin/houses/:houseID/images`
3. `PUT /api/admin/images/:imageID`
4. `DELETE /api/admin/images/:imageID`

- Price
1. `GET /api/admin/houses/:houseID/prices`
2. `POST /api/admin/houses/:houseID/prices`
3. `PUT /api/admin/prices/:priceID`
4. `DELETE /api/admin/prices/:priceID`

- Community Planning
1. `GET /api/admin/houses/:houseID/community-planning`
2. `POST /api/admin/houses/:houseID/community-planning`
3. `PUT /api/admin/community-planning/:communityID`
4. `DELETE /api/admin/community-planning/:communityID`

- Latest News
1. `POST /api/admin/houses/:houseID/latest-news`
2. `PUT /api/admin/latest-news/:newsID`
3. `DELETE /api/admin/latest-news/:newsID`

- Surrounding Facilities
1. `GET /api/admin/houses/:houseID/surrounding-facilities`
2. `POST /api/admin/houses/:houseID/surrounding-facilities`
3. `PUT /api/admin/surrounding-facilities/:facilityID`
4. `DELETE /api/admin/surrounding-facilities/:facilityID`

- Search Filters
1. `GET /api/admin/search-filters`
2. `POST /api/admin/search-filters`
3. `PUT /api/admin/search-filters/:filterID`
4. `DELETE /api/admin/search-filters/:filterID`

## 主要資料表

- `house`
- `house_images`
- `price`
- `community_planning`
- `latest_news`
- `surrounding_fac`
- `searchfilters`
- `manager`
- `house_model`
- `house_model_floors`
- `house_model_floors_360`

## 驗收清單

- 首頁可顯示推薦 / 新上架 / 降價清單
- 可使用篩選條件進行建案搜尋
- 建案詳情頁可載入主資料與價格資料
- VR 頁可載入 3D 模型與 360 熱點
- 熱點座標可儲存並回寫資料庫

## 專案價值總結

本專題展示了從需求分析、系統設計、資料庫整合、前後端開發、3D / VR 應用到測試驗收的完整實作能力。對於資訊系統開發、資料整合與情境導向應用落地，具備可直接延伸至實務場域的價值。

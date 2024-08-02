const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const search = require('./search');//搜尋
const db = require('./database'); //資料庫


// 設置靜態文件夾
app.use(express.static('public'));

// 處理首頁請求
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // 回應 index.html
});

// 處理搜尋請求
app.use(express.json()); // 解 JSON 格式的請求主體
app.post('/search', (req, res) => {
  const query = req.body.query;
  const results = search(query); // 使用搜尋模組進行搜尋
  res.json({ results }); // 返回搜尋結果
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器正在運行在 http://localhost:${PORT}`);
});

//設置路由文件 要在 routes 資料夾中創建路由文件
//例如 houseRoutes.js:定義與房屋相關的路由。

//const express = require('express');
//const router = express.Router();
//const houseController = require('../controllers/houseController');

// 定義路由和對應的控制器方法
//router.get('/houses', houseController.getAllHouses);
//router.get('/houses/:id', houseController.getHouseById);

//module.exports = router;


// 載入路由文件
//const houseRoutes = require('./routes/houseRoutes');

// 使用路由
//app.use('/api', houseRoutes);


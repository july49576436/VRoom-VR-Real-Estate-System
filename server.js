const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const os = require('os'); // 引入 os 模組
const search = require('./search'); //搜尋
const db = require('./database'); //資料庫
const dynamicContent = require('./dynamicContent'); // 動態內容處理
const { save360ImagePosition } = require('./dynamicContent');
// 設置靜態文件夾
app.use(express.static('public'));
app.use('/image', express.static(path.join(__dirname, 'public/image')));
app.use('/test', express.static(path.join(__dirname, 'public/3D_data')));
app.use(express.json());

// 處理首頁請求
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // 回應 index.html
});
app.get('/api/house', (req, res) => {
  dynamicContent.fetchHouseDetails((err, result) => {
      if (err) {
          res.status(500).send('Error fetching house details');
          return;
      }
      res.json(result);
  });
});

app.get('/api/house/images', (req, res) => {
  dynamicContent.fetchHouseImages(1, (err, results) => {
      if (err) {
          res.status(500).send('Error fetching house images');
          return;
      }
      res.json(results);
  });
});
app.post('/api/savePosition', (req, res) => {
    const { houseModelFloors360ID, x, y, z } = req.body;
    console.log("Received data:", req.body);
    // 假設 save360ImagePosition 是已定義的函數
    save360ImagePosition(houseModelFloors360ID, x, y, z, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Database error', error: err });
        }
        res.json({ success: true });
    });
});

app.get('/api/house/price', (req, res) => {
  dynamicContent.fetchPriceInfo(1, (err, results) => {
      if (err) {
          res.status(500).send('Error fetching price information');
          return;
      }

      // Prepare the data to match the expected JSON format
      const formattedResults = results.map(result => ({
          TransactionDate: result.TransactionDate,
          Floor: result.Floor,
          PricePerUnit: result.PricePerUnit,
          RoomDetails: result.RoomDetails,
          TotalPrice: result.TotalPrice,
          avgprice: result.avgprice,
          twoyear: result.twoyear,
          threeyear: result.threeyear,
          otheryear: result.otheryear
      }));

      res.json(formattedResults);
  });
});

app.get('/api/house/community-planning', (req, res) => {
  dynamicContent.fetchCommunityPlanning(1, (err, result) => {
      if (err) {
          res.status(500).send('Error fetching community planning details');
          return;
      }
      res.json(result);
  });
});

app.get('/api/test/model', (req, res) => {
  const houseID = req.query.houseID;

  dynamicContent.fetchHouseModel(houseID, (err, results) => {
      if (err) {
          console.error('查詢錯誤:', err);
          res.status(500).send('伺服器錯誤');
          return;
      }
      res.json(results);
  });
});
app.get('/api/VR/model', (req, res) => {
  const houseID = req.query.houseID;

  dynamicContent.fetchHouseModel(houseID, (err, results) => {
      if (err) {
          console.error('查詢錯誤:', err);
          res.status(500).send('伺服器錯誤');
          return;
      }
      res.json(results);
  });
});

app.get('/api/VR-acene/model', (req, res) => {
    const houseID = req.query.houseID;
  
    dynamicContent.fetchHouseModel(houseID, (err, results) => {
        if (err) {
            console.error('查詢錯誤:', err);
            res.status(500).send('伺服器錯誤');
            return;
        }
        res.json(results);
    });
  });

app.get('/api/house/latest-news', (req, res) => {
  const houseID = req.query.houseID || 1; // 根據需要使用 houseID 參數
  dynamicContent.fetchLatestNews(houseID, (err, results) => {
      if (err) {
          res.status(500).send('Error fetching latest news');
          return;
      }
      res.json(results);
  });
});


app.get('/api/house/surrounding-facilities', (req, res) => {
  dynamicContent.fetchSurroundingFacilities(1, (err, result) => {
      if (err) {
          res.status(500).send('Error fetching surrounding facilities');
          return;
      }
      res.json(result);
  });
});

app.get('/api/search-filters', (req, res) => {
  dynamicContent.fetchSearchFilters((err, results) => {
      if (err) {
          res.status(500).send('Error fetching search filters');
          return;
      }
      res.json(results);
  });
});

function getNetworkAddress() {
    const interfaces = os.networkInterfaces();
    let preferredAddress = null;

    for (let name in interfaces) {
        for (let iface of interfaces[name]) {
            // 找到 IPv4 且不是內部位址 (如 127.0.0.1)
            if (iface.family === 'IPv4' && !iface.internal) {
                // 優先選擇 192.168.x.x 或 10.x.x.x 這些常見的內部位址
                if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
                    return iface.address;
                }
                // 如果沒有匹配到 192.168 或 10.x.x.x, 則先儲存其他地址 (如 26.x.x.x)
                if (!preferredAddress) {
                    preferredAddress = iface.address;
                }
            }
        }
    }
    
    // 如果沒有找到 192.168.x.x 或 10.x.x.x, 返回找到的其他地址
    return preferredAddress || '127.0.0.1'; // 如果無法找到，則返回 localhost
}

// 處理登入請求
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: '請輸入帳號和密碼' });
    }

    try {
        const query = 'SELECT * FROM manager WHERE LOWER(username) = ?';
        const [results] = await db.promise().query(query, [username.trim().toLowerCase()]);

        if (results.length > 0) {
            const user = results[0];
            if (password === user.password) {
                return res.json({ success: true });
            } else {
                return res.json({ success: false, message: '帳號或密碼錯誤' });
            }
        } else {
            return res.json({ success: false, message: '帳號或密碼錯誤' });
        }
    } catch (err) {
        console.error('伺服器錯誤:', err);
        return res.json({ success: false, message: '伺服器錯誤' });
    }
});


// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
  const networkAddress = getNetworkAddress();
  console.log(`伺服器正在本機運行在 http://localhost:${PORT}`);
  console.log(`伺服器正在區域網路運行在 http://${networkAddress}:${PORT}`);
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


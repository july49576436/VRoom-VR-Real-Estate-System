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

function parseHouseID(rawHouseID, fallback = 1) {
    const parsed = Number.parseInt(rawHouseID, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function parseId(rawValue) {
    const parsed = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

// 處理首頁請求
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // 回應 index.html
});

app.get('/search', (req, res) => {
    const { city, district, priceRange, houseType } = req.query;

    search.searchHouses(city, district, priceRange, houseType, (err, results) => {
            if (err) {
                    console.error('搜尋錯誤:', err);
                    return res.status(500).json({ message: '搜尋失敗' });
            }
            res.json(results);
    });
});

app.get('/api/house', (req, res) => {
    const houseID = parseHouseID(req.query.houseID, 1);

    dynamicContent.fetchHouseDetails(houseID, (err, result) => {
      if (err) {
          res.status(500).send('Error fetching house details');
          return;
      }
      res.json(result);
  });
});

app.get('/api/house/images', (req, res) => {
    const houseID = parseHouseID(req.query.houseID, 1);

    dynamicContent.fetchHouseImages(houseID, (err, results) => {
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
    const houseID = parseHouseID(req.query.houseID, 1);

    dynamicContent.fetchPriceInfo(houseID, (err, results) => {
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
    const houseID = parseHouseID(req.query.houseID, 1);

    dynamicContent.fetchCommunityPlanning(houseID, (err, result) => {
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
    const houseID = parseHouseID(req.query.houseID, 1);
  dynamicContent.fetchLatestNews(houseID, (err, results) => {
      if (err) {
          res.status(500).send('Error fetching latest news');
          return;
      }
      res.json(results);
  });
});


app.get('/api/house/surrounding-facilities', (req, res) => {
    const houseID = parseHouseID(req.query.houseID, 1);

    dynamicContent.fetchSurroundingFacilities(houseID, (err, result) => {
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

app.get('/api/recommendations', (req, res) => {
    dynamicContent.fetchFeaturedHouses('recommend', (err, results) => {
            if (err) {
                    console.error('Error fetching recommendations:', err);
                    return res.status(500).json({ message: 'Error fetching recommendations' });
            }
            res.json(results);
    });
});

app.get('/api/new-arrivals', (req, res) => {
    dynamicContent.fetchFeaturedHouses('new', (err, results) => {
            if (err) {
                    console.error('Error fetching new arrivals:', err);
                    return res.status(500).json({ message: 'Error fetching new arrivals' });
            }
            res.json(results);
    });
});

app.get('/api/price-drop', (req, res) => {
    dynamicContent.fetchFeaturedHouses('price_reduction', (err, results) => {
            if (err) {
                    console.error('Error fetching price drop houses:', err);
                    return res.status(500).json({ message: 'Error fetching price drop houses' });
            }
            res.json(results);
    });
});

// -----------------------------
// CRUD APIs
// -----------------------------

app.get('/api/admin/houses', (req, res) => {
    dynamicContent.listHouses((err, results) => {
        if (err) {
            console.error('Error listing houses:', err);
            return res.status(500).json({ message: 'Error listing houses' });
        }
        res.json(results);
    });
});

app.post('/api/admin/houses', (req, res) => {
    dynamicContent.createHouse(req.body, (err, result) => {
        if (err) {
            console.error('Error creating house:', err);
            return res.status(500).json({ message: 'Error creating house' });
        }
        res.status(201).json({ success: true, insertedId: result.insertId });
    });
});

app.put('/api/admin/houses/:houseID', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.updateHouse(houseID, req.body, (err, result) => {
        if (err) {
            console.error('Error updating house:', err);
            return res.status(500).json({ message: 'Error updating house' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.delete('/api/admin/houses/:houseID', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.deleteHouse(houseID, (err, result) => {
        if (err) {
            console.error('Error deleting house:', err);
            return res.status(500).json({ message: 'Error deleting house' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.get('/api/admin/houses/:houseID/images', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.fetchHouseImagesByHouse(houseID, (err, results) => {
        if (err) {
            console.error('Error listing house images:', err);
            return res.status(500).json({ message: 'Error listing house images' });
        }
        res.json(results);
    });
});

app.post('/api/admin/houses/:houseID/images', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.createHouseImage(houseID, req.body, (err, result) => {
        if (err) {
            console.error('Error creating house image:', err);
            return res.status(500).json({ message: 'Error creating house image' });
        }
        res.status(201).json({ success: true, insertedId: result.insertId });
    });
});

app.put('/api/admin/images/:imageID', (req, res) => {
    const imageID = parseId(req.params.imageID);
    if (!imageID) {
        return res.status(400).json({ message: 'Invalid imageID' });
    }

    dynamicContent.updateHouseImage(imageID, req.body, (err, result) => {
        if (err) {
            console.error('Error updating house image:', err);
            return res.status(500).json({ message: 'Error updating house image' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.delete('/api/admin/images/:imageID', (req, res) => {
    const imageID = parseId(req.params.imageID);
    if (!imageID) {
        return res.status(400).json({ message: 'Invalid imageID' });
    }

    dynamicContent.deleteHouseImage(imageID, (err, result) => {
        if (err) {
            console.error('Error deleting house image:', err);
            return res.status(500).json({ message: 'Error deleting house image' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.get('/api/admin/houses/:houseID/prices', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.fetchPriceRecordsByHouse(houseID, (err, results) => {
        if (err) {
            console.error('Error listing price records:', err);
            return res.status(500).json({ message: 'Error listing price records' });
        }
        res.json(results);
    });
});

app.post('/api/admin/houses/:houseID/prices', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.createPriceRecord(houseID, req.body, (err, result) => {
        if (err) {
            console.error('Error creating price record:', err);
            return res.status(500).json({ message: 'Error creating price record' });
        }
        res.status(201).json({ success: true, insertedId: result.insertId });
    });
});

app.put('/api/admin/prices/:priceID', (req, res) => {
    const priceID = parseId(req.params.priceID);
    if (!priceID) {
        return res.status(400).json({ message: 'Invalid priceID' });
    }

    dynamicContent.updatePriceRecord(priceID, req.body, (err, result) => {
        if (err) {
            console.error('Error updating price record:', err);
            return res.status(500).json({ message: 'Error updating price record' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.delete('/api/admin/prices/:priceID', (req, res) => {
    const priceID = parseId(req.params.priceID);
    if (!priceID) {
        return res.status(400).json({ message: 'Invalid priceID' });
    }

    dynamicContent.deletePriceRecord(priceID, (err, result) => {
        if (err) {
            console.error('Error deleting price record:', err);
            return res.status(500).json({ message: 'Error deleting price record' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.get('/api/admin/houses/:houseID/community-planning', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.fetchCommunityPlanningByHouse(houseID, (err, results) => {
        if (err) {
            console.error('Error listing community planning:', err);
            return res.status(500).json({ message: 'Error listing community planning' });
        }
        res.json(results);
    });
});

app.post('/api/admin/houses/:houseID/community-planning', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.createCommunityPlanning(houseID, req.body, (err, result) => {
        if (err) {
            console.error('Error creating community planning:', err);
            return res.status(500).json({ message: 'Error creating community planning' });
        }
        res.status(201).json({ success: true, insertedId: result.insertId });
    });
});

app.put('/api/admin/community-planning/:communityID', (req, res) => {
    const communityID = parseId(req.params.communityID);
    if (!communityID) {
        return res.status(400).json({ message: 'Invalid communityID' });
    }

    dynamicContent.updateCommunityPlanning(communityID, req.body, (err, result) => {
        if (err) {
            console.error('Error updating community planning:', err);
            return res.status(500).json({ message: 'Error updating community planning' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.delete('/api/admin/community-planning/:communityID', (req, res) => {
    const communityID = parseId(req.params.communityID);
    if (!communityID) {
        return res.status(400).json({ message: 'Invalid communityID' });
    }

    dynamicContent.deleteCommunityPlanning(communityID, (err, result) => {
        if (err) {
            console.error('Error deleting community planning:', err);
            return res.status(500).json({ message: 'Error deleting community planning' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.post('/api/admin/houses/:houseID/latest-news', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.createLatestNews(houseID, req.body, (err, result) => {
        if (err) {
            console.error('Error creating latest news:', err);
            return res.status(500).json({ message: 'Error creating latest news' });
        }
        res.status(201).json({ success: true, insertedId: result.insertId });
    });
});

app.put('/api/admin/latest-news/:newsID', (req, res) => {
    const newsID = parseId(req.params.newsID);
    if (!newsID) {
        return res.status(400).json({ message: 'Invalid newsID' });
    }

    dynamicContent.updateLatestNews(newsID, req.body, (err, result) => {
        if (err) {
            console.error('Error updating latest news:', err);
            return res.status(500).json({ message: 'Error updating latest news' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.delete('/api/admin/latest-news/:newsID', (req, res) => {
    const newsID = parseId(req.params.newsID);
    if (!newsID) {
        return res.status(400).json({ message: 'Invalid newsID' });
    }

    dynamicContent.deleteLatestNews(newsID, (err, result) => {
        if (err) {
            console.error('Error deleting latest news:', err);
            return res.status(500).json({ message: 'Error deleting latest news' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.get('/api/admin/houses/:houseID/surrounding-facilities', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.fetchSurroundingFacilitiesByHouse(houseID, (err, results) => {
        if (err) {
            console.error('Error listing surrounding facilities:', err);
            return res.status(500).json({ message: 'Error listing surrounding facilities' });
        }
        res.json(results);
    });
});

app.post('/api/admin/houses/:houseID/surrounding-facilities', (req, res) => {
    const houseID = parseId(req.params.houseID);
    if (!houseID) {
        return res.status(400).json({ message: 'Invalid houseID' });
    }

    dynamicContent.createSurroundingFacility(houseID, req.body, (err, result) => {
        if (err) {
            console.error('Error creating surrounding facility:', err);
            return res.status(500).json({ message: 'Error creating surrounding facility' });
        }
        res.status(201).json({ success: true, insertedId: result.insertId });
    });
});

app.put('/api/admin/surrounding-facilities/:facilityID', (req, res) => {
    const facilityID = parseId(req.params.facilityID);
    if (!facilityID) {
        return res.status(400).json({ message: 'Invalid facilityID' });
    }

    dynamicContent.updateSurroundingFacility(facilityID, req.body, (err, result) => {
        if (err) {
            console.error('Error updating surrounding facility:', err);
            return res.status(500).json({ message: 'Error updating surrounding facility' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.delete('/api/admin/surrounding-facilities/:facilityID', (req, res) => {
    const facilityID = parseId(req.params.facilityID);
    if (!facilityID) {
        return res.status(400).json({ message: 'Invalid facilityID' });
    }

    dynamicContent.deleteSurroundingFacility(facilityID, (err, result) => {
        if (err) {
            console.error('Error deleting surrounding facility:', err);
            return res.status(500).json({ message: 'Error deleting surrounding facility' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.get('/api/admin/search-filters', (req, res) => {
    dynamicContent.fetchSearchFiltersAdmin((err, results) => {
        if (err) {
            console.error('Error listing search filters:', err);
            return res.status(500).json({ message: 'Error listing search filters' });
        }
        res.json(results);
    });
});

app.post('/api/admin/search-filters', (req, res) => {
    dynamicContent.createSearchFilter(req.body, (err, result) => {
        if (err) {
            console.error('Error creating search filter:', err);
            return res.status(500).json({ message: 'Error creating search filter' });
        }
        res.status(201).json({ success: true, insertedId: result.insertId });
    });
});

app.put('/api/admin/search-filters/:filterID', (req, res) => {
    const filterID = parseId(req.params.filterID);
    if (!filterID) {
        return res.status(400).json({ message: 'Invalid filterID' });
    }

    dynamicContent.updateSearchFilter(filterID, req.body, (err, result) => {
        if (err) {
            console.error('Error updating search filter:', err);
            return res.status(500).json({ message: 'Error updating search filter' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
    });
});

app.delete('/api/admin/search-filters/:filterID', (req, res) => {
    const filterID = parseId(req.params.filterID);
    if (!filterID) {
        return res.status(400).json({ message: 'Invalid filterID' });
    }

    dynamicContent.deleteSearchFilter(filterID, (err, result) => {
        if (err) {
            console.error('Error deleting search filter:', err);
            return res.status(500).json({ message: 'Error deleting search filter' });
        }
        res.json({ success: true, affectedRows: result.affectedRows });
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


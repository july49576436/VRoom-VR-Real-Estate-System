const mysql = require('mysql2');
const connection = require('./database'); // 引入資料庫連線


// Function to fetch all house details
const fetchHouseDetails = (callback) => {
    const sql = 'SELECT * FROM house WHERE houseID = ?';
    connection.query(sql, [1], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]);
    });
};
const saveHouseDetails = (data, callback) => {
    const sql = 'INSERT INTO house (houseID, Name, Address, PicePerUnit, TotalPrice, RoomLayout, Area, CompletionYear, ParkingPrice, VR ,Description, recommend, new, price_reduction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [data.houseID, data.name, data.address, data.description];
    connection.query(sql, params, callback);
};
//保存房屋圖片 (house_images 表)
const saveHouseImages = (data, callback) => {
    const sql = 'INSERT INTO house_images (houseID, Img, Img_description) VALUES ?';
    const values = data.map(image => [image.houseID, image.img, image.imgDescription]);
    connection.query(sql, [values], callback);
};
//保存價格資訊 (price 表)
const savePriceInfo = (data, callback) => {
    const sql = `
        INSERT INTO price (houseID, TransactionDate, Floor, PricePerUnit, TotalPrice, RoomDetails, avgprice, twoyear, threeyear, otheryear) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        data.houseID,
        data.TransactionDate,
        data.Floor || null,
        data.PricePerUnit,
        data.TotalPrice || null,
        data.RoomDetails || null,
        data.avgprice || null,
        data.twoyear || null,
        data.threeyear || null,
        data.otheryear || null,
    ];
    connection.query(sql, params, callback);
};
//保存社區規劃資訊 (community_planning 表)
const saveCommunityPlanning = (data, callback) => {
    const sql = 'INSERT INTO community_planning (houseID, planningDetails) VALUES (?, ?)';
    const params = [data.houseID, data.planningDetails];
    connection.query(sql, params, callback);
};
//保存最新消息 (latest_news 表)
const saveLatestNews = (data, callback) => {
    const sql = 'INSERT INTO latest_news (houseID, newsTitle, newsContent, date) VALUES (?, ?, ?, ?)';
    const params = [data.houseID, data.newsTitle, data.newsContent, data.date];
    connection.query(sql, params, callback);
};
//保存周邊設施資訊 (surrounding_facilities 表)

const saveSurroundingFacilities = (data, callback) => {
    const sql = 'INSERT INTO surrounding_fac (houseID, facilityDetails) VALUES (?, ?)';
    const params = [data.houseID, data.facilityDetails];
    connection.query(sql, params, callback);
};

//12.9新增
// Function to fetch house images
const fetchHouseImages = (houseID, callback) => {
    const sql = 'SELECT Img, Img_description FROM house_images WHERE houseID = ?';
    connection.query(sql, [houseID], (err, results) => {
        if (err) return callback(err, null);

        // 將 /public 移除，保證返回的路徑正確
        const updatedResults = results.map(image => ({
            ...image,
            Img: image.Img.replace('/public', '') // 修改路徑
        }));

        callback(null, updatedResults);
    });
};

// Function to fetch price information
const fetchPriceInfo = (houseID, callback) => {
    const sql = `
        SELECT 
            TransactionDate, 
            Floor, 
            PricePerUnit, 
            TotalPrice, 
            RoomDetails, 
            avgprice, 
            twoyear, 
            threeyear, 
            otheryear 
        FROM price 
        WHERE houseID = ? 
        ORDER BY TransactionDate DESC
    `;
    connection.query(sql, [houseID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};


const fetchHouseModel = (houseID, callback) => {
    const query = `SELECT 
    hmf.houseModelFloorsFileName, 
    hmf.houseModelFloorInitX, 
    hmf.houseModelFloorInitY, 
    hmf.houseModelFloorInitZ,
    houseModelFloors360ID,
    hmf360.houseModelFloors360FileName, 
    hmf360.houseModelFloors360InitX, 
    hmf360.houseModelFloors360InitY, 
    hmf360.houseModelFloors360InitZ
FROM house_model_floors hmf
JOIN house_model hm ON hmf.houseModelID = hm.houseModelID
LEFT JOIN house_model_floors_360 hmf360 ON hmf.houseModelFloorsID = hmf360.houseModelFloorsID
WHERE hm.houseID = ?
`;

    connection.query(query, [houseID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};



// Function to fetch community planning details
const fetchCommunityPlanning = (houseID, callback) => {
    const sql = 'SELECT * FROM community_planning WHERE houseID = ?';
    connection.query(sql, [houseID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]);
    });
};

// Function to fetch latest news
const fetchLatestNews = (houseID, callback) => {
    const sql = 'SELECT * FROM latest_news WHERE houseID = ? ORDER BY date_column ASC'; // 按日期排序
    connection.query(sql, [houseID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};


// Function to fetch surrounding facilities
const fetchSurroundingFacilities = (houseID, callback) => {
    const sql = 'SELECT * FROM surrounding_fac WHERE houseID = ?';
    connection.query(sql, [houseID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]);
    });
};
const save360ImagePosition = (houseModelFloorsID, posX, posY, posZ, callback) => {
    console.log(houseModelFloorsID, posX, posY, posZ, callback);
    const updateQuery = `UPDATE house_model_floors_360 
                         SET houseModelFloors360InitX = ?, 
                             houseModelFloors360InitY = ?, 
                             houseModelFloors360InitZ = ? 
                         WHERE houseModelFloors360ID = ?`;
  
    connection.query(updateQuery, [posX, posY, posZ, houseModelFloorsID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
  };

module.exports = {
    fetchPriceInfo,
    saveHouseDetails,
    saveHouseImages,
    savePriceInfo,
    saveCommunityPlanning,
    saveLatestNews,
    saveSurroundingFacilities,
    fetchHouseDetails,
    fetchHouseImages,
    fetchPriceInfo,
    fetchCommunityPlanning,
    fetchLatestNews,
    fetchSurroundingFacilities,
    fetchHouseModel,
    save360ImagePosition
};

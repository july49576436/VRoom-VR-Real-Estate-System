const connection = require('./database'); // 引入資料庫連線


// Function to fetch all house details
const fetchHouseDetails = (houseID, callback) => {
    const sql = 'SELECT * FROM house WHERE houseID = ?';
    connection.query(sql, [houseID], (err, results) => {
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
    const sql = 'SELECT * FROM latest_news WHERE houseID = ? ORDER BY con_date ASC';
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

const fetchSearchFilters = (callback) => {
    const sql = `
        SELECT DISTINCT city, district, PriceRange, houseType
        FROM searchfilters
        ORDER BY city, district
    `;

    connection.query(sql, (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const fetchFeaturedHouses = (flagColumn, callback) => {
    const allowedFlags = new Set(['recommend', 'new', 'price_reduction']);
    if (!allowedFlags.has(flagColumn)) {
        return callback(new Error('Invalid featured house flag'), null);
    }

    const sql = `
        SELECT
            h.houseID AS id,
            h.Name AS name,
            COALESCE(MAX(hi.Img), '/image/NTU.jpg') AS main_image,
            h.PricePerUnit AS unit_price,
            COALESCE(MAX(sf.district), '未提供') AS district,
            COALESCE(MAX(sf.houseType), '住宅') AS type,
            h.RoomLayout AS layout,
            h.Area AS size
        FROM house h
        LEFT JOIN house_images hi ON hi.houseID = h.houseID
        LEFT JOIN searchfilters sf ON sf.houseID = h.houseID
        WHERE COALESCE(h.\`${flagColumn}\`, '') <> ''
        GROUP BY h.houseID, h.Name, h.PricePerUnit, h.RoomLayout, h.Area
        ORDER BY h.houseID DESC
        LIMIT 12
    `;

    connection.query(sql, (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const listHouses = (callback) => {
    const sql = 'SELECT * FROM house ORDER BY houseID DESC';
    connection.query(sql, (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const createHouse = (data, callback) => {
    const sql = `
        INSERT INTO house (
            houseID, Name, Address, PricePerUnit, TotalPrice, RoomLayout, Area,
            CompletionYear, ParkingPrice, VR, Description, recommend, new, price_reduction
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        data.houseID,
        data.Name,
        data.Address,
        data.PricePerUnit,
        data.TotalPrice,
        data.RoomLayout,
        data.Area,
        data.CompletionYear,
        data.ParkingPrice,
        data.VR || null,
        data.Description || null,
        data.recommend || null,
        data.new || null,
        data.price_reduction || null
    ];
    connection.query(sql, params, callback);
};

const updateHouse = (houseID, data, callback) => {
    const sql = `
        UPDATE house SET
            Name = ?,
            Address = ?,
            PricePerUnit = ?,
            TotalPrice = ?,
            RoomLayout = ?,
            Area = ?,
            CompletionYear = ?,
            ParkingPrice = ?,
            VR = ?,
            Description = ?,
            recommend = ?,
            new = ?,
            price_reduction = ?
        WHERE houseID = ?
    `;
    const params = [
        data.Name,
        data.Address,
        data.PricePerUnit,
        data.TotalPrice,
        data.RoomLayout,
        data.Area,
        data.CompletionYear,
        data.ParkingPrice,
        data.VR || null,
        data.Description || null,
        data.recommend || null,
        data.new || null,
        data.price_reduction || null,
        houseID
    ];
    connection.query(sql, params, callback);
};

const deleteHouse = (houseID, callback) => {
    const sql = 'DELETE FROM house WHERE houseID = ?';
    connection.query(sql, [houseID], callback);
};

const fetchHouseImagesByHouse = (houseID, callback) => {
    const sql = 'SELECT ImageID, houseID, Img, Img_description FROM house_images WHERE houseID = ? ORDER BY ImageID DESC';
    connection.query(sql, [houseID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const createHouseImage = (houseID, data, callback) => {
    const sql = 'INSERT INTO house_images (houseID, Img, Img_description) VALUES (?, ?, ?)';
    connection.query(sql, [houseID, data.Img || null, data.Img_description || null], callback);
};

const updateHouseImage = (imageID, data, callback) => {
    const sql = 'UPDATE house_images SET Img = ?, Img_description = ? WHERE ImageID = ?';
    connection.query(sql, [data.Img || null, data.Img_description || null, imageID], callback);
};

const deleteHouseImage = (imageID, callback) => {
    const sql = 'DELETE FROM house_images WHERE ImageID = ?';
    connection.query(sql, [imageID], callback);
};

const fetchPriceRecordsByHouse = (houseID, callback) => {
    const sql = 'SELECT * FROM price WHERE houseID = ? ORDER BY PriceID DESC';
    connection.query(sql, [houseID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const createPriceRecord = (houseID, data, callback) => {
    const sql = `
        INSERT INTO price (
            houseID, TransactionDate, TransctionPrice, Floor, PricePerUnit,
            TotalPrice, RoomDetails, twoyear, threeyear, otheryear, avgprice
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        houseID,
        data.TransactionDate || null,
        data.TransctionPrice || null,
        data.Floor || null,
        data.PricePerUnit || null,
        data.TotalPrice || null,
        data.RoomDetails || null,
        data.twoyear || null,
        data.threeyear || null,
        data.otheryear || null,
        data.avgprice || null
    ];
    connection.query(sql, params, callback);
};

const updatePriceRecord = (priceID, data, callback) => {
    const sql = `
        UPDATE price SET
            TransactionDate = ?,
            TransctionPrice = ?,
            Floor = ?,
            PricePerUnit = ?,
            TotalPrice = ?,
            RoomDetails = ?,
            twoyear = ?,
            threeyear = ?,
            otheryear = ?,
            avgprice = ?
        WHERE PriceID = ?
    `;
    const params = [
        data.TransactionDate || null,
        data.TransctionPrice || null,
        data.Floor || null,
        data.PricePerUnit || null,
        data.TotalPrice || null,
        data.RoomDetails || null,
        data.twoyear || null,
        data.threeyear || null,
        data.otheryear || null,
        data.avgprice || null,
        priceID
    ];
    connection.query(sql, params, callback);
};

const deletePriceRecord = (priceID, callback) => {
    const sql = 'DELETE FROM price WHERE PriceID = ?';
    connection.query(sql, [priceID], callback);
};

const fetchCommunityPlanningByHouse = (houseID, callback) => {
    const sql = 'SELECT * FROM community_planning WHERE houseID = ? ORDER BY community_ID DESC';
    connection.query(sql, [houseID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const createCommunityPlanning = (houseID, data, callback) => {
    const sql = `
        INSERT INTO community_planning (
            houseID, PublicFacilityRatio, BuildingRage, SiteArea, ParkingRatio,
            ParkingType, BuildingInfo, FloorPlanning, Orientation, BuildingPermit,
            UsagePermit, BuildingMaterial, PublicFacilities, ManagementFee,
            LandUseZoning, Propertymanagement, man_committee, constructure
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        houseID,
        data.PublicFacilityRatio || null,
        data.BuildingRage || null,
        data.SiteArea || null,
        data.ParkingRatio || null,
        data.ParkingType || null,
        data.BuildingInfo || null,
        data.FloorPlanning || null,
        data.Orientation || null,
        data.BuildingPermit || null,
        data.UsagePermit || null,
        data.BuildingMaterial || null,
        data.PublicFacilities || null,
        data.ManagementFee || null,
        data.LandUseZoning || null,
        data.Propertymanagement || null,
        data.man_committee || null,
        data.constructure || null
    ];
    connection.query(sql, params, callback);
};

const updateCommunityPlanning = (communityID, data, callback) => {
    const sql = `
        UPDATE community_planning SET
            PublicFacilityRatio = ?,
            BuildingRage = ?,
            SiteArea = ?,
            ParkingRatio = ?,
            ParkingType = ?,
            BuildingInfo = ?,
            FloorPlanning = ?,
            Orientation = ?,
            BuildingPermit = ?,
            UsagePermit = ?,
            BuildingMaterial = ?,
            PublicFacilities = ?,
            ManagementFee = ?,
            LandUseZoning = ?,
            Propertymanagement = ?,
            man_committee = ?,
            constructure = ?
        WHERE community_ID = ?
    `;
    const params = [
        data.PublicFacilityRatio || null,
        data.BuildingRage || null,
        data.SiteArea || null,
        data.ParkingRatio || null,
        data.ParkingType || null,
        data.BuildingInfo || null,
        data.FloorPlanning || null,
        data.Orientation || null,
        data.BuildingPermit || null,
        data.UsagePermit || null,
        data.BuildingMaterial || null,
        data.PublicFacilities || null,
        data.ManagementFee || null,
        data.LandUseZoning || null,
        data.Propertymanagement || null,
        data.man_committee || null,
        data.constructure || null,
        communityID
    ];
    connection.query(sql, params, callback);
};

const deleteCommunityPlanning = (communityID, callback) => {
    const sql = 'DELETE FROM community_planning WHERE community_ID = ?';
    connection.query(sql, [communityID], callback);
};

const createLatestNews = (houseID, data, callback) => {
    const sql = 'INSERT INTO latest_news (houseID, house_state, con_date, content_describe) VALUES (?, ?, ?, ?)';
    connection.query(sql, [houseID, data.house_state || null, data.con_date || null, data.content_describe || null], callback);
};

const updateLatestNews = (newsID, data, callback) => {
    const sql = 'UPDATE latest_news SET house_state = ?, con_date = ?, content_describe = ? WHERE newsID = ?';
    connection.query(sql, [data.house_state || null, data.con_date || null, data.content_describe || null, newsID], callback);
};

const deleteLatestNews = (newsID, callback) => {
    const sql = 'DELETE FROM latest_news WHERE newsID = ?';
    connection.query(sql, [newsID], callback);
};

const fetchSurroundingFacilitiesByHouse = (houseID, callback) => {
    const sql = 'SELECT * FROM surrounding_fac WHERE houseID = ? ORDER BY facilityID DESC';
    connection.query(sql, [houseID], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const createSurroundingFacility = (houseID, data, callback) => {
    const sql = 'INSERT INTO surrounding_fac (houseID, mapURL) VALUES (?, ?)';
    connection.query(sql, [houseID, data.mapURL || null], callback);
};

const updateSurroundingFacility = (facilityID, data, callback) => {
    const sql = 'UPDATE surrounding_fac SET mapURL = ? WHERE facilityID = ?';
    connection.query(sql, [data.mapURL || null, facilityID], callback);
};

const deleteSurroundingFacility = (facilityID, callback) => {
    const sql = 'DELETE FROM surrounding_fac WHERE facilityID = ?';
    connection.query(sql, [facilityID], callback);
};

const fetchSearchFiltersAdmin = (callback) => {
    const sql = 'SELECT * FROM searchfilters ORDER BY filterID DESC';
    connection.query(sql, (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const createSearchFilter = (data, callback) => {
    const sql = 'INSERT INTO searchfilters (city, district, PriceRange, houseType, houseID) VALUES (?, ?, ?, ?, ?)';
    const params = [data.city || null, data.district || null, data.PriceRange || null, data.houseType || null, data.houseID || null];
    connection.query(sql, params, callback);
};

const updateSearchFilter = (filterID, data, callback) => {
    const sql = 'UPDATE searchfilters SET city = ?, district = ?, PriceRange = ?, houseType = ?, houseID = ? WHERE filterID = ?';
    const params = [data.city || null, data.district || null, data.PriceRange || null, data.houseType || null, data.houseID || null, filterID];
    connection.query(sql, params, callback);
};

const deleteSearchFilter = (filterID, callback) => {
    const sql = 'DELETE FROM searchfilters WHERE filterID = ?';
    connection.query(sql, [filterID], callback);
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
    listHouses,
    createHouse,
    updateHouse,
    deleteHouse,
    saveHouseDetails,
    saveHouseImages,
    savePriceInfo,
    saveCommunityPlanning,
    saveLatestNews,
    saveSurroundingFacilities,
    fetchHouseDetails,
    fetchHouseImages,
    fetchHouseImagesByHouse,
    createHouseImage,
    updateHouseImage,
    deleteHouseImage,
    fetchPriceInfo,
    fetchPriceRecordsByHouse,
    createPriceRecord,
    updatePriceRecord,
    deletePriceRecord,
    fetchCommunityPlanning,
    fetchCommunityPlanningByHouse,
    createCommunityPlanning,
    updateCommunityPlanning,
    deleteCommunityPlanning,
    fetchLatestNews,
    createLatestNews,
    updateLatestNews,
    deleteLatestNews,
    fetchSurroundingFacilities,
    fetchSurroundingFacilitiesByHouse,
    createSurroundingFacility,
    updateSurroundingFacility,
    deleteSurroundingFacility,
    fetchSearchFilters,
    fetchSearchFiltersAdmin,
    createSearchFilter,
    updateSearchFilter,
    deleteSearchFilter,
    fetchFeaturedHouses,
    fetchHouseModel,
    save360ImagePosition
};

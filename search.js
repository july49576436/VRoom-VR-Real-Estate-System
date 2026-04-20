const db = require('./database');

const CITY_ALIASES = {
    taipei_city: ['台北市', 'Taipei City', '台北市 (Taipei City)', 'taipei_city'],
    new_taipei_city: ['新北市', 'New Taipei City', '新北市 (New Taipei City)', 'new_taipei_city'],
    keelung_city: ['基隆市', 'Keelung City', '基隆市 (Keelung City)', 'keelung_city'],
    taichung_city: ['台中市', 'Taichung City', '台中市 (Taichung City)', 'taichung_city'],
    tainan_city: ['台南市', 'Tainan City', '台南市 (Tainan City)', 'tainan_city'],
    kaohsiung_city: ['高雄市', 'Kaohsiung City', '高雄市 (Kaohsiung City)', 'kaohsiung_city'],
    taoyuan_city: ['桃園市', 'Taoyuan City', '桃園市 (Taoyuan City)', 'taoyuan_city'],
    hsinchu_city: ['新竹市', 'Hsinchu City', '新竹市 (Hsinchu City)', 'hsinchu_city'],
    chiayi_city: ['嘉義市', 'Chiayi City', '嘉義市 (Chiayi City)', 'chiayi_city'],
    yilan_county: ['宜蘭縣', 'Yilan County', '宜蘭縣 (Yilan County)', 'yilan_county'],
    hsinchu_county: ['新竹縣', 'Hsinchu County', '新竹縣 (Hsinchu County)', 'hsinchu_county'],
    miaoli_county: ['苗栗縣', 'Miaoli County', '苗栗縣 (Miaoli County)', 'miaoli_county'],
    changhua_county: ['彰化縣', 'Changhua County', '彰化縣 (Changhua County)', 'changhua_county'],
    nantou_county: ['南投縣', 'Nantou County', '南投縣 (Nantou County)', 'nantou_county'],
    yunlin_county: ['雲林縣', 'Yunlin County', '雲林縣 (Yunlin County)', 'yunlin_county'],
    chiayi_county: ['嘉義縣', 'Chiayi County', '嘉義縣 (Chiayi County)', 'chiayi_county'],
    pingtung_county: ['屏東縣', 'Pingtung County', '屏東縣 (Pingtung County)', 'pingtung_county'],
    taitung_county: ['台東縣', 'Taitung County', '台東縣 (Taitung County)', 'taitung_county'],
    hualien_county: ['花蓮縣', 'Hualien County', '花蓮縣 (Hualien County)', 'hualien_county'],
    penghu_county: ['澎湖縣', 'Penghu County', '澎湖縣 (Penghu County)', 'penghu_county'],
    kinmen_county: ['金門縣', 'Kinmen County', '金門縣 (Kinmen County)', 'kinmen_county'],
    lienchiang_county: ['連江縣', 'Lienchiang County', '連江縣 (Lienchiang County)', 'lienchiang_county']
};

const HOUSE_TYPE_ALIASES = {
    type1: '住宅',
    type2: '商用',
    type3: '住辦',
    type4: '土地',
    type5: '車位',
    type6: '廠房',
    type7: '其他'
};

const HOUSE_TYPE_QUERY_ALIASES = {
        '住宅': ['住宅', 'residential', 'Residence'],
        '商用': ['商用', 'commercial', 'Commercial'],
        '住辦': ['住辦', 'mixed-use', 'Mixed-Use'],
        '土地': ['土地', 'land', 'Land'],
        '車位': ['車位', 'parking', 'Parking'],
        '廠房': ['廠房', 'factory', 'Factory'],
        '其他': ['其他', 'other', 'Others']
};

function buildTotalPriceWanExpression(column) {
        return `CASE
            WHEN ${column} IS NULL OR TRIM(${column}) = '' THEN NULL
            WHEN ${column} LIKE '%億%' THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(${column}), '億', ''), ',', ''), '元', ''), ' ', ''), '') AS DECIMAL(10,2)) * 10000)
            WHEN ${column} LIKE '%萬%' THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(${column}), '萬', ''), ',', ''), '元', ''), ' ', ''), '') AS DECIMAL(10,2)))
            ELSE
                CASE
                    WHEN CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(${column}), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED) >= 100000
                        THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(${column}), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED) / 10000)
                    ELSE CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(${column}), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED)
                END
        END`;
}

// Removed unused function buildTotalPriceExpression

function parsePriceRange(priceRange) {
    if (!priceRange) return null;
    const [minValue, maxValue] = String(priceRange).split('-');
    const min = Number(minValue);
    const max = maxValue ? Number(maxValue) : null;
    if (Number.isNaN(min)) return null;
    return { min, max: Number.isNaN(max) ? null : max };
}

function normalizeHouseType(typeValue) {
    if (!typeValue || typeValue === '不限' || typeValue === 'all') return null;
    return HOUSE_TYPE_ALIASES[typeValue] || typeValue;
}

function normalizeCityCandidates(cityValue) {
    if (!cityValue || cityValue === '全區') return [];
    const normalized = CITY_ALIASES[cityValue];
    if (normalized) return normalized;
    return [cityValue];
}

function searchHouses(city, district, priceRange, houseType, callback) {
        const totalPriceWanExpr = `COALESCE(h.TotalPriceWan, ${buildTotalPriceWanExpression('h.TotalPrice')})`;
    let query = `
        SELECT
            h.houseID AS id,
            h.Name AS name,
            h.Address AS address,
                        CASE
                            WHEN ${totalPriceWanExpr} IS NOT NULL THEN CONCAT(FORMAT(${totalPriceWanExpr}, 0), '萬')
                            ELSE h.TotalPrice
                        END AS totalprice,
                        ${totalPriceWanExpr} AS totalprice_wan,
            h.RoomLayout AS roomlayout,
            h.Area AS area
        FROM house h
        JOIN searchfilters sf ON h.houseID = sf.houseID
                WHERE 1=1
    `;

    const values = [];

    const cityCandidates = normalizeCityCandidates(city);
    if (cityCandidates.length > 0) {
        query += ` AND sf.city IN (${cityCandidates.map(() => '?').join(', ')})`;
        values.push(...cityCandidates);
    }
    if (district && district !== '全區') {
        query += ' AND sf.district = ?';
        values.push(district);
    }
    const parsedRange = parsePriceRange(priceRange);
    if (parsedRange) {
        query += ` AND ${totalPriceWanExpr} >= ?`;
        values.push(parsedRange.min);
        if (parsedRange.max !== null) {
            query += ` AND ${totalPriceWanExpr} < ?`;
            values.push(parsedRange.max);
        }
    }
    const normalizedHouseType = normalizeHouseType(houseType);
    if (normalizedHouseType) {
        const aliases = HOUSE_TYPE_QUERY_ALIASES[normalizedHouseType] || [normalizedHouseType];
        query += ` AND sf.houseType IN (${aliases.map(() => '?').join(', ')})`;
        values.push(...aliases);
    }

    query += ' ORDER BY h.houseID DESC';

    db.query(query, values, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

module.exports = { searchHouses };

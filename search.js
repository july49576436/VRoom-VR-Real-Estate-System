const db = require('./database');

function buildTotalPriceExpression(column) {
    return `CASE
        WHEN ${column} LIKE '%萬%' THEN CAST(REGEXP_REPLACE(${column}, '[^0-9]', '') AS UNSIGNED)
        ELSE CAST(REGEXP_REPLACE(${column}, '[^0-9]', '') AS UNSIGNED) / 10000
    END`;
}

function parsePriceRange(priceRange) {
    if (!priceRange) return null;
    const [minValue, maxValue] = String(priceRange).split('-');
    const min = Number(minValue);
    const max = maxValue ? Number(maxValue) : null;
    if (Number.isNaN(min)) return null;
    return { min, max: Number.isNaN(max) ? null : max };
}

function searchHouses(city, district, priceRange, houseType, callback) {
    const totalPriceExpression = buildTotalPriceExpression('h.TotalPrice');
    let query = `
        SELECT
            h.houseID AS id,
            h.Name AS name,
            h.Address AS address,
            h.TotalPrice AS totalprice,
            ${totalPriceExpression} AS totalprice_wan,
            h.RoomLayout AS roomlayout,
            h.Area AS area
        FROM house h
        JOIN searchfilters sf ON h.houseID = sf.houseID
        WHERE 1=1
    `;

    const values = [];

    if (city && city !== '全區') {
        query += ' AND sf.city = ?';
        values.push(city);
    }
    if (district && district !== '全區') {
        query += ' AND sf.district = ?';
        values.push(district);
    }
    const parsedRange = parsePriceRange(priceRange);
    if (parsedRange) {
        query += ` AND ${totalPriceExpression} >= ?`;
        values.push(parsedRange.min);
        if (parsedRange.max !== null) {
            query += ` AND ${totalPriceExpression} < ?`;
            values.push(parsedRange.max);
        }
    }
    if (houseType && houseType !== '不限') {
        query += ' AND sf.houseType = ?';
        values.push(houseType);
    }

    query += ' ORDER BY h.houseID DESC';

    db.query(query, values, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

module.exports = { searchHouses };

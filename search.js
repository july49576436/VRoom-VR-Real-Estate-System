const db = require('./database');

function searchHouses(city, district, priceRange, houseType, callback) {
    let query = `
        SELECT
            h.houseID AS id,
            h.Name AS name,
            h.Address AS address,
            h.PricePerUnit AS priceperunit,
            h.TotalPrice AS totalprice,
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
    if (priceRange && priceRange !== '不限') {
        query += ' AND sf.PriceRange = ?';
        values.push(priceRange);
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

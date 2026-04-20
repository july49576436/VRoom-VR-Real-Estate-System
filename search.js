function searchHouses(city, district, priceRange, houseType, callback) {
    let query = `
        SELECT h.* FROM house h
        JOIN searchfilter sf ON h.houseID = sf.houseID
        WHERE 1=1
    `;
    
    if (city) query += ` AND sf.city = '${city}'`;
    if (district) query += ` AND sf.district = '${district}'`;
    if (priceRange) query += ` AND sf.priceRange = '${priceRange}'`;
    if (houseType) query += ` AND sf.houseType = '${houseType}'`;

    db.query(query, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

module.exports = { searchHouses };

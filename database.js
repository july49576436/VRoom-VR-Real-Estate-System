const mysql = require('mysql2');

// 建立連線池，避免單一連線關閉後整個 API 掛掉
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'vroom',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function runPriceNormalizationMigration() {
  const promisePool = pool.promise();

  const parseWanSql = (columnName) => `
    CASE
      WHEN ${columnName} IS NULL OR TRIM(${columnName}) = '' THEN NULL
      WHEN ${columnName} LIKE '%億%' THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(${columnName}), '億', ''), ',', ''), '元', ''), ' ', ''), '') AS DECIMAL(10,2)) * 10000)
      WHEN ${columnName} LIKE '%萬%' THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(${columnName}), '萬', ''), ',', ''), '元', ''), ' ', ''), '') AS DECIMAL(10,2)))
      ELSE
        CASE
          WHEN CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(${columnName}), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED) >= 100000
            THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(${columnName}), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED) / 10000)
          ELSE CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(${columnName}), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED)
        END
    END
  `;

  try {
    await promisePool.query('ALTER TABLE house ADD COLUMN IF NOT EXISTS TotalPriceWan INT NULL');
    await promisePool.query(`
      UPDATE house
      SET TotalPriceWan = ${parseWanSql('TotalPrice')}
      WHERE (TotalPriceWan IS NULL OR TotalPriceWan = 0)
    `);
    await promisePool.query(`
      UPDATE house
      SET TotalPrice = CONCAT(FORMAT(TotalPriceWan, 0), '萬')
      WHERE TotalPriceWan IS NOT NULL
    `);

    await promisePool.query('ALTER TABLE price ADD COLUMN IF NOT EXISTS TotalPriceWan INT NULL');
    await promisePool.query(`
      UPDATE price
      SET TotalPriceWan = ${parseWanSql('TotalPrice')}
      WHERE (TotalPriceWan IS NULL OR TotalPriceWan = 0)
    `);
    await promisePool.query(`
      UPDATE price
      SET TotalPrice = CONCAT(FORMAT(TotalPriceWan, 0), '萬')
      WHERE TotalPriceWan IS NOT NULL
    `);

    await promisePool.query(`
      UPDATE searchfilters sf
      JOIN house h ON h.houseID = sf.houseID
      SET sf.PriceRange = CASE
        WHEN h.TotalPriceWan < 1000 THEN '1000萬以下'
        WHEN h.TotalPriceWan < 1500 THEN '1000萬 - 1500萬'
        WHEN h.TotalPriceWan < 2000 THEN '1500萬 - 2000萬'
        WHEN h.TotalPriceWan < 3000 THEN '2000萬 - 3000萬'
        WHEN h.TotalPriceWan < 4000 THEN '3000萬 - 4000萬'
        ELSE '4000萬以上'
      END
      WHERE h.TotalPriceWan IS NOT NULL
    `);

    console.log('價格欄位正規化完成（僅使用總價）');
  } catch (migrationErr) {
    console.warn('價格欄位正規化略過:', migrationErr.message);
  }
}

// 啟動時測試一次資料庫可用性
pool.getConnection((err, conn) => {
  if (err) {
    console.error('錯誤連線到 MySQL:', err.stack);
    return;
  }
  console.log('成功連線到 MySQL');
  conn.release();
  runPriceNormalizationMigration();
});

module.exports = pool;

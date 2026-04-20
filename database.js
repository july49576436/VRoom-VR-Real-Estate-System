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

// 啟動時測試一次資料庫可用性
pool.getConnection((err, conn) => {
  if (err) {
    console.error('錯誤連線到 MySQL:', err.stack);
    return;
  }
  console.log('成功連線到 MySQL');
  conn.release();
});

module.exports = pool;

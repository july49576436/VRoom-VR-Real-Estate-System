const mysql = require('mysql2');

// 建立連線
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'vroom'
});

// 連線到 MySQL
connection.connect((err) => {
  if (err) {
    console.error('錯誤連線到 MySQL:', err.stack);
    return;
  }
  console.log('成功連線到 MySQL');

});

// 導出連線實例
module.exports = connection;

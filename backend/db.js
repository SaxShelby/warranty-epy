const mysql = require('mysql2');

// สร้างการเชื่อมต่อกับ MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // เปลี่ยนให้ตรงกับ username ของคุณ
    password: '', // เปลี่ยนเป็น password ของคุณ
    database: 'warranty_db' // ชื่อฐานข้อมูล
});

// เชื่อมต่อกับฐานข้อมูล
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

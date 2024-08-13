const mysql = require('mysql');

// เชื่อม database โดยกำหนด host user password ไม่ได้ตั้งเลยใช้เป็น '' และ database ชื่อ seafood
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'seafood',
});
// เชื่อมโดย เข้า folder server แล้ว node server.js จะต้อง run server ก่อนแล้วค่อยไป npm start ใน folder หลัก เพราะกำหนดให้ server run อยู่ port 3000
// ถ้าเชื่อมไม่ได้ เจอ error จะขึ้นใน console.log ว่า Error connecting to the database
db.connect((err) => {
    if(err) {
        console.error('Error connecting to the database', err);
        return;
    }
    // ถ้าเชื่อมได้จะแสดงข้อความนี้
    console.log('Connected to the MySQL database');
});

module.exports = db;
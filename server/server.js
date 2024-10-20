require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


const multer = require('multer');
const path = require('path');

// กำหนดที่เก็บไฟล์ที่อัปโหลด
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // กำหนดโฟลเดอร์ที่ใช้เก็บไฟล์
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์เป็น timestamp
  }
});

const upload = multer({ storage: storage });




// สมัครสมาชิก
app.post('/api/register', async (req, res) => {
  const { username, password, email, cname, clastname, phone, address } = req.body;

  console.log('Register request:', { username, email, cname, clastname, phone, address });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, password, email, cname, clastname, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [username, hashedPassword, email, cname, clastname, phone, address], (err, result) => {
      res.json({ message: 'User registered successfully' });
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send({ message: 'Database error', error: err });
  }
});


// ล็อกอิน
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login request:', { username, password });
  try {
    // ตรวจ username
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).send(err);
        return;
      }
      if (results.length === 0) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }
      const user = results[0];

      // ตรวจ password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }
      const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
      const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

      // Update refreshToken in the database เพื่อ login ถ้าไม่มี token จะล็อกอินไม่ได้
      const updateTokenSql = 'UPDATE users SET refresh_token = ? WHERE id = ?';
      db.query(updateTokenSql, [refreshToken, user.id], (err, result) => {
        if (err) {
          console.error('Database update error:', err);
          res.status(500).send(err);
          return;
        }
        console.log('Tokens issued:', { accessToken, refreshToken });
        res.json({ accessToken, refreshToken, user });
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send(err);
  }
});

// // Middleware สำหรับตรวจสอบ token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ดึงข้อมูลผู้ใช้ไปแสดง โดยจะให้ข้อมูลที่ดึงไปแสดง ตรงกับ userid ที่ login อยู่
app.get('/api/protected-data', authenticateToken, (req, res) => {
  const sql = 'SELECT id, cname, clastname, phone, address, username, email FROM users WHERE id = ?';
  db.query(sql, [req.user.userId], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(result[0]);
  });
});

// อัพเดทข้อมูล โดยจะดึงข้อมูลตามข้อมูลของผู้ใช้ที่ login อยู่
app.put('/api/update-user', authenticateToken, (req, res) => {
  const { username, email, cname, clastname, phone, address } = req.body;
  const sql = `UPDATE users SET username = ?, email = ?, cname = ?, clastname = ?, phone = ?, address = ? WHERE id = ?`;

  db.query(sql, [username, email, cname, clastname, phone, address, req.user.userId], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).send({ message: 'User information updated successfully.' });
  });
});


app.post('/api/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  });
});


// ดึงข้อมูลมาแสดง
app.get('/api/data', (req, res) => {
  const sql = 'SELECT * FROM product';
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(result);
  });
});

// เพิ่มข้อมูล product
app.post('/api/data', upload.single('productImage'), (req, res) => {
  const { menu, price_per_kg, status, type } = req.body; // Extract type from body
  const productImage = req.file ? req.file.filename : null;
  const imageUrl = productImage ? `http://localhost:3000/uploads/${productImage}` : null;

  const sql = 'INSERT INTO product (menu, price_per_kg, productimage, status, type) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [menu, price_per_kg, imageUrl, status || true, type], (err, result) => { // Include type in the insert query
    if (err) {
      return res.status(500).send(err);
    }
    res.json({
      message: 'Product added successfully',
      product: { menu, price_per_kg, productimage: imageUrl, status, type }, // Include type in response
    });
  });
});


// แก้ไขข้อมูล status ของ product เอาไว้ ปิด เปิด สินค้าเมื่อหมด
app.put('/api/product/:pid/status', (req, res) => {
  const { pid } = req.params;
  const { status } = req.body;  // รับข้อมูลจาก Body (status)

  console.log('Updating product with PID:', pid, 'to status:', status);  // ตรวจสอบว่า API รับข้อมูลถูกต้อง

  const sql = 'UPDATE product SET status = ? WHERE pid = ?';
  db.query(sql, [status, pid], (err, result) => {
    if (err) {
      console.error('Error updating status in database:', err);  // ตรวจสอบข้อผิดพลาดในการอัปเดตฐานข้อมูล
      return res.status(500).send(err);
    }

    console.log('Product status updated successfully in database.');
    res.json({
      message: 'Product status updated successfully',
      status,
    });
  });
});


// ลบข้อมูล
app.delete('/api/data/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM product WHERE pid = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// แก้ไขข้อมูลพร้อมอัปเดตรูปภาพ
app.put('/api/data/:pid', upload.single('productImage'), (req, res) => {
  const { pid } = req.params;
  const { menu, price_per_kg, type } = req.body;  // รวมฟิลด์ type
  const productImage = req.file ? req.file.filename : null;
  const imageUrl = productImage ? `http://localhost:3000/uploads/${productImage}` : null;  // ใช้ backticks สำหรับ Template Literal

  const sql = 'UPDATE product SET menu = ?, price_per_kg = ?, productimage = ?, type = ? WHERE pid = ?';
  db.query(sql, [menu, price_per_kg, imageUrl, type, pid], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).send(err);
    }
    res.json({
      message: 'Product updated successfully',
      product: { menu, price_per_kg, productimage: imageUrl, type },  // ตอบกลับพร้อมข้อมูลที่อัปเดต
    });
  });
});




// ล็อกเอาท์
app.post('/api/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(400);

  const sql = 'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?';
  db.query(sql, [refreshToken], (err, result) => {
    if (err) {
      console.error('Database update error:', err);
      res.status(500).send(err);
      return;
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// เอาไว้ เพิ่มข้อมูลจากตะกร้า ลง database orderdetail
app.post('/api/order', upload.single('slipImage'), (req, res) => {
  console.log('Order received:', req.body); // ดูข้อมูลที่ถูกส่งจาก client
  const orders = JSON.parse(req.body.orders); // ดึงข้อมูลการสั่งซื้อจาก body
  const slipImage = req.file ? req.file.filename : null; // ไฟล์รูปที่อัปโหลด
  const deliveryTime = req.body.deliveryTime; // ดึงเวลาการจัดส่ง

  // สร้าง URL สำหรับ SlipImage
  const slipImageUrl = slipImage ? `http://localhost:3000/uploads/${slipImage}` : null;

  // ดึง BillID ล่าสุดจากฐานข้อมูล
  db.query('SELECT MAX(BillID) AS maxBillID FROM orderdetail', (err, result) => {
    if (err) {
      console.error('Error fetching max BillID:', err);
      return res.status(500).json({ error: 'Error fetching max BillID: ' + err });
    }

    // ตรวจสอบว่า BillID มีหรือไม่ ถ้าไม่มีให้เริ่มที่ 1
    const maxBillID = result[0].maxBillID ? parseInt(result[0].maxBillID) : 0;
    const newBillID = (maxBillID + 1).toString().padStart(5, '0'); // ฟอร์แมตให้เป็น 5 หลัก เช่น 00001

    // เริ่ม transaction
    db.beginTransaction((err) => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).json({ error: 'Transaction error: ' + err });
      }

      const orderPromises = orders.map((order) => {
        const { PID, menu, Amount_per_kg, Price, Service, UserAddress, cname, Status } = order;

        const query = `
          INSERT INTO orderdetail (BillID, PID, menu, Amount_per_kg, Price, Service, UserAddress, cname, Status, SlipImage, DeliveryTime)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
          db.query(query, [newBillID, PID, menu, Amount_per_kg, Price, Service, UserAddress, cname, Status, slipImageUrl, deliveryTime], (error, results) => {
            if (error) {
              console.error('Query error:', error);
              return reject(error);
            }
            resolve(results);
          });
        });
      });

      // รอให้การ insert ทั้งหมดเสร็จสิ้น
      Promise.all(orderPromises)
        .then(() => {
          db.commit((err) => {
            if (err) {
              console.error('Commit error:', err);
              return db.rollback(() => {
                res.status(500).json({ error: 'Transaction commit error: ' + err });
              });
            }
            res.status(200).json({ message: 'Orders placed successfully', BillID: newBillID });
          });
        })
        .catch((error) => {
          console.error('Error inserting order:', error);
          db.rollback(() => {
            res.status(500).json({ error: 'Error inserting order: ' + error });
          });
        });
    });
  });
});




// ดึงข้อมูล orderdetail มาแสดง
app.get('/api/orders', (req, res) => {
  const sql = 'SELECT BillID, PID, menu, Amount_per_kg, Price, Service, UserAddress, cname, Status, DeliveryTime, SlipImage, review FROM orderdetail';
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(result);
  });
});


// เอาไว้อัพเดท status ของ orderdetail
app.put('/api/orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;

  const sql = 'UPDATE orderdetail SET Status = ? WHERE BillID = ?';
  db.query(sql, [Status, id], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully' });
  });
});

// เพิ่มบริการ
app.post('/api/service', (req, res) => {
  const { service_name, type } = req.body;

  const sql = 'INSERT INTO service (service_name, type) VALUES (?, ?)';
  db.query(sql, [service_name, type], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({
      message: 'Service added successfully',
      service: { service_name, type },
    });
  });
});

// ลบบริการ
app.delete('/api/service/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM service WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ message: 'Service deleted successfully' });
  });
});

// แก้ไขบริการ
app.put('/api/service/:id', (req, res) => {
  const id = req.params.id;
  const { service_name, type } = req.body;

  const sql = 'UPDATE service SET service_name = ?, type = ? WHERE id = ?';
  db.query(sql, [service_name, type, id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({
      message: 'Service updated successfully',
      service: { service_name, type },
    });
  });
});

// ดึงข้อมูลบริการ
app.get('/api/service', (req, res) => {
  const sql = 'SELECT * FROM service';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.put('/api/orderdetail/:billID', (req, res) => {
  const { billID } = req.params;
  const { review } = req.body;

  const sql = 'UPDATE orderdetail SET review = ? WHERE BillID = ?';
  db.query(sql, [review, billID], (err, result) => {
    if (err) {
      console.error('Error updating review:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบ BillID ที่ระบุ' });
    }
    res.json({ message: 'รีวิวถูกอัปเดตเรียบร้อยแล้ว' });
  });
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

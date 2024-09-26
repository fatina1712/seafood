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
      const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
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

// ใช้ middleware ใน endpoint ที่ต้องการ
app.get('/api/protected-data', authenticateToken, (req, res) => {
  const sql = 'SELECT id, username, email FROM users WHERE id = ?';
  db.query(sql, [req.user.userId], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(result[0]);
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
app.post('/api/data', (req, res) => {
  const { menu, price_per_kg, productimage } = req.body;
  const sql = 'INSERT INTO product ( menu, price_per_kg, productimage) VALUES ( ?, ?, ?)';
  db.query(sql, [menu, price_per_kg, productimage], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: 'Product added successfully', product: { menu, price_per_kg, productimage } });
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

//แก้ไขข้อมูล
app.put("/api/data/:id", (req, res) => {
  const id = req.params.id;
  const { menu, price_per_kg, productimage } = req.body;
  const sql = "UPDATE product SET menu = ?, price_per_kg = ?, productimage = ? WHERE pid = ?";
  db.query(sql, [menu, price_per_kg, productimage, id], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "Product updated successfully" });
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



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

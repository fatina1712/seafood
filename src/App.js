import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import UserInfo from './components/userinfo';
import EditProduct from './components/editproduct';
import Home from './components/home';
import OderUserHistory from './components/oderuserhistory';
import Admin from './components/admin';

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> {/* กำหนดให้หน้าแรกเปลี่ยนเส้นทางไปหน้า login */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userinfo" element={<UserInfo user={user} />} />
        <Route path="/editproduct" element={<EditProduct />} />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/orderhistory" element={<OderUserHistory user={user} />} />
        <Route path="/admin" element={<Admin user={user} />} />
      </Routes>
    </Router>
  );
};

export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import UserInfo from './components/userinfo';
import EditProduct from './components/editproduct';
import Home from './components/home';

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userinfo" element={<UserInfo user={user} />} />
        <Route path="/editproduct" element={<EditProduct /> } />
        <Route path="/home" element={<Home user={user} />} />
      </Routes>
    </Router>
  );
};

export default App;

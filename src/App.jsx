import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const naviage = useNavigate();

  // to save the token
  const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      if (remember) {
        if (userObj) localStorage.setItem('user', JSON.stringify(userObj));
        if (tokenStr) localStorage.setItem('token', tokenStr);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      } else {
        if (userObj) sessionStorage.setItem('user', JSON.stringify(userObj));
        if (tokenStr) sessionStorage.setItem('token', tokenStr);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      setUser(userObj || null);
      setToken(tokenStr || null);
    } catch (err) {
      console.error('persistAuth error:', err);
    }
  };

  const clearAuth = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    } catch (error) {
      console.log(error);
    }
    setUser(null);
    setToken(null);
  };

  const handleLogout = () => {
    clearAuth();
    naviage('/login');
  };

  const handleLogin = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, remember, tokenFromApi);
    naviage('/');
  }
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login onLogout={handleLogin} />} />
        <Route element={<Layout user={user} onLogout={handleLogout}/>}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

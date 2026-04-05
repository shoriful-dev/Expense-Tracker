import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import Signup from './components/SignUp';

const API_URL = 'http://localhost:8000';

// to get transactions from localstorage
const getTransactionsFromStorage = () => {
  const saved = localStorage.getItem('transactions');
  return saved ? JSON.parse(saved) : [];
};

// to protect the routes
const ProtectedRoute = ({ user, children }) => {
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');
  const hasToken = localToken || sessionToken;

  if(!user && !hasToken) {
    return <Navigate to="/login" replace/>;
  }
  return children;
}

// to scroll to top when the page is reloaded
const scrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({top: 0, left: 0, behavior: 'auto'});
  }, [location.pathname]);
  return null;
}

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // to update the user data both in state & storage
  

  const handleLogout = () => {
    clearAuth();
    naviage('/login');
  };

  const handleLogin = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, remember, tokenFromApi);
    naviage('/');
  }

  const handleSignup = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, remember, tokenFromApi);
    naviage('/');
  }
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login onLogout={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignUp={handleSignup} />} />
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

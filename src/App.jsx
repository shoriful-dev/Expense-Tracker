import { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import Signup from './components/SignUp';
import axios from 'axios';
import { API_URL } from './utils/api';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePreferences } from './context/PreferencesContext.jsx';



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

  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// to scroll to top when the page is reloaded
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);
  return null;
};

const App = () => {
  usePreferences(); // keep provider alive for digits toggle
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

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
  const updateUserData = updateUser => {
    setUser(updateUser);

    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    if (localToken) {
      localStorage.setItem('user', JSON.stringify(updateUser));
    } else if (sessionToken) {
      sessionStorage.setItem('user', JSON.stringify(updateUser));
    }
  };

  // try to load user with token when mounted
  useEffect(() => {
    (async () => {
      try {
        const localUserRow = localStorage.getItem('user');
        const sessionUserRow = sessionStorage.getItem('user');
        const localToken = localStorage.getItem('token');
        const sessionToken = sessionStorage.getItem('token');

        const storedUser = localUserRow
          ? JSON.parse(localUserRow)
          : sessionUserRow
            ? JSON.parse(sessionUserRow)
            : null;
        const storedToken = localToken || sessionToken || null;
        const tokenFromLocal = !!localToken;

        if (storedUser) {
          setUser(storedUser);
          setToken(storedToken);
          setIsLoading(false);
          return;
        }

        if (storedToken) {
          try {
            const res = await axios.get(`${API_URL}/api/user/me`, {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            });
            const profile = res.data;
            persistAuth(profile, storedToken, tokenFromLocal);
          } catch (fetchError) {
            console.warn('could not fetch user profile with token', fetchError);
            clearAuth();
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);

        try {
          setTransaction(getTransactionsFromStorage());
        } catch (error) {
          console.log(error);
        }
      }
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transaction));
    } catch (error) {
      console.log(error);
    }
  }, [transaction]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleLogin = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember);
    navigate('/');
  };

  const handleSignup = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember);
    navigate('/');
  };

  // transaction helpers
  const addTransaction = newTransaction =>
    setTransaction(p => [newTransaction, ...p]);
  const editTransaction = (id, updatedTransaction) =>
    setTransaction(p =>
      p.map(t => (t.id === id ? { ...updatedTransaction, id } : t)),
    );
  const deleteTransaction = id =>
    setTransaction(p => p.filter(t => t.id !== id));
  const refreshTransactions = () =>
    setTransaction(getTransactionsFromStorage());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignUp={handleSignup} />} />

        <Route
          element={
            <ProtectedRoute user={user}>
              <Layout
                user={user}
                onLogout={handleLogout}
                transactions={transaction}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
                refreshTransactions={refreshTransactions}
              />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={<Dashboard />}
            transactions={transaction}
            addTransaction={addTransaction}
            editTransaction={editTransaction}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}
          />

          <Route
            path="/income"
            element={
              <Income
                transactions={transaction}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
                refreshTransactions={refreshTransactions}
              />
            }
          />

          <Route
            path="/expense"
            element={
              <Expense
                transactions={transaction}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
                refreshTransactions={refreshTransactions}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <Profile
                user={user}
                onUpdateProfile={updateUserData}
                onLogout={handleLogout}
              />
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? '/' : '/login'} replace />}
        />
      </Routes>
    </>
  );
};

export default App;

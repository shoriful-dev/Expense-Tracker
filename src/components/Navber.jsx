import React, { useEffect, useRef, useState } from 'react';
import { navbarStyles } from '../assets/dummyStyles';
import img1 from '../assets/logo.png';
import { ChevronDown, LogOut, User, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePreferences } from '../context/PreferencesContext.jsx';

const BASE_URL = 'http://localhost:8000/api';

const Navber = ({user: propUser, onLogout}) => {
  const navigate = useNavigate();
  const menuref = useRef()
  const [menuOpen, setMenuOpen] = useState(false);
  const { prefs, setDigits } = usePreferences();

  const user = propUser || {
    name: '',
    email: '',
  };

  // Reliance on propUser passed from parent

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem('token');
    onLogout?.();
    navigate('/login');
  }

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // close the toggle menu if click outside the box
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if(menuref.current && !menuref.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    }
  }, [])

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className={navbarStyles.logoContainer}
        >
          <div className={navbarStyles.logoImage}>
            <img src={img1} alt="Logo" />
          </div>
          <span className={navbarStyles.logoText}>Expense Tracker</span>
        </div>
        {/* if user is logged in */}
        {user && (
          <div className={navbarStyles.userContainer} ref={menuref}>
            <button onClick={toggleMenu} className={navbarStyles.userButton}>
              <div className="relative">
                <div className={navbarStyles.userAvatar}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className={navbarStyles.statusIndicator}></div>
              </div>
              <div className={navbarStyles.userTextContainer}>
                <p className={navbarStyles.userName} title={user?.name || 'User'}>
                  {user?.name || 'User'}
                </p>
                <p
                  className={navbarStyles.userEmail}
                  title={user?.email || 'user@expensetracker.com'}
                >
                  {user?.email || 'user@expensetracker.com'}
                </p>
              </div>
              <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
            </button>
            {/* dropdown menu */}
            {menuOpen && (
              <div className={navbarStyles.dropdownMenu}>
                <div className={navbarStyles.dropdownHeader}>
                  <div className="flex items-center gap-3">
                    <div className={navbarStyles.dropdownAvatar}>
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="">
                      <div className={navbarStyles.dropdownName}>
                        {user?.name || 'User'}
                      </div>
                      <div className={navbarStyles.dropdownEmail}>
                        {user?.email || 'user@expensetracker.com'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={navbarStyles.menuItemContainer}>
                  <button onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile');
                  }} className={navbarStyles.menuItem}>
                    <User className='w-4 h-4'/>
                    <span>My Profile</span>
                  </button>
                </div>

                <div className={navbarStyles.menuItemContainer}>
                  <button
                    onClick={() => {
                      const next = prefs.digits === 'bn' ? 'en' : 'bn';
                      setDigits(next);
                    }}
                    className={navbarStyles.menuItem}
                    title="Toggle Bengali/English digits"
                  >
                    <Languages className="w-4 h-4 text-teal-700" />
                    <span>
                      Digits: {prefs.digits === 'bn' ? 'বাংলা' : 'English'}
                    </span>
                  </button>
                </div>

                <div className={navbarStyles.menuItemBorder}>
                  <button onClick={handleLogout} className={navbarStyles.logoutButton}>
                    <LogOut className='w-4 h-4'/>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navber;

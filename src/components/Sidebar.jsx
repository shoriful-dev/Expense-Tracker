import { useEffect, useRef, useState } from 'react';
import { sidebarStyles, cn } from '../assets/dummyStyles';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react';

const MENU_ITEMS = [
  { text: 'Dashboard', path: '/', icon: <Home size={20} /> },
  { text: 'Income', path: '/income', icon: <ArrowUp size={20} /> },
  { text: 'Expenses', path: '/expense', icon: <ArrowDown size={20} /> },
  // Keep Profile linking to Home, but don't share the same active match as Dashboard.
  { text: 'Profile', path: '/profile', to: '/', icon: <User size={20} /> },
];

const Sidebar = ({ user, isCollapsed, setIsCollapsed }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

  const { name: username = 'User', email = 'user@example.com' } = user || {};
  const initial = username.charAt(0).toUpperCase();

  // to check for overflow in mobile
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen]);

  // to logout the user
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSidebar = () => setIsCollapsed(c => !c);

  // a small components
  const renderMenuItem = ({ text, path, icon }) => {
    const isActive = pathname === path;
    return (
      <li key={text}>
        <Link
          to={MENU_ITEMS.find(i => i.text === text)?.to || path}
          className={cn(
            sidebarStyles.menuItem.base,
            isActive
              ? sidebarStyles.menuItem.active
              : sidebarStyles.menuItem.inactive,
            isCollapsed
              ? sidebarStyles.menuItem.collapsed
              : sidebarStyles.menuItem.expanded,
          )}
          onMouseEnter={() => setActiveHover(text)}
          onMouseLeave={() => setActiveHover(null)}
        >
          <span
            className={
              isActive
                ? sidebarStyles.menuIcon.active
                : sidebarStyles.menuIcon.inactive
            }
          >
            {icon}
          </span>
          {!isCollapsed && (
            <span>{text}</span>
          )}
          {activeHover === text && !isActive && !isCollapsed && (
            <span className={sidebarStyles.activeIndicator}></span>
          )}
        </Link>
      </li>
    );
  };
  return (
    <>
      <div
        ref={sidebarRef}
        className={sidebarStyles.sidebarContainer.base}
        style={{ width: isCollapsed ? 80 : 256 }}
      >
        <div className={sidebarStyles.sidebarInner.base}>
          <button
            onClick={toggleSidebar}
            className={sidebarStyles.toggleButton.base}
          >
            <div style={{ transform: `rotate(${isCollapsed ? 0 : 180}deg)` }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline
                  points={isCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'}
                ></polyline>
              </svg>
            </div>
          </button>

          <div
            className={cn(
              sidebarStyles.userProfileContainer.base,
              isCollapsed
                ? sidebarStyles.userProfileContainer.collapsed
                : sidebarStyles.userProfileContainer.expanded,
            )}
          >
            <div className="flex items-center">
              <div className={sidebarStyles.userInitials.base}>{initial}</div>
              {!isCollapsed && (
                <div className="ml-3 overflow-hidden">
                  <h2
                    className="text-sm font-bold text-gray-800 truncate"
                    title={username}
                  >
                    {username}
                  </h2>
                  <p className="text-xs text-gray-500 truncate" title={email}>
                    {email}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <ul className={sidebarStyles.menuList.base}>
              {MENU_ITEMS.map(renderMenuItem)}
            </ul>
          </div>

          <div
            className={cn(
              sidebarStyles.footerContainer.base,
              isCollapsed
                ? sidebarStyles.footerContainer.collapsed
                : sidebarStyles.footerContainer.expanded,
            )}
          >
            <a
              href="https://www.shoriful.me/#contact"
              target="_blank"
              rel="noreferrer"
              className={cn(
                sidebarStyles.footerLink.base,
                isCollapsed
                  ? sidebarStyles.footerLink.collapsed
                  : sidebarStyles.footerLink.expanded,
              )}
            >
              <HelpCircle size={20} className="text-gray-500" />
              {!isCollapsed && <span>Support</span>}
            </a>

            <button
              onClick={handleLogout}
              className={cn(
                sidebarStyles.logoutButton.base,
                isCollapsed && sidebarStyles.logoutButton.collapsed,
              )}
            >
              <LogOut size={20} className="text-gray-500" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setMobileOpen(prev => !prev)}
        className={sidebarStyles.mobileMenuButton}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className={sidebarStyles.mobileOverlay}>
          <div
            className={sidebarStyles.mobileBackdrop}
            onClick={() => setMobileOpen(false)}
          />

          <div ref={sidebarRef} className={sidebarStyles.mobileSidebar.base}>
            <div className="relative h-full flex flex-col">
              <div className={sidebarStyles.mobileHeader}>
                <div className={sidebarStyles.mobileUserContainer}>
                  <div className={sidebarStyles.userInitials.base}>{initial}</div>
                  <div className="">
                    <h2 className="text-lg font-bold text-gray-800">
                      {username}
                    </h2>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className={sidebarStyles.mobileCloseButton}
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <ul className={sidebarStyles.mobileMenuList}>
                  {MENU_ITEMS.map(({ text, path, icon }) => (
                    <li key={text}>
                      <Link
                        to={path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          sidebarStyles.mobileMenuItem.base,
                          pathname === path
                            ? sidebarStyles.mobileMenuItem.active
                            : sidebarStyles.mobileMenuItem.inactive,
                        )}
                      >
                        <span
                          className={
                            pathname === path
                              ? sidebarStyles.menuIcon.active
                              : sidebarStyles.menuIcon.inactive
                          }
                        >
                          {icon}
                        </span>
                        <span>{text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={sidebarStyles.mobileFooter}>
                <a
                  href="https://shoriful.me"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className={sidebarStyles.mobileFooterLink}
                >
                  <HelpCircle size={20} className="text-gray-500" />
                  <span>Support</span>
                </a>

                <button
                  onClick={handleLogout}
                  className={sidebarStyles.mobileLogoutButton}
                >
                  <LogOut size={20} className="text-gray-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

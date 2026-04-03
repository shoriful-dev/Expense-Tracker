import React, { useState } from 'react';
import { styles } from '../assets/dummyStyles';
import Navber from './Navber';
import Sidebar from './Sidebar';

const Layout = ({ onLogout, user }) => {
  const [sidebarCollapsed, setsidebarCollapsed] = useState(false);
  return (
    <div className={styles.layout.root}>
      <Navber user={user} onLogout={onLogout}/>
      <Sidebar user={user} isCollapsed={sidebarCollapsed} setIsCollapsed={setsidebarCollapsed}/>
    </div>
  );
};

export default Layout;

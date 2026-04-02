import React from 'react';
import { styles } from '../assets/dummyStyles';
import Navber from './Navber';

const Layout = ({ onLogout, user }) => {
  return (
    <div className={styles.layout.root}>
      <Navber user={user} onLogout={onLogout}/>
    </div>
  );
};

export default Layout;

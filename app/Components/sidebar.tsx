'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import styles from './sidebar.module.css';

const Sidebar: React.FC = () => {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min');
  }, []);

  return (
    <div>
        <div className={styles.sidebar}>
        </div>
    </div>
  );
};

export default Sidebar;
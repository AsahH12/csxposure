'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './footer.module.css';

const Footer: React.FC = () => {

  return (
    <nav className={styles.footer}>
      <div className={styles.footerLinks}>
        <Link href="/" className={styles.footerLink}>About</Link>
        <Link href="/" className={styles.footerLink}>Terms & Conditions</Link>
        <Link href="/" className={styles.footerLink}>Contact</Link>
        <Link href="/Home" className={styles.footerLink}>Home Page</Link>
      </div>
    </nav>
  );
};

export default Footer;

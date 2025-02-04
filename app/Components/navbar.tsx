'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import styles from './navbar.module.css';

const profilePhotoUrl = '/placeholder-profile.jpg';

const Navbar: React.FC = () => {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min');
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className="navbar-start">
        <div className="navbar-logo">
          <Link href="/Home" className="text-white">
            <img
              src="/logo.png"
              alt="Logo"
              width={210}
              height={50}
              className=""
            />
          </Link>
        </div>
      </div>
      <ul className="navbar-end d-flex align-items-center ">

         {/* Profile Dropdown */}
         <div className="nav-item dropdown mx-2">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="navbarDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <img
              src={profilePhotoUrl}
              alt="Profile"
              width={50}
              height={50}
              className="rounded-circle"
            />
          </a>
          <div className="dropdown-menu" aria-labelledby="navbarDropdown">
            <Link href="/Authentication" className="dropdown-item">
              Login/SignUp
            </Link>
            <Link href="/ProfileEditPage" className="dropdown-item">
              My Profile
            </Link>
            <div className="dropdown-divider"></div>
            <Link href="/logout" className="dropdown-item">
              Logout
            </Link>
          </div>
        </div>
        {/* Notification Icon */}
        <div className="nav-item">
          <Link href="/" className="text-white mx-2 me-5">
            <img
              src="Notification_White_False.png"
              alt="Notifications"
              width={50}
              height={50}
            />
          </Link>
        </div>

      </ul>
    </nav>
  );
};

export default Navbar;
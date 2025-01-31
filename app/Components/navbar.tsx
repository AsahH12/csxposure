'use client';
import React from 'react';
import Link from 'next/link';
// import './navbar.css';

const profilePhotoUrl = '/placeholder-profile.jpg';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar navbar-dark bg-primary text-white p-4">
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
        <ul className="navbar-end">
        <Link href="/Authentication" className="text-white mx-2">
            <img
              src="placeholder-profile.jpg" // Placeholder for now, will be replaced with Firebase URL
              alt="Profile"
              width={50}
              height={50}
              className="rounded-circle" 
            />
        </Link>
            {/* <Link href="/Authentication" className="text-white mx-2">
                Profile
            </Link> */}
            <Link href="/" className="text-white mx-2">
                Notifications
            </Link>
        </ul>
    </nav>
);
};

export default Navbar;

'use client';
import React from 'react';
import Link from 'next/link';
// import './navbar.css';


const Navbar: React.FC = () => {
    return (
    <nav className="navbar navbar-dark bg-primary text-white p-4">
        <div className="nabar-start">
            <div className="navbar-logo">
                <Link href="/Home" className="text-white">
                    CSXposure
                </Link>
            </div>
        </div>
        <ul className="navbar-end">
            <Link href="/Authentication" className="text-white mx-2">Profile</Link>
            <Link href="/" className="text-white mx-2">Notifications</Link>
        </ul>
    </nav>
    );
};

export default Navbar;

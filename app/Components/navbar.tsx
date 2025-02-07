"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./navbar.module.css";
import ChatOverlay from "./ChatOverlay";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const profilePhotoUrl = "/placeholder-profile.jpg";

const Navbar: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<boolean>(false); // Track user authentication state

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min");

    // Check Firebase authentication state
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(!!currentUser); // Set user state to true if logged in, false otherwise
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // Toggle chat open/close
  const toggleChat = () => {
    if (user) {
      setIsChatOpen((prev) => !prev); // Open chat if user is logged in
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className="navbar-start">
        <div className="navbar-logo">
          <Link href="/Home" className="text-white">
            <img src="/logo.png" alt="Logo" width={210} height={50} />
          </Link>
        </div>
      </div>

      <ul className="navbar-end d-flex align-items-center">
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
            {!user && (
              <Link href="/Authentication" className="dropdown-item">
                Login/SignUp
              </Link>
            )}
            {user && (
              <>
                <Link href="/ProfileEditPage" className="dropdown-item">
                  My Profile
                </Link>
                <div className="dropdown-divider"></div>
                <Link href="/logout" className="dropdown-item">
                  Logout
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Notification Icon - Toggles Chat or Redirects to Authentication */}
        <div className="nav-item">
          {user ? (
            <button
              onClick={toggleChat}
              className="btn p-0 border-0 bg-transparent me-5 mx-2"
            >
              <img
                src="Notification_White_False.png"
                alt="Notifications"
                width={50}
                height={50}
              />
            </button>
          ) : (
            <Link href="/Authentication">
              <img
                src="Notification_White_False.png"
                alt="Notifications"
                width={50}
                height={50}
                className="cursor-pointer"
              />
            </Link>
          )}
        </div>
      </ul>

      {/* Show ChatOverlay when isChatOpen is true */}
      {isChatOpen && <ChatOverlay onClose={() => setIsChatOpen(false)} />}
    </nav>
  );
};

export default Navbar;


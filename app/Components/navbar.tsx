"use client";
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '../../firebaseconfig'; // Assuming you have firebase initialized here
import { doc, getDoc } from "firebase/firestore";
import Link from 'next/link';
import styles from './navbar.module.css'; // Assuming you have a CSS module for styling
import ChatOverlay from "./ChatOverlay"; // Adjust the path as needed
import 'bootstrap/dist/css/bootstrap.min.css';

// Function to get initials from first and last name
const getInitials = (firstName: string | null, lastName: string | null) => {
  const firstInitial = firstName?.charAt(0).toUpperCase() || "";
  const lastInitial = lastName?.charAt(0).toUpperCase() || "";
  return firstInitial + lastInitial;
};

const Navbar: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<any>(null); // Track user authentication state
  const [firstName, setFirstName] = useState<string | null>(null); // Track first name
  const [lastName, setLastName] = useState<string | null>(null); // Track last name
  const [userType, setUserType] = useState<string | null>(null); // Track userType
  const [profileImage, setProfileImage] = useState<string | null>(null); // Track profile image

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min");

    // Check Firebase authentication state
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("User data:", currentUser); // Log current user to check if it's coming through
      if (currentUser) {
        setUser(currentUser);

        // Fetch userType from users/{uid}
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserType(userData?.userType || null);
        } else {
          setUserType(null);
        }

        const profileRef = doc(db, "users", currentUser.uid, "details", "profileData");
        const profileSnap = await getDoc(profileRef);

        // Set profile image
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          setFirstName(profileData?.firstName || "");
          setLastName(profileData?.lastName || "");
          setProfileImage(profileData?.profileImage || null); // Store profile image
        } else {
          console.log("No profile data found in Firestore");
          setFirstName(currentUser.displayName?.split(" ")[0] || "");
          setLastName(currentUser.displayName?.split(" ")[1] || "");
          setProfileImage(null);
        }
      } else {
        setUser(null);
        setFirstName(null);
        setLastName(null);
        setUserType(null);
        setProfileImage(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Get initials from the user's first and last name
  const initials = getInitials(firstName, lastName);

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
            aria-expanded="true"
          >
            {/* Display Profile Image or Initials */}
            {profileImage ? (
              <img src={profileImage} alt="Profile" className={styles.profileImage} />
            ) : user ? (
              initials ? (
                <span className={styles.profileInitials}>{initials}</span>
              ) : (
                <img src="/placeholder-profile.jpg" alt="Default Profile" className={styles.profileImage} />
              )
            ) : (
              <img src="/placeholder-profile.jpg" alt="Default Profile" className={styles.profileImage} />
            )}
          </a>

          <div className="dropdown-menu" aria-labelledby="navbarDropdown">
            {!user && (
              <Link href="/Authentication" className="dropdown-item">
                Login/SignUp
              </Link>
            )}
            {user && userType && (
              <>
                <Link href={userType === "business" ? "/BusinessEditPage" : "/ProfileEditPage"} className="dropdown-item">
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

        {/* Notification Icon */}
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
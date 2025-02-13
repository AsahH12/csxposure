"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import styles from "./navbar.module.css";
import ChatOverlay from "./ChatOverlay";
import { db } from "../../firebaseconfig";


// Function to get initials from first and last name
const getInitials = (firstName: string | null, lastName: string | null) => {
  const firstInitial = firstName?.charAt(0).toUpperCase() || "";
  const lastInitial = lastName?.charAt(0).toUpperCase() || "";
  return firstInitial + lastInitial;
};

const Navbar: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState(null); // Track user authentication state
  const [firstName, setFirstName] = useState<string | null>(null); // Track first name
  const [lastName, setLastName] = useState<string | null>(null); // Track last name
  const [userType, setUserType] = useState<string | null>(null); // Track userType
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min");

    // Check Firebase authentication state
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("User data:", currentUser); // Log current user to check if it's coming through

      if (currentUser) {
        setUser(currentUser); // Set user to the current Firebase user

        // Fetch user data from Firestore (profileData)
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const firstName = userData?.profileData?.firstName || '';
          const lastName = userData?.profileData?.lastName || '';

          console.log("Fetched User Data from Firestore:", userData); // Check the fetched data
          console.log("First Name:", firstName); // Debugging: Check the first name
          console.log("Last Name:", lastName); // Debugging: Check the last name

          setFirstName(firstName); // Set first name
          setLastName(lastName); // Set last name
        } else {
          console.log("No profile data found in Firestore"); // Debugging: Log if no data is found
          setFirstName(currentUser.displayName?.split(" ")[0] || ""); // Fallback first name
          setLastName(currentUser.displayName?.split(" ")[1] || ""); // Fallback last name
        }
      } else {
        setUser(null); // No user is logged in
        setFirstName(null); // Reset first name
        setLastName(null); // Reset last name
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
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
            aria-expanded="false"
          >
            {/* Display initials directly in gray */}
            {initials ? (
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "gray", // Set text color to gray
                }}
              >
                {initials}
              </span>
            ) : (
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "gray", // Set text color to gray
                }}
              >
                ?
              </span>
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

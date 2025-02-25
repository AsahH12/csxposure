'use client'
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '../../firebaseconfig';
import { doc, getDoc, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import Link from 'next/link';
import styles from './navbar.module.css';
import ChatOverlay from "./ChatOverlay";
import 'bootstrap/dist/css/bootstrap.min.css';
import { updateDoc } from "firebase/firestore";

const getInitials = (firstName: string | null, lastName: string | null) =>
  `${firstName?.charAt(0).toUpperCase() ?? ""}${lastName?.charAt(0).toUpperCase() ?? ""}`;

const Navbar: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false); // Set default to false
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min");
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        const unread = await checkUnreadMessages(currentUser.email, setHasUnreadMessages); // Await the promise
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
        resetUserData();
      }
    });
    return () => unsubscribe();
  }, []);

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const fetchUserData = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    setUserType(userSnap.exists() ? userSnap.data()?.userType ?? null : null);

    const profileRef = doc(db, "users", uid, "details", "profileData");
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      const { firstName, lastName, profileImage } = profileSnap.data();
      setFirstName(firstName ?? "");
      setLastName(lastName ?? "");
      setProfileImage(profileImage ?? null);
    } else {
      const [first, last] = user?.displayName?.split(" ") ?? ["", ""];
      setFirstName(first);
      setLastName(last);
      setProfileImage(null);
    }
  };

  const resetUserData = () => {
    setFirstName(null);
    setLastName(null);
    setUserType(null);
    setProfileImage(null);
    setHasUnreadMessages(false); // Reset unread messages status
  };

  // Function to check unread messages and update notification button
  const checkUnreadMessages = (userEmail: string, callback: (hasUnread: boolean) => void): void => {
    // Remove .com from the email to match the structure in the readMessages map
    const emailWithoutDotCom = userEmail.replace('.com', '');

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", userEmail));

    // Set up the real-time listener
    onSnapshot(q, (snapshot) => {
      let hasUnread = false;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log("🔍 Checking chat:", doc.id);

        const readMessages = data.readMessages;
        if (!readMessages) {
          console.log("❌ No readMessages data found for this chat.");
          return;
        }

        const userReadMessages = readMessages[emailWithoutDotCom] || {};
        const otherUserEmail = data.participants.find((email: string) => email !== userEmail);
        const otherUserEmailWithoutDotCom = otherUserEmail.replace('.com', '');
        const otherUserReadMessages = readMessages[otherUserEmailWithoutDotCom] || {};

        // Log the readMessages for both users
        console.log(`📥 ${userEmail}'s read messages:`, userReadMessages);
        console.log(`📤 ${otherUserEmail}'s read messages:`, otherUserReadMessages);

        // Compare the number of read messages
        if (userReadMessages.com && otherUserReadMessages.com && userReadMessages.com.length < otherUserReadMessages.com.length) {
          hasUnread = true;
          console.log(`🚨 Unread messages exist in chat ${doc.id}.`);
        }
      });
      // Call the callback to return the boolean value
      callback(hasUnread);
    });
  };

  const toggleChat = async () => {
    if (user) {
      setIsChatOpen((prev) => !prev);
      if (!isChatOpen && currentChatId) {
        await setReadTimestamp(user.email, currentChatId); // Make sure currentChatId is available, which is the ID of the current chat
      }
    }
  };

  const setReadTimestamp = async (userEmail: string, chatId: string) => {
    const chatRef = doc(db, "chats", chatId); // Reference the chat document
    const currentTimestamp = new Date(); // Get the current time when the user opens the chat

    // Update the readTimestamp field for the specific user in the chat document
    await updateDoc(chatRef, {
      [`readTimestamp.${userEmail}`]: currentTimestamp,
    });
  };

  const initials = getInitials(firstName, lastName);

  return (
    <nav className={styles.navbar}>
      <div className="navbar-start">
        <Link href="/Home">
          <img src="/logo.png" alt="Logo" width={210} height={50} />
        </Link>
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
            <button onClick={toggleChat} className="btn p-0 border-0 bg-transparent me-5 mx-2">
              <img
                key={hasUnreadMessages ? "unread" : "read"} // Force re-render
                src={hasUnreadMessages ? "Notification_White_True.png" : "Notification_White_False.png"}
                alt="Notifications"
                width={50}
                height={50}
              />
            </button>
          ) : (
            <Link href="/Authentication">
              <img src="Notification_White_False.png" alt="Notifications" width={50} height={50} />
            </Link>
          )}
        </div>
      </ul>

      {isChatOpen && <ChatOverlay onClose={() => setIsChatOpen(false)} />}
    </nav>
  );
};

export default Navbar;

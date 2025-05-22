'use client'
import React, { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from '../../firebaseconfig';
import { doc, getDoc, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import Link from 'next/link';
import styles from './navbar.module.css';
import ChatOverlay from "./ChatOverlay";
import 'bootstrap/dist/css/bootstrap.min.css';
import { updateDoc } from "firebase/firestore";
import { UserContext } from '../Utility/UserContext';

const getInitials = (firstName: string | null, lastName: string | null) =>
  `${firstName?.charAt(0).toUpperCase() ?? ""}${lastName?.charAt(0).toUpperCase() ?? ""}`;

const Navbar: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const { profileImage } = useContext(UserContext)!;  
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false); // Set default to false
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min");
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        await checkUnreadMessages(currentUser.email!, setHasUnreadMessages); 
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
    const profileRef = doc(db, "users", uid, "details", "profileData");
  
    try {
      const [userSnap, profileSnap] = await Promise.all([getDoc(userRef), getDoc(profileRef)]);
  
      if (userSnap.exists()) {
        setUserType(userSnap.data()?.userType ?? null);
      }
  
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
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };  

  const resetUserData = () => {
    setFirstName(null);
    setLastName(null);
    setUserType(null);
    setProfileImage(null); // Clear profile image from context
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

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // Clear user data immediately
      resetUserData();
      // Redirect to home or login page
      window.location.href = '/Authentication'; // or wherever you want to redirect after logout
    } catch (error) {
      console.error("Error signing out:", error);
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
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="dropdown-item">
                  Logout
                </a>
              </>
            )}
          </div>
        </div>

        {/* Notification Icon */}
        <div className="nav-item">
          {user ? (
            <button onClick={toggleChat} className="btn p-0 border-0 bg-transparent me-2">
              <img
                key={hasUnreadMessages ? "unread" : "read"} // Force re-render
                src={hasUnreadMessages ? "/Notification_White_True.png" : "/Notification_White_False.png"}
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

        {/* Workspace Icon */}
        <div className="nav-item">
            <Link href="/CodeEditor" className="btn p-0 border-0 bg-transparent me-5 mx-2">
              <img
                src={"/icon_WorkSpace.png"}
                alt="Notifications"
                width={60}
                height={60}
              />
            </Link>
        </div>
      </ul>

      {isChatOpen && <ChatOverlay onClose={() => setIsChatOpen(false)} />}
    </nav>
  );
};

export default Navbar;
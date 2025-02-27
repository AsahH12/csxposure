"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from "../../firebaseconfig";
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface UserContextType {
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profileRef = doc(db, 'users', user.uid, 'details', 'profileData');
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfileImage(profileSnap.data().profileImage || null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </UserContext.Provider>
  );
};

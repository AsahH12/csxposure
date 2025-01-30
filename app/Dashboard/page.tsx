"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../firebaseconfig"; // Ensure Firebase is set up correctly
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

const DashboardPage: React.FC = () => {
  const [profiles, setProfiles] = useState<string[]>([]); // Store profiles (emails)
  const [selectedProfile, setSelectedProfile] = useState<string>(""); // Track selected profile's email
  const router = useRouter();

  // Fetch profiles from the 'users' collection and store emails in state
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setProfiles(snapshot.docs.map((doc) => doc.data().email)); // Assuming emails are stored under 'email'
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  // Handle dropdown selection
  const handleProfileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProfile(e.target.value);
  };

  // Navigate to the chat page with the selected profile's email
  const handleChatClick = () => {
    if (selectedProfile) {
      // Route to the ChatServer page with the selected profile's email
      router.push(`/ChatServer/${selectedProfile}`);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Gmail selection dropdown */}
      <div>
        <label htmlFor="profileSelect">Select a Profile:</label>
        <select id="profileSelect" onChange={handleProfileSelect} value={selectedProfile}>
          <option value="">Select a profile</option>
          {profiles.map((email, index) => (
            <option key={index} value={email}>
              {email}
            </option>
          ))}
        </select>
      </div>

      {/* Chat button */}
      <button onClick={handleChatClick} disabled={!selectedProfile}>
        Start Chat
      </button>

      {/* Optionally show the selected Gmail */}
      {selectedProfile && (
        <div>
          <p>Selected Gmail: {selectedProfile}</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

'use client';
import React, { useEffect, useState } from 'react';
import './studentProfile.css'; 
import Footer from '../Components/footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '../../firebaseconfig';  // Make sure this imports the correct Firebase setup
import { doc, getDoc } from 'firebase/firestore';

const ProfileEditPage: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);  // Store the user data from Firestore
  const [loading, setLoading] = useState(true);  // Loading state to handle the fetch process
  
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');  // Get the userId from the query parameters

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          // Reference to the user's profileData document
          const profileDocRef = doc(db, 'users', userId, 'details', 'profileData');
          const profileDocSnap = await getDoc(profileDocRef);

          if (profileDocSnap.exists()) {
            // Set the user data from Firestore
            setUserData(profileDocSnap.data());
          } else {
            console.log("No profile data found for this user");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId]);  // Trigger the effect only when userId changes

  // Handle loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  // If no user data is found
  if (!userData) {
    return <p>No profile found.</p>;
  }

  return (
    <div>
      <div className="student-profile-container">
        <div className="student-profile-card">
          <div className="project-section">
            <div className="project-grid">
              {[...Array(4)].map((__, index) => (
                <Link className="link" href="/StudentProjectPage" key={index}>
                  <button key={index} className="show-project">Project</button>
                </Link>
              ))}
            </div>
          </div>

          <div className="profile-form">
            <div className="profile-picture">    {/* Populate profile image */}
              {userData.profileImage ? (
                <img src={userData.profileImage} alt="Profile" className="profile-picture"/>
              ) : (
                <span className="initials">{userData.firstName[0]}{userData.lastName[0]}</span>
              )}</div> 

            <div className="name-group">
              <div className="first-name">{userData.firstName}</div>  {/* Populate first name */}
              <div className="last-name">{userData.lastName}</div>    {/* Populate last name */}
            </div>

            <div className="form-group">
              <label>Status:</label>
              <div className="input-field">{userData.status}</div>
            </div>

            <div className="form-group">
              <label>School:</label>
              <div className="input-field">{userData.school}</div>  {/* Populate school */}
            </div>

            <div className="form-group">
              <label>Bio:</label>
              <h1 className="bio-field">{userData.bio}</h1>   {/* Populate bio */}
            </div>

            <div className="form-group">
              <h2 className="section-title">Links</h2>
              {/* Add dynamic links if they are available in userData */}
              {userData.links && userData.links.map((link: { type: string, url: string }, index: number) => (
                <a href={link.url} key={index} className={link.type}>{link.type}</a>
              ))}
            </div>

            <div className="chat-button-container">
              <button className="chat-button">Chat</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileEditPage;

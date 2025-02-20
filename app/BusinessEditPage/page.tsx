'use client';
import React, { useEffect, useState } from 'react';
import { auth, db } from "../../firebaseconfig";
import { setDoc, doc, updateDoc, getDoc } from "firebase/firestore"; 
import { onAuthStateChanged } from "firebase/auth";
import './businessEdit.css';
import Link from 'next/link'
import Footer from '../Components/footer';

const BusinessEditPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState([{ type: '', url: '' }]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState('student');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setAccountType(userData.userType || 'student');
            
            const profileDocRef = doc(db, "users", user.uid, "details", "profileData");
            const profileDocSnap = await getDoc(profileDocRef);

            if (profileDocSnap.exists()) {
              const data = profileDocSnap.data();
              setFirstName(data.firstName || '');
              setLastName(data.lastName || '');
              setBusinessName(data.businessName || '');
              setIndustry(data.industry || '');
              setBio(data.bio || '');
              setLinks(data.links || [{ type: '', url: '' }]);
              setProfileImage(data.profileImage || null);
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          alert("Failed to fetch profile data.");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    setLinks([...links, { type: '', url: '' }]);
  };

  const saveProfile = async () => {
    try {
      const user = auth.currentUser; 
      const userId = user?.uid;
      if (!userId) return;
      
      const userDocRef = doc(db, "users", userId, "details", "profileData");
      const userDocSnap = await getDoc(userDocRef);

      const profileData = {
        firstName,
        lastName,
        businessName,
        industry,
        bio,
        links,
        profileImage,
      };
      
      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, profileData);
      } else {
        await setDoc(userDocRef, profileData, { merge: true });
      }

      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="business-edit-container">
        <div className="business-edit-card">
          <div className="profile-form">
            <label className="profile-picture" htmlFor="imageUpload">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-img" />
              ) : (
                <span className="text">Click to upload</span>
              )}
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            <div className="name-group">
              <input
                type="text"
                placeholder="First Name"
                className="name-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              
              <input
                type="text"
                placeholder="Last Name"
                className="name-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="Business Name"
              className="input-field"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Industry"
              className="input-field"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />

            <textarea
              className="input-field bio-field"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <h2 className="section-title">Links</h2>
            {links.map((link, index) => (
              <div key={index} className="link-group">
                <input
                  type="text"
                  placeholder="Type (e.g., Website, LinkedIn)"
                  className="input-field"
                  value={link.type}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index].type = e.target.value;
                    setLinks(newLinks);
                  }}
                />
                <input
                  type="text"
                  placeholder="URL Link"
                  className="input-field"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index].url = e.target.value;
                    setLinks(newLinks);
                  }}
                />
              </div>
            ))}
            {/* <button onClick={addLink} className="add-link">+ Add Link</button> */}

            <button className="save-button" onClick={saveProfile}>Save</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessEditPage;

'use client';
import React, { useEffect, useState } from 'react';
import { auth, db } from "../../firebaseconfig";
import { setDoc, doc, updateDoc, getDoc } from "firebase/firestore"; 
import { onAuthStateChanged } from "firebase/auth";
import './profileEdit.css';
import Link from 'next/link'
import Footer from '../Components/footer';
import { fetchUniversities } from "../Utility/fetchUniversities"; // Import the utility function


const ProfileEditPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('');
  const [school, setSchool] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState([{ type: '', url: '' }]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]); // Hold schools based on input
  const [allSchools, setAllSchools] = useState<string[]>([]); // Hold all schools from API

  //Fetch profile data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid, "details", "profileData");
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setStatus(data.status || '');
            setSchool(data.school || '');
            setBio(data.bio || '');
            setLinks(data.links || [{ type: '', url: '' }]);
            setProfileImage(data.profileImage || null);
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

  // Fetch university list
    useEffect(() => {
      const loadUniversities = async () => {
        const universities = await fetchUniversities();
        setAllSchools(universities);
      };
      loadUniversities();
    }, []);
  
    // Filter school dropdown
    const handleSchoolInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      setSchool(query);

      if (query.trim() === "") {
        setSchoolSuggestions([]); // Hide suggestions when input is empty
        return;
      }
    
      // Filter school suggestions based on input
      const filteredSchools = allSchools.filter((school) =>
        school.toLowerCase().includes(query.toLowerCase())
      );
    
      setSchoolSuggestions(filteredSchools.slice(0, 5)); // Limit to 5 suggestions
    };
  
    const handleSelectSchool = (school: string) => {
      setSchool(school);
      setSchoolSuggestions([]); // Hide suggestions after selection
    };    


  //Convert image to URL
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

  //Save profile information into the database
  const saveProfile = async () => {
    try {
      const user = auth.currentUser; 
      const userId = user.uid;

      const userDocRef = doc(db, "users", userId, "details", "profileData");
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // Update only the provided fields if the document exists
        await updateDoc(userDocRef, {
          firstName,
          lastName,
          status,
          school,
          bio,
          links,
          profileImage,
        });
      } else {
        // If the document doesn't exist, create it and merge fields
        await setDoc(userDocRef, {
          firstName,
          lastName,
          status,
          school,
          bio,
          links,
          profileImage,
        }, { merge: true });
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
    <div className="profile-edit-container">
      <div className="profile-edit-card">
        <div className="project-section">
          <div className="project-grid">
            {[...Array(4)].map((__, index) => (
                <Link className="link" href="/ProjectEditPage" key={index}>
                 <button key={index} className="add-project">+ Add Project</button>
               </Link>
               
            ))}
          </div>
        </div> 

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

          <div className="input-group">
            <input
              type="text"
              placeholder="First Name"
              className="input-field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="input-field"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Status:</label>
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Education Status</option>
              <option value="Student">Student</option>
              <option value="Graduate">Graduate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>School:</label>
            <input
              type="text"
              placeholder="University"
              className="input-field"
              value={school}
              onChange={handleSchoolInputChange}
            />
            {/* Show suggestions only if available */}
  {schoolSuggestions.length > 0 && (
    <ul className="suggestions-list">
      {schoolSuggestions.map((suggestion, index) => (
        <li key={index} onClick={() => handleSelectSchool(suggestion)}>
          {suggestion}
        </li>
      ))}
    </ul>
  )}
          </div>

          <div className="form-group">
            <label>Bio:</label>
            <textarea
              className="input-field bio-field"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <h2 className="section-title">Links</h2>
            {links.map((link, index) => (
              <div key={index} className="link-group">
                <input
                  type="text"
                  placeholder="Type (e.g., Instagram, GitHub)"
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
            <button onClick={addLink} className="add-link">+ Add Link</button>
          </div>

          <div className="save-button-container">
            <button className="save-button" onClick={saveProfile}>Save</button>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default ProfileEditPage;
  
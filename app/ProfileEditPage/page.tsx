'use client';
import React, { useState } from 'react';
import { auth, db } from "../../firebaseconfig";
import { setDoc, doc } from "firebase/firestore"; 
import './profileEdit.css';
import Link from 'next/link'
import Footer from '../Components/footer';

const ProfileEditPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('');
  const [school, setSchool] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState([{ type: '', url: '' }]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
      const userId = "user_123"; 

      await setDoc(doc(db, "profiles", userId), {
        firstName,
        lastName,
        status,
        school,
        bio,
        links,
        profileImage,
      });

      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    }
  };

  return (
    <div>
    <div className="profile-edit-container">
      <div className="profile-edit-card">
        <div className="project-section">
          <div className="project-grid">
            {[...Array(4)].map((__, index) => (
              <Link className="link" href="/StudentProjectPage" key={index}>
                <button className="add-project">+ Add Project</button>
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
              onChange={(e) => setSchool(e.target.value)}
            />
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
  
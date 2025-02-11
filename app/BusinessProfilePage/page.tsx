'use client';
import React from 'react';
import './businessProfile.css'; 
import Footer from '../Components/footer';
import Link from 'next/link';

const ProfileEditPage: React.FC = () => {
  return (
    <div>
      <div className="business-profile-container">
        <div className="business-profile-card">
          <div className="profile-form">
            <div className="profile-picture"></div>

            <div className="name-group">
              <div className="business-name">Business Name</div>  
            </div>

            <div className="form-group">
              <label>Status:</label>
              <div className="input-field">Active</div> 
            </div>

            <div className="form-group">
              <label>Industry:</label>
              <div className="input-field">Technology</div> 
            </div>

            <div className="form-group">
              <label>Bio:</label>
              <h1 className="bio-field">We are...</h1>
            </div>

            <div className="form-group">
              <h2 className="section-title">Links</h2>
              <a href="https://www.instagram.com/" className="insta">Instagram</a>
              <a href="https://github.com/" className="github">Github</a>
              <a href="https://www.linkedin.com/" className="linkedin">LinkedIn</a>
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
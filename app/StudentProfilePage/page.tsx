'use client';
import React, { useState } from 'react';
import './studentProfile.css'; 
import Footer from '../Components/footer';
import Link from 'next/link'
const ProfileEditPage: React.FC = () => {
  const [links, setLinks] = useState([{ type: '', url: '' }]);


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
          <div className="profile-picture"></div>

          <div className="name-group">
            <div className="first-name">First name</div>  
            <div className="last-name">Last name</div> 
          </div>

          <div className="form-group">
            <label>Status:</label>
            <div className="input-field">Student</div> 
          </div>

          <div className="form-group">
            <label>School:</label>
            <div className="input-field">Full Sail University</div> 
          </div>

          <div className="form-group">
            <label>Bio:</label>
            <h1 className="bio-field">I am...</h1>
          </div>

          <div className="form-group">
            <h2 className="section-title">Links</h2>
            
            <a href="https://www.instagram.com/" className="insta">Instagram</a>
            <a href="https://www.instagram.com/" className="github">Github</a>
            <a href="https://www.instagram.com/" className="linkedin">LinkedIn</a>
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

'use client';
import React, { useState } from 'react';
import './profileEdit.css'; 

const ProfileEditPage: React.FC = () => {
  const [links, setLinks] = useState([{ type: '', url: '' }]);

  const addLink = () => {
    setLinks([...links, { type: '', url: '' }]);
  };

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-card">
        
        <div className="project-section">
           <div className="project-grid">
       {[...Array(4)].map((__, index) => (
         <button key={index} className="add-project">+ Add Project</button> ))}
     </div>
    </div> 

        <div className="profile-form">
          <div className="profile-picture"></div>

          <div className="input-group">
            <input type="text" placeholder="First Name" className="input-field" />
            <input type="text" placeholder="Last Name" className="input-field" />
          </div>

          <div className="form-group">
            <label>Status:</label>
            <select className="input-field">
              <option>Education Status</option>
              <option>Student</option>
              <option>Graduate</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>School:</label>
            <input type="text" placeholder="University" className="input-field" />
          </div>

          <div className="form-group">
            <label>Bio:</label>
            <textarea className="input-field bio-field"></textarea>
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
            <button className="save-button">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;

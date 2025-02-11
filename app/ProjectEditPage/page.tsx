"use client";
import React, { useState } from "react";
import "./projectEdit.css";

const ProjectEditPage: React.FC = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newImages = [...images];
      newImages[index] = URL.createObjectURL(event.target.files[0]);
      setImages(newImages);
    }
  };

  const addCollaborator = () => {
    const newCollaborator = prompt("Enter collaborator's name:");
    if (newCollaborator) {
      setCollaborators([...collaborators, newCollaborator]);
    }
  };

  return (
    <div className="project-container">
      <div className="project-content">
        {/* Left Section */}
        <div className="left-section">
          <h1 className="project-title">Edit Project</h1>

          <div className="input-group">
            <label>Project Name</label>
            <input 
              type="text" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} 
              placeholder="Enter project name" 
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter project description" 
            />
          </div>

          <div className="input-group">
            <label>Website Link</label>
            <input 
              type="text" 
              value={websiteLink} 
              onChange={(e) => setWebsiteLink(e.target.value)} 
              placeholder="Enter website link" 
            />
          </div>

          <div className="input-group">
            <label>GitHub Link</label>
            <input 
              type="text" 
              value={githubLink} 
              onChange={(e) => setGithubLink(e.target.value)} 
              placeholder="Enter GitHub link" 
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="right-section">
          <div className="project-media">
            <h2>Upload Media</h2>
            <div className="media-upload-grid">
              {images.map((image, index) => (
                <label key={index} className="upload-box">
                  {image ? <img src={image} alt="Uploaded" className="uploaded-image" /> : "Upload Image"}
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: "none" }} 
                    onChange={(event) => handleImageUpload(index, event)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="collaborators">
            <h2>Collaborators</h2>
            <div className="collaborator-list">
              {collaborators.length > 0 ? 
                collaborators.map((name, index) => <span key={index}>{name}</span>) : 
                <span>No collaborators yet.</span>
              }
            </div>
            <button className="add-collaborator" onClick={addCollaborator}>+ Add Collaborator</button>
          </div>

          <button className="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditPage;

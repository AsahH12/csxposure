"use client";
import React from "react";
import "./studentProject.css";

const StudentProjectPage: React.FC = () => {
  return (
    <div className="project-container">

      <div className="project-content">
        <h1 className="project-title">Project Name</h1>
        <p className="project-description">
          Description of the project goes here. Provide details about the work, purpose, and functionality.
        </p>

        <div className="project-links">
          <a href="#" className="project-link"> Website Link</a>
          <a href="#" className="project-link"> GitHub Link</a>
        </div>

        <div className="project-media">
          <div className="media-item project-box"></div>
          <div className="media-item project-box"></div>
          <div className="media-item project-box"></div>
          <div className="media-item project-box"></div>
        </div>

        <div className="collaborators">
          <h2>Collaborators</h2>
          <div className="collaborator-list">
            <span> Full Name</span>
            <span> Full Name</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProjectPage;

"use client";
import React, { useState, useEffect } from "react";
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseconfig";
import "./projectEdit.css";

const ProjectEditPage: React.FC = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated");
      } else {
        console.log("No user logged in");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("projectId");
    if (id) {
      setProjectId(id);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const projectDocRef = doc(db, "Projects", projectId);
        const projectDocSnap = await getDoc(projectDocRef);

        if (projectDocSnap.exists()) {
          const projectData = projectDocSnap.data();
          setProjectName(projectData.projectName || "");
          setDescription(projectData.description || "");
          setWebsiteLink(projectData.websiteLink || "");
          setGithubLink(projectData.githubLink || "");
          setCollaborators(projectData.collaborators || []);
          setImages(projectData.images || [null, null, null, null]);
        } else {
          console.log("No project found with this ID");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

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

  const removeCollaborator = (index: number) => {
    const updatedCollaborators = collaborators.filter((_, i) => i !== index);
    setCollaborators(updatedCollaborators);
  };

  const saveProjectToFirebase = async () => {
    if (!projectName || !description) {
      alert("Project name and description are required!");
      return;
    }
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert("You must be logged in to save a project.");
      return;
    }
  
    try {
      // Generate a projectId if it doesn't exist
      const newProjectId = projectId || doc(collection(db, "Projects")).id;
  
      const projectData = {
        projectName,
        description,
        websiteLink,
        githubLink,
        collaborators,
        images: images.filter((img) => img !== null),
        updatedAt: new Date(),
        ownerId: user.uid, // Useful for global filtering
      };
  
      // 1️⃣ Save to global Projects collection
      const globalProjectRef = doc(db, "Projects", newProjectId);
      await setDoc(globalProjectRef, projectData);
  
      // 2️⃣ Save to User's personal Projects collection
      const userProjectRef = doc(db, "Users", user.uid, "Projects", newProjectId);
      await setDoc(userProjectRef, projectData);
  
      setProjectId(newProjectId); // Update state if it was a new project
  
      alert("Project saved successfully in both collections!");
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Check console for errors.");
    }
  };
  

  if (loading) return <div>Loading...</div>;

  return (
    <div className="project-container">
      <div className="project-content">
        <div className="left-section">
          <h1 className="project-title">{projectId ? "Edit Project" : "New Project"}</h1>

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
              {collaborators.length > 0 ? (
                collaborators.map((name, index) => (
                  <div key={index} className="collaborator-item">
                    <span>{name}</span>
                    <button onClick={() => removeCollaborator(index)}>Remove</button>
                  </div>
                ))
              ) : (
                <span>No collaborators yet.</span>
              )}
            </div>
            <button className="add-collaborator" onClick={addCollaborator}>+ Add Collaborator</button>
          </div>

          <button className="save-button" onClick={saveProjectToFirebase}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditPage;

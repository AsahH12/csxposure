"use client";
import React, { useState, useEffect } from "react";
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseconfig";
import "./projectEdit.css";

const ProjectEditPage: React.FC = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>(["", "", "", ""]); // Ensure 4 images
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get projectId from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("projectId");
    if (id) setProjectId(id);
  }, []);

  // Fetch user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch project data when projectId is available
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      try {
        const projectDocRef = doc(db, "Projects", projectId);
        const projectDocSnap = await getDoc(projectDocRef);

        if (projectDocSnap.exists()) {
          const projectData = projectDocSnap.data() || {};

          setProjectName(projectData.projectName || "");
          setDescription(projectData.description || "");
          setWebsiteLink(projectData.websiteLink || "");
          setGithubLink(projectData.githubLink || "");
          setCollaborators(Array.isArray(projectData.collaborators) ? projectData.collaborators : []);
          setImages(Array.isArray(projectData.images) ? [...projectData.images, "", "", "", ""].slice(0, 4) : ["", "", "", ""]);
        } else {
          console.log(`No project found with ID: ${projectId}`);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Handle image upload
  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newImages = [...images];
      newImages[index] = URL.createObjectURL(event.target.files[0]);
      setImages(newImages);
    }
  };

  // Add a collaborator
  const addCollaborator = () => {
    const newCollaborator = prompt("Enter collaborator's name:");
    if (newCollaborator) {
      setCollaborators([...collaborators, newCollaborator]);
    }
  };

  // Remove a collaborator
  const removeCollaborator = (index: number) => {
    setCollaborators(collaborators.filter((_, i) => i !== index));
  };

  // Save project to Firebase
  const saveProjectToFirebase = async () => {
    if (!projectName || !description) {
      alert("Project name and description are required!");
      return;
    }

    if (!userId) {
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
        images: images.filter((img) => img !== ""),
        updatedAt: new Date(),
        ownerId: userId, // Useful for global filtering
      };

      // Save to global Projects collection
      await setDoc(doc(db, "Projects", newProjectId), projectData);

      // Save to User's personal Projects collection
      await setDoc(doc(db, "users", userId, "Projects", newProjectId), projectData);

      setProjectId(newProjectId); // Update state if it was a new project
      alert("Project saved successfully!");
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

          <h2>Collaborators</h2>
          {collaborators.map((name, index) => (
            <div key={index} className="collaborator-item">
              <span>{name}</span>
              <button onClick={() => removeCollaborator(index)}>Remove</button>
            </div>
          ))}
          <button onClick={addCollaborator}>+ Add Collaborator</button>

          <button className="save-button" onClick={saveProjectToFirebase}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditPage;

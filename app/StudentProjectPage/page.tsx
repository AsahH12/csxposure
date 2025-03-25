'use client';
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "./studentProject.css";

const StudentProjectPage: React.FC = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      console.error("No project ID provided in URL");
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      try {
        const projectRef = doc(db, "Projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          setProjectName(projectData.projectName || "Untitled Project");
          setDescription(projectData.description || "No description available.");
          setWebsiteLink(projectData.websiteLink || "#");
          setGithubLink(projectData.githubLink || "#");
          setCollaborators(projectData.collaborators || []);
          setImages(projectData.images || []);
        } else {
          console.error("Project not found.");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
      setLoading(false);
    };

    fetchProjectData();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="project-container">
      <div className="project-content">
        <h1 className="project-title">{projectName}</h1>
        <p className="project-description">{description}</p>

        <div className="project-links">
          <a href={websiteLink} target="_blank" rel="noopener noreferrer" className="project-link">
            Website Link
          </a>
          <a href={githubLink} target="_blank" rel="noopener noreferrer" className="project-link">
            GitHub Link
          </a>
        </div>

        <div className="project-media">
          {images.map((img, index) => (
            <img key={index} src={img} alt={`Project Media ${index + 1}`} className="media-item project-box" />
          ))}
        </div>

        <div className="collaborators">
          <h2>Collaborators</h2>
          <div className="collaborator-list">
            {collaborators.length > 0 ? (
              collaborators.map((name, index) => <span key={index}>{name}</span>)
            ) : (
              <span>No collaborators listed.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProjectPage;

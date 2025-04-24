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
  const [youtubeLink, setYoutubeLink] = useState("");
  const [youtubeEmbedId, setYoutubeEmbedId] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // More comprehensive YouTube ID extraction function
  const extractYoutubeId = (url: string): string => {
    if (!url || typeof url !== 'string') return "";
    
    // Handle various YouTube URL formats
    let videoId = "";
    
    // Format: youtube.com/watch?v=ID
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URL(url).searchParams;
      videoId = urlParams.get('v') || "";
    } 
    // Format: youtu.be/ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || "";
    } 
    // Format: youtube.com/embed/ID
    else if (url.includes('/embed/')) {
      videoId = url.split('/embed/')[1]?.split('?')[0] || "";
    }
    // Format: youtube.com/shorts/ID
    else if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split('?')[0] || "";
    }

    // Clean up any trailing parameters
    videoId = videoId.split('&')[0];
    
    console.log("Extracted YouTube ID:", videoId);
    return videoId;
  };

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
          
          // Parse YouTube link
          const ytLink = projectData.youtubeLink || '';
          setYoutubeLink(ytLink);
          
          console.log("Original YouTube URL:", ytLink);
          
          try {
            // Make sure URL parsing doesn't break if the URL is malformed
            if (ytLink && ytLink !== "#") {
              const videoId = extractYoutubeId(ytLink);
              setYoutubeEmbedId(videoId);
            }
          } catch (error) {
            console.error("Error parsing YouTube URL:", error);
          }
          
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
          {websiteLink && websiteLink !== "#" && (
            <a href={websiteLink} target="_blank" rel="noopener noreferrer" className="project-link">
              Website Link
            </a>
          )}
          {githubLink && githubLink !== "#" && (
            <a href={githubLink} target="_blank" rel="noopener noreferrer" className="project-link">
              GitHub Link
            </a>
          )}
          {/* {youtubeLink && youtubeLink !== "#" && (
            <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className="project-link">
              YouTube Link
            </a>
          )} */}
        </div>

        {youtubeEmbedId && (
          <div className="youtube-embed-container">
            <h2>Project Video</h2>
            <div className="youtube-embed">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <h2>Project Media</h2>
        <div className="project-media">
        
          {images.length > 0 && images.map((img, index) => (
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
"use client";
import React, { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc, collection, getDoc, addDoc, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseconfig";
import "./projectEdit.css";

const ProjectEditPage: React.FC = () => {
 const router = useRouter();
   const searchParams = useSearchParams();
   const projectId = searchParams.get("id"); // Get projectId from URL
   const [projectName, setProjectName] = useState("");
   const [description, setDescription] = useState("");
   const [websiteLink, setWebsiteLink] = useState("");
   const [githubLink, setGithubLink] = useState("");
   const [collaborators, setCollaborators] = useState<string[]>([]);
   const [images, setImages] = useState<string[]>(["", "", "", ""]);
   const [loading, setLoading] = useState(true);
   const [userId, setUserId] = useState<string | null>(null);
 useEffect(() => {
     const unsubscribe = auth.onAuthStateChanged((user) => {
       if (user) setUserId(user.uid);
     });
     return () => unsubscribe();
   }, []);
 
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
 
  // Handle image/video upload
  const handleMediaUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileURL = URL.createObjectURL(file);
  
      // Check if it's a video file
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = fileURL;
        video.crossOrigin = "anonymous"; // Ensure cross-origin safety
        video.muted = true; // Mute to allow autoplay
        video.playsInline = true;
  
        video.oncanplay = () => {
          video.currentTime = 0.5; // Capture at 1 second
           
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
  
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnailURL = canvas.toDataURL("image/png");
  
            // Update state with the thumbnail
            const newMedia = [...images];
            newMedia[index] = thumbnailURL;
            setImages(newMedia);
          }
        };
      } else {
        // If it's an image, just use the file URL
        const newMedia = [...images];
        newMedia[index] = fileURL;
        setImages(newMedia);
      }
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
         const projectData = {
           projectName,
           description,
           websiteLink,
           githubLink,
           collaborators,
           images: images.filter((img) => img !== ""),
           updatedAt: new Date(),
           ownerId: userId,
         };
   
         if (projectId) {
           await setDoc(doc(db, "Projects", projectId), projectData);
         } else {
           const newProjectRef = await addDoc(collection(db, "Projects"), projectData);
           const newProjectId = newProjectRef.id;
           await setDoc(doc(db, "users", userId, "Projects", newProjectId), projectData);
           router.push(`/ProjectEditPage?id=${newProjectId}`);
         }
   
         alert("Project saved successfully!");
       } catch (error) {
         console.error("Error saving project:", error);
         alert("Failed to save project.");
       }
     };

     const deleteProjectFromFirebase = async () => {
      if (!projectId) return;
  
      const confirmDelete = window.confirm("Are you sure you want to delete this project?");
      if (!confirmDelete) return;
  
      try {
        await deleteDoc(doc(db, "Projects", projectId));
        alert("Project deleted successfully!");
        router.push("/ProfileEditPage"); // Redirect to projects page
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project.");
      }
    };
   

  if (loading) return <div>Loading...</div>;

  return (
    // <div className="project-container">
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
            <label className="description">Description</label>
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

          <h2 className="collaborator-title">Collaborators</h2>
          {collaborators.map((name, index) => (
            <div key={index}>
              <span>{name}</span>
              <button onClick={() => removeCollaborator(index)}>Remove</button>
            </div>
          ))}
          <button className="add-collab" onClick={addCollaborator}>+ Add Collaborator</button>
        </div>

        <div className="right-section">
        <h2 className="media-upload">Upload Media</h2>
          <div className="media-upload-grid">
          {images.map((media, index) => (
             <label key={index} className="upload-box">
             {media ? (
               <img src={media} alt="Uploaded media" className="uploaded-media" />
             ) : (
               "Upload Image/Video"
             )}
             <input
               type="file"
               accept="image/*,video/*"
               style={{ display: "none" }}
               onChange={(event) => handleMediaUpload(index, event)}
             />
           </label>
           
  ))}
</div>


          

          <button className="save-button" onClick={saveProjectToFirebase}>Save Changes</button>

          {projectId && (
              <button className="delete-button" onClick={deleteProjectFromFirebase}>
                Delete Project
              </button>
            )}
        </div>
      </div>
    // </div>
  );
};

export default ProjectEditPage;

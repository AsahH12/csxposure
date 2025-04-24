"use client";
import React, { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc, collection, getDoc, addDoc, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseconfig";
import "./projectEdit.css";

interface NotificationProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Notification will disappear after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        {type === 'success' ? '✓' : '✕'}
      </div>
      <div className="notification-content">
        <div className="notification-title">{title}</div>
        <div className="notification-message">{message}</div>
      </div>
    </div>
  );
};

const ProjectEditPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id"); 
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

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
          setYoutubeLink(projectData.youtubeLink || "");
          setCollaborators(Array.isArray(projectData.collaborators) ? projectData.collaborators : []);
          setImages(Array.isArray(projectData.images) ? [...projectData.images, "", "", "", ""].slice(0, 4) : ["", "", "", ""]);
          setCategories(Array.isArray(projectData.categories) ? projectData.categories : []);
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

  // Show notification
  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({
      show: true,
      type,
      title, 
      message
    });
  };

  // Hide notification
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Handle image/video upload
  const handleMediaUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
  
      // Check if it's a video file
      if (file.type.startsWith("video/")) {
        const fileURL = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata"; 
        video.src = fileURL;
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;
  
        video.onloadedmetadata = () => {
          // Check if video duration exceeds 5 minutes (300 seconds)
          if (video.duration > 300) {
            showNotification('error', 'Video Too Long', 'Please upload a video shorter than 5 minutes.');
            URL.revokeObjectURL(fileURL);
            return;
          }
  
          video.currentTime = Math.min(video.duration / 2, 5);
        
          video.oncanplay = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 320;
            canvas.height = 240;
    
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const thumbnailURL = canvas.toDataURL("image/jpeg", 0.6);
    
              const newMedia = [...images];
              newMedia[index] = thumbnailURL;
              setImages(newMedia);
            }
            URL.revokeObjectURL(fileURL); // Clean up
          };
        };
      } else {
        // If it's an image
        const reader = new FileReader();
        reader.onloadend = () => {
          const newMedia = [...images];
          newMedia[index] = reader.result as string;
          setImages(newMedia);
        };
        reader.readAsDataURL(file);
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

  // Handle category changes
  const handleCategoryChange = (category: string) => {
    setCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
  };

  // Save project to Firebase
  const saveProjectToFirebase = async () => {
    if (!projectName || !description) {
      showNotification('error', 'Missing Information', 'Project name and description are required!');
      return;
    }

    if (!userId) {
      showNotification('error', 'Authentication Error', 'You must be logged in to save a project.');
      return;
    }

    try {
      const projectData = {
        projectName,
        description,
        websiteLink,
        githubLink,
        youtubeLink,
        collaborators,
        images: images.filter((img) => img !== ""), 
        categories,
        updatedAt: new Date(),
        ownerId: userId,
      };

      if (projectId) {
        await setDoc(doc(db, "Projects", projectId), projectData);
        await setDoc(doc(db, "users", userId, "Projects", projectId), projectData);
      } else {
        const newProjectRef = await addDoc(collection(db, "Projects"), projectData);
        const newProjectId = newProjectRef.id;
        await setDoc(doc(db, "users", userId, "Projects", newProjectId), projectData);
        router.push(`/ProjectEditPage?id=${newProjectId}`);
      }

      showNotification('success', 'Success', 'Project saved successfully!');
    } catch (error) {
      console.error("Error saving project:", error);
      showNotification('error', 'Save Failed', 'Failed to save project. Please try again.');
    }
  };

  const deleteProjectFromFirebase = async () => {
    if (!projectId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "Projects", projectId));
      if (userId) {
        await deleteDoc(doc(db, "users", userId, "Projects", projectId));
      }
      showNotification('success', 'Success', 'Project deleted successfully!');
      
      // Give a little time for notification to be seen before redirecting
      setTimeout(() => {
        router.push("/ProfileEditPage");
      }, 1500);
    } catch (error) {
      console.error("Error deleting project:", error);
      showNotification('error', 'Delete Failed', 'Failed to delete project. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {/* Render notification if it's visible */}
      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
      
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

          <div className="input-group category-checkboxes">
            <label>Project Category:</label>
            <div className="checkbox-container category-checkboxes">
              {['Game', 'App', 'Website', 'Other'].map((category) => (
                <label key={category} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Website Link</label>
            <input
              type="text"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              placeholder="Enter Website link"
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

          <div className="input-group">
            <label>Video Link</label>
            <input
              type="text"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="Enter Video link"
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
    </>
  );
};

export default ProjectEditPage;
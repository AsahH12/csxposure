"use client";
import React, { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc, collection, getDoc, addDoc, deleteDoc, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseconfig";
import { query, where, } from "firebase/firestore";
import "./projectEdit.css";



interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'confirm';
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Notification: React.FC<NotificationProps> = ({ 
  type, 
  title, 
  message, 
  onClose, 
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  useEffect(() => {
    // Only set auto-close timer for non-confirmation notifications
    if (type !== 'confirm') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Notification will disappear after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [onClose, type]);

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        {type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'confirm' ? '?' : '✕'}
      </div>
      <div className="notification-content">
        <div className="notification-title">{title}</div>
        <div className="notification-message">{message}</div>
        
        {type === 'confirm' && (
          <div className="notification-actions">
            <button className="notification-btn confirm-btn" onClick={onConfirm}>
              {confirmText}
            </button>
            <button className="notification-btn cancel-btn" onClick={onCancel}>
              {cancelText}
            </button>
          </div>
        )}
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
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const currentUser = auth.currentUser; // Get logged-in user  
  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
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

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchInput(query);
  
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
  
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const results: any[] = [];
  
    for (const userDoc of snapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const email = userData.email;
  
      try {
        const detailsRef = doc(db, "users", userId, "details", "profileData");
        const detailsSnap = await getDoc(detailsRef);
  
        const profileData = detailsSnap.exists() ? detailsSnap.data() : null;
        const firstName = profileData?.firstName || "";
        const lastName = profileData?.lastName || "";
        const name = `${firstName} ${lastName}`.trim();
  
        if (
          name.toLowerCase().includes(query.toLowerCase()) ||
          email?.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push({ id: userId, name, email });
        }
      } catch (err) {
        console.error("Error fetching profile data for user:", userId, err);
      }
    }
  
    setSearchResults(results);
    console.log(results);
  };
  
  const sendInvite = async (selectedUser: { email: string; name: string; }) => {
    if (!currentUser || !projectId || !selectedUser) return;
  
    setSendingInvite(true);
  
    try {
      // 1. Check if a chat exists between currentUser and selectedUser
      const chatRef = collection(db, "chats");
      const chatQuery = query(chatRef, where("participants", "array-contains", currentUser.email));
      const snapshot = await getDocs(chatQuery);
  
      let chatId: string | null = null;
  
      snapshot.forEach((doc) => {
        const data = doc.data() as { participants?: string[] };
        const participants = data.participants || [];
  
        // Check if selectedUser email is in the participants list
        if (participants.includes(selectedUser.email)) {
          chatId = doc.id;
        }
      });
  
      // 2. If no existing chat, create a new one
      if (!chatId) {
        const newChatRef = await addDoc(chatRef, {
          participants: [currentUser.email, selectedUser.email],
          unreadMessages: { [selectedUser.name]: 0, [currentUser.email]: 0 },
          lastMessage: "A new chat has been created.",
          createdAt: new Date(),
        });

        chatId = newChatRef.id;

        const messagesRef = collection(db, "chats", chatId, "messages");
        await addDoc(messagesRef, {
          sender: currentUser.email,
          text: "A new chat has been created.",
          timestamp: new Date(),
        });
      }
  
      // 3. Send invite message in the chat
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        sender: currentUser.email,
        type: "invite",
        text: `You've been invited to collaborate on the project "${projectName}"`,
        projectId,
        timestamp: new Date(),
        status: "pending",
      });
  
      // 4. Mark collaborator as pending
      setCollaborators((prev) => [...prev, `pending:${selectedUser.email}`]);
      setSearchInput("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error sending invite:", error);
    } finally {
      setSendingInvite(false);
    }
  };
  
  
  // Show notification
  const showNotification = (type: 'success' | 'error' | 'warning' | 'confirm', title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
    setNotification({
      show: true,
      type,
      title, 
      message,
      onConfirm,
      onCancel
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

  const confirmDeleteProject = () => {
    if (!projectId) return;
    
    // Show confirmation notification instead of window.confirm
    showNotification(
      'confirm',
      'Confirm Delete',
      'Are you sure you want to delete this project? This action cannot be undone.',
      // onConfirm callback
      async () => {
        try {
          await deleteDoc(doc(db, "Projects", projectId));
          if (userId) {
            await deleteDoc(doc(db, "users", userId, "Projects", projectId));
          }
          
          // Hide the confirmation notification
          hideNotification();
          
          // Show success notification
          showNotification('success', 'Success', 'Project deleted successfully!');
          
          // Give a little time for notification to be seen before redirecting
          setTimeout(() => {
            router.push("/ProfileEditPage");
          }, 1500);
        } catch (error) {
          console.error("Error deleting project:", error);
          
          // Hide the confirmation notification
          hideNotification();
          
          // Show error notification
          showNotification('error', 'Delete Failed', 'Failed to delete project. Please try again.');
        }
      },
      // onCancel callback
      () => {
        hideNotification();
      }
    );
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
          onConfirm={notification.onConfirm}
          onCancel={notification.onCancel}
          confirmText="Delete"
          cancelText="Cancel"
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

          <div>
        <label className="block mb-1 font-medium">Invite Collaborator</label>
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search users by name or email"
          className="w-full border rounded px-3 py-2"
        />
        {searchResults.length > 0 && (
          <div className="border mt-1 rounded shadow bg-white">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => setSelectedUser(user)}
                >
                {user.name} ({user.email})
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3">
        <button
          onClick={() => selectedUser && sendInvite(selectedUser) && console.log("button clicked", selectedUser.email)
          }
          disabled={!selectedUser || sendingInvite}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send Invite
        </button>
      </div>
      {selectedUser && (
  <div className="mt-2 text-sm text-gray-700">
    Selected: {selectedUser.name} ({selectedUser.email})
  </div>
)}
  
      <div>
        <label className="block mb-1 font-medium">Collaborators</label>
        <ul className="list-disc pl-5">
          {collaborators.map((collab, index) => (
            <li key={index}>{collab}</li>
          ))}
        </ul>
      </div>
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
            <button className="delete-button" onClick={confirmDeleteProject}>
              Delete Project
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectEditPage;
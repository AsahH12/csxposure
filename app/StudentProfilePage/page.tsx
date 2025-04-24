'use client';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseconfig";
import './studentProfile.css';
import Link from 'next/link'
import ChatOverlay from "../Components/ChatOverlay";

const getFirstImage = (images?: string[] | string): string | null => {
  if (!images) return null;
  
  if (typeof images === 'string') return images;
  
  return images.length > 0 ? images[0] : null;
};

const StudentProfilePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("I am...");
  const [school, setSchool] = useState("Full Sail University");
  const [status, setStatus] = useState<string[]>([]);
  const [links, setLinks] = useState<{ type: string; url: string }[]>([]);
  const [profileImage, setProfileImage] = useState("");
  const [projects, setProjects] = useState<{ id: string; projectName: string; images: string | string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isChatOpen, setChatOverlayOpen] = useState(false);
  const currentUser = auth.currentUser; 

  useEffect(() => {
    if (!userId) {
      console.log("No userID received");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId, 'details', 'profileData');
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setFirstName(userData?.firstName || "");
          setLastName(userData?.lastName || "");
          setBio(userData?.bio || "I am...");
          setLinks(userData?.links || []);
          setProfileImage(userData?.profileImage || "");
          setSchool(userData?.school || "N/A");
          setStatus(userData?.status || "Student");
        } else {
          console.log(`No user found with ID: ${userId}`);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchUserProjects = async () => {
      try {
        const projectsRef = collection(db, "Projects");
        const q = query(projectsRef, where("ownerId", "==", userId));
        const projectSnapshots = await getDocs(q);
        
        const projectList = projectSnapshots.docs.map((doc) => {
          const projectData = doc.data();
          return {
            id: doc.id,
            projectName: projectData.projectName,
            images: projectData.images || "", 
          };
        });

        setProjects(projectList);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchUserData();
    fetchUserProjects();
    setLoading(false);
  }, [userId]);
  
  const handleOpenChat = async () => {
    if (!userId || !currentUser) return;

      try {
          const userDocRef = doc(db, "users", userId);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          console.error("User not found");
          return;
        }

        const selectedUserEmail = userSnap.data().email;
        if (!selectedUserEmail) {
          console.error("Selected user's email not found");
          return;
        }

      const chatRef = collection(db, "chats");
      const chatQuery = query(chatRef, where("participants", "array-contains", currentUser.email));
      const snapshot = await getDocs(chatQuery);
      
      let chatId = null;
      snapshot.docs.forEach((doc) => {
        const chatData = doc.data();
        if (chatData.participants.includes(selectedUserEmail)) {
          chatId = doc.id;
        }
      });

      if (!chatId) {
        const newChatRef = await addDoc(chatRef, {
          participants: [currentUser.email, selectedUserEmail],
          unreadMessages: { [selectedUserEmail]: 0, [currentUser.email]: 0 },
          lastMessage: "A new chat has been created.",
          createdAt: new Date(),
        });

        chatId = newChatRef.id;

        const messagesRef = collection(db, "chats", chatId, "messages");
        await addDoc(messagesRef, {
          sender: "System",
          text: "A new chat has been created.",
          timestamp: new Date(),
        });
      }

      setChatOverlayOpen(true);
      setSelectedUser(selectedUserEmail);
      setChatId(chatId);
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };
  
  const handleClick = (projectId: string) => {
    router.push(`/StudentProjectPage?id=${projectId}`);
  };
  
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="student-profile-container">
        <div className="student-profile-card">
          <div className="project-section">
          <div className="project-grid">
              {projects.map((project) => (
                <Link key={project.id} className="link" href={`/StudentProjectPage?id=${project.id}`}>
                  <div className="project-card">
                    {getFirstImage(project.images) ? (
                      <img src={getFirstImage(project.images) as string} className="project-thumbnail" alt={project.projectName} />
                    ) : (
                      <div className="no-thumbnail">No Image</div>
                    )}
                    <p className="project-title">{project.projectName || "Unnamed Project"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="profile-form">
          <div className="chat-button-container" style={{ position: 'relative', top: '10px', right: '10px' }}>
          <button className="chat-button" onClick={handleOpenChat}>Chat</button>
        </div>
            <div className="profile-picture">
              {profileImage ? (
                <img src={profileImage} alt="Profile" />
              ) : (
                <div className="initials-placeholder">
                  {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="name-group">
              <div className="first-name">{firstName}</div>
              <div className="last-name">{lastName}</div>
            </div>

            <div className="form-group">
              <label>Status:</label>
              <div className="input-field">{status}</div>
            </div>

            <div className="form-group">
              <label>School:</label>
              <div className="input-field">{school}</div>
            </div>

            <div className="form-group">
              <label>Bio:</label>
              <h1 className="bio-field">{bio}</h1>
            </div>

            <div className="form-group">
              <h2 className="section-title">Links</h2>
              {links.map((link, index) => (
                <a key={index} href={link.url} className={link.type.toLowerCase()}>{link.type}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isChatOpen && <ChatOverlay onClose={() => setChatOverlayOpen(false)} />}
    </div>
  );
};

export default StudentProfilePage;
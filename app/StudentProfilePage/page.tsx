'use client';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs,addDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseconfig";
import './studentProfile.css';
import ChatOverlay from "../Components/ChatOverlay";
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
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
const [selectedUser, setSelectedUser] = useState<string | null>(null);
const [userEmail, setUserEmail] = useState<string | null>(null);
const [isChatOpen, setChatOverlayOpen] = useState(false);
    const currentUser = auth.currentUser; // Get logged-in user
    useEffect(() => {
    if (!userId) {
      console.log("No userID received");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId,'details', 'profileData');
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
        const projectList = projectSnapshots.docs.map(doc => doc.data().projectName);
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
  const { userId } = useParams(); // Get user ID from the URL
  if (!userId) return;

  try {
    // Fetch user details using userId
    const userRef = doc(db, "users");
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User not found");
      return;
    }

    const userEmail = userSnap.data().email; // Get email from Firestore
    if (!userEmail) {
      console.error("User email not found");
      return;
    }

    // Find if a chat already exists
    const chatRef = collection(db, "chats");
    const chatQuery = query(chatRef, where("participants", "array-contains", currentUser.email));
    const snapshot = await getDocs(chatQuery);

    let chatId = null;
    snapshot.docs.forEach((doc) => {
      if (doc.data().participants.includes(userEmail)) {
        chatId = doc.id;
      }
    });

    if (!chatId) {
      // Create a new chat if it doesn't exist
      const newChatRef = await addDoc(chatRef, {
        participants: [currentUser.email, userEmail],
        unreadMessages: { [userEmail]: 0, [currentUser.email]: 0 },
        lastMessage: "",
        createdAt: new Date(),
      });
      chatId = newChatRef.id;
    }

    // Open ChatOverlay
    setChatOverlayOpen(true);
    setSelectedUser(userEmail);
    setChatId(chatId);
  } catch (error) {
    console.error("Error opening chat:", error);
  }
};

  
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="student-profile-container">
        <div className="student-profile-card">
          <div className="project-section">
            <div className="project-grid">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <button key={index} className="show-project">{project}</button>
                ))
              ) : (
                <p>No projects available</p>
              )}
            </div>
          </div>

          <div className="profile-form">
            <div className="profile-picture">
              {profileImage ? <img src={profileImage} alt="Profile" /> : <div className=""></div>}
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

            <div className="chat-button-container">
              <button className="chat-button"
              onClick={()=>setChatOverlayOpen(false)}
              >Chat</button>
            </div>
          </div>
        </div>
      </div>
      {isChatOpen && (
        <ChatOverlay onClose={() => setChatOverlayOpen(false)} />
      )}
    </div>
  );
};

export default StudentProfilePage;
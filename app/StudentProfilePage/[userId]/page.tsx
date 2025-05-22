'use client';
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../../../firebaseconfig";
//import './studentProfile.css';
import Link from 'next/link'
import ChatOverlay from "../../Components/ChatOverlay";
import styles from './studentProfile.module.css';
import socialButtons from './socialButtons.module.css';
import Footer from "../../Components/footer";

const getFirstImage = (images?: string[] | string): string | null => {
  if (!images) return null;
  
  if (typeof images === 'string') return images;
  
  return images.length > 0 ? images[0] : null;
};

const StudentProfilePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
const userId = params?.userId as string;

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

  const socialButtonClasses: { [key: string]: string } = {
    github: socialButtons.github,
    gitlab: socialButtons.gitlab,
    bitbucket: socialButtons.bitbucket,
    codepen: socialButtons.codepen,
    replit: socialButtons.replit,
    linkedin: socialButtons.linkedin,
    discord: socialButtons.discord,
    telegram: socialButtons.telegram,
    email: socialButtons.email,
    medium: socialButtons.medium,
    "dev.to": socialButtons.devto,
    hashnode: socialButtons.hashnode,
    leetcode: socialButtons.leetcode,
    hackerrank: socialButtons.hackerrank,
    codewars: socialButtons.codewars,
    kaggle: socialButtons.kaggle,
    "personal website": socialButtons.personalWebsite,
    notion: socialButtons.notion,
    behance: socialButtons.behance,
    instagram: socialButtons.instagram,
    twitter: socialButtons.twitter,
    reddit: socialButtons.reddit,
  };
  
  const socialIcons: { [key: string]: string } = {
    github: "fa-brands fa-github",
    gitlab: "fa-brands fa-gitlab",
    bitbucket: "fa-brands fa-bitbucket",
    codepen: "fa-brands fa-codepen",
    replit: "fa-solid fa-terminal",
    linkedin: "fa-brands fa-linkedin",
    discord: "fa-brands fa-discord",
    telegram: "fa-brands fa-telegram",
    email: "fas fa-envelope",
    medium: "fa-brands fa-medium",
    "dev.to": "fa-brands fa-dev",
    hashnode: "fa-solid fa-hashtag",
    leetcode: "fa-solid fa-code",
    hackerrank: "fa-solid fa-terminal",
    codewars: "fa-solid fa-code",
    kaggle: "fa-solid fa-chart-line",
    "personal website": "fa-solid fa-globe",
    notion: "far fa-folder",
    behance: "fa-brands fa-behance",
    instagram: "fa-brands fa-instagram",
    twitter: "fa-brands fa-twitter",
    reddit: "fa-brands fa-reddit",
  };
  

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
    router.push(`/StudentProjectPage/${projectId}`);
  };
  
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.projectSection}>
            <div className={styles.projectGrid}>
              {projects.map((project) => (
                <Link key={project.id} className={styles.projectLink} href={`/StudentProjectPage/${project.id}`}>
                  <div className={styles.projectCard}>
                    <div className={styles.projectImageWrapper}>
                      {getFirstImage(project.images) ? (
                        <img
                          src={getFirstImage(project.images) as string}
                          className={styles.projectThumbnail}
                          alt={project.projectName}
                        />
                      ) : (
                        <div className={styles.noThumbnail}>No Image</div>
                      )}
                      <div className={styles.projectTitleOverlay}>
                        {project.projectName || "Unnamed Project"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
  
          <div className={styles.profileForm}>
            <div className={styles.chatButtonContainer}>
              <button className={styles.chatButton} onClick={handleOpenChat}>Chat</button>
            </div>
  
            <div className={styles.profilePicture}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" />
              ) : (
                <div className={styles.initials}>{firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}</div>
              )}
            </div>
  
            <div className={styles.fullName}>{`${firstName} ${lastName}`}</div>
  
            <div className={styles.formGroup}>
              <label className={styles.label}>Status:</label>
              <div className={styles.inputField}>{status}</div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>School:</label>
              <div className={styles.inputField}>{school}</div>
            </div>

            <h1 className={styles.bioField}>
              <strong>Bio:</strong>
              <span style={{ marginLeft: '1rem' }}>{bio}</span>
            </h1>

            <div className={styles.linkGroup}>
              <h2 className={styles.sectionTitle}>Links</h2>

              <div className={styles.linkButtonContainer}>
                {links.map((link, index) => {
                  const typeKey = link.type.toLowerCase();
                  const className = socialButtonClasses[typeKey];
                  const iconClass = socialIcons[typeKey];

                  if (!className || !iconClass) {
                    // Fallback for unknown types
                    return (
                      <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.type}
                      </a>
                    );
                  }

                  return (
                    <a
                      key={index}
                      className={`${className} ${socialButtons.socialButton}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className={iconClass} style={{ marginRight: '0.5rem' }}></i>
                      <span>{link.type}</span>
                    </a>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
      {isChatOpen && <ChatOverlay onClose={() => setChatOverlayOpen(false)} />}
    </div>
  );
};

export default StudentProfilePage;
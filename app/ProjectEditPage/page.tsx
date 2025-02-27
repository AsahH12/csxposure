'use client';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseconfig";
import './projectEdit.css';

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="project-container">
      <div className="project-content">
        <div className="left-section">
          <h1 className="project-title">{projectId ? "Edit Project" : "Create New Project"}</h1>
          <div className="input-group">
            <label>Project Name</label>
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter project name" />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter project description" />
          </div>
          <div className="input-group">
            <label>Website Link</label>
            <input type="text" value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} placeholder="Enter website link" />
          </div>
          <div className="input-group">
            <label>GitHub Link</label>
            <input type="text" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="Enter GitHub link" />
          </div>
          <button className="save-button" onClick={saveProjectToFirebase}>{projectId ? "Save Changes" : "Create Project"}</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditPage;
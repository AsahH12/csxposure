'use client';
import React, { useEffect, useState, useContext } from 'react';
import { auth, db } from "../../firebaseconfig";
import { setDoc, doc, updateDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import './profileEdit.css';
import Link from 'next/link'
import Footer from '../Components/footer';
import { fetchUniversities } from "../Utility/fetchUniversities"; // Import the utility function
import { UserContext } from '../Utility/UserContext';

// Define the structure of a Project
interface Project {
  id: string;
  projectName: string;
  categories?: string[];  // Categories will be an optional array of strings
  images?: string[];      // Optional field for project images
}

const ProfileEditPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('');
  const [school, setSchool] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState([{ type: '', url: '' }]);
  const { setProfileImage } = useContext(UserContext); // Use only setter to update after save
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(null); // Store selected image locally
  const [loading, setLoading] = useState(true);
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]); // Hold schools based on input
  const [allSchools, setAllSchools] = useState<string[]>([]); // Hold all schools from API
  const [isSchoolValid, setIsSchoolValid] = useState(false); // Track if a valid school is selected
  const [volunteerAgreement, setVolunteerAgreement] = useState(false); // Track if volunteer agreement is checked
  const [projects, setProjects] = useState<any[]>([]);
  const [totalProjects, setTotalProjects] = useState<number>(0); // Store total number of projects
  const [categoryCounts, setCategoryCounts] = useState({
    Game: 0,
    App: 0,
    Website: 0,
    Other: 0
  });

  //Fetch profile data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid, "details", "profileData");
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            console.log("Profile Data:", data);
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setStatus(data.status || '');
            setSchool(data.school || '');
            setBio(data.bio || '');
            setLinks(data.links || [{ type: '', url: '' }]);
            setVolunteerAgreement(data.volunteerAgreement || false);
            setLocalProfileImage(data.profileImage || null);
          }
          // Fetch project IDs from users -> Projects
          const userProjectsRef = collection(db, "users", user.uid, "Projects");
          const userProjectsSnapshot = await getDocs(userProjectsRef);
          const projectIds = userProjectsSnapshot.docs.map(doc => doc.id);

          // Fetch project details from Projects collection
          const projectPromises = projectIds.map(async (projectId) => {
            const projectDocRef = doc(db, "Projects", projectId);
            const projectDocSnap = await getDoc(projectDocRef);
            if (projectDocSnap.exists()) {
              return { id: projectId, ...projectDocSnap.data() as Project };
            }
            return null;
          });

          const userProjects = (await Promise.all(projectPromises)).filter(project => project !== null);
          setProjects(userProjects);

          // Count the total number of projects
          setTotalProjects(userProjects.length);

          // Count the categories (Game, App, Website, Other)
          const categoryCounter = {
            Game: 0,
            App: 0,
            Website: 0,
            Other: 0
          };
          userProjects.forEach((project) => {
            project.categories?.forEach((category: string) => {
              if (categoryCounter[category] !== undefined) {
                categoryCounter[category] += 1;
              } else {
                categoryCounter['Other'] += 1; // If category is unrecognized, count as 'Other'
              }
            });
          });
          setCategoryCounts(categoryCounter);

          // Save categoryCounts and totalProjects to the Firestore database
          const userProfileRef = doc(db, "users", user.uid, "details", "profileData");
          await updateDoc(userProfileRef, {
            totalProjects: userProjects.length,
            categoryCounts: categoryCounter,
          });

        } catch (error) {
          console.error("Error fetching profile or projects:", error);
          alert("Failed to fetch data.");
        }
      }
      setLoading(false);
      setLoading(false);
      // If school is pre-selected, skip validation
    
      if (school != null) { setIsSchoolValid(true); }
     
    });
    
    return () => unsubscribe();
  }, [setProfileImage]);

  //////////////////////////////////// School Input ////////////////////////////////////
  // Fetch university list
  useEffect(() => {
    const loadUniversities = async () => {
      const universities = await fetchUniversities();
      setAllSchools(universities);
    };
    loadUniversities();
  }, []);

  // Handle input change and filter schools
  const handleSchoolInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSchool(query);
    setIsSchoolValid(false); // Reset validation when typing

    if (query.trim() === "") {
      setSchoolSuggestions([]);
      return;
    }

    const filteredSchools = allSchools.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    );
    setSchoolSuggestions(filteredSchools.slice(0, 5));
  };

  // Ensure school selection is from suggestions
  const handleSelectSchool = (selectedSchool: string) => {
    setSchool(selectedSchool);
    setIsSchoolValid(true);
    setSchoolSuggestions([]);
  };

  ////////////////////////////////////////////////////////////////////////////////////

  //Convert image to URL
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    if (links.length >= 4) {
      alert("You can only add up to 4 links.");
      return;
    }
    setLinks([...links, { type: '', url: '' }]);
  };

  // Save profile information into the database
  const saveProfile = async () => {
    if (!isSchoolValid) {
      alert("Please select a school from the suggestions.");
      return;
    }

    // Filter out links with empty type and URL
    const validLinks = links.filter((link) => link.type.trim() !== "" || link.url.trim() !== "");
    setLinks(validLinks);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid, "details", "profileData");
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        status,
        school,
        bio,
        links: validLinks,
        volunteerAgreement,
        profileImage: localProfileImage, // Save the selected image
      });

      // Update context only after successful save
      setProfileImage(localProfileImage);

      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <div className="profile-edit-container">
        <div className="profile-edit-card">
          <div className="project-section">
            <h2>Your Projects</h2>
            <div className="project-grid">
              {projects.map((project) => (
                <Link key={project.id} className="link" href={`/ProjectEditPage?id=${project.id}`}>
                  <div className="project-card">
                    {project.images ? (
                      <img src={project.images} className="project-thumbnail" />
                    ) : (
                      <div className="no-thumbnail">No Image</div>
                    )}
                    <p className="project-title">{project.projectName || "Unnamed Project"}</p>
                  </div>

                </Link>
              ))}
              <Link className="link" href="/ProjectEditPage">
                <button className="add-project">+ Add Project</button>
              </Link>
            </div>
          </div>

          <div className="profile-form">
            <label className="profile-picture" htmlFor="imageUpload">
              {localProfileImage && typeof localProfileImage === "string" ? (
                <img src={localProfileImage} alt="Profile" className="profile-img" />
              ) : (
                <span className="text">Click to upload</span>
              )}
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            <div className="input-group">
              <input
                type="text"
                placeholder="First Name"
                className="input-field"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="input-field"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Status:</label>
              <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Education Status</option>
                <option value="Student">Student</option>
                <option value="Graduate">Graduate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* School Input Section */}
            <div className="form-group">
              <label>School:</label>
              <input
                type="text"
                placeholder="Search for your university..."
                className="input-field"
                value={school}
                onChange={handleSchoolInputChange}
              />
              {schoolSuggestions.length > 0 && (
                <ul className="suggestions-list">
                  {schoolSuggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => handleSelectSchool(suggestion)}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CheckBox Volunteer Filter */}
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="filterVolunteer"
                checked={volunteerAgreement}
                onChange={(e) => setVolunteerAgreement(e.target.checked)} // Update state on checkbox change
              />
              <label className="form-check-label" htmlFor="filterVolunteer">
                I am looking for volunteer opportunities
              </label>
            </div>

            {/* Bio Input Section */}
            <div className="form-group">
              <label>Bio:</label>
              <textarea
                className="input-field bio-field"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Link Input Section */}
            <div className="form-group">
              <h2 className="section-title">Links</h2>
              {links.map((link, index) => (
                <div key={index} className="link-group">
                  <select
                    className="input-field"
                    value={link.type}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index].type = e.target.value;
                      setLinks(newLinks);
                    }}
                  >  {/* Link Type Selection */}
                    <option value="">--Select Link Type--</option>
                    <optgroup label="Coding & Project Showcases">
                      <option value="GitHub">GitHub</option>
                      <option value="GitLab">GitLab</option>
                      <option value="Bitbucket">Bitbucket</option>
                      <option value="CodePen">CodePen</option>
                      <option value="Replit">Replit</option>
                    </optgroup>
                    <optgroup label="Professional Networking & Contacts">
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Discord">Discord</option>
                      <option value="Telegram">Telegram</option>
                      <option value="Email">Email</option>
                    </optgroup>
                    <optgroup label="Technical Writing & Blogging">
                      <option value="Medium">Medium</option>
                      <option value="Dev.to">Dev.to</option>
                      <option value="Hashnode">Hashnode</option>
                    </optgroup>
                    <optgroup label="Competitive Coding & Problem-Solving">
                      <option value="LeetCode">LeetCode</option>
                      <option value="HackerRank">HackerRank</option>
                      <option value="CodeWars">CodeWars</option>
                      <option value="Kaggle">Kaggle</option>
                    </optgroup>
                    <optgroup label="Portfolio & Personal Website">
                      <option value="Personal Website">Personal Website</option>
                      <option value="Notion">Notion</option>
                      <option value="Behance">Behance</option>
                    </optgroup>
                    <optgroup label="Social Media for Showcasing Work">
                      <option value="Instagram">Instagram</option>
                      <option value="Twitter">Twitter (X)</option>
                      <option value="Reddit">Reddit</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    placeholder="URL Link"
                    className="input-field"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index].url = e.target.value;
                      setLinks(newLinks);
                    }}
                  />
                  <button
                    className="remove-link"
                    onClick={() => {
                      const newLinks = links.filter((_, i) => i !== index);
                      setLinks(newLinks);
                    }}
                  > Remove </button>
                </div>
              ))}
              <button onClick={addLink} className="add-link">+ Add Link</button>
            </div>

            <div className="save-button-container">
              <button className="save-button" onClick={saveProfile}>Save</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileEditPage;

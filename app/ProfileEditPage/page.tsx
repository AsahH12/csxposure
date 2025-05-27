'use client';
import React, { useEffect, useState, useContext } from 'react';
import { auth, db } from "../../firebaseconfig";
import { setDoc, doc, updateDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; 
import { onAuthStateChanged } from "firebase/auth";
import './profileEdit.module.css';
import styles from './profileEdit.module.css';
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

// Notification Component
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
      <div className={styles.notificationIcon}>
        {type === 'success' ? '✓' : '✕'}
      </div>
      <div className={styles.notificationContent}>
        <div className={styles.notificationTitle}>{title}</div>
        <div className={styles.notificationMessage}>{message}</div>
      </div>
    </div>
  );
};

const ProfileEditPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('');
  const [school, setSchool] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState([{ type: '', url: '' }]);
  const [linkErrors, setLinkErrors] = useState<{[key: number]: string}>({});
  const { setProfileImage } = useContext(UserContext)!; // Use only setter to update after save
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

  // Link validation function
  const isValidLink = (type: string, url: string): boolean => {
    if (!type || !url) return false;
    
    // Convert URL to lowercase for case-insensitive matching
    const lowerUrl = url.toLowerCase();
    
    // Define expected domains for each platform type
    const platformDomains: {[key: string]: string | string[] | null} = {
      'GitHub': 'github.com',
      'GitLab': 'gitlab.com',
      'Bitbucket': 'bitbucket.org',
      'CodePen': 'codepen.io',
      'Replit': 'replit.com',
      'LinkedIn': 'linkedin.com',
      'Discord': ['discord.com', 'discord.gg'],
      'Telegram': ['t.me', 'telegram.me'],
      'Email': '@',
      'Medium': 'medium.com',
      'Dev.to': 'dev.to',
      'Hashnode': 'hashnode.com',
      'LeetCode': 'leetcode.com',
      'HackerRank': 'hackerrank.com',
      'CodeWars': 'codewars.com',
      'Kaggle': 'kaggle.com',
      'Personal Website': null, // No specific domain required
      'Notion': 'notion.so',
      'Behance': 'behance.net',
      'Instagram': 'instagram.com',
      'Twitter': ['twitter.com', 'x.com'],
      'Reddit': 'reddit.com'
    };
    
    // Get the expected domain for the selected type
    const expectedDomain = platformDomains[type];
    
    // If there's no expected domain (like for Personal Website), consider it valid
    if (!expectedDomain) return true;
    
    // Special case for email
    if (type === 'Email') {
      // Simple email validation: contains @ and at least one . after @
      return lowerUrl.includes('@') && lowerUrl.split('@')[1].includes('.');
    }
    
    // Handle multiple possible domains (array)
    if (Array.isArray(expectedDomain)) {
      return expectedDomain.some(domain => lowerUrl.includes(domain));
    }
    
    // Standard case: URL should include the expected domain
    return lowerUrl.includes(expectedDomain);
  };

  // Validate all links before saving
  const validateAllLinks = () => {
    const errors: {[key: number]: string} = {};
    let hasErrors = false;
    
    links.forEach((link, index) => {
      // Skip empty links
      if (!link.type || !link.url) return;
      
      if (!isValidLink(link.type, link.url)) {
        errors[index] = `This doesn't appear to be a valid ${link.type} URL`;
        hasErrors = true;
      }
    });
    
    setLinkErrors(errors);
    return !hasErrors;
  };

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
              if (categoryCounter[category as keyof typeof categoryCounter] !== undefined) {
                categoryCounter[category as keyof typeof categoryCounter] += 1;
              } else {
                categoryCounter['Other'] += 1; 
              }
            });
          });
          setCategoryCounts(categoryCounter);

          const userProfileRef = doc(db, "users", user.uid, "details", "profileData");
          await updateDoc(userProfileRef, {
            totalProjects: userProjects.length,
            categoryCounts: categoryCounter,
          });

        } catch (error) {
          console.error("Error fetching profile or projects:", error);
          showNotification('error', 'Error', 'Failed to fetch data.');
        }
      }
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
    const LinkLimit = 4; // Set the limit to 4 links
    if (links.length >= LinkLimit) {
      showNotification('error', 'Link Limit', 'You can only add up to 4 links.');
      return;
    }
    setLinks([...links, { type: '', url: '' }]);
  };

  // Save profile information into the database
  const saveProfile = async () => {
    if (!isSchoolValid) {
      showNotification('error', 'Invalid School', 'Please select a school from the suggestions.');
      return;
    }

    // Validate links
    if (!validateAllLinks()) {
      showNotification('error', 'Invalid Links', 'Please correct the highlighted links before saving.');
      return;
    }

    const validLinks = links.filter((link) => link.type.trim() !== "" || link.url.trim() !== "");
    setLinks(validLinks);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid, "details", "profileData");
      await setDoc(userDocRef, {
        firstName,
        lastName,
        status,
        school,
        bio,
        links: validLinks,
        volunteerAgreement,
        profileImage: localProfileImage, 
      }, { merge: true });

      // Update context only after successful save
      setProfileImage(localProfileImage);

      showNotification('success', 'Success', 'Profile saved successfully!');
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification('error', 'Save Failed', 'Failed to save profile.');
    }
  };

  // Helper function to get the first image from an array or return null
  const getFirstImage = (images?: string[] | string): string | null => {
    if (!images) return null;
    
    if (typeof images === 'string') return images;
    
    return images.length > 0 ? images[0] : null;
  };

  // Handle link changes with validation
  const handleLinkChange = (index: number, field: 'type' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    
    // Clear any previous error for this link if the field changes
    if (linkErrors[index]) {
      const newLinkErrors = {...linkErrors};
      delete newLinkErrors[index];
      setLinkErrors(newLinkErrors);
    }
    
    setLinks(newLinks);
    
    // Validate on-the-fly if both type and URL are present
    if (newLinks[index].type && newLinks[index].url && field === 'url') {
      if (!isValidLink(newLinks[index].type, value)) {
        setLinkErrors(prev => ({
          ...prev,
          [index]: `This doesn't appear to be a valid ${newLinks[index].type} URL`
        }));
      }
    }
  };

  if (loading) {
    return(
      <div className={styles.loadingContainer || 'text-center py-5'}>
        <DotLottieReact
          src="./loading_BlueComputer.json"
          loop
          autoplay
        />
      </div>
    );
  }

  return (
    <div>
      {/* Render notification if it's visible */}
      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}

      <div className={styles.profileEditContainer}>
        <div className={styles.profileEditCard}>
          <div className={styles.projectSection}>
            <h2 className={styles.projectSectionTitle}>Your Projects</h2>
            <div className={styles.projectGrid}>
              {projects.map((project) => (
                <Link key={project.id} className={styles.projectLink} href={`/ProjectEditPage?id=${project.id}`}>
                  <div className={styles.projectCard}>
                    <div className={styles.projectImageWrapper}>
                      {getFirstImage(project.images) ? (
                        <img src={getFirstImage(project.images)!} className={styles.projectThumbnail} alt={project.projectName || "Project"} />
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
              <Link className={styles.link} href="/ProjectEditPage">
                <button className={styles.addProject}>+ Add Project</button>
              </Link>
            </div>
          </div>


          <div className={styles.profileForm}>
            <div className={styles.saveButtonContainer}>
              <button className={styles.saveButton} onClick={saveProfile}>Save</button>
            </div>
            <label className={styles.profilePicture} htmlFor="imageUpload">
              {localProfileImage && typeof localProfileImage === "string" ? (
                <img src={localProfileImage} alt="Profile" className={styles.profileImage} />
              ) : (
                <span className={styles.text}>Click to upload</span>
              )}
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="First Name"
                className={styles.inputField}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                className={styles.inputField}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Status:</label>
              <select className={styles.inputField} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Education Status</option>
                <option value="Student">Student</option>
                <option value="Graduate">Graduate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* School Input Section */}
            <div className={styles.formGroup}>
              <label>School:</label>
              <input
                type="text"
                placeholder="Search for your university..."
                className={styles.inputField}
                value={school}
                onChange={handleSchoolInputChange}
              />
              {schoolSuggestions.length > 0 && (
                <ul className={styles.suggestionList}>
                  {schoolSuggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => handleSelectSchool(suggestion)}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CheckBox Volunteer Filter */}
            <div className={styles.formCheck}>
              <input
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
            <div className={styles.formGorup}>
              <label>Bio:</label>
              <textarea
                className={`${styles.inputField} ${styles.bioTextarea}`}
                value={bio}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 600) setBio(value); // character limit
                }}
                rows={4}
                maxLength={600}
                placeholder="Tell us about yourself..."
              />
              <div className={styles.charCounter}>
                {bio.length}/600 characters
              </div>
            </div>

            {/* Link Input Section */}
            <div className={styles.formGroup}>
              <h2 className={styles.sectionTitle}>Links</h2>
              {links.map((link, index) => (
                <div key={index} className={styles.linkGroup}>
                  <select
                    className={styles.inputField}
                    value={link.type}
                    onChange={(e) => handleLinkChange(index, 'type', e.target.value)}
                  >  {/* Link Type Selection */}
                    <option value="">Select Link</option>
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
                  <div className={styles.urlInputContainer}>
                    <input
                      type="text"
                      placeholder="URL Link"
                      className={`${styles.inputField} ${linkErrors[index] ? styles.inputError : ''}`}
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    />
                    {linkErrors[index] && <div className={styles.errorMessage}>{linkErrors[index]}</div>}
                  </div>
                  <button
                    className={styles.removeLink}
                    onClick={() => {
                      const newLinks = links.filter((_, i) => i !== index);
                      setLinks(newLinks);
                      
                      // Clear any errors for this link
                      if (linkErrors[index]) {
                        const newErrors = {...linkErrors};
                        delete newErrors[index];
                        setLinkErrors(newErrors);
                      }
                    }}
                  > Remove </button>
                </div>
              ))}
              <button onClick={addLink} className={styles.addLink}>+ Add Link</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileEditPage;
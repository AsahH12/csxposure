"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import styles from "./sidebar.module.css";
import { fetchUniversities } from "../Utility/fetchUniversities"; // Import the utility function


// Handle search
interface SidebarProps {
  onNameSearchChange?: (query: string) => void;
  onSchoolChange?: (school: string) => void;
  onGraduatedChange?: (graduated: boolean) => void;
  onVolunteerChange?: (volunteer: boolean) => void;
  onWebsitesChange?: (websites: boolean) => void;
  onAppsChange?: (apps: boolean) => void;
  onGamesChange?: (games: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onNameSearchChange, onSchoolChange, onGraduatedChange, onVolunteerChange, onWebsitesChange, onAppsChange, onGamesChange  
  }) => {
  const [discussionPosts, setDiscussionPosts] = useState([]); // Stores discussion posts from database
  const [nameSearch, setNameInput] = useState("");  // Name search input
  const [allSchools, setAllSchools] = useState<string[]>([]); // All schools from API
  const [schoolInput, setSchoolInput] = useState(""); // School search input
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]); // Schools based on search
  const [discussionSearch, setDiscussionSearch] = useState(""); // Discussion search input
  const [filteredDiscussions, setFilteredDiscussions] = useState([]); // Discussions based on search
  const [searchInput, setSearchInput] = useState(""); // For "Search discussions..." only

  const [graduated, setGraduated] = useState(false);
  const [volunteer, setVolunteer] = useState(false);
  const [websites, setWebsites] = useState(false);
  const [apps, setApps] = useState(false);
  const [games, setGames] = useState(false);

  //////////////////////////////////// Discussion Board ////////////////////////////////////
  // Populate discussion posts
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "discussionPosts"));

        const posts = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const commentsSnapshot = await getDocs(
              collection(db, "discussionPosts", doc.id, "comments")
            );

            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              createdAt: data.createdAt?.toDate() || null,
              commentCount: commentsSnapshot.size,
            };
          })
        );

        setDiscussionPosts(posts);
        setFilteredDiscussions(posts); // Default to all discussions
      } catch (error) {
        console.error("Error fetching discussion posts:", error);
      }
    };

    fetchDiscussions();
  }, []);

  const handleDiscussionSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setDiscussionSearch(query);

    // Filter discussion posts based on title or description
    const filteredPosts = discussionPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query)
    );

    setFilteredDiscussions(filteredPosts);
  };

  //////////////////////////////////// School Filter ////////////////////////////////////
  // Fetch university list
  useEffect(() => {
    const loadUniversities = async () => {
      const universities = await fetchUniversities();
      setAllSchools(universities);
    };
    loadUniversities();
  }, []);

  // Filter school dropdown
  const handleSchoolInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSchoolInput(query);

    // Update the school filter dynamically as the user types
    onSchoolChange(query);

    // Reset filter when input is empty
    if (query.trim() === "") {
      setSchoolSuggestions([]);
      return;
    }

    // Filter school suggestions based on input
    const filteredSchools = allSchools.filter((school) =>
      school.toLowerCase().includes(query.toLowerCase())
    );
    setSchoolSuggestions(filteredSchools.slice(0, 5)); // Limit to 5 suggestions
  };

  // Select a school from suggestions
  const handleSelectSchool = (school: string) => {
    setSchoolInput(school);
    setSchoolSuggestions([]);
    onSchoolChange(school); // Pass selected school to HomePage
  };

  //////////////////////////////////// Check Filters ////////////////////////////////////
  const handleGraduatedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setGraduated(isChecked);
    onGraduatedChange(isChecked); // Pass the graduated state to HomePage
  };

  const handleVolunteerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setVolunteer(isChecked);
    onVolunteerChange(isChecked); // Pass the volunteer state to HomePage
  }

  //////////////////////////////////// Name Filter ////////////////////////////////////
  // Handle search input change
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setNameInput(query);
    onNameSearchChange(query); // Pass search query to HomePage
  };

  // Filter the posts based on the search input (only search in title and description)
  const filteredPosts = discussionPosts.filter((post) =>
    post.title.toLowerCase().includes(searchInput.toLowerCase()) ||
    post.description.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className={styles.sidebar}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search student name..."
          className={styles.searchbar}
          value={nameSearch}
          onChange={handleSearchInputChange}
        />
      </div>

      <div className={styles.filterSection}>
        <h5 className={styles.filterTitle}>Filter by:</h5>
        <div className={styles.filterGrid}>
          <div className={styles.leftColumn}>

            {/* School Filter */}
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search school..."
                className={styles.searchbar}
                value={schoolInput}
                onChange={handleSchoolInputChange}
              />
              {/* Autocomplete Suggestions */}
              {schoolSuggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                  {schoolSuggestions.map((school, index) => (
                    <li key={index} onClick={() => handleSelectSchool(school)}>
                      {school}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CheckBox Filters */}
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="filterVolunteer" checked={volunteer} onChange={handleVolunteerChange} />
              <label className="form-check-label" htmlFor="filterVolunteer">Volunteer</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="filterGraduated" checked={graduated} onChange={handleGraduatedChange} />
              <label className="form-check-label" htmlFor="filterGraduated">Graduated</label>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="filterWebsites" />
              <label className="form-check-label" htmlFor="filterWebsites">Websites</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="filterApps" />
              <label className="form-check-label" htmlFor="filterApps">Apps</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="filterGames" />
              <label className="form-check-label" htmlFor="filterGames">Games</label>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>
      <h5 className={styles.discussionTitle}>Discussion Board</h5>
      <div className={styles.divider}></div>

      {/* Discussion Post Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search discussions..."
          className={styles.searchbar}
          value={discussionSearch}
          onChange={handleDiscussionSearch}
        />
      </div>

      {/* Display Filtered Discussions */}
      <div className={styles.scrollableContainer}>
        {filteredDiscussions.length > 0 ? (
          filteredDiscussions.map((post) => (
            <Link className={styles.discussionLink} key={post.id} href={`/Discussion/${post.id}`} passHref>
              <button className={styles.discussionButton}>
                <div className={styles.discussionPost}>
                  <h6>{post.title}</h6>
                  <p>{post.description}</p>
                  <div className={styles.postInfo}>
                    <div>
                      <span>Created At: {post.createdAt ? post.createdAt.toLocaleDateString() : "No date"}</span>
                    </div>
                    <div>
                      <span>Comment Count: {post.commentCount} {post.commentCount === 1 ? "message" : "messages"}</span>
                    </div>
                  </div>
                </div>
              </button>
            </Link>
          ))
        ) : (
          <p>No matching discussions found.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

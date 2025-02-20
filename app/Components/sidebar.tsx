'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../firebaseconfig"; // Adjust this based on your Firebase setup
import { collection, getDocs } from "firebase/firestore";
import styles from "./sidebar.module.css";
import { fetchUniversities } from "../Utility/fetchUniversities"; // Import the utility function


// Handle search
interface SidebarProps {
  onNameSearchChange: (query: string) => void;
  onSchoolChange: (school: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNameSearchChange, onSchoolChange }) => {
  const [discussionPosts, setDiscussionPosts] = useState([]); // Stores discussion posts from database
  const [nameSearch, setNameInput] = useState("");  // Name search input
  const [allSchools, setAllSchools] = useState<string[]>([]); // All schools from API
  const [schoolInput, setSchoolInput] = useState(""); // School search input
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]); // Schools based on search
  const [discussionSearch, setDiscussionSearch] = useState(""); // Discussion search input
  const [filteredDiscussions, setFilteredDiscussions] = useState([]); // Discussions based on search

  //////////////////////////////////// Discussion Board ////////////////////////////////////
  // Populate discussion posts
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "discussionPosts"));
        const posts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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

  //////////////////////////////////// Name Filter ////////////////////////////////////
  // Handle search input change
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setNameInput(query);
    onNameSearchChange(query); // Pass search query to HomePage
  };


  return (
    <div className={styles.sidebar}>
      {/* Name Search Section */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search name..."
          className={styles.searchbar}
          value={nameSearch}
          onChange={handleSearchInputChange}
        />
      </div>

      {/* Filter Section */}
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
              <input className="form-check-input" type="checkbox" id="filterVolunteer" />
              <label className="form-check-label" htmlFor="filterVolunteer">Volunteer</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="filterGraduated" />
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

      {/* Divider */}
      <div className={styles.divider}></div>

      {/* Discussion Board Section */}
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
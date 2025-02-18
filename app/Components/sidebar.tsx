'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../firebaseconfig"; // Adjust this based on your Firebase setup
import { collection, getDocs } from "firebase/firestore";
import styles from "./sidebar.module.css";

// Handle search
interface SidebarProps {
  onSearchChange: (query: string) => void;
  onSchoolChange: (school: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSearchChange, onSchoolChange }) => {
  const [discussionPosts, setDiscussionPosts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [allSchools, setAllSchools] = useState<string[]>([]);

  // Populate discussion posts
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min");

    const fetchDiscussions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "discussionPosts"));
        const posts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDiscussionPosts(posts);
      } catch (error) {
        console.error("Error fetching discussion posts:", error);
      }
    };

    fetchDiscussions();
  }, []);

  // Fetch university list from API
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
        const data = await response.json();
        const schoolNames = data.map((school: any) => school.name);
        setAllSchools(schoolNames);
      } catch (error) {
        console.error("Error fetching universities:", error);
      }
    };

    fetchUniversities();
  }, []);

  // Filter school dropdown
  const handleSchoolInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSchoolInput(query);

    // Reset filter when input is empty
    if (query.trim() === "") {
      onSchoolChange("");
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

  // Handle search input change
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchInput(query);
    onSearchChange(query); // Pass search query to HomePage
  };


  return (
    <div className={styles.sidebar}>
      {/* Name Search Section */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search name..."
          className={styles.searchbar}
          value={searchInput}
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

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input type="text" placeholder="Search discussions..." className={styles.searchbar} />
      </div>

      {/* Scrollable Container for Discussion Posts */}
      <div className={styles.scrollableContainer}>
        {discussionPosts.length > 0 ? (
          discussionPosts.map((post) => (
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
          <p>No discussion posts available.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
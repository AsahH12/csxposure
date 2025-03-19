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
  onStudentChange?: (student: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNameSearchChange, onSchoolChange, onGraduatedChange, onVolunteerChange, onWebsitesChange, onAppsChange, onGamesChange, onStudentChange
}) => {
  const [discussionPosts, setDiscussionPosts] = useState([]); // Stores discussion posts from database
  const [nameSearch, setNameInput] = useState("");  // Name search input
  const [allSchools, setAllSchools] = useState<string[]>([]); // All schools from API
  const [schoolInput, setSchoolInput] = useState(""); // School search input
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]); // Schools based on search
  const [isFocused, setIsFocused] = useState(false); // For school suggestions
  const [discussionSearch, setDiscussionSearch] = useState(""); // Discussion search input
  const [filteredDiscussions, setFilteredDiscussions] = useState([]); // Discussions based on search
  const [searchInput, setSearchInput] = useState(""); // For "Search discussions..." only
  const [activeFilters, setActiveFilters] = useState<string[]>([]); // Active filter for discussions

  const [graduated, setGraduated] = useState(false);
  const [student, setStudent] = useState(false);
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

  const handleFilter = (filterType: string) => {
    setActiveFilters((prevFilters) =>
      prevFilters.includes(filterType)
        ? prevFilters.filter((filter) => filter !== filterType) // Remove if already selected
        : [...prevFilters, filterType] // Add if not selected
    );
    console.log("Active Filters:", activeFilters);
    // Implement filter logic here
  };

  const handleSort = (sortType: string) => {
    console.log("Sort selected:", sortType);
    // Implement sorting logic here
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

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding to allow clicking on a suggestion
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
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

  const handleStudentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setStudent(isChecked);
    onStudentChange(isChecked); // Pass the student state to HomePage
  }

  const handleWebsitesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setWebsites(isChecked);
    onWebsitesChange(isChecked);
  };

  const handleAppsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setApps(isChecked);
    onAppsChange(isChecked);
  };

  const handleGamesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setGames(isChecked);
    onGamesChange(isChecked);
  };

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
      <div className={styles.searchNameContainer}>
        <img src="/icon_Search.png" alt="Search Icon" className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search student name..."
          className={styles.searchbarName}
          value={nameSearch}
          onChange={handleSearchInputChange}
        />
      </div>

      <div className={styles.filterSection}>
        <img src="/icon_Filter.png" alt="Filter Icon" className={styles.filterIcon} />
        <h5 className={styles.filterTitle}>Filter by:</h5>

        {/* School Filter */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search school..."
            className={styles.searchbarSchool}
            value={schoolInput}
            onChange={handleSchoolInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {/* Autocomplete Suggestions */}
          {isFocused && schoolSuggestions.length > 0 && (
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
        <div className={styles.filterGrid}>
          <div className={styles.leftColumn}>
            <div className="form-check">
              <input className={`form-check-input ${styles.checkbox}`} type="checkbox" id="filterVolunteer" checked={volunteer} onChange={handleVolunteerChange} />
              <label className={`form-check-label ${styles.checkboxLabels}`} htmlFor="filterVolunteer">Volunteer</label>
            </div>
            <div className="form-check">
              <input className={`form-check-input ${styles.checkbox}`} type="checkbox" id="filterGraduated" checked={graduated} onChange={handleGraduatedChange} />
              <label className={`form-check-label ${styles.checkboxLabels}`} htmlFor="filterGraduated">Graduated</label>
            </div>
            <div className="form-check">
              <input className={`form-check-input ${styles.checkbox}`} type="checkbox" id="filterStudent" checked={student} onChange={handleStudentChange} />
              <label className={`form-check-label ${styles.checkboxLabels}`} htmlFor="filterStudent">Student</label>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className="form-check">
              <input className={`form-check-input ${styles.checkbox}`} type="checkbox" id="filterWebsites" checked={websites} onChange={handleWebsitesChange}/>
              <label className={`form-check-label ${styles.checkboxLabels}`} htmlFor="filterWebsites">Websites</label>
            </div>
            <div className="form-check">
              <input className={`form-check-input ${styles.checkbox}`} type="checkbox" id="filterApps" checked={apps} onChange={handleAppsChange}/>
              <label className={`form-check-label ${styles.checkboxLabels}`} htmlFor="filterApps">Apps</label>
            </div>
            <div className="form-check">
              <input className={`form-check-input ${styles.checkbox}`} type="checkbox" id="filterGames" checked={games} onChange={handleGamesChange}/>
              <label className={`form-check-label ${styles.checkboxLabels}`} htmlFor="filterGames">Games</label>
            </div>
          </div>
        </div>

      </div>

      <div className={styles.divider}></div>
      <h5 className={styles.discussionTitle}>Discussion Board</h5>
      <div className={styles.divider}></div>

      {/* Discussion Post Search */}
      <div className={styles.searchDiscussionContainer}>
        <input
          type="text"
          placeholder="Search discussions..."
          className={styles.searchDiscussion}
          value={discussionSearch}
          onChange={handleDiscussionSearch}
        />
      </div>

      {/* Discussion Post Filters */}
      <div className={styles.discussionFilters}>
        <div className={`btn-group ${styles.buttonGroup}`} role="group" aria-label="Discussion Filters">
          <button
            type="button"
            className={`btn btn-secondary ${styles.filterButton} ${activeFilters.includes("Created") ? styles.active : ""}`}
            onClick={() => handleFilter("Created")}
          >
            Created
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${styles.filterButton} ${activeFilters.includes("Joined") ? styles.active : ""}`}
            onClick={() => handleFilter("Joined")}
          >
            Joined
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${styles.filterButton} ${activeFilters.includes("Business") ? styles.active : ""}`}
            onClick={() => handleFilter("Business")}
          >
            Business
          </button>

          <div className="btn-group" role="group">
            <select className={`btn btn-secondary ${styles.sortDropdown}`} onChange={(e) => handleSort(e.target.value)}>
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most_comments">Most Comments</option>
              <option value="least_comments">Least Comments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Filtered Discussions */}
      <div className={styles.scrollableContainer}>
        {filteredDiscussions.length > 0 ? (
          filteredDiscussions.map((post) => (
            <Link className={styles.discussionLink} key={post.id} href={`/Discussion/${post.id}`} passHref>
              <div className={styles.discussionPost}>
                <h6>{post.title}</h6>
                <p>{post.description}</p>
                <div className={styles.postInfo}>
                  <p>{post.createdAt ? post.createdAt.toLocaleDateString() : "No date"} | {post.commentCount} {post.commentCount === 1 ? "Comments" : "Comments"}</p>
                </div>
              </div>
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

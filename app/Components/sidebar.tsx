'use client';
import { useEffect, useState } from "react";
import { db } from "../../firebaseconfig"; 
import { collection, getDocs } from "firebase/firestore";
import styles from "./sidebar.module.css"; 

//Handle search
interface SidebarProps{
  onSearchChange: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({onSearchChange}) => {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [discussionPosts, setDiscussionPosts] = useState([]); // State for discussion posts
  const [searchInput, setSearchInput] = useState("");

  //Populate discussion posts
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

  //Filter school dropdown
  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(event.target.value);
  };

  //Handle search input change
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
        <button className={styles.searchButton}>Search</button>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <h5 className={styles.filterTitle}>Filter by:</h5>
        <div className={styles.filterGrid}>
          <div className={styles.leftColumn}>
            <select
              className={`form-select ${styles.schoolSelect}`}
              id="schoolSelect"
              value={selectedSchool}
              onChange={handleSchoolChange}
            >
              <option value="" disabled>Select a school</option>
              <option value="any">Any</option>
              <option value="school1">Full Sail University</option>
              <option value="school2">Harvard University</option>
              <option value="school3">Stanford University</option>
            </select>
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
        <button className={styles.searchButton}>Search</button>
      </div>

      {/* Scrollable Container for Discussion Posts */}
      <div className={styles.scrollableContainer}>
       
        {discussionPosts.length > 0 ? (
          discussionPosts.map((post) => (
            <button className= {styles.discussionButton} key={post.id}>
            <div className={styles.discussionPost} key={post.id}>
              <h6>{post.title}</h6>
              <p>{post.description}</p>
            </div>
            </button>
          ))
        ) : (
          <p>No discussion posts available.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import styles from "./sidebar.module.css";

interface SidebarProps {
  onSearchChange: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSearchChange }) => {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [discussionPosts, setDiscussionPosts] = useState([]);
  const [searchInput, setSearchInput] = useState(""); // For "Search discussions..." only

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min");

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
      } catch (error) {
        console.error("Error fetching discussion posts:", error);
      }
    };

    fetchDiscussions();
  }, []);

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(event.target.value);
  };

  // Method for handling "Search name..." input
  const handleSearchNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value); // Calls the prop function for name search
  };

  // Method for handling "Search discussions..." input
  const handleSearchDiscussionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchInput(query); // Update "Search discussions..." query
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
          placeholder="Search name..."
          className={styles.searchbar}
          onChange={handleSearchNameChange} // Handle "Search name..." input
        />
        <button className={styles.searchButton}>Search</button>
      </div>

      <div className={styles.filterSection}>
        <h5 className={styles.filterTitle}>Filter by:</h5>
        <div className={styles.filterGrid}>
          <div className={styles.leftColumn}>
            <select
              className={`form-select ${styles.schoolSelect}`}
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

      <div className={styles.divider}></div>
      <h5 className={styles.discussionTitle}>Discussion Board</h5>
      <div className={styles.divider}></div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search discussions..."
          className={styles.searchbar}
          value={searchInput}
          onChange={handleSearchDiscussionsChange} // Handle "Search discussions..." input
        />
        <button className={styles.searchButton}>Search</button>
      </div>

      <div className={styles.scrollableContainer}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
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
          <p>No discussion posts available.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './sidebar.module.css';

const Sidebar: React.FC = () => {
  const [selectedSchool, setSelectedSchool] = useState(''); // State to manage selected school

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min');
  }, []);

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(event.target.value); // Update state on change
  };

  return (
    <div className={styles.sidebar}>
      {/* Name Search Section */}
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Search name..." 
          className={styles.searchbar} 
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
              value={selectedSchool} // Use value prop here
              onChange={handleSchoolChange} // Handle change event
            >              
            <option value="" disabled>
                Select a school
              </option>
              <option value="any">Any</option>
              <option value="school1">Full Sail University</option>
              <option value="school2">Harvard University</option>
              <option value="school3">Stanford University</option>
            </select>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="filterVolunteer" 
              />
              <label className="form-check-label" htmlFor="filterVolunteer">
                Volunteer
              </label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="filterGraduated" 
              />
              <label className="form-check-label" htmlFor="filterGraduated">
                Graduated
              </label>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="filterWebsites" 
              />
              <label className="form-check-label" htmlFor="filterWebsites">
                Websites
              </label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="filterApps" 
              />
              <label className="form-check-label" htmlFor="filterApps">
                Apps
              </label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="filterGames" 
              />
              <label className="form-check-label" htmlFor="filterGames">
                Games
              </label>
            </div>
          </div>
        </div>
      </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Discussion Board Section */}
        <h5 className={styles.discussionTitle}>Discussion Board</h5>

        {/* Divider */}
        <div className={styles.divider}></div>

       {/* Search Bar */}
       <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Search discussions..." 
          className={styles.searchbar} 
        />
        <button className={styles.searchButton}>Search</button>
      </div>

        {/* Scrollable Container for Discussion Posts */}
        <div className={styles.scrollableContainer}>
        {['Discussion Post 1', 'Discussion Post 2', 'Discussion Post 3', 'Discussion Post 4', 'Discussion Post 5', 'Discussion Post 6', 'Discussion Post 7', 'Discussion Post 8', , 'Discussion Post 9', 'Discussion Post 10'].map((post, index) => (
            <div className={styles.discussionPost} key={index}>
            <h6>{post}</h6>
            <p>This is a brief description of {post}.</p>
            </div>
        ))}
        </div>
    </div>
  );
};

export default Sidebar;
'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import styles from './sidebar.module.css';

const Sidebar: React.FC = () => {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min');
  }, []);

  return (
    <div className={styles.sidebar}>
      {/* Name Search Section */}
      <input 
        type="text" 
        placeholder="Search..." 
        className={styles.searchName} 
      />
      <button className={styles.searchButton}>Search</button>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <h5 className={styles.filterTitle}>Filters:</h5>
        {/* Dropdown */}
        <select className={`form-select ${styles.schoolSelect}`} id="schoolSelect">
          <option value="" disabled selected>
            Select a school
          </option>
          <option value="any">Any</option>
          <option value="school1">School 1</option>
          <option value="school2">School 2</option>
          <option value="school3">School 3</option>
        </select>
        {/* Checkboxes */}
        {['Websites', 'Volunteer', 'Apps', 'Graduated', 'Games'].map((item, index) => (
          <div className="form-check" key={index}>
            <input 
              className="form-check-input" 
              type="checkbox" 
              id={`filterCheck${index}`} 
            />
            <label className="form-check-label" htmlFor={`filterCheck${index}`}>
              {item}
            </label>
          </div>
        ))}
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
            className={styles.searchName} 
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
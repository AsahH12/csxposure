// page.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import CardComponent from '../HomeComponents/profileCard';
import Sidebar from '../Components/sidebar';
import styles from './home.module.css';
import Footer from '../Components/footer';


const HomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className="row">
          <div className={`col-md-auto ${styles.columnleft}`}>
            <Sidebar />
          </div>
          <div className="col">
            <div className={styles.scrollableContainer}>
              <CardComponent
                firstName="John"
                lastName="Doe"
                school="Harvard University"
                description="A passionate student with a love for learning."
              />
              <CardComponent
                firstName="Emily"
                lastName="Underwood"
                school="Stanford University"
                description="An enthusiastic learner with a focus on computer science."
              />
              <CardComponent
                firstName="Jane"
                lastName="Smith"
                school="MIT"
                description="A dedicated student with a passion for technology."
              />
              <CardComponent
                firstName="John"
                lastName="Doe"
                school="Harvard University"
                description="A passionate student with a love for learning."
              />
              <CardComponent
                firstName="Emily"
                lastName="Underwood"
                school="Stanford University"
                description="An enthusiastic learner with a focus on computer science."
              />
              <CardComponent
                firstName="Jane"
                lastName="Smith"
                school="MIT"
                description="A dedicated student with a passion for technology."
              />
              <Footer />
            </div>
          </div>
        </div>
    </div>
  );
};

export default HomePage; 
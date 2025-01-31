'use client';
import React from 'react';
import Link from 'next/link';
import styles from './profileCard.module.css';
interface CardProps {
  firstName: string;
  lastName: string;
  school: string;
  description: string;
  profileImageUrl?: string; // Optional profile image URL
}

const CardComponent: React.FC<CardProps> = ({ firstName, lastName, school, description, profileImageUrl }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.nameContainer}>
          <div className={styles.profileImageContainer}>
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile" className={styles.profileImage} />
            ) : (
              <span className={styles.initials}>{firstName[0]}{lastName[0]}</span>
            )}
          </div>
          <h5 className={styles.cardTitle}>{firstName} {lastName}</h5>
        </div>
        <h6 className={styles.cardSubtitle}>{school}</h6>
        <p className={styles.cardText}>{description}</p>
      </div>
    </div>
  );
};

export default CardComponent;
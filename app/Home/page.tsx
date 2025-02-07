'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../../firebaseconfig'; // Ensure correct Firebase config path
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Sidebar from '../Components/sidebar';
import styles from './home.module.css';
import cardstyles from './profileCard.module.css';
import Footer from '../Components/footer';

const HomePage: React.FC = () => {
  const [cards, setCards] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);

  //Grab users from database
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min');

    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userDocs = await getDocs(usersCollection);
        
        const fetchedUsers: CardProps[] = [];

        for (const userDoc of userDocs.docs) {
          const userId = userDoc.id;
          const profileDocRef = doc(db, "users", userId, "details", "profileData");
          const profileDocSnap = await getDoc(profileDocRef);

          if (profileDocSnap.exists()) {
            const profileData = profileDocSnap.data();
            fetchedUsers.push({
              firstName: profileData.firstName || "N/A",
              lastName: profileData.lastName || "N/A",
              school: profileData.school || "Unknown School",
              description: profileData.bio || "No bio available",
              profileImageUrl: profileData.profileImage || '',
            });
          }
        }

        setCards(fetchedUsers);
      } catch (error) {
        console.error("Error fetching user profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Card Component
  const CardComponent: React.FC<CardProps> = ({ firstName, lastName, school, description, profileImageUrl }) => {
    return (
      <Link className={cardstyles.cardLink} href="/StudentProfilePage">
        <div className={cardstyles.card}>
          <div className={cardstyles.cardBody}>
            <div className={cardstyles.profileImageContainer}>
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className={cardstyles.profileImage} />
              ) : (
                <span className={cardstyles.initials}>{firstName[0]}{lastName[0]}</span>
              )}
            </div>
            <h5 className={cardstyles.cardTitle}>{firstName} {lastName}</h5>
            <h6 className={cardstyles.cardSubtitle}>{school}</h6>
            <p className={cardstyles.cardText}>{description}</p>
          </div>
        </div>
      </Link>
    );
  };

  // CardProps interface
  interface CardProps {
    firstName: string;
    lastName: string;
    school: string;
    description: string;
    profileImageUrl?: string;
  }

  return (
    <div className={styles.container}>
      <div className="row">
        <div className={`col-md-auto ${styles.columnleft}`}>
          <Sidebar />
        </div>
        <div className="col">
          <div className={styles.scrollableContainer}>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className={styles.cardContainer}>
                {cards.map((card, index) => (
                  <CardComponent key={index} {...card} />
                ))}
              </div>
            )}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

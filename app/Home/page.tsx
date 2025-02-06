// page.tsx
'use client';
import React, { useEffect, useState } from 'react'; 
import Link from 'next/link';
import Sidebar from '../Components/sidebar';
import styles from './home.module.css';
import cardstyles from './profileCard.module.css';
import Footer from '../Components/footer';

const HomePage: React.FC = () => {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [cards, setCards] = useState<CardProps[]>([]); // State for cards
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min');

    // Simulate fetching data
    const fetchCards = async () => {
      // Simulating a delay to mimic fetching
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const fetchedCards: CardProps[] = [
        {
          firstName: "John",
          lastName: "Doe",
          school: "Harvard University",
          description: "A passionate student with a love for learning.",
        },
        {
          firstName: "Emily",
          lastName: "Underwood",
          school: "Stanford University",
          description: "An enthusiastic learner with a focus on computer science.",
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          school: "MIT",
          description: "A dedicated student with a passion for technology.",
        },
        {
          firstName: "Michael",
          lastName: "Johnson",
          school: "Yale University",
          description: "An aspiring engineer with a knack for innovation.",
        },
        {
          firstName: "Sarah",
          lastName: "Connor",
          school: "UC Berkeley",
          description: "A creative thinker with a passion for the arts.",
        },
        {
          firstName: "Chris",
          lastName: "Evans",
          school: "Stanford University",
          description: "A sports enthusiast with leadership skills.",
        },
        {
          firstName: "Jessica",
          lastName: "Biel",
          school: "Duke University",
          description: "A science lover with dreams of becoming a doctor.",
        },
        {
          firstName: "Daniel",
          lastName: "Craig",
          school: "Harvard University",
          description: "A dedicated student with a love for history.",
        },
        {
          firstName: "John",
          lastName: "Doe",
          school: "Harvard University",
          description: "A passionate student with a love for learning.",
        },
        {
          firstName: "Emily",
          lastName: "Underwood",
          school: "Stanford University",
          description: "An enthusiastic learner with a focus on computer science.",
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          school: "MIT",
          description: "A dedicated student with a passion for technology.",
        },
        {
          firstName: "Michael",
          lastName: "Johnson",
          school: "Yale University",
          description: "An aspiring engineer with a knack for innovation.",
        },
        {
          firstName: "Sarah",
          lastName: "Connor",
          school: "UC Berkeley",
          description: "A creative thinker with a passion for the arts.",
        },
        {
          firstName: "Chris",
          lastName: "Evans",
          school: "Stanford University",
          description: "A sports enthusiast with leadership skills.",
        },
        {
          firstName: "Jessica",
          lastName: "Biel",
          school: "Duke University",
          description: "A science lover with dreams of becoming a doctor.",
        },
        {
          firstName: "Daniel",
          lastName: "Craig",
          school: "Harvard University",
          description: "A dedicated student with a love for history.",
        },
      ];

      setCards(fetchedCards);
      setLoading(false);
    };

    fetchCards();
  }, []);

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(event.target.value);
  };

  // Combined CardComponent
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
              <div className={styles.cardGrid}>
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
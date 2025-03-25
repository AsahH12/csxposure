'use client';
import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Link from 'next/link';
import { db } from '../../firebaseconfig';
import { collection, getDocs, doc, getDoc, query } from "firebase/firestore";
import Sidebar from '../Components/sidebar';
import styles from './home.module.css';
import cardstyles from './profileCard.module.css';
import Footer from '../Components/footer';

// CardProps interface
interface CardProps {
  userId: string;
  userType: string;
  firstName: string;
  lastName: string;
  school: string;
  description: string;
  profileImageUrl?: string;
  status?: string;
  volunteer?: boolean;
  categoryCounts?: { Game: number; App: number; Website: number; Other: number };
}

const HomePage: React.FC = () => {
  const [cards, setCards] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");

  const [showGraduated, setShowGraduated] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [showWebsites, setShowWebsites] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showGames, setShowGames] = useState(false);

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
          const userType = userDoc.data().userType;
          const profileDocRef = doc(db, "users", userId, "details", "profileData");
          const profileDocSnap = await getDoc(profileDocRef);

          if (profileDocSnap.exists()) {
            const profileData = profileDocSnap.data();
            
            fetchedUsers.push({
              userId,
              userType,
              firstName: profileData.firstName || "N/A",
              lastName: profileData.lastName || "N/A",
              school: profileData.school || "Unknown School",
              description: profileData.bio || "No bio available",
              profileImageUrl: profileData.profileImage || '',
              status: profileData.status || '',
              volunteer: profileData.volunteerAgreement || false,
              categoryCounts: profileData.categoryCounts || { Game: 0, App: 0, Website: 0, Other: 0 },
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

  //////////////////////////////////// Filtered Cards ////////////////////////////////////
  // Filter cards based on search name and checkboxes
  const filteredCards = cards.filter((card) =>
    `${card.firstName} ${card.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedSchool.trim() === "" || selectedSchool.toLowerCase() === "any" || card.school.toLowerCase().includes(selectedSchool.toLowerCase())) &&
    (!showGraduated || card.status === "Graduate") &&
    (!showVolunteers || card.volunteer) &&
    (!showStudents || card.status === "Student") &&
    (!showApps || card.categoryCounts?.App > 0) && 
    (!showWebsites || card.categoryCounts?.Website > 0) && 
    (!showGames || card.categoryCounts?.Game > 0)
  );

  // Handle search updates from sidebar
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter updates from sidebar
  const handleSchoolChange = (school: string) => {
    setSelectedSchool(school.trim());
  };

  const handleGraduatedChange = (graduated: boolean) => {
    setShowGraduated(graduated);
  };

  const handleVolunteerChange = (volunteer: boolean) => {
    setShowVolunteers(volunteer);
  };

  const handleStudentChange = (student: boolean) => {
    setShowStudents(student);
  };

  const handleAppsChange = (apps: boolean) => {
    setShowApps(apps);
  };

  const handleWebsitesChange = (websites: boolean) => {
    setShowWebsites(websites);
  };

  const handleGamesChange = (games: boolean) => {
    setShowGames(games);
  };

  //////////////////////////////////// Card Component ////////////////////////////////////
  const CardComponent: React.FC<CardProps> = ({ userId, userType, firstName, lastName, school, description, profileImageUrl }) => {
    const profileUrl = userType === 'student'
      ? `/StudentProfilePage?userId=${userId}`
      : `/BusinessProfilePage?userId=${userId}`;

    return (
      <Link className={cardstyles.cardLink} href={profileUrl}>
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

  //Home page layout
  return (
    <div className={styles.container}>
      <div className="row">
        <div className={`col-md-auto ${styles.columnleft}`}>
          <Sidebar
            onNameSearchChange={handleSearchChange}
            onSchoolChange={handleSchoolChange}
            onGraduatedChange={handleGraduatedChange}
            onVolunteerChange={handleVolunteerChange}
            onStudentChange={handleStudentChange}
            onAppsChange={handleAppsChange}
            onWebsitesChange={handleWebsitesChange}
            onGamesChange={handleGamesChange}
          />
        </div>
        <div className="col">
          <div className={styles.scrollableContainer}>
            {loading ? (
              <DotLottieReact
              src="./loading_BlueComputer.json"
              loop
              autoplay
            />
            ) : (
              <div className={styles.cardContainer}>
                {filteredCards.map((card, index) => (
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

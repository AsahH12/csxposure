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

        console.log("Fetched users:", fetchedUsers);
        // Identify the top user for each category without duplication
        const topUsers: CardProps[] = [];

        // Find top user for general (most combined projects)
        const mostGeneral = fetchedUsers.sort((a, b) => 
          (b.categoryCounts?.Game + b.categoryCounts?.App + b.categoryCounts?.Website) - 
          (a.categoryCounts?.Game + a.categoryCounts?.App + a.categoryCounts?.Website)
        )[0];

        // Find top user for website projects
        const mostWebsite = fetchedUsers.sort((a, b) => (b.categoryCounts?.Website || 0) - (a.categoryCounts?.Website || 0))[0];

        // Find top user for app projects
        const mostApp = fetchedUsers.sort((a, b) => (b.categoryCounts?.App || 0) - (a.categoryCounts?.App || 0))[0];

        // Find top user for game projects
        const mostGame = fetchedUsers.sort((a, b) => (b.categoryCounts?.Game || 0) - (a.categoryCounts?.Game || 0))[0];

        // Ensure users are unique by checking if they are already added to the top users array
        if (mostGeneral && !topUsers.some(user => user.userId === mostGeneral.userId)) topUsers.push(mostGeneral);
        if (mostWebsite && !topUsers.some(user => user.userId === mostWebsite.userId)) topUsers.push(mostWebsite);
        if (mostApp && !topUsers.some(user => user.userId === mostApp.userId)) topUsers.push(mostApp);
        if (mostGame && !topUsers.some(user => user.userId === mostGame.userId)) topUsers.push(mostGame);

        // Add the top users to the front and the rest of the users afterwards
        const restOfTheUsers = fetchedUsers.filter(user => 
          !topUsers.some(topUser => topUser.userId === user.userId)
        );

        setCards([...topUsers, ...restOfTheUsers]);

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

  // Function to determine what the user has the most of
  const getMostCategory = (categoryCounts: { Game: number; App: number; Website: number }) => {
    const categories = ['Game', 'App', 'Website'];
    let mostCategory = categories[0];
    let maxCount = categoryCounts[mostCategory];

    categories.forEach(category => {
      if (categoryCounts[category] > maxCount) {
        mostCategory = category;
        maxCount = categoryCounts[category];
      }
    });

    return mostCategory;
  };

  //////////////////////////////////// Card Component ////////////////////////////////////
  const CardComponent: React.FC<CardProps & { index: number }> = ({ userId, userType, firstName, lastName, school, description, profileImageUrl, categoryCounts, index}) => {
    const truncatedDescription = description.length > 60 ? description.slice(0, 60) + '...' : description;

    const profileUrl = userType === 'student'
      ? `/StudentProfilePage?userId=${userId}`
      : `/BusinessProfilePage?userId=${userId}`;

    const mostCategory = getMostCategory(categoryCounts || { Game: 0, App: 0, Website: 0 });
    const categoryLabel = mostCategory ? `Most ${mostCategory} Projects` : "";

    const showCategoryBar = index < 4;

    return (
      <Link className={cardstyles.cardLink} href={profileUrl}>
        <div className={cardstyles.card}>
        {showCategoryBar && categoryLabel && <div className={cardstyles.categoryBar}>{categoryLabel}</div>}          <div className={cardstyles.cardBody}>
            <div className={cardstyles.profileImageContainer}>
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className={cardstyles.profileImage} />
              ) : (
                <span className={cardstyles.initials}>{firstName[0]}{lastName[0]}</span>
              )}
            </div>
            <h5 className={cardstyles.cardTitle}>{firstName} {lastName}</h5>
            <h6 className={cardstyles.cardSubtitle}>{school}</h6>
            <p className={cardstyles.cardText}>{truncatedDescription}</p>
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
                  <CardComponent key={index} index={index} {...card} />
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

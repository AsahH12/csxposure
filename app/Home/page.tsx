'use client';
import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Link from 'next/link';
import { db } from '../../firebaseconfig';
import { collection, getDocs, doc, getDoc, query, setDoc } from "firebase/firestore";
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
  highlightCategory?: string;
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
        const featuredRef = doc(db, "featured", "topUsers");
        const featuredSnap = await getDoc(featuredRef);
        const now = new Date();
        let topUsers: CardProps[] = [];
    
        // Check if featured data exists and is fresh
        if (featuredSnap.exists()) {
          const data = featuredSnap.data();
          const lastUpdated = data.lastUpdated?.toDate?.() || new Date(0);
          const ageInDays = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
          if (ageInDays < 3 && data.users?.length > 0) {
            // Fetch full profiles for each cached top user
            const topUserPromises = data.users.map(async (u: { userId: string; highlightCategory: string }) => {
              const profileRef = doc(db, "users", u.userId, "details", "profileData");
              const profileSnap = await getDoc(profileRef);
    
              if (profileSnap.exists()) {
                const profile = profileSnap.data();
                return {
                  userId: u.userId,
                  userType: "student", // adjust if needed
                  firstName: profile.firstName || "N/A",
                  lastName: profile.lastName || "N/A",
                  school: profile.school || "Unknown School",
                  description: profile.bio || "No bio available",
                  profileImageUrl: profile.profileImage || '',
                  status: profile.status || '',
                  volunteer: profile.volunteerAgreement || false,
                  categoryCounts: profile.categoryCounts || { Game: 0, App: 0, Website: 0, Other: 0 },
                  highlightCategory: u.highlightCategory,
                };
              }
              return null;
            });
    
            const resolved = await Promise.all(topUserPromises);
            topUsers = resolved.filter(Boolean) as CardProps[];
            console.log("Loaded cached top users:", topUsers);
          }
        }
    
        // If no recent data, recalculate top users
        if (topUsers.length === 0) {
          const usersCollection = collection(db, "users");
          const userDocs = await getDocs(usersCollection);
          const fetchedUsers: CardProps[] = [];
    
          for (const userDoc of userDocs.docs) {
            const userId = userDoc.id;
            const userType = userDoc.data().userType;
            const profileDocRef = doc(db, "users", userId, "details", "profileData");
            const profileDocSnap = await getDoc(profileDocRef);
    
            if (profileDocSnap.exists()) {
              const profile = profileDocSnap.data();
              fetchedUsers.push({
                userId,
                userType,
                firstName: profile.firstName || "N/A",
                lastName: profile.lastName || "N/A",
                school: profile.school || "Unknown School",
                description: profile.bio || "No bio available",
                profileImageUrl: profile.profileImage || '',
                status: profile.status || '',
                volunteer: profile.volunteerAgreement || false,
                categoryCounts: profile.categoryCounts || { Game: 0, App: 0, Website: 0, Other: 0 },
              });
            }
          }

          const usedIds = new Set<string>();

          let mostGame: CardProps | undefined;
          let mostApp: CardProps | undefined;
          let mostWebsite: CardProps | undefined;
          let mostGeneral: CardProps | undefined;

          const findTopUser = (category: keyof CardProps["categoryCounts"]) =>
            fetchedUsers
              .filter(u => !usedIds.has(u.userId))
              .sort((a, b) => (b.categoryCounts?.[category] || 0) - (a.categoryCounts?.[category] || 0))[0];

          mostGame = findTopUser("Game");
          if (mostGame) usedIds.add(mostGame.userId);

          mostApp = findTopUser("App");
          if (mostApp) usedIds.add(mostApp.userId);

          mostWebsite = findTopUser("Website");
          if (mostWebsite) usedIds.add(mostWebsite.userId);

          mostGeneral = fetchedUsers
            .filter(u => !usedIds.has(u.userId))
            .sort((a, b) =>
              (b.categoryCounts?.Game || 0) + (b.categoryCounts?.App || 0) + (b.categoryCounts?.Website || 0) -
              ((a.categoryCounts?.Game || 0) + (a.categoryCounts?.App || 0) + (a.categoryCounts?.Website || 0))
            )[0];

          if (mostGeneral) usedIds.add(mostGeneral.userId);

          // Step 4: Push to topList in desired display order
          const topList: { userId: string; highlightCategory: string }[] = [];

          if (mostGeneral) topList.push({ userId: mostGeneral.userId, highlightCategory: "Number of" });
          if (mostGame) topList.push({ userId: mostGame.userId, highlightCategory: "Game" });
          if (mostApp) topList.push({ userId: mostApp.userId, highlightCategory: "App" });
          if (mostWebsite) topList.push({ userId: mostWebsite.userId, highlightCategory: "Website" });

          // Write lean version to Firestore
          await setDoc(featuredRef, {
            lastUpdated: new Date(),
            users: topList,
          });

          // Fetch full profiles for new top users
          const topUserPromises = topList.map(async (u) => {
            const profileRef = doc(db, "users", u.userId, "details", "profileData");
            const profileSnap = await getDoc(profileRef);
            const userDoc = await getDoc(doc(db, "users", u.userId));
    
            if (profileSnap.exists()) {
              const profile = profileSnap.data();
              return {
                userId: u.userId,
                userType: userDoc.exists() ? userDoc.data().userType : "student",
                firstName: profile.firstName || "N/A",
                lastName: profile.lastName || "N/A",
                school: profile.school || "Unknown School",
                description: profile.bio || "No bio available",
                profileImageUrl: profile.profileImage || '',
                status: profile.status || '',
                volunteer: profile.volunteerAgreement || false,
                categoryCounts: profile.categoryCounts || { Game: 0, App: 0, Website: 0, Other: 0 },
                highlightCategory: u.highlightCategory,
              };
            }
            return null;
          });
    
          const resolved = await Promise.all(topUserPromises);
          topUsers = resolved.filter(Boolean) as CardProps[];
          console.log("Updated and saved new top users:", topUsers);
        }
    
        // Fetch rest of users
        const usersCollection = collection(db, "users");
        const userDocs = await getDocs(usersCollection);
        const allUsers: CardProps[] = [];
    
        for (const userDoc of userDocs.docs) {
          const userId = userDoc.id;
          const userType = userDoc.data().userType;
          const profileRef = doc(db, "users", userId, "details", "profileData");
          const profileSnap = await getDoc(profileRef);
    
          if (profileSnap.exists() && userType !== 'business') {
            const data = profileSnap.data();
            allUsers.push({
              userId,
              userType,
              firstName: data.firstName || "N/A",
              lastName: data.lastName || "N/A",
              school: data.school || "Unknown School",
              description: data.bio || "No bio available",
              profileImageUrl: data.profileImage || '',
              status: data.status || '',
              volunteer: data.volunteerAgreement || false,
              categoryCounts: data.categoryCounts || { Game: 0, App: 0, Website: 0, Other: 0 },
            });
          }
        }
    
        const restOfUsers = allUsers.filter(user => !topUsers.some(t => t.userId === user.userId));
        setCards([...topUsers, ...restOfUsers]);
    
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
  const CardComponent: React.FC<CardProps & { index: number }> = ({ userId, userType, firstName, lastName, school, description, profileImageUrl, highlightCategory, categoryCounts, index}) => {
    const truncatedDescription = description.length > 60 ? description.slice(0, 60) + '...' : description;

    const profileUrl = userType === 'student'
      ? `/StudentProfilePage?userId=${userId}`
      : `/BusinessProfilePage?userId=${userId}`;

    const mostCategory = getMostCategory(categoryCounts || { Game: 0, App: 0, Website: 0 });
    const categoryLabel = index < 4 && highlightCategory ? `Most ${highlightCategory} Projects` : "";

    const showCategoryBar = index < 4;

    const cardClass = index < 4 ? `${cardstyles.card} ${cardstyles.highlightedCard}` : cardstyles.card;

    return (
      <Link className={cardstyles.cardLink} href={profileUrl}>
        <div className={cardClass}>
        {showCategoryBar && categoryLabel && <div className={cardstyles.categoryBar}>{categoryLabel}</div>}          
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

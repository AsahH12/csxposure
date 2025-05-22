'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Link from 'next/link';
import { db } from '../../firebaseconfig';
import { collection, getDocs, doc, getDoc, query, limit, startAfter, orderBy, where } from "firebase/firestore";
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

// Filters interface
interface Filters {
  searchQuery: string;
  selectedSchool: string;
  showGraduated: boolean;
  showStudents: boolean;
  showVolunteers: boolean;
  showWebsites: boolean;
  showApps: boolean;
  showGames: boolean;
}

const HomePage: React.FC = () => {
  // State
  const [featuredCards, setFeaturedCards] = useState<CardProps[]>([]);
  const [regularCards, setRegularCards] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    searchQuery: "",
    selectedSchool: "",
    showGraduated: false,
    showStudents: false,
    showVolunteers: false,
    showWebsites: false,
    showApps: false,
    showGames: false
  });

  const PAGE_SIZE = 20;
  
  // Fetch featured cards first (they load faster)
  useEffect(() => {
    const fetchFeaturedUsers = async () => {
      try {
        const featuredRef = doc(db, "featured", "topUsers");
        const featuredSnap = await getDoc(featuredRef);
        const now = new Date();
        let topUsers: CardProps[] = [];
    
        // Check if featured data exists and is fresh (less than 3 days old)
        if (featuredSnap.exists()) {
          const data = featuredSnap.data();
          const lastUpdated = data.lastUpdated?.toDate?.() || new Date(0);
          const ageInDays = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
          if (ageInDays < 3 && data.users?.length > 0) {
            // Use a batch get for better performance
            const topUserPromises = data.users.map(async (u: { userId: string; highlightCategory: string }) => {
              const profileRef = doc(db, "users", u.userId, "details", "profileData");
              const userRef = doc(db, "users", u.userId);
              const [profileSnap, userSnap] = await Promise.all([getDoc(profileRef), getDoc(userRef)]);
              
              if (profileSnap.exists() && userSnap.exists()) {
                const profile = profileSnap.data();
                const userData = userSnap.data();
                return {
                  userId: u.userId,
                  userType: userData.userType || "student",
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
            setFeaturedCards(topUsers);
          }
        }
        
        // If no recent cached data, calculate top users ourselves
        if (topUsers.length === 0) {
          // Efficiently get a batch of users to find featured users
          const usersCollection = collection(db, "users");
          const userQuery = query(usersCollection, where("userType", "!=", "business"), limit(100));
          const userDocs = await getDocs(userQuery);
          const fetchedUsers: CardProps[] = [];
          
          // Process users in parallel for better performance
          const userPromises = userDocs.docs.map(async (userDoc) => {
            const userId = userDoc.id;
            const userType = userDoc.data().userType;
            
            const profileDocRef = doc(db, "users", userId, "details", "profileData");
            const profileDocSnap = await getDoc(profileDocRef);
            
            if (profileDocSnap.exists()) {
              const profile = profileDocSnap.data();
              return {
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
              };
            }
            return null;
          });
          
          const resolvedUsers = await Promise.all(userPromises);
          const validUsers = resolvedUsers.filter(Boolean) as CardProps[];
          
          // Find featured users
          const usedIds = new Set<string>();
          
          // Find user with most games
          const mostGame = validUsers
            .filter(u => !usedIds.has(u.userId))
            .sort((a, b) => (b.categoryCounts?.Game || 0) - (a.categoryCounts?.Game || 0))[0];
            
          if (mostGame) {
            usedIds.add(mostGame.userId);
            mostGame.highlightCategory = "Game";
          }
          
          // Find user with most apps
          const mostApp = validUsers
            .filter(u => !usedIds.has(u.userId))
            .sort((a, b) => (b.categoryCounts?.App || 0) - (a.categoryCounts?.App || 0))[0];
            
          if (mostApp) {
            usedIds.add(mostApp.userId);
            mostApp.highlightCategory = "App";
          }
          
          // Find user with most websites
          const mostWebsite = validUsers
            .filter(u => !usedIds.has(u.userId))
            .sort((a, b) => (b.categoryCounts?.Website || 0) - (a.categoryCounts?.Website || 0))[0];
            
          if (mostWebsite) {
            usedIds.add(mostWebsite.userId);
            mostWebsite.highlightCategory = "Website";
          }
          
          // Find user with most projects overall
          const mostGeneral = validUsers
            .filter(u => !usedIds.has(u.userId))
            .sort((a, b) => {
              const totalA = (a.categoryCounts?.Game || 0) + 
                           (a.categoryCounts?.App || 0) + 
                           (a.categoryCounts?.Website || 0);
              const totalB = (b.categoryCounts?.Game || 0) + 
                           (b.categoryCounts?.App || 0) + 
                           (b.categoryCounts?.Website || 0);
              return totalB - totalA;
            })[0];
            
          if (mostGeneral) {
            usedIds.add(mostGeneral.userId);
            mostGeneral.highlightCategory = "Number of";
          }
          
          // Create featured cards array
          const featuredCards: CardProps[] = [];
          if (mostGeneral) featuredCards.push(mostGeneral);
          if (mostGame) featuredCards.push(mostGame);
          if (mostApp) featuredCards.push(mostApp);
          if (mostWebsite) featuredCards.push(mostWebsite);
          
          setFeaturedCards(featuredCards);
          
          // Build lean version that could be cached on server side
          const leanFeatured = featuredCards.map(card => ({
            userId: card.userId,
            highlightCategory: card.highlightCategory
          }));
          
          console.log("Calculated new featured users:", leanFeatured);
          // Note: The caching to Firestore should be done server-side
        }
      } catch (error) {
        console.error("Error fetching featured users:", error);
      } finally {
        // Now fetch regular users in a paginated way
        fetchUsers();
      }
    };
    
    fetchFeaturedUsers();
  }, []);
  
  // Fetch regular users with pagination
  const fetchUsers = async (loadMore = false) => {
    if (loadMore && !hasMore) return;
    
    try {
      setLoadingMore(loadMore);
      if (!loadMore) setLoading(true);
      
      // Create a query with pagination
      let usersQuery = query(
        collection(db, "users"),
        where("userType", "!=", "business"),
        orderBy("userType"),
        limit(PAGE_SIZE)
      );
      
      // If loading more, start after the last document
      if (loadMore && lastDoc) {
        usersQuery = query(
          collection(db, "users"),
          where("userType", "!=", "business"),
          orderBy("userType"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }
      
      const userDocs = await getDocs(usersQuery);
      
      // Update lastDoc for pagination
      const lastVisible = userDocs.docs[userDocs.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(userDocs.docs.length === PAGE_SIZE);
      
      // Process users in batch
      const userPromises = userDocs.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const userType = userDoc.data().userType;
        
        // Skip if this user is in featuredCards
        if (featuredCards.some(card => card.userId === userId)) {
          return null;
        }
        
        // Get profile data
        const profileDocRef = doc(db, "users", userId, "details", "profileData");
        const profileDocSnap = await getDoc(profileDocRef);
        
        if (profileDocSnap.exists() && userType !== 'business') {
          const profile = profileDocSnap.data();
          return {
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
          };
        }
        return null;
      });
      
      const users = (await Promise.all(userPromises)).filter(Boolean) as CardProps[];
      
      if (loadMore) {
        setRegularCards(prev => [...prev, ...users]);
      } else {
        setRegularCards(users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  // Load more users when scrolling to bottom
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchUsers(true);
    }
  }, [loadingMore, hasMore]);

  // Filter cards based on search name and checkboxes
  const filteredCards = useMemo(() => {
    // Always prioritize featured cards first, then regular cards
    // This ensures that "Most Game", "Most App", etc. always appear first
    let allCards = [...featuredCards];
    
    // Add regular cards that aren't already in featured cards
    regularCards.forEach(regularCard => {
      if (!featuredCards.some(featuredCard => featuredCard.userId === regularCard.userId)) {
        allCards.push(regularCard);
      }
    });
    
    return allCards.filter((card) => {
      const nameMatch = `${card.firstName} ${card.lastName}`.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const schoolMatch = !filters.selectedSchool.trim() || 
                         filters.selectedSchool.toLowerCase() === "any" || 
                         card.school.toLowerCase().includes(filters.selectedSchool.toLowerCase());
      const graduatedMatch = !filters.showGraduated || card.status === "Graduate";
      const volunteerMatch = !filters.showVolunteers || card.volunteer;
      const studentMatch = !filters.showStudents || card.status === "Student";
      const appsMatch = !filters.showApps || (card.categoryCounts?.App ?? 0) > 0;
      const websitesMatch = !filters.showWebsites || (card.categoryCounts?.Website ?? 0) > 0;
      const gamesMatch = !filters.showGames || (card.categoryCounts?.Game ?? 0) > 0;
      
      return nameMatch && schoolMatch && graduatedMatch && volunteerMatch && 
             studentMatch && appsMatch && websitesMatch && gamesMatch;
    });
  }, [
    featuredCards, 
    regularCards, 
    filters
  ]);

  // Handle search updates from sidebar
  const handleSearchChange = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Handle filter updates from sidebar
  const handleSchoolChange = useCallback((school: string) => {
    setFilters(prev => ({ ...prev, selectedSchool: school.trim() }));
  }, []);

  const handleGraduatedChange = useCallback((graduated: boolean) => {
    setFilters(prev => ({ ...prev, showGraduated: graduated }));
  }, []);

  const handleVolunteerChange = useCallback((volunteer: boolean) => {
    setFilters(prev => ({ ...prev, showVolunteers: volunteer }));
  }, []);

  const handleStudentChange = useCallback((student: boolean) => {
    setFilters(prev => ({ ...prev, showStudents: student }));
  }, []);

  const handleAppsChange = useCallback((apps: boolean) => {
    setFilters(prev => ({ ...prev, showApps: apps }));
  }, []);

  const handleWebsitesChange = useCallback((websites: boolean) => {
    setFilters(prev => ({ ...prev, showWebsites: websites }));
  }, []);

  const handleGamesChange = useCallback((games: boolean) => {
    setFilters(prev => ({ ...prev, showGames: games }));
  }, []);

  // Function to determine what the user has the most of
  // const getMostCategory = useCallback((categoryCounts: { Game: number; App: number; Website: number; Other: number }) => {
  //   type CategoryType = keyof typeof categoryCounts;
  //   const categories: CategoryType[] = ['Game', 'App', 'Website'];
    
  //   let mostCategory: CategoryType = 'Game';
  //   let maxCount = categoryCounts[mostCategory] || 0;

  //   categories.forEach(category => {
  //     if ((categoryCounts[category] || 0) > maxCount) {
  //       mostCategory = category;
  //       maxCount = categoryCounts[category] || 0;
  //     }
  //   });

  //   return mostCategory;
  // }, []);

  // Scroll handler for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 500 &&
        !loadingMore && 
        hasMore
      ) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loadingMore, hasMore]);

  // Card Component - Memoized to prevent unnecessary re-renders
  const CardComponent = React.memo<CardProps & { index: number }>(({ 
    userId, 
    userType, 
    firstName, 
    lastName, 
    school, 
    description, 
    profileImageUrl, 
    highlightCategory, 
    categoryCounts,
    index
  }) => {
    const truncatedDescription = description.length > 60 ? description.slice(0, 60) + '...' : description;

    const profileUrl = userType === 'student'
      ? `/StudentProfilePage/${userId}`
      : `/BusinessProfilePage/${userId}`;

    // Determine if this is a featured card
    const isFeatured = index < featuredCards.length;
    
    // Get category label for featured cards
    let categoryLabel = "";
    if (isFeatured && highlightCategory) {
      categoryLabel = `Most ${highlightCategory} Projects`;
    }
    
    const showCategoryBar = isFeatured && highlightCategory;
    const cardClass = isFeatured ? `${cardstyles.card} ${cardstyles.highlightedCard}` : cardstyles.card;

    return (
      <Link className={cardstyles.cardLink} href={profileUrl}>
        <div className={cardClass}>
          {showCategoryBar && categoryLabel && <div className={cardstyles.categoryBar}>{categoryLabel}</div>}          
          <div className={cardstyles.cardBody}>
            <div className={cardstyles.profileImageContainer}>
              {profileImageUrl ? (
                <img 
                  src={profileImageUrl} 
                  alt="Profile" 
                  className={cardstyles.profileImage}
                  loading="lazy" // Lazy load images
                />
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
  });
  
  CardComponent.displayName = 'CardComponent';

  // Home page layout
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
              <div className={styles.loadingContainer}>
                <DotLottieReact
                  src="./loading_BlueComputer.json"
                  loop
                  autoplay
                />
              </div>
            ) : (
              <>
                <div className={styles.cardContainer}>
                  {filteredCards.map((card, index) => (
                    <CardComponent key={card.userId} index={index} {...card} />
                  ))}
                  
                  {filteredCards.length === 0 && (
                    <div className={styles.noResults}>
                      <h3>No users match your filters</h3>
                      <p>Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
                
                {loadingMore && (
                  <div className={styles.loadMoreIndicator}>
                    <DotLottieReact
                      src="./loading_BlueComputer.json"
                      loop
                      autoplay
                      style={{ width: '100px', height: '100px' }}
                    />
                  </div>
                )}
              </>
            )}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
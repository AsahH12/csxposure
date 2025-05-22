"use client";
import { auth, db } from "../../../firebaseconfig";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection } from "firebase/firestore";
import "./businessProfile.css";
import Footer from "../../Components/footer";

const BusinessProfilePage: React.FC = () => {
  const params = useParams();
  const userId = params?.userId as string;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [industry, setIndustry] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!userId) return;

      try {
        // Navigate through the correct Firestore path: users -> details -> profileData
        const profileRef = doc(db, "users", userId, "details", "profileData");
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data();

          setFirstName(profileData.firstName || "First Name");
          setLastName(profileData.lastName || "Last Name");
          setBusinessName(profileData.businessName || "Business Name");
          setOccupation(profileData.occupation || "Not specified");
          setIndustry(profileData.industry || "Not specified");
          setBio(profileData.bio || "No bio available.");
          setProfileImage(profileData.profileImage || "");
          setInstagram(profileData.instagram || "");
          setLinkedin(profileData.linkedin || "");
        } else {
          console.error("Profile data not found.");
        }
      } catch (error) {
        console.error("Error fetching business profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!firstName && !lastName && !businessName) {
    return <div>User profile not found.</div>;
  }

  return (
    <div>
      <div className="business-profile-container">
        <div className="business-profile-card">
          <div className="profile-form">
            <div className="profile-picture">
              {profileImage ? (
                <img src={profileImage} alt="Profile" />
              ) : (
                <div className="default-avatar">No Image</div>
              )}
            </div>
            <div className="first-name">{firstName}</div>
            <div className="last-name">{lastName}</div>

            <div className="business-name">{businessName}</div>

            <div className="form-group">
              <label>Occupation:</label>
              <div className="input-field">{occupation}</div>
            </div>

            <div className="form-group">
              <label>Industry:</label>
              <div className="input-field">{industry}</div>
            </div>

            <div className="form-group">
              <label>Bio:</label>
              <h1 className="bio-field">{bio}</h1>
            </div>

            <div className="form-group">
              <h2 className="section-title">Links</h2>
              {instagram && (
                <a href={instagram} className="insta" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              )}
              {linkedin && (
                <a href={linkedin} className="linkedin" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              )}
            </div>

            <div className="chat-button-container">
              <button className="chat-button">Chat</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessProfilePage;

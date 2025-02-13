'use client';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebaseconfig';
import Footer from '../Components/footer';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import './businessEdit.css';

const BusinessEditPage: React.FC = () => {
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAccountType(userData.userType);
        } else {
          setError('User data not found.');
        }
      } catch (err) {
        setError('Error fetching user data.');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        router.push('/login'); // Redirect if not authenticated
      }
    });

    return () => unsubscribe();
  }, [auth, db, router]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="business-edit-wrapper">
      <div className="business-edit-container">
        <div className="business-edit-card">
          <div className="profile-form">
            <label className="profile-picture" htmlFor="imageUpload">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-img" />
              ) : (
                <span className="text">Click to upload</span>
              )}
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>

          <div className="name-group">
            <input type="text" className="name-input" placeholder="First Name" />
            <input type="text" className="name-input" placeholder="Last Name" />
          </div>

          <div className="form-group">
            <label>Business:</label>
            <input type="text" className="input-field" placeholder="Optional" />
          </div>

          <div className="form-group">
            <label>Occupation:</label>
            <input type="text" className="input-field" placeholder="Optional" />
          </div>

          <div className="form-group">
            <label>Bio:</label>
            <textarea className="bio-field" placeholder="Optional"></textarea>
          </div>

          <h2 className="section-title">Links</h2>
          <div className="link-group">
            <input type="text" className="link-type" placeholder="Type" />
            <input type="text" className="link-url" placeholder="URL Link" />
          </div>

          <div className="save-button-container">
            <button className="save-button">Save</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessEditPage;

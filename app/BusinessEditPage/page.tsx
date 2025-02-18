'use client';
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Footer from '../Components/footer';
import './businessEdit.css';

const BusinessEditPage: React.FC = () => {
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [business, setBusiness] = useState('');
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState([{ type: '', url: '' }]);
  
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
      try {
        const userDocRef = doc(db, "users", uid, "details", "businessProfile");
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setBusiness(data.business || '');
          setOccupation(data.occupation || '');
          setBio(data.bio || '');
          setLinks(data.links || [{ type: '', url: '' }]);
          setProfileImage(data.profileImage || null);
        }
      } catch (error) {
        console.error("Error fetching business profile:", error);
        alert("Failed to fetch business profile data.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        router.push('/login');
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

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (accountType !== 'business') {
      setError('Only business accounts can update this information.');
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid, "details", "businessProfile"), {
        firstName,
        lastName,
        business,
        occupation,
        bio,
        links,
        profileImage,
        userType: 'business',
      }, { merge: true });
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Error saving data.');
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
            <input type="text" className="name-input" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" className="name-input" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Business:</label>
            <input type="text" className="input-field" placeholder="Optional" value={business} onChange={(e) => setBusiness(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Occupation:</label>
            <input type="text" className="input-field" placeholder="Optional" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Bio:</label>
            <textarea className="bio-field" placeholder="Optional" value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
          </div>

          <h2 className="section-title">Links</h2>
          <div className="link-group">
            <input type="text" className="link-type" placeholder="Type" value={links[0].type} onChange={(e) => setLinks([{ type: e.target.value, url: links[0].url }])} />
            <input type="text" className="link-url" placeholder="URL Link" value={links[0].url} onChange={(e) => setLinks([{ type: links[0].type, url: e.target.value }])} />
          </div>

          <div className="save-button-container">
            <button className="save-button" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessEditPage;

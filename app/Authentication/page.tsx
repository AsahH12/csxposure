"use client";
import React, { useState } from "react";
import { auth, db } from "../../firebaseconfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Footer from '../Components/footer';

import styles from './signup.module.css';

// SignUp Component
const SignUp = ({ isBusiness, setIsBusiness }: { isBusiness: boolean; setIsBusiness: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Save user email and userType ('student' or 'business') in Firestore
      const userType = isBusiness ? "business" : "student";
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        userType,
        createdAt: new Date(),
      });

      router.push("/Dashboard");
    } catch (err) {
      setError("Error signing up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${styles.card} ${isBusiness ? styles.cardBusiness : styles.cardStudent}`}
    >
      <h1 className={`${styles.userTypeTitle} ${isBusiness ? styles.businessText : styles.studentText}`}>
            {isBusiness ? "Business" : "Student"}
          </h1>
      <h2 className={styles.cardTitle}>Sign Up</h2>
      {error && <p className={styles.statusText}>{error}</p>}

      <form onSubmit={handleSignUp}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>

        <div className={styles.toggleBusinessStudent}>
          <span
            className={styles.toggleText}
            onClick={() => setIsBusiness(!isBusiness)}
          >
            {isBusiness ? "Are you a student?" : "Are you a business?"}
          </span>
        </div>
      </form>
    </div>
  );
};

// Login Component
const Login = ({ isBusiness, setIsBusiness }: { isBusiness: boolean; setIsBusiness: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // State to track if reset email was sent
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");

    try {
      setLoading(true);

      // Sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user type from Firestore to verify if it's a business or student
      const userDoc = doc(db, "users", userCredential.user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const userType = userData.userType;

        // Check if the user type matches the selected type (business or student)
        if ((isBusiness && userType !== "business") || (!isBusiness && userType !== "student")) {
          setStatus("This account is not a valid " + (isBusiness ? "business" : "student") + " account.");
          await signOut(auth); // Sign out the user if account type doesn't match
          return;
        }

        setStatus("Login successful!");
        router.push("/Dashboard");
      } else {
        setStatus("User not found.");
      }
    } catch (error) {
      setStatus("Error: Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    router.push('/ForgotPassword');
  };

  return (
    <div
      className={`${styles.card} ${isBusiness ? styles.cardBusiness : styles.cardStudent}`}
    >
      <h1 className={`${styles.userTypeTitle} ${isBusiness ? styles.businessText : styles.studentText}`}>
            {isBusiness ? "Business" : "Student"}
          </h1>
      <h2 className={`${styles.cardTitle}`}>Login</h2>
      {status && <p className={`${styles.statusText}`}>{status}</p>}

      <form onSubmit={handleLogin}>
        <div className={`${styles.formGroup}`}>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className={`${styles.formGroup}`}>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className={`${styles.formGroup}`}>
          <button
            type="submit"
            className={`btn btn-primary w-100 ${loading ? "disabled" : ""}`}
            disabled={loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </div>

        {/* Forgot Password link */}
        <div className={`${styles.forgotPasswordLinkContainer}`}>
          <span
            className={`${styles.forgotPasswordLink}`}
            onClick={handlePasswordReset}
          >
            Forgot username or password?
          </span>
        </div>

        {/* Display message if reset email was sent */}
        {emailSent && (
          <div className={`${styles.resetEmailMessage}`}>
            <p>Password reset email sent!</p>
          </div>
        )}

        {/* Clickable question to toggle between Business and Student */}
        <div className={`${styles.toggleBusinessStudent}`}>
          <span
            className={`${styles.toggleText}`}
            onClick={() => setIsBusiness(!isBusiness)}
          >
            {isBusiness ? "Are you a student?" : "Are you a business?"}
          </span>
        </div>
      </form>
    </div>
  );

};

// AuthPage Component
const AuthPage = () => {
  const [isBusiness, setIsBusiness] = useState(false);
  const [rightPanelActive, setRightPanelActive] = useState(false);

  return (
    <div>
      {/*Background */}
      <div
        className={`${styles.container} ${
          isBusiness ? styles.businessBackground : styles.studentBackground
        }`}
      >
        {/* Login/Sign Up */}
        <div
          className={`${styles.contentWrapper} ${
            rightPanelActive ? styles.containerRightPanelActive : ""
          }`}
        >
          <div className={styles.mainContainer}>
            {/* Right Side - Student Login/SignUp */}
            <div className={`${styles.formContainer} ${styles.studentContainer}`}>
              <div className={styles.main}>
                {/* Hidden toggle checkbox for sliding */}
                <input
                  type="checkbox"
                  id="chk"
                  className={styles.chkToggle}
                  aria-hidden="true"
                />
  
                {/* Sign Up Form */}
                <div className={styles.signup}>
                  <SignUp isBusiness={isBusiness} setIsBusiness={setIsBusiness} />
                  <label htmlFor="chk" className={styles.toggleLink}>
                    Already have an account? Log In
                  </label>
                </div>
  
                {/* Login Form */}
                <div className={styles.login}>
                  <Login isBusiness={isBusiness} setIsBusiness={setIsBusiness} />
                  <label htmlFor="chk" className={styles.toggleLink}>
                    Don't have an account? Sign Up
                  </label>
                </div>
              </div>
            </div>
  
            {/* Left Side - Business Login/SignUp */}
            <div className={`${styles.formContainer} ${styles.businessContainer}`}>
              <div className={styles.main}>
                {/* Hidden toggle checkbox for sliding */}
                <input
                  type="checkbox"
                  id="chk"
                  className={styles.chkToggle}
                  aria-hidden="true"
                />
  
                {/* Sign Up Form */}
                <div className={styles.signup}>
                  <SignUp isBusiness={isBusiness} setIsBusiness={setIsBusiness} />
                  <label htmlFor="chk" className={styles.toggleLink}>
                    Already have an account? Log In
                  </label>
                </div>
  
                {/* Login Form */}
                <div className={styles.login}>
                  <Login isBusiness={isBusiness} setIsBusiness={setIsBusiness} />
                  <label htmlFor="chk" className={styles.toggleLink}>
                    Don't have an account? Sign Up
                  </label>
                </div>
              </div>
            </div>
  
            {/* Overlay for Business and Student Login */}
            <div className={styles.overlayContainer}>
              <div className={styles.overlay}>
                <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
                  <h1>Are you showcasing projects?</h1>
                  <button
                    className={styles.ghost}
                    onClick={() => setRightPanelActive(false)}
                  >
                    Student Login
                  </button>
                </div>
                <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
                  <h1>Are you a Business or Employer?</h1>
                  <button
                    className={styles.ghost}
                    onClick={() => setRightPanelActive(true)}
                  >
                    Business Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthPage;

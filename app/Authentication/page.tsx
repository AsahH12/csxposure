"use client"; 
import React, { useState } from "react";
import { auth, db } from "../../firebaseconfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Footer from '../Components/footer';

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
      className="card p-4 shadow-lg"
      style={{
        width: "100%",
        maxWidth: "400px",
        backgroundColor: isBusiness ? "#1e3a8a" : "white", // Dark blue for business
        color: isBusiness ? "white" : "black", // Text color
      }}
    >
      <h2 className="card-title text-center">Sign Up</h2>
      {error && <p className="text-danger text-center mb-3">{error}</p>}

      <form onSubmit={handleSignUp}>
        <div className="mb-3">
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

        <div className="mb-3">
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

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control"
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="mb-3">
          <button
            type="submit"
            className={`btn btn-primary w-100 ${loading ? "disabled" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>

        {/* Clickable question to toggle between Business and Student */}
        <div className="d-flex justify-content-center mt-3">
          <span
            className="me-2"
            style={{ cursor: "pointer", textDecoration: "underline" }}
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
        router.push("/Home");
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
      className="card p-4 shadow-lg"
      style={{
        width: "100%",
        maxWidth: "400px",
        backgroundColor: isBusiness ? "#1e3a8a" : "white", // Dark blue for business
        color: isBusiness ? "white" : "black", // Text color
      }}
    >
      <h2 className="card-title text-center">Login</h2>
      {status && <p className="text-danger text-center mb-3">{status}</p>}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
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

        <div className="mb-3">
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

        <div className="mb-3">
          <button
            type="submit"
            className={`btn btn-primary w-100 ${loading ? "disabled" : ""}`}
            disabled={loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </div>

        {/* Forgot Password link */}
        <div className="d-flex justify-content-center mt-3">
          <span
            className="me-2"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={handlePasswordReset}
          >
            Forgot username or password?
          </span>
        </div>

        {/* Display message if reset email was sent */}
        {emailSent && (
          <div className="mt-3 text-center">
            <p style={{ color: "green" }}>Password reset email sent!</p>
          </div>
        )}

        {/* Clickable question to toggle between Business and Student */}
        <div className="d-flex justify-content-center mt-3">
          <span
            className="me-2"
            style={{ cursor: "pointer", textDecoration: "underline" }}
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

  return (
    <div>
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: `url('/logo_Vertical.png')`,
        backgroundRepeat: 'repeat', // makes it tile across the whole background
        backgroundSize: '100px 100px',
        backgroundPosition: 'top left', // can be 'center', 'top left', etc.
        backgroundColor: isBusiness ? "#2d2d2d" : "#f7fafc", // will show through transparent parts
        transition: "background-color 0.3s ease",
      }}
    >
      <div className="d-flex flex-column flex-md-row gap-4">
        <SignUp isBusiness={isBusiness} setIsBusiness={setIsBusiness} />
        <Login isBusiness={isBusiness} setIsBusiness={setIsBusiness} />
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default AuthPage;

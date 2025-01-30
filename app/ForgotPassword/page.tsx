"use client"; // Ensure this is a client-side component
import React, { useState } from "react";
import { auth } from "../../firebaseconfig"; // Your firebase config
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
      setEmail(""); // Clear the email field
    } catch (err) {
      setError("Error sending reset email. Please try again.");
    }
  };
const handlerBacktoSignIn = async() =>{
    router.push('/Auth');
}
  return (
    <div className="container" style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2 className="text-center">Forgot Password</h2>
      {message && <p className="text-success">{message}</p>}
      {error && <p className="text-danger">{error}</p>}

      <form onSubmit={handleResetPassword}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Enter your email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            placeholder="Email address"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Reset Password
        </button>
      </form>
      <span
            className="me-2"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={handlerBacktoSignIn}
          >
            Log In?
          </span>
    </div>
  );
};

export default ForgotPassword;

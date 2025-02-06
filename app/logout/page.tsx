"use client";
import React, { useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const LogoutPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();

    // Sign out the user when the component mounts
    const logout = async () => {
      try {
        await signOut(auth);
        // Redirect the user after logout (e.g., to the login page)
        router.push("/Authentication");
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Logging out...</h2>
        <p>Please wait while we log you out of your account.</p>
      </div>
    </div>
  );
};

export default LogoutPage;

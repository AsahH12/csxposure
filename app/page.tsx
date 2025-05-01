"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { auth } from "../firebaseconfig"; // Ensure correct path

const Page1 = () => {
  const router = useRouter();

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");

    if (!hasVisited) {
      // First-time visitor → Force logout
      signOut(auth).then(() => {
        localStorage.setItem("hasVisited", "true");
      }).catch((error) => {
        console.error("Error signing out:", error);
      });
    }
  }, []);

  const navigateToPageSignUPTemp = () => {
    router.push('/CodeEditor');
  };

  return (
    <div className="p-4 text-center">
      <div className="text-2xl font-bold">
        Page 1
        <button
          onClick={navigateToPageSignUPTemp}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Go To Page 2
        </button>
      </div>
    </div>
  );
};

export default Page1;

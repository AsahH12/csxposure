// src/app/page.tsx
"use client"; // Add this line at the very top if it's a client-side component

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the sign_in page as soon as the app loads
    router.push("/Auth/signuplogin"); 
  }, [router]);

  return null; // You don't need to render anything here; it just redirects.
};

export default HomePage;


// src/app/page.tsx
"use client"; // Add this line at the very top if it's a client-side component

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page1 = () => {
  const router = useRouter();
  const navigateToPageSignUPTemp = () => {
    router.push('/Home');
  };

  return (
    <div className='p-4 text-center'>
      <div className='text-2xl font-bold'>Page 1
        <button 
        onClick={navigateToPageSignUPTemp}
        className='mt-4 bg blue-500 text-white py-2 px-4 rounded-lg'>
          Go To Page 2
        </button>
      </div>
    </div>
  );
};
export default Page1;

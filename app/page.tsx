'use client'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CodeEditor from "./Components/CodeEditor";
import RunButton from "./Components/RunButton";
import { Router } from "express";
import { useRouter } from "next/navigation";

const Page1: React.FC = () => {
  const [code, setCode] = useState<string>("console.log('Hello, World!');");
  const router = useRouter(); // Initialize Next.js router

  const navigateToPageSignUPTemp = () => {
    router.push("/Home");
  };

  return (
    <div className="p-4 text-center">
      <div className="text-2xl font-bold">
        Page 1
        <CodeEditor code={code} setCode={setCode} />
        <RunButton code={code} />
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

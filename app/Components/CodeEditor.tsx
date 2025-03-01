"use client"; // Ensure this runs only on the client side

import React, { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { ref, set, onValue } from "firebase/database";
import { realtimeDB } from "../../firebaseconfig"; 

interface CodeEditorProps {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode }) => {
  // Firebase reference
  const codeRef = ref(realtimeDB, "editor/session1");

  useEffect(() => {
    // Listen for Firebase updates and sync code
    onValue(codeRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.code !== code) {
        setCode(data.code);
      }
    });
  }, [code]); // Depend on `code` to ensure updates

  // Handle code changes
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      set(codeRef, { code: value }); // Save to Firebase
    }
  };

  return (
    <Editor
      height="500px"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={code}
      onChange={handleEditorChange}
    />
  );
};

export default CodeEditor;

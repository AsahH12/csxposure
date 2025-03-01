import React, { useState } from "react";

// Supported JDoodle languages
const languages = [
  { name: "JavaScript", value: "javascript", versionIndex: "4" }, // ✅ Fix here
  { name: "Python", value: "python3", versionIndex: "3" },
  { name: "C++", value: "cpp17", versionIndex: "0" },
  { name: "Java", value: "java", versionIndex: "4" },
];


interface JDoodleResponse {
  output: string;
  statusCode: number;
  memory: string;
  cpuTime: string;
}

const RunButton: React.FC<{ code: string }> = ({ code }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [output, setOutput] = useState<string>("");

  const executeCode = async () => {
    const requestBody = {
      script: code, // Your Monaco Editor code
      language: selectedLanguage.value,
      versionIndex: selectedLanguage.versionIndex,
      clientId: "1ed425d3ed173afd308cf4d06b4ab096",
      clientSecret: "dca8fbbb4173d37d8fa9f4a7d7418bd010c0b26c05623c30e9f24ff6a1d4cc17",
    };
    console.log("Request Body:", requestBody); // Debugging

    try {
      const response = await fetch("http://localhost:5000/compile", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data: JDoodleResponse = await response.json();
      setOutput(data.output);
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput("Error executing code.");
    }
  };

  return (
    <div>
      {/* Language Selector */}
      <select
        value={selectedLanguage.value}
        onChange={(e) => {
          const lang = languages.find((lang) => lang.value === e.target.value);
          if (lang) setSelectedLanguage(lang);
        }}
        className="px-2 py-1 border rounded"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.name}
          </option>
        ))}
      </select>

      {/* Run Code Button */}
      <button onClick={executeCode} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
        Run Code
      </button>

      {/* Output Display */}
      <pre className="mt-4 p-2 bg-gray-100">{output}</pre>
    </div>
  );
};

export default RunButton;

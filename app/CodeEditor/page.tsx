"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import 'bootstrap/dist/css/bootstrap.min.css';

const languageOptions = {
  python3: "python",
  cpp17: "cpp",
  java: "java",
  javascript: "javascript",
};

export default function CodeEditor() {
  const [language, setLanguage] = useState("python3");
  const [code, setCode] = useState('print("Hello, World!")');
  const [output, setOutput] = useState("");

  const handleRunCode = async () => {
    setOutput("Running...");

    const requestBody = {
      code,
      language,
    };

    try {
      const response = await fetch("/api/runcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      setOutput(result.output || result.error || "No output");
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput("Execution failed.");
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Online Code Editor</h1>

      <div className="row mb-4 align-items-center">
        <div className="col-auto">
          <label className="form-label fw-bold">Language:</label>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python3">Python</option>
            <option value="cpp17">C++</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
      </div>

      <div className="mb-4 border rounded">
        <Editor
          height="400px"
          language={languageOptions[language]}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      </div>

      <div className="text-center mb-4">
        <button
          className="btn btn-primary"
          onClick={handleRunCode}
        >
          Run Code
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Output:</h5>
          <pre className="card-text text-dark bg-light p-3 rounded">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

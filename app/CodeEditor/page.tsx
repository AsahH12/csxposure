"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

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

        console.log("Sending request:", requestBody);

        try {
            const response = await fetch("/api/runcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            console.log("Response received:", result);

            setOutput(result.output || result.error || "No output");
        } catch (error) {
            console.error("Error executing code:", error);
            setOutput("Execution failed.");
        }
    };

    return (
        <div className="p-5 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Online Code Editor</h1>

            <div className="flex gap-4 mb-4">
                <label className="font-semibold">Language:</label>
                <select
                    className="p-2 border rounded"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="python3">Python</option>
                    <option value="cpp17">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                </select>
            </div>

            <Editor
                height="300px"
                width="600px"
                language={languageOptions[language]}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
            />

            <button
                className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                onClick={handleRunCode}
            >
                Run Code
            </button>

            <div className="mt-4 p-4 border rounded bg-gray-100 w-3/4">
                <h2 className="text-lg font-semibold">Output:</h2>
                <pre className="mt-2 text-gray-800">{output}</pre>
            </div>
        </div>
    );
}

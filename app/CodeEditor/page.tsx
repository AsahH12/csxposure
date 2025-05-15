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
      <h1 className="text-center mb-4">Workspace</h1>

      <div className="row">
        {/* Main Column - Code Editor */}
        <div className="col-lg-8 mb-4">
          <div className="mb-3 d-flex align-items-center">
            <label className="form-label me-2 fw-bold">Language:</label>
            <select
              className="form-select w-auto"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="python3">Python</option>
              <option value="cpp17">C++</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div className="mb-3 border rounded">
            <Editor
              height="400px"
              language={languageOptions[language]}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
            />
          </div>

          <div className="text-center mb-3">
            <button className="btn btn-primary" onClick={handleRunCode}>
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

        {/* Side Column - To-Do List + Document + Jitsi */}
        <div className="col-lg-4">
          {/* To-Do List */}
          <ToDoList />

          {/* Collaborative Document */}
          <CollaborativeDoc />

          {/* === Jitsi Start === */}
          <JitsiMeet />
          {/* === Jitsi End === */}
        </div>
      </div>
    </div>
  );
}

function ToDoList() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim() !== "") {
      setTasks([...tasks, newTask.trim()]);
      setNewTask("");
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <h5>📝 To-Do List</h5>
      <div className="input-group mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button className="btn btn-outline-secondary" onClick={addTask}>
          Add
        </button>
      </div>
      <ul className="list-group">
        {tasks.map((task, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {task}
            <button className="btn btn-sm btn-danger" onClick={() => removeTask(index)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CollaborativeDoc() {
  const [text, setText] = useState("");

  return (
    <div className="mb-4">
      <h5>🧾 Collaborative Notes</h5>
      <textarea
        className="form-control"
        rows={10}
        placeholder="Start typing..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <small className="text-muted">Changes are local — connect to Firebase or Yjs for real-time sync.</small>
    </div>
  );
}

// === Jitsi Video Room Component ===
function JitsiMeet() {
  const [room, setRoom] = useState<string | null>(null);
  const [customRoom, setCustomRoom] = useState("");

  const createRoom = () => {
    const newRoom = `workspace-${Math.floor(Math.random() * 100000)}`;
    setRoom(newRoom);
  };

  const joinRoom = () => {
    if (customRoom.trim() !== "") {
      setRoom(customRoom.trim());
    }
  };

  return (
    <div className="mb-4">
      <h5>📹 Video Room</h5>
      {!room ? (
        <>
          <div className="mb-2 d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Enter room name..."
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
            />
            <button className="btn btn-outline-primary" onClick={joinRoom}>
              Join Room
            </button>
          </div>
          <button className="btn btn-success" onClick={createRoom}>
            Create New Room
          </button>
        </>
      ) : (
        <>
          <div className="mb-2">
            <small className="text-muted">Room: {room}</small>
          </div>
          <iframe
            src={`https://meet.jit.si/${room}`}
            allow="camera; microphone; fullscreen; display-capture"
            style={{ width: "100%", height: "400px", border: "none", borderRadius: "8px" }}
            title="Jitsi Video Room"
          />
        </>
      )}
    </div>
  );
}

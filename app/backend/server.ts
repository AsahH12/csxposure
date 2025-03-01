import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json()); // ✅ Ensure JSON body is parsed

// ✅ Correct function signature
app.post("/compile", async (req: Request, res: Response): Promise<void> => { 
  console.log("Incoming Request:", req.body);

  if (!req.body || !req.body.script || !req.body.language) {
    res.status(400).json({ error: "Invalid request format" });
    return;
  }

  try {
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log("JDoodle Response:", data);

    if (!response.ok) {
      res.status(response.status).json({ error: data });
      return;
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error connecting to JDoodle API" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

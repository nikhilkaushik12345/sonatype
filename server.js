import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve index.html

// CORS headers for local testing — not needed on Render since same origin
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// === Exchange authorization code for access token ===
app.post("/exchange", async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ error: "Missing authorization code" });

  try {
    const response = await fetch("https://mcp.guide.sonatype.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        client_id: "Gfd74wKsjIYuhO8gEIieIN1y64Tmg5ku",
        redirect_uri: "https://sonatype-login.onrender.com", // your Render app URL
        grant_type: "authorization_code"
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error exchanging code:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ App running on port ${PORT}`));

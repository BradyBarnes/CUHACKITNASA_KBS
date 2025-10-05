// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from your client folder
app.use(express.static(path.join(__dirname, "client", "asteroid-tracker")));

// ✅ Use regex instead of '*' to match all routes (Express 5 fix)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "asteroid-tracker", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
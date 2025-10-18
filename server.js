import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets (images, CSS, JS)
app.use(express.static(__dirname, { extensions: ["html"] }));

// Main route: inject Firebase config before sending HTML
app.get("/", (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  // Build injection variables
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  // Optional: supply a custom token or just null
  const initialAuthToken = process.env.FIREBASE_CUSTOM_TOKEN || null;

  // Inject into HTML
  html = `
    <script>
      window.__firebase_config = ${JSON.stringify(firebaseConfig)};
      window.__initial_auth_token = ${JSON.stringify(initialAuthToken)};
    </script>
  ` + html;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


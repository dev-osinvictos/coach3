// server.js
import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config(); // only for local testing; Render provides env vars in production

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets (images, CSS, JS)
app.use(express.static(__dirname, { extensions: ["html"] }));

function buildFirebaseConfigFromEnv() {
  return {
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.FIREBASE_APP_ID || ""
  };
}

app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");

  const firebaseConfig = buildFirebaseConfigFromEnv();
  const initialAuthToken = process.env.FIREBASE_CUSTOM_TOKEN || null;

  // Inject as a STRING containing JSON (double-stringify)
  // Client will run JSON.parse(window.__firebase_config)
  const firebaseConfigAsStringLiteral = JSON.stringify(JSON.stringify(firebaseConfig));
  const initialAuthTokenLiteral = JSON.stringify(initialAuthToken);

  const injection = `
<script>
  // Injected by server - DO NOT EDIT IN CLIENT
  window.__firebase_config = ${firebaseConfigAsStringLiteral};
  window.__initial_auth_token = ${initialAuthTokenLiteral};
</script>
`;

  // Prepend the injection so the client code can read it immediately
  html = injection + html;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


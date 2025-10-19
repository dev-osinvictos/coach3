import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/config", (req, res) => {
  res.json({
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    supabaseConfig: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
    },
  });
});

app.get("/", (req, res) => {
  const htmlPath = path.join(process.cwd(), "index.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  const supabaseConfig = {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  };

  // Safely inject JSON as text (no escaping problems)
  const injectedJSON = JSON.stringify({ firebaseConfig, supabaseConfig });
  const injectedScript = `
    <script id="app-config" type="application/json">
      ${injectedJSON}
    </script>
  `;

  html = html.replace("<!DOCTYPE html>", `<!DOCTYPE html>\n${injectedScript}`);
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


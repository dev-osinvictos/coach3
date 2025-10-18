import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (images, css, etc.)
app.use(express.static("public"));

app.get("/", (req, res) => {
  const htmlPath = path.join(process.cwd(), "index.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  // Firebase config object
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  // Prepare injected script with both Firebase and Supabase
  const injectedScript = `
    <script>
      window.__firebase_config = '${JSON.stringify(firebaseConfig)}';
      window.__supabase_url = "${process.env.SUPABASE_URL}";
      window.__supabase_anon_key = "${process.env.SUPABASE_ANON_KEY}";
    </script>
  `;

  // Inject the script right after <!DOCTYPE html>
  html = html.replace("<!DOCTYPE html>", `<!DOCTYPE html>\n${injectedScript}`);

  res.send(html);
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


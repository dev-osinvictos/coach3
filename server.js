import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();  // ✅ cria o app primeiro
const PORT = process.env.PORT || 3000;

// ✅ habilita CORS logo depois da criação do app
app.use(cors({
  origin: [
    "https://www.osinvictos.com.br",
    "https://osinvictos.com.br",
  ],
}));

app.use(express.static("public"));

// 🔹 rota /config para Vercel buscar configs
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

// 🔹 rota principal (opcional)
app.get("/", (req, res) => {
  const htmlPath = path.join(process.cwd(), "index.html");
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, "utf-8");
    res.send(html);
  } else {
    res.send("<h1>Backend running ✅</h1><p>Use /config to get config JSON.</p>");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// 🔹 Função auxiliar para enviar SMS
async function sendSMS(phone, message) {
  try {
    const res = await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        phone: phone,
        message: message,
        key: "textbelt", // chave gratuita = 1 SMS/dia
      }),
    });
    const data = await res.json();
    console.log("📩 SMS result:", data);
  } catch (err) {
    console.error("❌ SMS send error:", err);
  }
}

// 🔹 Endpoint de salvar booking e disparar SMS
app.post("/saveBooking", async (req, res) => {
  try {
    const bookingData = req.body;
    console.log("🆕 Novo booking recebido:", bookingData);

    // Salva no Firestore
    const docRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      timestamp: Date.now(),
    });

    // 🔔 Envia SMS pro coach
    await sendSMS(
      "+5519988108063", // 👉 Coloque seu número completo (ex: +5511999999999)
      `📅 Novo booking recebido!\nJogador: ${bookingData.payerAddress}\nHorário: ${bookingData.appointmentTime}`
    );

    console.log("✅ Booking salvo e SMS enviado");
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("❌ Erro ao salvar booking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔹 Endpoint de config (mantém o mesmo)
app.get("/config", (req, res) => {
  res.json({ firebaseConfig });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


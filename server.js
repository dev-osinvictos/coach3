import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import twilio from "twilio";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// 🔹 Inicializa Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// 🔹 Inicializa Twilio client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// 🔹 Função auxiliar para enviar SMS com Twilio
async function sendSMS(phone, message) {
  console.log("🚀 Enviando SMS via Twilio:", phone, message);
  try {
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });
    console.log("📩 Twilio SMS sent:", sms.sid);
  } catch (err) {
    console.error("❌ Twilio SMS error:", err);
  }
}

// 🔹 Endpoint de salvar booking e enviar SMS
app.post("/saveBooking", async (req, res) => {
  try {
    const bookingData = req.body;
    console.log("🆕 Novo booking recebido:", bookingData);

    // Salva no Firestore
    const docRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      timestamp: Date.now(),
    });

    // Envia SMS para o coach
    await sendSMS(
      "+5519988108063", // 👉 Substitua pelo seu número real (ex: +5511999999999)
      `📅 Novo booking!\nJogador: ${bookingData.payerAddress}\nHorário: ${bookingData.appointmentTime}`
    );

    console.log("✅ Booking salvo e SMS enviado.");
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("❌ Erro ao salvar booking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔹 Endpoint de configuração (para o frontend)
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

// 🔹 Inicia servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


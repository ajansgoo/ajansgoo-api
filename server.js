const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

// 🌍 .env dosyasını yükle
dotenv.config();

const app = express();

// 🧠 Middleware'ler
app.use(express.json());
app.use(cookieParser());

// 🌐 CORS Ayarları – Railway ve tarayıcıdan gelen tüm domainler için izin
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ajansgoo-api-production.up.railway.app"
  ],
  credentials: true
}));

// 🔐 API Rotaları
app.use("/api", authRoutes);

// 🧪 Basit test endpoint
app.get("/", (req, res) => {
  res.send("AjansGoo API çalışıyor!");
});

// 🚀 Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AjansGoo API ${PORT} portunda çalışıyor...`);
});

// 🌐 Global Hata Yakalama
app.use((err, req, res, next) => {
  console.error("🚨 Beklenmeyen Sunucu Hatası:", err);
  res.status(500).json({ message: "Sunucu hatası!" });
});

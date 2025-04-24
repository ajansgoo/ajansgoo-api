// server.js
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
app.use(cors({
  origin: "http://localhost:3000",
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

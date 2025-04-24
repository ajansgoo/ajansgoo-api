// authController.js gibi dosyalarda:
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../utils/db");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

// ✅ Kullanıcı Kaydı
exports.register = async (req, res) => {
  console.log("✅ register endpoint hit"); // BURAYA EKLE
  const { isim, email, telefon, password } = req.body;

  if (!telefon || !password) {
    return res.status(400).json({ message: "Telefon ve şifre zorunludur." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (isim, email, telefon, parola_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, rol`,
      [isim || null, email || null, telefon, hashedPassword]
    );

    res.status(201).json({
      message: "Kayıt başarılı",
      userId: result.rows[0].id,
      rol: result.rows[0].rol
    });
  } catch (err) {
    console.error("Kayıt hatası:", err);
    res.status(500).json({ message: "Kayıt sırasında hata oluştu." });
  }
};

// ✅ Kullanıcı Girişi
exports.login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE telefon = $1",
      [phone]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Telefon numarası geçersiz" });
    }

    const match = await bcrypt.compare(password, user.parola_hash);
    if (!match) {
      return res.status(401).json({ message: "Şifre hatalı" });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.rol });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.rol });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 15 // 15 dk
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 gün
    });

    res.json({ message: "Giriş başarılı", role: user.rol });
  } catch (err) {
    console.error("Giriş hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// ✅ Kullanıcı Çıkışı
exports.logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Çıkış yapıldı" });
};

// ✅ Access Token Yenileme
exports.refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Token yok" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = generateAccessToken({
      id: payload.id,
      role: payload.role
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 15
    });

    res.json({ message: "Yeni access token verildi" });
  } catch (err) {
    console.error("Refresh token hatası:", err);
    return res.status(403).json({ message: "Geçersiz token" });
  }
};

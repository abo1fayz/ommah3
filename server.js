const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// استيراد Firebase
const { db } = require("./config/firebase");

// استيراد المسارات
const studentRoutes = require("./routes/studentRoutes");
const competitionRoutes = require("./routes/competitionRoutes");
const achievementRoutes = require("./routes/achievementRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware للتحقق من قاعدة البيانات
app.use((req, res, next) => {
  if (!db && req.path.startsWith('/api/')) {
    return res.status(503).json({ 
      message: "قاعدة البيانات غير متاحة حالياً. يرجى المحاولة لاحقاً.",
      error: "Firebase not initialized"
    });
  }
  next();
});

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, "frontend")));

// API Routes
app.use("/api/students", studentRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/achievements", achievementRoutes);

// Routes للواجهات
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "student.html"));
});

app.get("/competitions", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "competitions.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "admin.html"));
});

app.get("/achievements", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "achievements.html"));
});

// أي رابط غير معروف
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// معالج الأخطاء
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ 
    message: "حدث خطأ في الخادم",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// تشغيل السيرفر محلياً فقط
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    if (!db) {
      console.log("⚠️ Warning: Firebase not connected. Running in limited mode.");
    }
  });
}

module.exports = app;
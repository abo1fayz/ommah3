const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// التحقق من البيئة
const isVercel = process.env.VERCEL === '1';

// استيراد Firebase فقط إذا كان متاحاً
let db;
try {
  const firebase = require("./config/firebase-admin");
  db = firebase.db;
  console.log('✅ Firebase loaded');
} catch (error) {
  console.error('⚠️ Firebase not available:', error.message);
}

// استيراد المسارات
const studentRoutes = require("./routes/studentRoutes");
const competitionRoutes = require("./routes/competitionRoutes");
const achievementRoutes = require("./routes/achievementRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, "frontend")));

// API Routes - مع معالجة الأخطاء
app.use("/api/students", (req, res, next) => {
  if (!db) {
    return res.status(503).json({ message: "قاعدة البيانات غير متاحة حالياً" });
  }
  next();
}, studentRoutes);

app.use("/api/competitions", (req, res, next) => {
  if (!db) {
    return res.status(503).json({ message: "قاعدة البيانات غير متاحة حالياً" });
  }
  next();
}, competitionRoutes);

app.use("/api/achievements", (req, res, next) => {
  if (!db) {
    return res.status(503).json({ message: "قاعدة البيانات غير متاحة حالياً" });
  }
  next();
}, achievementRoutes);

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

// معالج الأخطاء العام
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    message: "حدث خطأ في الخادم",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// تصدير للتشغيل على Vercel
module.exports = app;
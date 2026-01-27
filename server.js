const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const competitionRoutes = require("./routes/competitionRoutes");
const achievementRoutes = require("./routes/achievementRoutes");

// الاتصال بقاعدة البيانات
connectDB();

// إنشاء السيرفر
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة الملفات الثابتة من مجلد frontend
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

// أي رابط غير معروف يرجع index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// تشغيل السيرفر للسيرفر المحلي فقط
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

// التصدير للتشغيل على Vercel
module.exports = app;

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const competitionRoutes = require("./routes/competitionRoutes");

// الاتصال بقاعدة البيانات
connectDB();

// إنشاء السيرفر
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// خدمة الملفات الثابتة من مجلد frontend
app.use(express.static(path.join(__dirname, "frontend")));

// API Routes
app.use("/api/students", studentRoutes);
app.use("/api/competitions", competitionRoutes);

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

// أي رابط غير معروف يرجع index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;

// التصدير للتشغيل على Vercel
module.exports = app;

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

// تهيئة Firebase Admin SDK
let db;

try {
  // محاولة التهيئة باستخدام service account key (للتشغيل المحلي)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    // للتشغيل على Vercel - استخدام متغيرات البيئة
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  
  db = getFirestore();
  console.log("✅ Firebase Connected");
} catch (error) {
  console.error("❌ Firebase Connection Failed:", error.message);
  // عدم إنهاء العملية للسماح بالتشغيل على Vercel
}

module.exports = { db };
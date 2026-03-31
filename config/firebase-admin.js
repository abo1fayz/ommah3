// config/firebase-admin.js
const admin = require('firebase-admin');

// التحقق من وجود Firebase
let db = null;

try {
  // في بيئة Vercel، نحتاج إلى تهيئة Firebase بشكل مختلف
  if (process.env.VERCEL) {
    // استخدام متغيرات البيئة مباشرة
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (privateKey && process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
      db = admin.firestore();
      console.log('✅ Firebase initialized on Vercel');
    }
  } else {
    // في البيئة المحلية
    const serviceAccount = require('./service-account-key.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('✅ Firebase initialized locally');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
}

module.exports = { admin, db };
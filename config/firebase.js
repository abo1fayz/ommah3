// config/firebase.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let db = null;

try {
  // استخدام متغيرات البيئة لتهيئة Firebase
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  // التحقق من وجود جميع المتغيرات
  if (firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey) {
    initializeApp({
      credential: cert(firebaseConfig)
    });
    
    db = getFirestore();
    console.log('✅ Firebase Firestore initialized');
  } else {
    console.log('⚠️ Firebase credentials missing, running in demo mode');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
}

module.exports = { db };
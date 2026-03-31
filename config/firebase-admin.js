const admin = require('firebase-admin');

// إذا كنت تستخدم Firebase Admin SDK
// قم بتحميل ملف المفاتيح من Firebase Console
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com"
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
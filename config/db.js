const { db } = require('./firebase-admin');

// دالة للتحقق من الاتصال
const connectDB = async () => {
  try {
    // اختبار الاتصال بمحاولة قراءة بسيطة
    await db.collection('_test').limit(1).get();
    console.log('✅ Firebase Firestore connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
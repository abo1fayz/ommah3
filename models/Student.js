const { db } = require('../config/firebase');

const COLLECTION_NAME = 'students';

// دالة مساعدة لتحويل بيانات Firestore إلى كائن
const convertDoc = (doc) => {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

// دالة مساعدة لتحويل قائمة المستندات
const convertDocs = (snapshot) => {
  const students = [];
  snapshot.forEach(doc => {
    students.push({ id: doc.id, ...doc.data() });
  });
  return students;
};

// دوال CRUD
const StudentModel = {
  // جلب جميع الطلاب
  findAll: async () => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return convertDocs(snapshot);
  },

  // جلب طالب حسب ID
  findById: async (id) => {
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    return convertDoc(doc);
  },

  // جلب طالب حسب الكود
  findOne: async (filter) => {
    const { code } = filter;
    if (code) {
      const snapshot = await db.collection(COLLECTION_NAME)
        .where('code', '==', code)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return convertDoc(snapshot.docs[0]);
    }
    return null;
  },

  // إنشاء طالب جديد
  create: async (data) => {
    const docRef = db.collection(COLLECTION_NAME).doc();
    const newStudent = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lessonTests: data.lessonTests || [],
      tajweedTests: data.tajweedTests || [],
      memorizationTests: data.memorizationTests || [],
      monthlyPages: data.monthlyPages || []
    };
    await docRef.set(newStudent);
    return { id: docRef.id, ...newStudent };
  },

  // تحديث طالب
  update: async (id, data) => {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await docRef.update(updateData);
    
    return { id, ...doc.data(), ...updateData };
  },

  // حذف طالب
  delete: async (id) => {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    await docRef.delete();
    return { id, ...doc.data() };
  }
};

module.exports = StudentModel;
const { db } = require('../config/firebase-client');
const { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, limit } = require('firebase/firestore');

const COLLECTION_NAME = 'students';

// دالة مساعدة لتحويل بيانات Firestore إلى كائن
const convertDoc = (docSnap) => {
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

// دالة مساعدة لتحويل قائمة المستندات
const convertDocs = (snapshot) => {
  const students = [];
  snapshot.forEach(doc => {
    students.push({ id: doc.id, ...doc.data() });
  });
  return students;
};

const StudentModel = {
  // جلب جميع الطلاب
  findAll: async () => {
    const studentsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(studentsRef);
    return convertDocs(snapshot);
  },

  // جلب طالب حسب ID
  findById: async (id) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return convertDoc(docSnap);
  },

  // جلب طالب حسب الكود
  findOne: async (filter) => {
    const { code } = filter;
    if (code) {
      const studentsRef = collection(db, COLLECTION_NAME);
      const q = query(studentsRef, where('code', '==', code), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  // إنشاء طالب جديد
  create: async (data) => {
    const studentsRef = collection(db, COLLECTION_NAME);
    const newStudent = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lessonTests: data.lessonTests || [],
      tajweedTests: data.tajweedTests || [],
      memorizationTests: data.memorizationTests || [],
      monthlyPages: data.monthlyPages || []
    };
    const docRef = await addDoc(studentsRef, newStudent);
    return { id: docRef.id, ...newStudent };
  },

  // تحديث طالب
  update: async (id, data) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, updateData);
    
    return { id, ...docSnap.data(), ...updateData };
  },

  // حذف طالب
  delete: async (id) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    await deleteDoc(docRef);
    return { id, ...docSnap.data() };
  }
};

module.exports = StudentModel;
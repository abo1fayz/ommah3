const { db } = require('../config/firebase-admin');

class StudentModel {
  // جلب جميع الطلاب
  static async findAll() {
    const snapshot = await db.collection('students').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // جلب طالب بالكود
  static async findByCode(code) {
    const snapshot = await db.collection('students')
      .where('code', '==', code)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  // جلب طالب بالمعرف
  static async findById(id) {
    const doc = await db.collection('students').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  // إنشاء طالب جديد
  static async create(data) {
    const docRef = await db.collection('students').add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  }

  // تحديث طالب
  static async update(id, data) {
    await db.collection('students').doc(id).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { id, ...data };
  }

  // حذف طالب
  static async delete(id) {
    await db.collection('students').doc(id).delete();
    return true;
  }

  // إضافة اختبار
  static async addTest(studentId, testType, testData) {
    const studentRef = db.collection('students').doc(studentId);
    const student = await this.findById(studentId);
    
    const tests = student[testType] || [];
    tests.push({
      ...testData,
      id: Date.now().toString(),
      date: testData.date || new Date().toISOString()
    });
    
    await studentRef.update({ [testType]: tests });
    return tests;
  }

  // تحديث اختبار
  static async updateTest(studentId, testType, testIndex, testData) {
    const student = await this.findById(studentId);
    const tests = student[testType] || [];
    
    if (tests[testIndex]) {
      tests[testIndex] = { ...tests[testIndex], ...testData };
      await db.collection('students').doc(studentId).update({ [testType]: tests });
    }
    
    return tests;
  }

  // حذف اختبار
  static async deleteTest(studentId, testType, testIndex) {
    const student = await this.findById(studentId);
    const tests = student[testType] || [];
    
    if (tests[testIndex]) {
      tests.splice(testIndex, 1);
      await db.collection('students').doc(studentId).update({ [testType]: tests });
    }
    
    return tests;
  }

  // إضافة أو تحديث الصفحات الشهرية
  static async updateMonthlyPages(studentId, month, year, pages, goal) {
    const student = await this.findById(studentId);
    let monthlyPages = student.monthlyPages || [];
    
    const existingIndex = monthlyPages.findIndex(
      p => p.month === month && p.year === year
    );
    
    if (existingIndex !== -1) {
      monthlyPages[existingIndex] = {
        ...monthlyPages[existingIndex],
        pages,
        goal: goal || 20,
        lastUpdate: new Date().toISOString()
      };
    } else {
      monthlyPages.push({
        month,
        year,
        pages,
        goal: goal || 20,
        lastUpdate: new Date().toISOString()
      });
    }
    
    await db.collection('students').doc(studentId).update({ monthlyPages });
    return monthlyPages;
  }
}

module.exports = StudentModel;
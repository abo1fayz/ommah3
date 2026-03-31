const { db } = require('../config/firebase-admin');

const COLLECTION = 'students';

class StudentModel {
  // جلب جميع الطلاب
  static async findAll() {
    try {
      const snapshot = await db.collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error finding all students:', error);
      throw error;
    }
  }

  // جلب طالب بالكود
  static async findByCode(code) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('code', '==', code)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding student by code:', error);
      throw error;
    }
  }

  // جلب طالب بالمعرف
  static async findById(id) {
    try {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding student by id:', error);
      throw error;
    }
  }

  // إنشاء طالب جديد
  static async create(data) {
    try {
      const now = new Date().toISOString();
      const docRef = await db.collection(COLLECTION).add({
        ...data,
        createdAt: now,
        updatedAt: now,
        lessonTests: data.lessonTests || [],
        tajweedTests: data.tajweedTests || [],
        memorizationTests: data.memorizationTests || [],
        monthlyPages: data.monthlyPages || []
      });
      
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  // تحديث طالب
  static async update(id, data) {
    try {
      const docRef = db.collection(COLLECTION).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) return null;
      
      await docRef.update({
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      const updated = await docRef.get();
      return { id: updated.id, ...updated.data() };
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // حذف طالب
  static async delete(id) {
    try {
      await db.collection(COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // إضافة اختبار
  static async addTest(studentId, testType, testData) {
    try {
      const student = await this.findById(studentId);
      if (!student) throw new Error('Student not found');
      
      const tests = student[testType] || [];
      const newTest = {
        ...testData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      tests.push(newTest);
      
      await db.collection(COLLECTION).doc(studentId).update({
        [testType]: tests,
        updatedAt: new Date().toISOString()
      });
      
      return tests;
    } catch (error) {
      console.error('Error adding test:', error);
      throw error;
    }
  }

  // تحديث اختبار
  static async updateTest(studentId, testType, testIndex, testData) {
    try {
      const student = await this.findById(studentId);
      if (!student) throw new Error('Student not found');
      
      const tests = student[testType] || [];
      if (!tests[testIndex]) throw new Error('Test not found');
      
      tests[testIndex] = { ...tests[testIndex], ...testData };
      
      await db.collection(COLLECTION).doc(studentId).update({
        [testType]: tests,
        updatedAt: new Date().toISOString()
      });
      
      return tests;
    } catch (error) {
      console.error('Error updating test:', error);
      throw error;
    }
  }

  // حذف اختبار
  static async deleteTest(studentId, testType, testIndex) {
    try {
      const student = await this.findById(studentId);
      if (!student) throw new Error('Student not found');
      
      const tests = student[testType] || [];
      if (!tests[testIndex]) throw new Error('Test not found');
      
      tests.splice(testIndex, 1);
      
      await db.collection(COLLECTION).doc(studentId).update({
        [testType]: tests,
        updatedAt: new Date().toISOString()
      });
      
      return tests;
    } catch (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  }

  // إضافة أو تحديث الصفحات الشهرية
  static async updateMonthlyPages(studentId, month, year, pages, goal = 20) {
    try {
      const student = await this.findById(studentId);
      if (!student) throw new Error('Student not found');
      
      let monthlyPages = student.monthlyPages || [];
      const existingIndex = monthlyPages.findIndex(
        p => p.month === month && p.year === year
      );
      
      const pageData = {
        month,
        year,
        pages,
        goal,
        lastUpdate: new Date().toISOString()
      };
      
      if (existingIndex !== -1) {
        monthlyPages[existingIndex] = { ...monthlyPages[existingIndex], ...pageData };
      } else {
        monthlyPages.push(pageData);
      }
      
      // ترتيب حسب السنة والشهر (الأحدث أولاً)
      monthlyPages.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
      
      await db.collection(COLLECTION).doc(studentId).update({
        monthlyPages,
        updatedAt: new Date().toISOString()
      });
      
      return monthlyPages;
    } catch (error) {
      console.error('Error updating monthly pages:', error);
      throw error;
    }
  }

  // حذف صفحة شهرية
  static async deleteMonthlyPage(studentId, pageIndex) {
    try {
      const student = await this.findById(studentId);
      if (!student) throw new Error('Student not found');
      
      const monthlyPages = student.monthlyPages || [];
      if (!monthlyPages[pageIndex]) throw new Error('Page not found');
      
      monthlyPages.splice(pageIndex, 1);
      
      await db.collection(COLLECTION).doc(studentId).update({
        monthlyPages,
        updatedAt: new Date().toISOString()
      });
      
      return monthlyPages;
    } catch (error) {
      console.error('Error deleting monthly page:', error);
      throw error;
    }
  }
}

module.exports = StudentModel;
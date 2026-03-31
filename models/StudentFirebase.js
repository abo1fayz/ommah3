// models/StudentFirebase.js
const { db } = require('../config/firebase');

const COLLECTION = 'students';

class StudentModel {
  static async findAll() {
    if (!db) return [];
    try {
      const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding students:', error);
      return [];
    }
  }

  static async findByCode(code) {
    if (!db) return null;
    try {
      const snapshot = await db.collection(COLLECTION).where('code', '==', code).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding student by code:', error);
      return null;
    }
  }

  static async findById(id) {
    if (!db) return null;
    try {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding student by id:', error);
      return null;
    }
  }

  static async create(data) {
    if (!db) throw new Error('Database not available');
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

  static async update(id, data) {
    if (!db) throw new Error('Database not available');
    try {
      const docRef = db.collection(COLLECTION).doc(id);
      await docRef.update({ ...data, updatedAt: new Date().toISOString() });
      const updated = await docRef.get();
      return { id: updated.id, ...updated.data() };
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  static async delete(id) {
    if (!db) throw new Error('Database not available');
    try {
      await db.collection(COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  static async addTest(studentId, testType, testData) {
    if (!db) throw new Error('Database not available');
    try {
      const student = await this.findById(studentId);
      if (!student) throw new Error('Student not found');
      
      const tests = student[testType] || [];
      tests.push({
        ...testData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
      
      await db.collection(COLLECTION).doc(studentId).update({ [testType]: tests });
      return tests;
    } catch (error) {
      console.error('Error adding test:', error);
      throw error;
    }
  }

  static async updateTest(studentId, testType, testIndex, testData) {
    if (!db) throw new Error('Database not available');
    try {
      const student = await this.findById(studentId);
      if (!student) throw new Error('Student not found');
      
      const tests = student[testType] || [];
      if (!tests[testIndex]) throw new Error('Test not found');
      
      tests[testIndex] = { ...tests[testIndex], ...testData };
      await db.collection(COLLECTION).doc(studentId).update({ [testType]: tests });
      return tests;
    } catch (error) {
      console.error('Error updating test:', error);
      throw error;
    }
  }

  static async deleteTest(studentId, testType, testIndex) {
    if (!db) throw new Error('Database not available');
    try {
      const student = await this.findById(studentId);
      if (!student) throw new Error('Student not found');
      
      const tests = student[testType] || [];
      if (!tests[testIndex]) throw new Error('Test not found');
      
      tests.splice(testIndex, 1);
      await db.collection(COLLECTION).doc(studentId).update({ [testType]: tests });
      return tests;
    } catch (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  }

  static async updateMonthlyPages(studentId, month, year, pages, goal = 20) {
    if (!db) throw new Error('Database not available');
    try {
      const student = await this.findById(studentId);
      if (!student) throw new Error('Student not found');
      
      let monthlyPages = student.monthlyPages || [];
      const existingIndex = monthlyPages.findIndex(p => p.month === month && p.year === year);
      
      const pageData = { month, year, pages, goal, lastUpdate: new Date().toISOString() };
      
      if (existingIndex !== -1) {
        monthlyPages[existingIndex] = { ...monthlyPages[existingIndex], ...pageData };
      } else {
        monthlyPages.push(pageData);
      }
      
      monthlyPages.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
      
      await db.collection(COLLECTION).doc(studentId).update({ monthlyPages });
      return monthlyPages;
    } catch (error) {
      console.error('Error updating monthly pages:', error);
      throw error;
    }
  }
}

module.exports = StudentModel;
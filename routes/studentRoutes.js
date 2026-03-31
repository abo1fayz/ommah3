const express = require("express");
const Student = require("../models/Student");
const router = express.Router();

/* تسجيل الدخول بكود الطالب */
router.post("/login", async (req, res) => {
  const { code } = req.body;
  try {
    const student = await Student.findOne({ code });
    if (!student) return res.status(404).json({ message: "كود الدخول غير صحيح" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
});

/* جلب جميع الطلاب */
router.get("/", async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب الطلاب" });
  }
});

/* إضافة طالب جديد */
router.post("/", async (req, res) => {
  try {
    // التحقق من عدم تكرار الكود
    const existingStudent = await Student.findOne({ code: req.body.code });
    if (existingStudent) {
      return res.status(400).json({ message: "كود الدخول هذا مستخدم بالفعل" });
    }
    
    const student = await Student.create(req.body);
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* تعديل بيانات طالب */
router.put("/:id", async (req, res) => {
  try {
    // التحقق من عدم تكرار الكود
    if (req.body.code) {
      const existingStudent = await Student.findOne({ code: req.body.code });
      if (existingStudent && existingStudent.id !== req.params.id) {
        return res.status(400).json({ message: "كود الدخول هذا مستخدم بالفعل" });
      }
    }
    
    const student = await Student.update(req.params.id, req.body);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* حذف طالب */
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.delete(req.params.id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });
    res.json({ message: "تم حذف الطالب" });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء الحذف" });
  }
});

/* إضافة اختبار لطالب */
router.post("/:id/tests", async (req, res) => {
  const { testType, testName, result, date } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });

    const newTest = { testName, lessonName: testName, result, date };
    let updatedTests;

    if (testType === "lessonTests") {
      updatedTests = [...(student.lessonTests || []), newTest];
      await Student.update(req.params.id, { lessonTests: updatedTests });
    } else if (testType === "tajweedTests") {
      updatedTests = [...(student.tajweedTests || []), newTest];
      await Student.update(req.params.id, { tajweedTests: updatedTests });
    } else if (testType === "memorizationTests") {
      updatedTests = [...(student.memorizationTests || []), newTest];
      await Student.update(req.params.id, { memorizationTests: updatedTests });
    } else {
      return res.status(400).json({ message: "نوع الاختبار غير صحيح" });
    }

    const updatedStudent = await Student.findById(req.params.id);
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* تعديل اختبار لطالب */
router.put("/:id/tests/:testIndex", async (req, res) => {
  const { testType, testName, result, date } = req.body;
  const { id, testIndex } = req.params;
  
  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });

    let testArray;
    if (testType === "lessonTests") testArray = [...(student.lessonTests || [])];
    else if (testType === "tajweedTests") testArray = [...(student.tajweedTests || [])];
    else if (testType === "memorizationTests") testArray = [...(student.memorizationTests || [])];
    else return res.status(400).json({ message: "نوع الاختبار غير صحيح" });

    const index = parseInt(testIndex);
    if (index < 0 || index >= testArray.length) {
      return res.status(404).json({ message: "الاختبار غير موجود" });
    }

    testArray[index] = { ...testArray[index], testName, lessonName: testName, result, date };

    const updateData = {};
    updateData[testType] = testArray;
    await Student.update(id, updateData);

    const updatedStudent = await Student.findById(id);
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* حذف اختبار لطالب */
router.delete("/:id/tests/:testIndex", async (req, res) => {
  const { testType } = req.body;
  const { id, testIndex } = req.params;
  
  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });

    let testArray;
    if (testType === "lessonTests") testArray = [...(student.lessonTests || [])];
    else if (testType === "tajweedTests") testArray = [...(student.tajweedTests || [])];
    else if (testType === "memorizationTests") testArray = [...(student.memorizationTests || [])];
    else return res.status(400).json({ message: "نوع الاختبار غير صحيح" });

    const index = parseInt(testIndex);
    if (index < 0 || index >= testArray.length) {
      return res.status(404).json({ message: "الاختبار غير موجود" });
    }

    testArray.splice(index, 1);

    const updateData = {};
    updateData[testType] = testArray;
    await Student.update(id, updateData);

    const updatedStudent = await Student.findById(id);
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* إضافة أو تعديل الصفحات الشهرية */
router.post("/:id/monthly-pages", async (req, res) => {
  const { month, year, pages, goal } = req.body;
  
  console.log("📝 Received monthly pages data:", req.body);
  console.log("🎯 Student ID:", req.params.id);
  
  if (!month || !year || pages === undefined) {
    return res.status(400).json({ 
      message: "البيانات ناقصة. يرجى إدخال الشهر والسنة وعدد الصفحات" 
    });
  }

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });

    let monthlyPages = student.monthlyPages || [];
    const existingIndex = monthlyPages.findIndex(
      m => m.month === parseInt(month) && m.year === parseInt(year)
    );

    const newPageData = {
      month: parseInt(month),
      year: parseInt(year),
      pages: parseInt(pages),
      goal: goal ? parseInt(goal) : 20,
      lastUpdate: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      monthlyPages[existingIndex] = newPageData;
    } else {
      monthlyPages.push(newPageData);
    }

    await Student.update(req.params.id, { monthlyPages });
    console.log("✅ Monthly pages saved successfully");
    
    const updatedStudent = await Student.findById(req.params.id);
    res.json({ 
      message: "تم حفظ بيانات الصفحات بنجاح",
      student: updatedStudent 
    });
  } catch (err) {
    console.error("❌ Error saving monthly pages:", err);
    res.status(500).json({ 
      message: "حدث خطأ أثناء حفظ البيانات: " + err.message 
    });
  }
});

/* تعديل الصفحات الشهرية */
router.put("/:id/monthly-pages/:pageIndex", async (req, res) => {
  const { month, year, pages, goal } = req.body;
  const { id, pageIndex } = req.params;
  
  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });

    const index = parseInt(pageIndex);
    let monthlyPages = student.monthlyPages || [];
    
    if (index < 0 || index >= monthlyPages.length) {
      return res.status(404).json({ message: "بيانات الصفحات غير موجودة" });
    }

    monthlyPages[index] = {
      month: parseInt(month),
      year: parseInt(year),
      pages: parseInt(pages),
      goal: goal ? parseInt(goal) : 20,
      lastUpdate: new Date().toISOString()
    };

    await Student.update(id, { monthlyPages });

    const updatedStudent = await Student.findById(id);
    res.json({ 
      message: "تم تعديل بيانات الصفحات بنجاح",
      student: updatedStudent 
    });
  } catch (err) {
    console.error("❌ Error updating monthly pages:", err);
    res.status(500).json({ 
      message: "حدث خطأ أثناء تعديل البيانات: " + err.message 
    });
  }
});

/* حذف الصفحات الشهرية */
router.delete("/:id/monthly-pages/:pageIndex", async (req, res) => {
  const { id, pageIndex } = req.params;
  
  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });

    const index = parseInt(pageIndex);
    let monthlyPages = student.monthlyPages || [];
    
    if (index < 0 || index >= monthlyPages.length) {
      return res.status(404).json({ message: "بيانات الصفحات غير موجودة" });
    }

    monthlyPages.splice(index, 1);
    await Student.update(id, { monthlyPages });

    const updatedStudent = await Student.findById(id);
    res.json({ 
      message: "تم حذف بيانات الصفحات بنجاح",
      student: updatedStudent 
    });
  } catch (err) {
    console.error("❌ Error deleting monthly pages:", err);
    res.status(500).json({ 
      message: "حدث خطأ أثناء حذف البيانات: " + err.message 
    });
  }
});

module.exports = router;
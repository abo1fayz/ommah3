const express = require("express");
const Student = require("../models/StudentFirebase");
const router = express.Router();

/* تسجيل الدخول بكود الطالب */
router.post("/login", async (req, res) => {
  const { code } = req.body;
  try {
    const student = await Student.findByCode(code);
    if (!student) return res.status(404).json({ message: "كود الدخول غير صحيح" });
    res.json(student);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
});

/* جلب جميع الطلاب */
router.get("/", async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "خطأ في جلب الطلاب" });
  }
});

/* إضافة طالب جديد */
router.post("/", async (req, res) => {
  try {
    // التحقق من عدم تكرار الكود
    const existing = await Student.findByCode(req.body.code);
    if (existing) {
      return res.status(400).json({ message: "كود الدخول هذا مستخدم بالفعل" });
    }
    
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(400).json({ message: err.message });
  }
});

/* تعديل بيانات طالب */
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.update(req.params.id, req.body);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });
    res.json(student);
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(400).json({ message: err.message });
  }
});

/* حذف طالب */
router.delete("/:id", async (req, res) => {
  try {
    await Student.delete(req.params.id);
    res.json({ message: "تم حذف الطالب" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ message: "خطأ أثناء الحذف" });
  }
});

/* إضافة اختبار لطالب */
router.post("/:id/tests", async (req, res) => {
  const { testType, testName, result, date } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });

    const newTest = { testName, lessonName: testName, result, date: date || new Date().toISOString().split('T')[0] };
    
    let updatedTests;
    if (testType === "lessonTests") {
      updatedTests = await Student.addTest(req.params.id, testType, newTest);
    } else if (testType === "tajweedTests") {
      updatedTests = await Student.addTest(req.params.id, testType, newTest);
    } else if (testType === "memorizationTests") {
      updatedTests = await Student.addTest(req.params.id, testType, newTest);
    } else {
      return res.status(400).json({ message: "نوع الاختبار غير صحيح" });
    }

    res.json({ message: "تم إضافة الاختبار", tests: updatedTests });
  } catch (err) {
    console.error("Error adding test:", err);
    res.status(400).json({ message: err.message });
  }
});

/* تعديل اختبار لطالب */
router.put("/:id/tests/:testIndex", async (req, res) => {
  const { testType, testName, result, date } = req.body;
  const { id, testIndex } = req.params;
  
  try {
    const updatedTests = await Student.updateTest(id, testType, parseInt(testIndex), {
      testName,
      lessonName: testName,
      result,
      date
    });
    
    res.json({ message: "تم تعديل الاختبار", tests: updatedTests });
  } catch (err) {
    console.error("Error updating test:", err);
    res.status(400).json({ message: err.message });
  }
});

/* حذف اختبار لطالب */
router.delete("/:id/tests/:testIndex", async (req, res) => {
  const { testType } = req.body;
  const { id, testIndex } = req.params;
  
  try {
    const updatedTests = await Student.deleteTest(id, testType, parseInt(testIndex));
    res.json({ message: "تم حذف الاختبار", tests: updatedTests });
  } catch (err) {
    console.error("Error deleting test:", err);
    res.status(400).json({ message: err.message });
  }
});

/* إضافة أو تعديل الصفحات الشهرية */
router.post("/:id/monthly-pages", async (req, res) => {
  const { month, year, pages, goal } = req.body;
  
  if (!month || !year || pages === undefined) {
    return res.status(400).json({ 
      message: "البيانات ناقصة. يرجى إدخال الشهر والسنة وعدد الصفحات" 
    });
  }

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });

    const updatedPages = await Student.updateMonthlyPages(
      req.params.id, 
      parseInt(month), 
      parseInt(year), 
      parseInt(pages), 
      goal ? parseInt(goal) : 20
    );
    
    res.json({ 
      message: "تم حفظ بيانات الصفحات بنجاح",
      monthlyPages: updatedPages 
    });
  } catch (err) {
    console.error("Error saving monthly pages:", err);
    res.status(500).json({ 
      message: "حدث خطأ أثناء حفظ البيانات: " + err.message 
    });
  }
});

module.exports = router;
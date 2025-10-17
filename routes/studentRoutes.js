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
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب الطلاب" });
  }
});

/* إضافة طالب جديد */
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* تعديل بيانات طالب */
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* حذف طالب */
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
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

    if (testType === "lessonTests") student.lessonTests.push(newTest);
    else if (testType === "tajweedTests") student.tajweedTests.push(newTest);
    else if (testType === "memorizationTests") student.memorizationTests.push(newTest);
    else return res.status(400).json({ message: "نوع الاختبار غير صحيح" });

    await student.save();
    res.json(student);
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
    if (testType === "lessonTests") testArray = student.lessonTests;
    else if (testType === "tajweedTests") testArray = student.tajweedTests;
    else if (testType === "memorizationTests") testArray = student.memorizationTests;
    else return res.status(400).json({ message: "نوع الاختبار غير صحيح" });

    if (testIndex < 0 || testIndex >= testArray.length) {
      return res.status(404).json({ message: "الاختبار غير موجود" });
    }

    // تحديث بيانات الاختبار
    testArray[testIndex].testName = testName;
    testArray[testIndex].lessonName = testName;
    testArray[testIndex].result = result;
    testArray[testIndex].date = date;

    await student.save();
    res.json(student);
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
    if (testType === "lessonTests") testArray = student.lessonTests;
    else if (testType === "tajweedTests") testArray = student.tajweedTests;
    else if (testType === "memorizationTests") testArray = student.memorizationTests;
    else return res.status(400).json({ message: "نوع الاختبار غير صحيح" });

    if (testIndex < 0 || testIndex >= testArray.length) {
      return res.status(404).json({ message: "الاختبار غير موجود" });
    }

    // حذف الاختبار
    testArray.splice(testIndex, 1);

    await student.save();
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* إضافة أو تعديل الصفحات الشهرية */
router.post("/:id/monthly-pages", async (req, res) => {
  const { month, year, pages, goal } = req.body;
  
  console.log("📝 Received monthly pages data:", req.body);
  console.log("🎯 Student ID:", req.params.id);
  
  // التحقق من البيانات المدخلة
  if (!month || !year || pages === undefined) {
    return res.status(400).json({ 
      message: "البيانات ناقصة. يرجى إدخال الشهر والسنة وعدد الصفحات" 
    });
  }

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "الطالب غير موجود" });

    // البحث عن بيانات الشهر إن كانت موجودة
    const existingIndex = student.monthlyPages.findIndex(
      m => m.month === parseInt(month) && m.year === parseInt(year)
    );

    if (existingIndex !== -1) {
      // تحديث البيانات الموجودة
      student.monthlyPages[existingIndex].pages = parseInt(pages);
      student.monthlyPages[existingIndex].goal = goal ? parseInt(goal) : 20;
      student.monthlyPages[existingIndex].lastUpdate = new Date();
    } else {
      // إضافة بيانات جديدة
      student.monthlyPages.push({
        month: parseInt(month),
        year: parseInt(year),
        pages: parseInt(pages),
        goal: goal ? parseInt(goal) : 20,
        lastUpdate: new Date()
      });
    }

    await student.save();
    console.log("✅ Monthly pages saved successfully");
    
    res.json({ 
      message: "تم حفظ بيانات الصفحات بنجاح",
      student 
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

    if (pageIndex < 0 || pageIndex >= student.monthlyPages.length) {
      return res.status(404).json({ message: "بيانات الصفحات غير موجودة" });
    }

    // تحديث بيانات الصفحات
    student.monthlyPages[pageIndex].month = parseInt(month);
    student.monthlyPages[pageIndex].year = parseInt(year);
    student.monthlyPages[pageIndex].pages = parseInt(pages);
    student.monthlyPages[pageIndex].goal = goal ? parseInt(goal) : 20;
    student.monthlyPages[pageIndex].lastUpdate = new Date();

    await student.save();
    res.json({ 
      message: "تم تعديل بيانات الصفحات بنجاح",
      student 
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

    if (pageIndex < 0 || pageIndex >= student.monthlyPages.length) {
      return res.status(404).json({ message: "بيانات الصفحات غير موجودة" });
    }

    // حذف بيانات الصفحات
    student.monthlyPages.splice(pageIndex, 1);

    await student.save();
    res.json({ 
      message: "تم حذف بيانات الصفحات بنجاح",
      student 
    });
  } catch (err) {
    console.error("❌ Error deleting monthly pages:", err);
    res.status(500).json({ 
      message: "حدث خطأ أثناء حذف البيانات: " + err.message 
    });
  }
});

module.exports = router;

const express = require("express");
const Competition = require("../models/Competition");
const Student = require("../models/Student");
const router = express.Router();

/* جلب جميع المسابقات */
router.get("/", async (req, res) => {
  try {
    const competitions = await Competition.find()
      .sort({ date: -1 })
      .populate('winners.studentId', 'name code');
    res.json(competitions);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب المسابقات" });
  }
});

/* جلب مسابقة محددة */
router.get("/:id", async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('winners.studentId', 'name code image overallLevel');
    if (!competition) return res.status(404).json({ message: "المسابقة غير موجودة" });
    res.json(competition);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب المسابقة" });
  }
});

/* إضافة مسابقة جديدة */
router.post("/", async (req, res) => {
  try {
    const competition = new Competition(req.body);
    await competition.save();
    res.json(competition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* تعديل مسابقة */
router.put("/:id", async (req, res) => {
  try {
    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!competition) return res.status(404).json({ message: "المسابقة غير موجودة" });
    res.json(competition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* حذف مسابقة */
router.delete("/:id", async (req, res) => {
  try {
    const competition = await Competition.findByIdAndDelete(req.params.id);
    if (!competition) return res.status(404).json({ message: "المسابقة غير موجودة" });
    res.json({ message: "تم حذف المسابقة" });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء الحذف" });
  }
});

/* إضافة فائز لمسابقة */
router.post("/:id/winners", async (req, res) => {
  const { studentCode, position, prize, notes, score, studentName } = req.body;
  
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "المسابقة غير موجودة" });

    let studentId = null;
    let finalStudentName = studentName;

    // إذا تم تقديم كود الطالب، البحث عنه
    if (studentCode) {
      const student = await Student.findOne({ code: studentCode });
      if (student) {
        studentId = student._id;
        finalStudentName = student.name; // استخدام اسم الطالب من قاعدة البيانات
      }
    }

    // إذا لم يتم تقديم اسم الطالب
    if (!finalStudentName) {
      return res.status(400).json({ message: "الرجاء إدخال اسم الطالب" });
    }

    // إضافة الفائز
    competition.winners.push({
      studentId,
      studentName: finalStudentName,
      studentCode: studentCode || 'غير محدد',
      position,
      prize,
      notes,
      score
    });

    await competition.save();
    res.json(competition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* تعديل فائز */
router.put("/:id/winners/:winnerId", async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "المسابقة غير موجودة" });

    const winner = competition.winners.id(req.params.winnerId);
    if (!winner) return res.status(404).json({ message: "الفائز غير موجود" });

    // تحديث بيانات الفائز
    Object.assign(winner, req.body);

    // إذا تم تغيير كود الطالب، تحديث بياناته
    if (req.body.studentCode) {
      const student = await Student.findOne({ code: req.body.studentCode });
      if (student) {
        winner.studentId = student._id;
        winner.studentName = student.name;
      }
    }

    await competition.save();
    res.json(competition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* حذف فائز من مسابقة */
router.delete("/:id/winners/:winnerId", async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "المسابقة غير موجودة" });

    competition.winners = competition.winners.filter(
      winner => winner._id.toString() !== req.params.winnerId
    );

    await competition.save();
    res.json(competition);
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء حذف الفائز" });
  }
});

module.exports = router;

const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  testName: String,
  lessonName: String,
  result: Number,
  date: String
});

const monthlyPagesSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  pages: { type: Number, required: true, min: 0 },
  goal: { type: Number, default: 20 },
  lastUpdate: { type: Date, default: Date.now }
});

// إضافة index للبحث السريع
monthlyPagesSchema.index({ month: 1, year: 1 });

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  overallLevel: { type: String, default: "مبتدئ" },
  image: { type: String },
  lessonTests: [testSchema],
  tajweedTests: [testSchema],
  memorizationTests: [testSchema],
  monthlyPages: [monthlyPagesSchema]
}, {
  timestamps: true
});

// Middleware للتحقق من عدم تكرار الكود عند التحديث
studentSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.code) {
    const Student = mongoose.model('Student');
    const existingStudent = await Student.findOne({ code: update.code });
    if (existingStudent && existingStudent._id.toString() !== this.getQuery()._id.toString()) {
      return next(new Error('كود الدخول هذا مستخدم بالفعل'));
    }
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);

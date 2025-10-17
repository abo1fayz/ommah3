const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  studentCode: { type: String },
  position: { type: String, required: true },
  prize: { type: String },
  notes: { type: String },
  score: { type: String }
});

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    required: true
  },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String },
  status: {
    type: String,
  },
  image: { type: String },
  winners: [winnerSchema],
  criteria: { type: String },
  participantsCount: { type: Number },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model("Competition", competitionSchema);

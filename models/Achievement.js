const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ 
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  }],
  date: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }], // لتخزين هويات الذين أعجبوا بالإنجاز
  comments: [commentSchema],
  tags: [{ type: String }],
  category: { type: String, default: "عام" }
}, {
  timestamps: true
});

module.exports = mongoose.model("Achievement", achievementSchema);

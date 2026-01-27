const express = require("express");
const Achievement = require("../models/Achievement");
const upload = require("../middleware/upload");
const router = express.Router();

/* جلب جميع الإنجازات */
router.get("/", async (req, res) => {
  try {
    const achievements = await Achievement.find()
      .sort({ createdAt: -1 });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب الإنجازات" });
  }
});

/* جلب إنجاز محدد */
router.get("/:id", async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ message: "الإنجاز غير موجود" });
    res.json(achievement);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب الإنجاز" });
  }
});

/* إضافة إنجاز جديد مع صور */
router.post("/", upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, tags, category } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: "العنوان والوصف مطلوبان" });
    }

    const images = req.files?.map(file => ({
      url: file.path,
      publicId: file.filename
    })) || [];

    const achievement = new Achievement({
      title,
      description,
      images,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || "عام"
    });

    await achievement.save();
    res.status(201).json(achievement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* تعديل إنجاز */
router.put("/:id", upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, tags, category } = req.body;
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: "الإنجاز غير موجود" });
    }

    // تحديث الحقول الأساسية
    if (title) achievement.title = title;
    if (description) achievement.description = description;
    if (tags) achievement.tags = tags.split(',').map(tag => tag.trim());
    if (category) achievement.category = category;

    // إضافة صور جديدة إذا وجدت
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      achievement.images = [...achievement.images, ...newImages];
    }

    await achievement.save();
    res.json(achievement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* حذف إنجاز */
router.delete("/:id", async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) return res.status(404).json({ message: "الإنجاز غير موجود" });
    
    // TODO: حذف الصور من Cloudinary
    res.json({ message: "تم حذف الإنجاز بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء الحذف" });
  }
});

/* حذف صورة من إنجاز */
router.delete("/:id/images/:imageId", async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ message: "الإنجاز غير موجود" });

    const imageIndex = achievement.images.findIndex(img => img.publicId === req.params.imageId);
    if (imageIndex === -1) return res.status(404).json({ message: "الصورة غير موجودة" });

    // TODO: حذف الصورة من Cloudinary
    const cloudinary = require('../config/cloudinary');
    await cloudinary.uploader.destroy(req.params.imageId);

    achievement.images.splice(imageIndex, 1);
    await achievement.save();
    
    res.json({ message: "تم حذف الصورة بنجاح", achievement });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء حذف الصورة" });
  }
});

/* إضافة إعجاب */
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "معرف المستخدم مطلوب" });

    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ message: "الإنجاز غير موجود" });

    const alreadyLiked = achievement.likedBy.includes(userId);
    
    if (alreadyLiked) {
      // إزالة الإعجاب
      achievement.likes -= 1;
      achievement.likedBy = achievement.likedBy.filter(id => id !== userId);
    } else {
      // إضافة إعجاب
      achievement.likes += 1;
      achievement.likedBy.push(userId);
    }

    await achievement.save();
    res.json({ 
      likes: achievement.likes, 
      liked: !alreadyLiked 
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الإعجاب" });
  }
});

/* إضافة تعليق */
router.post("/:id/comments", async (req, res) => {
  try {
    const { user, comment } = req.body;
    if (!user || !comment) {
      return res.status(400).json({ message: "اسم المستخدم والتعليق مطلوبان" });
    }

    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ message: "الإنجاز غير موجود" });

    achievement.comments.push({ user, comment });
    await achievement.save();
    
    res.json(achievement.comments[achievement.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: "خطأ في إضافة التعليق" });
  }
});

/* حذف تعليق */
router.delete("/:id/comments/:commentId", async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ message: "الإنجاز غير موجود" });

    const commentIndex = achievement.comments.findIndex(
      comment => comment._id.toString() === req.params.commentId
    );
    
    if (commentIndex === -1) return res.status(404).json({ message: "التعليق غير موجود" });

    achievement.comments.splice(commentIndex, 1);
    await achievement.save();
    
    res.json({ message: "تم حذف التعليق بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء حذف التعليق" });
  }
});

/* البحث في الإنجازات */
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const achievements = await Achievement.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: "خطأ في البحث" });
  }
});

module.exports = router;

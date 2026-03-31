const express = require("express");
const Achievement = require("../models/Achievement");
const upload = require("../middleware/upload");
const router = express.Router();

/* جلب جميع الإنجازات */
router.get("/", async (req, res) => {
  try {
    const achievements = await Achievement.findAll();
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

    const achievement = await Achievement.create({
      title,
      description,
      images,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || "عام"
    });

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

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (category) updateData.category = category;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      updateData.images = [...(achievement.images || []), ...newImages];
    }

    const updatedAchievement = await Achievement.update(req.params.id, updateData);
    res.json(updatedAchievement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* حذف إنجاز */
router.delete("/:id", async (req, res) => {
  try {
    const achievement = await Achievement.delete(req.params.id);
    if (!achievement) return res.status(404).json({ message: "الإنجاز غير موجود" });
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

    const imageExists = achievement.images?.some(img => img.publicId === req.params.imageId);
    if (!imageExists) return res.status(404).json({ message: "الصورة غير موجودة" });

    const cloudinary = require('../config/cloudinary');
    await cloudinary.uploader.destroy(req.params.imageId);
    
    await Achievement.deleteImage(req.params.id, req.params.imageId);
    
    const updatedAchievement = await Achievement.findById(req.params.id);
    res.json({ message: "تم حذف الصورة بنجاح", achievement: updatedAchievement });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء حذف الصورة" });
  }
});

/* إضافة إعجاب */
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "معرف المستخدم مطلوب" });

    const result = await Achievement.addLike(req.params.id, userId);
    if (!result) return res.status(404).json({ message: "الإنجاز غير موجود" });
    
    res.json(result);
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

    const newComment = await Achievement.addComment(req.params.id, { user, comment });
    if (!newComment) return res.status(404).json({ message: "الإنجاز غير موجود" });
    
    res.json(newComment);
  } catch (err) {
    res.status(500).json({ message: "خطأ في إضافة التعليق" });
  }
});

/* حذف تعليق */
router.delete("/:id/comments/:commentId", async (req, res) => {
  try {
    const result = await Achievement.deleteComment(req.params.id, req.params.commentId);
    if (!result) return res.status(404).json({ message: "الإنجاز غير موجود" });
    
    res.json({ message: "تم حذف التعليق بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء حذف التعليق" });
  }
});

/* البحث في الإنجازات */
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const achievements = await Achievement.search(query);
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: "خطأ في البحث" });
  }
});

module.exports = router;
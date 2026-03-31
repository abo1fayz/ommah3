const { db } = require('../config/firebase');

const COLLECTION_NAME = 'achievements';

const convertDoc = (doc) => {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const convertDocs = (snapshot) => {
  const items = [];
  snapshot.forEach(doc => {
    items.push({ id: doc.id, ...doc.data() });
  });
  return items;
};

const AchievementModel = {
  findAll: async () => {
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get();
    return convertDocs(snapshot);
  },

  findById: async (id) => {
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    return convertDoc(doc);
  },

  search: async (query) => {
    // Firestore لا يدعم البحث النصي الكامل بشكل مباشر
    // سنقوم بجلب الكل ثم التصفية
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const achievements = convertDocs(snapshot);
    
    return achievements.filter(a => 
      a.title?.toLowerCase().includes(query.toLowerCase()) ||
      a.description?.toLowerCase().includes(query.toLowerCase()) ||
      a.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  },

  create: async (data) => {
    const docRef = db.collection(COLLECTION_NAME).doc();
    const newAchievement = {
      ...data,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await docRef.set(newAchievement);
    return { id: docRef.id, ...newAchievement };
  },

  update: async (id, data) => {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await docRef.update(updateData);
    
    return { id, ...doc.data(), ...updateData };
  },

  delete: async (id) => {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    await docRef.delete();
    return { id, ...doc.data() };
  },

  addLike: async (achievementId, userId) => {
    const docRef = db.collection(COLLECTION_NAME).doc(achievementId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const achievement = doc.data();
    const likedBy = achievement.likedBy || [];
    const alreadyLiked = likedBy.includes(userId);
    
    let likes = achievement.likes || 0;
    
    if (alreadyLiked) {
      likes -= 1;
      const newLikedBy = likedBy.filter(id => id !== userId);
      await docRef.update({ likes, likedBy: newLikedBy });
      return { likes, liked: false };
    } else {
      likes += 1;
      likedBy.push(userId);
      await docRef.update({ likes, likedBy });
      return { likes, liked: true };
    }
  },

  addComment: async (achievementId, comment) => {
    const docRef = db.collection(COLLECTION_NAME).doc(achievementId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const achievement = doc.data();
    const comments = achievement.comments || [];
    const newComment = {
      ...comment,
      _id: Date.now().toString(),
      date: new Date().toISOString()
    };
    comments.push(newComment);
    
    await docRef.update({ comments });
    return newComment;
  },

  deleteComment: async (achievementId, commentId) => {
    const docRef = db.collection(COLLECTION_NAME).doc(achievementId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const achievement = doc.data();
    const comments = (achievement.comments || []).filter(c => c._id !== commentId);
    await docRef.update({ comments });
    
    return true;
  },

  addImages: async (achievementId, newImages) => {
    const docRef = db.collection(COLLECTION_NAME).doc(achievementId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const achievement = doc.data();
    const images = achievement.images || [];
    images.push(...newImages);
    
    await docRef.update({ images });
    return { id: achievementId, ...achievement, images };
  },

  deleteImage: async (achievementId, imagePublicId) => {
    const docRef = db.collection(COLLECTION_NAME).doc(achievementId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const achievement = doc.data();
    const images = (achievement.images || []).filter(img => img.publicId !== imagePublicId);
    await docRef.update({ images });
    
    return true;
  }
};

module.exports = AchievementModel;
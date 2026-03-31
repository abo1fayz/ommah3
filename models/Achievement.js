const { db } = require('../config/firebase-client');
const { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } = require('firebase/firestore');

const COLLECTION_NAME = 'achievements';

const convertDoc = (docSnap) => {
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
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
    const achievementsRef = collection(db, COLLECTION_NAME);
    const q = query(achievementsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return convertDocs(snapshot);
  },

  findById: async (id) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return convertDoc(docSnap);
  },

  search: async (searchQuery) => {
    // Firestore Client SDK لا يدعم البحث النصي الكامل
    // سنقوم بجلب الكل ثم التصفية
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const achievements = convertDocs(snapshot);
    
    return achievements.filter(a => 
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  },

  create: async (data) => {
    const achievementsRef = collection(db, COLLECTION_NAME);
    const newAchievement = {
      ...data,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(achievementsRef, newAchievement);
    return { id: docRef.id, ...newAchievement };
  },

  update: async (id, data) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, updateData);
    
    return { id, ...docSnap.data(), ...updateData };
  },

  delete: async (id) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    await deleteDoc(docRef);
    return { id, ...docSnap.data() };
  },

  addLike: async (achievementId, userId) => {
    const docRef = doc(db, COLLECTION_NAME, achievementId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const achievement = docSnap.data();
    const likedBy = achievement.likedBy || [];
    const alreadyLiked = likedBy.includes(userId);
    
    let likes = achievement.likes || 0;
    
    if (alreadyLiked) {
      likes -= 1;
      const newLikedBy = likedBy.filter(id => id !== userId);
      await updateDoc(docRef, { likes, likedBy: newLikedBy });
      return { likes, liked: false };
    } else {
      likes += 1;
      likedBy.push(userId);
      await updateDoc(docRef, { likes, likedBy });
      return { likes, liked: true };
    }
  },

  addComment: async (achievementId, comment) => {
    const docRef = doc(db, COLLECTION_NAME, achievementId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const achievement = docSnap.data();
    const comments = achievement.comments || [];
    const newComment = {
      ...comment,
      _id: Date.now().toString(),
      date: new Date().toISOString()
    };
    comments.push(newComment);
    
    await updateDoc(docRef, { comments });
    return newComment;
  },

  deleteComment: async (achievementId, commentId) => {
    const docRef = doc(db, COLLECTION_NAME, achievementId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const achievement = docSnap.data();
    const comments = (achievement.comments || []).filter(c => c._id !== commentId);
    await updateDoc(docRef, { comments });
    
    return true;
  },

  addImages: async (achievementId, newImages) => {
    const docRef = doc(db, COLLECTION_NAME, achievementId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const achievement = docSnap.data();
    const images = achievement.images || [];
    images.push(...newImages);
    
    await updateDoc(docRef, { images });
    return { id: achievementId, ...achievement, images };
  },

  deleteImage: async (achievementId, imagePublicId) => {
    const docRef = doc(db, COLLECTION_NAME, achievementId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const achievement = docSnap.data();
    const images = (achievement.images || []).filter(img => img.publicId !== imagePublicId);
    await updateDoc(docRef, { images });
    
    return true;
  }
};

module.exports = AchievementModel;
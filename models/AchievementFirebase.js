const { db } = require('../config/firebase-admin');

const COLLECTION = 'achievements';

class AchievementModel {
  static async findAll() {
    try {
      const snapshot = await db.collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error finding all achievements:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding achievement by id:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const now = new Date().toISOString();
      const docRef = await db.collection(COLLECTION).add({
        ...data,
        images: data.images || [],
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: now,
        updatedAt: now
      });
      
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const docRef = db.collection(COLLECTION).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) return null;
      
      await docRef.update({
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      const updated = await docRef.get();
      return { id: updated.id, ...updated.data() };
    } catch (error) {
      console.error('Error updating achievement:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.collection(COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting achievement:', error);
      throw error;
    }
  }

  static async addImage(id, imageData) {
    try {
      const achievement = await this.findById(id);
      if (!achievement) throw new Error('Achievement not found');
      
      const images = achievement.images || [];
      images.push(imageData);
      
      await db.collection(COLLECTION).doc(id).update({
        images,
        updatedAt: new Date().toISOString()
      });
      
      return images;
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  }

  static async removeImage(id, imagePublicId) {
    try {
      const achievement = await this.findById(id);
      if (!achievement) throw new Error('Achievement not found');
      
      const images = (achievement.images || []).filter(img => img.publicId !== imagePublicId);
      
      await db.collection(COLLECTION).doc(id).update({
        images,
        updatedAt: new Date().toISOString()
      });
      
      return images;
    } catch (error) {
      console.error('Error removing image:', error);
      throw error;
    }
  }

  static async toggleLike(id, userId) {
    try {
      const achievement = await this.findById(id);
      if (!achievement) throw new Error('Achievement not found');
      
      let likedBy = achievement.likedBy || [];
      let likes = achievement.likes || 0;
      let isLiked;
      
      if (likedBy.includes(userId)) {
        // إزالة الإعجاب
        likes--;
        likedBy = likedBy.filter(uid => uid !== userId);
        isLiked = false;
      } else {
        // إضافة إعجاب
        likes++;
        likedBy.push(userId);
        isLiked = true;
      }
      
      await db.collection(COLLECTION).doc(id).update({
        likes,
        likedBy,
        updatedAt: new Date().toISOString()
      });
      
      return { likes, liked: isLiked };
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  static async addComment(id, commentData) {
    try {
      const achievement = await this.findById(id);
      if (!achievement) throw new Error('Achievement not found');
      
      const comments = achievement.comments || [];
      const newComment = {
        ...commentData,
        id: Date.now().toString(),
        date: new Date().toISOString()
      };
      
      comments.push(newComment);
      
      await db.collection(COLLECTION).doc(id).update({
        comments,
        updatedAt: new Date().toISOString()
      });
      
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  static async removeComment(id, commentId) {
    try {
      const achievement = await this.findById(id);
      if (!achievement) throw new Error('Achievement not found');
      
      const comments = (achievement.comments || []).filter(c => c.id !== commentId);
      
      await db.collection(COLLECTION).doc(id).update({
        comments,
        updatedAt: new Date().toISOString()
      });
      
      return comments;
    } catch (error) {
      console.error('Error removing comment:', error);
      throw error;
    }
  }

  static async search(query) {
    try {
      // البحث النصي في Firebase محدود، نستخدم طريقة بسيطة
      const snapshot = await db.collection(COLLECTION).get();
      const achievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const lowerQuery = query.toLowerCase();
      return achievements.filter(a => 
        a.title?.toLowerCase().includes(lowerQuery) ||
        a.description?.toLowerCase().includes(lowerQuery) ||
        a.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching achievements:', error);
      throw error;
    }
  }
}

module.exports = AchievementModel;
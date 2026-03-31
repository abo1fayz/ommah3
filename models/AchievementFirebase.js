const { db } = require('../config/firebase-admin');

class AchievementModel {
  static async findAll() {
    const snapshot = await db.collection('achievements')
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async findById(id) {
    const doc = await db.collection('achievements').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async create(data) {
    const docRef = await db.collection('achievements').add({
      ...data,
      images: data.images || [],
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  }

  static async update(id, data) {
    await db.collection('achievements').doc(id).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { id, ...data };
  }

  static async delete(id) {
    await db.collection('achievements').doc(id).delete();
    return true;
  }

  static async addImage(id, imageData) {
    const achievement = await this.findById(id);
    const images = achievement.images || [];
    
    images.push(imageData);
    await db.collection('achievements').doc(id).update({ images });
    return images;
  }

  static async removeImage(id, imageId) {
    const achievement = await this.findById(id);
    const images = (achievement.images || []).filter(img => img.publicId !== imageId);
    
    await db.collection('achievements').doc(id).update({ images });
    return images;
  }

  static async toggleLike(id, userId) {
    const achievement = await this.findById(id);
    const likedBy = achievement.likedBy || [];
    let likes = achievement.likes || 0;
    
    if (likedBy.includes(userId)) {
      likes--;
      const index = likedBy.indexOf(userId);
      likedBy.splice(index, 1);
    } else {
      likes++;
      likedBy.push(userId);
    }
    
    await db.collection('achievements').doc(id).update({ likes, likedBy });
    return { likes, liked: !likedBy.includes(userId) };
  }

  static async addComment(id, commentData) {
    const achievement = await this.findById(id);
    const comments = achievement.comments || [];
    
    const newComment = {
      ...commentData,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    
    comments.push(newComment);
    await db.collection('achievements').doc(id).update({ comments });
    return newComment;
  }

  static async removeComment(id, commentId) {
    const achievement = await this.findById(id);
    const comments = (achievement.comments || []).filter(c => c.id !== commentId);
    
    await db.collection('achievements').doc(id).update({ comments });
    return comments;
  }

  static async search(query) {
    const achievements = await this.findAll();
    return achievements.filter(a => 
      a.title?.includes(query) ||
      a.description?.includes(query) ||
      a.tags?.some(tag => tag.includes(query))
    );
  }
}

module.exports = AchievementModel;
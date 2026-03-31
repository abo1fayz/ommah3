const { db } = require('../config/firebase-admin');

const COLLECTION = 'competitions';

class CompetitionModel {
  static async findAll() {
    try {
      const snapshot = await db.collection(COLLECTION)
        .orderBy('date', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error finding all competitions:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding competition by id:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const now = new Date().toISOString();
      const docRef = await db.collection(COLLECTION).add({
        ...data,
        winners: data.winners || [],
        createdAt: now,
        updatedAt: now
      });
      
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating competition:', error);
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
      console.error('Error updating competition:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.collection(COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting competition:', error);
      throw error;
    }
  }

  static async addWinner(competitionId, winnerData) {
    try {
      const competition = await this.findById(competitionId);
      if (!competition) throw new Error('Competition not found');
      
      const winners = competition.winners || [];
      const newWinner = {
        ...winnerData,
        id: Date.now().toString(),
        addedAt: new Date().toISOString()
      };
      
      winners.push(newWinner);
      
      await db.collection(COLLECTION).doc(competitionId).update({
        winners,
        updatedAt: new Date().toISOString()
      });
      
      return winners;
    } catch (error) {
      console.error('Error adding winner:', error);
      throw error;
    }
  }

  static async updateWinner(competitionId, winnerId, winnerData) {
    try {
      const competition = await this.findById(competitionId);
      if (!competition) throw new Error('Competition not found');
      
      const winners = competition.winners || [];
      const index = winners.findIndex(w => w.id === winnerId);
      
      if (index === -1) throw new Error('Winner not found');
      
      winners[index] = { ...winners[index], ...winnerData };
      
      await db.collection(COLLECTION).doc(competitionId).update({
        winners,
        updatedAt: new Date().toISOString()
      });
      
      return winners;
    } catch (error) {
      console.error('Error updating winner:', error);
      throw error;
    }
  }

  static async deleteWinner(competitionId, winnerId) {
    try {
      const competition = await this.findById(competitionId);
      if (!competition) throw new Error('Competition not found');
      
      const winners = (competition.winners || []).filter(w => w.id !== winnerId);
      
      await db.collection(COLLECTION).doc(competitionId).update({
        winners,
        updatedAt: new Date().toISOString()
      });
      
      return winners;
    } catch (error) {
      console.error('Error deleting winner:', error);
      throw error;
    }
  }
}

module.exports = CompetitionModel;
const { db } = require('../config/firebase-admin');

class CompetitionModel {
  static async findAll() {
    const snapshot = await db.collection('competitions')
      .orderBy('date', 'desc')
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async findById(id) {
    const doc = await db.collection('competitions').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async create(data) {
    const docRef = await db.collection('competitions').add({
      ...data,
      winners: data.winners || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  }

  static async update(id, data) {
    await db.collection('competitions').doc(id).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { id, ...data };
  }

  static async delete(id) {
    await db.collection('competitions').doc(id).delete();
    return true;
  }

  static async addWinner(competitionId, winnerData) {
    const competition = await this.findById(competitionId);
    const winners = competition.winners || [];
    
    winners.push({
      ...winnerData,
      id: Date.now().toString(),
      addedAt: new Date().toISOString()
    });
    
    await db.collection('competitions').doc(competitionId).update({ winners });
    return winners;
  }

  static async updateWinner(competitionId, winnerId, winnerData) {
    const competition = await this.findById(competitionId);
    const winners = competition.winners || [];
    
    const index = winners.findIndex(w => w.id === winnerId);
    if (index !== -1) {
      winners[index] = { ...winners[index], ...winnerData };
      await db.collection('competitions').doc(competitionId).update({ winners });
    }
    
    return winners;
  }

  static async deleteWinner(competitionId, winnerId) {
    const competition = await this.findById(competitionId);
    const winners = (competition.winners || []).filter(w => w.id !== winnerId);
    
    await db.collection('competitions').doc(competitionId).update({ winners });
    return winners;
  }
}

module.exports = CompetitionModel;
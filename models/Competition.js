const { db } = require('../config/firebase');

const COLLECTION_NAME = 'competitions';

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

const CompetitionModel = {
  findAll: async () => {
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('date', 'desc')
      .get();
    return convertDocs(snapshot);
  },

  findById: async (id) => {
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    return convertDoc(doc);
  },

  create: async (data) => {
    const docRef = db.collection(COLLECTION_NAME).doc();
    const newCompetition = {
      ...data,
      winners: data.winners || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await docRef.set(newCompetition);
    return { id: docRef.id, ...newCompetition };
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

  addWinner: async (competitionId, winner) => {
    const docRef = db.collection(COLLECTION_NAME).doc(competitionId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const competition = doc.data();
    const winners = competition.winners || [];
    winners.push(winner);
    
    await docRef.update({ winners });
    
    return { id: competitionId, ...competition, winners };
  },

  updateWinner: async (competitionId, winnerId, winnerData) => {
    const docRef = db.collection(COLLECTION_NAME).doc(competitionId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const competition = doc.data();
    const winners = competition.winners || [];
    const index = winners.findIndex(w => w._id === winnerId);
    
    if (index === -1) return null;
    
    winners[index] = { ...winners[index], ...winnerData };
    await docRef.update({ winners });
    
    return { id: competitionId, ...competition, winners };
  },

  deleteWinner: async (competitionId, winnerId) => {
    const docRef = db.collection(COLLECTION_NAME).doc(competitionId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const competition = doc.data();
    const winners = (competition.winners || []).filter(w => w._id !== winnerId);
    await docRef.update({ winners });
    
    return { id: competitionId, ...competition, winners };
  }
};

module.exports = CompetitionModel;
const { db } = require('../config/firebase-client');
const { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } = require('firebase/firestore');

const COLLECTION_NAME = 'competitions';

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

const CompetitionModel = {
  findAll: async () => {
    const competitionsRef = collection(db, COLLECTION_NAME);
    const q = query(competitionsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return convertDocs(snapshot);
  },

  findById: async (id) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return convertDoc(docSnap);
  },

  create: async (data) => {
    const competitionsRef = collection(db, COLLECTION_NAME);
    const newCompetition = {
      ...data,
      winners: data.winners || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(competitionsRef, newCompetition);
    return { id: docRef.id, ...newCompetition };
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

  addWinner: async (competitionId, winner) => {
    const docRef = doc(db, COLLECTION_NAME, competitionId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const competition = docSnap.data();
    const winners = competition.winners || [];
    winners.push(winner);
    
    await updateDoc(docRef, { winners });
    
    return { id: competitionId, ...competition, winners };
  },

  updateWinner: async (competitionId, winnerId, winnerData) => {
    const docRef = doc(db, COLLECTION_NAME, competitionId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const competition = docSnap.data();
    const winners = competition.winners || [];
    const index = winners.findIndex(w => w._id === winnerId);
    
    if (index === -1) return null;
    
    winners[index] = { ...winners[index], ...winnerData };
    await updateDoc(docRef, { winners });
    
    return { id: competitionId, ...competition, winners };
  },

  deleteWinner: async (competitionId, winnerId) => {
    const docRef = doc(db, COLLECTION_NAME, competitionId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const competition = docSnap.data();
    const winners = (competition.winners || []).filter(w => w._id !== winnerId);
    await updateDoc(docRef, { winners });
    
    return { id: competitionId, ...competition, winners };
  }
};

module.exports = CompetitionModel;
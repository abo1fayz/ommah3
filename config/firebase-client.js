const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBo6RsKH9afzoB3iTcdQ7DuAKzy_qxc6-Q",
  authDomain: "ommah-institute-1b9c0.firebaseapp.com",
  databaseURL: "https://ommah-institute-1b9c0-default-rtdb.firebaseio.com",
  projectId: "ommah-institute-1b9c0",
  storageBucket: "ommah-institute-1b9c0.firebasestorage.app",
  messagingSenderId: "257258084063",
  appId: "1:257258084063:web:ddccd468b2d3fa076b7b6a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Firebase Client initialized successfully");

module.exports = { db };
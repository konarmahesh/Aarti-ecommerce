/* ═══════════════════════════════════════════
   admin-firebase.js — Firebase init + Storage
═══════════════════════════════════════════ */

const ADMIN_PASSWORD = "Aarti@2025";

const firebaseConfig = {
  apiKey: "AIzaSyBv-NSwb78D-dbWGWOBVp-d8ZV9BXZbg80",
  authDomain: "aarti-7246c.firebaseapp.com",
  projectId: "aarti-7246c",
  storageBucket: "aarti-7246c.firebasestorage.app",
  messagingSenderId: "73572412831",
  appId: "1:73572412831:web:65d183b26bc7ba96be21aa"
};

let _firestore = null;
let _usingFirebase = false;

try {
  firebase.initializeApp(firebaseConfig);
  _firestore = firebase.firestore();
  _usingFirebase = true;
  console.log("✅ Firebase connected");
} catch(e) {
  console.warn("Firebase init failed:", e.message);
}

window.storage = {
  get: async (key) => {
    if (_usingFirebase && _firestore) {
      try {
        const doc = await _firestore.collection("aarti_business").doc(key).get();
        if (doc.exists) return { value: doc.data().value };
        return null;
      } catch(e) { return null; }
    } else {
      const v = localStorage.getItem("aarti_" + key);
      return v ? { value: v } : null;
    }
  },
  set: async (key, value) => {
    if (_usingFirebase && _firestore) {
      try {
        await _firestore.collection("aarti_business").doc(key).set({ value });
        return { key, value };
      } catch(e) { return null; }
    } else {
      localStorage.setItem("aarti_" + key, value);
      return { key, value };
    }
  },
  delete: async (key) => {
    if (_usingFirebase && _firestore) {
      try { await _firestore.collection("aarti_business").doc(key).delete(); } catch(e) {}
    } else { localStorage.removeItem("aarti_" + key); }
  }
};

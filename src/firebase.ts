import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ 
  prompt: 'select_account'
});

// Set default persistence
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("Firebase persistence error:", err);
});

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getDatabase, ref, set, onValue } from "firebase/database";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBbuQIaavU0crJRkLY8ShKmj7zNvnozMAo",
  authDomain: "csxposure-1d417.firebaseapp.com",
  databaseURL: "https://csxposure-1d417-default-rtdb.firebaseio.com",
  projectId: "csxposure-1d417",
  storageBucket: "csxposure-1d417.firebasestorage.app",
  messagingSenderId: "142420296421",
  appId: "1:142420296421:web:487a25d58096e277acca0c",
  measurementId: "G-XETZ46LJZ9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, doc };
export const realtimeDB = getDatabase(app); // Use this for Realtime Database
export {ref, set, onValue };

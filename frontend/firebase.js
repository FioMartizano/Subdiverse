import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "....", //pending
  authDomain: "subdiverse.firebaseapp.com",
  projectId: "subdiverse",
  storageBucket: "subdiverse.firebasestorage.app",
  messagingSenderId: "....", //pending
  appId: "...." //pending
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
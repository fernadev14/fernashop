import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQJ1Gjh_Lhf5b3FQgTyt1FAdHgicbgpns",
  authDomain: "fernashop-9e0c6.firebaseapp.com",
  projectId: "fernashop-9e0c6",
  storageBucket: "fernashop-9e0c6.firebasestorage.app",
  messagingSenderId: "407075129316",
  appId: "1:407075129316:web:797c1fbe9ee096ba1269f1"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
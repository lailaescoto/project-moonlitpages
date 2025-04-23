// app/_utils/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBdj8pjy9uX3chd3RbH5Z4fY6IUaossd0",
  authDomain: "moonlit-pages.firebaseapp.com",
  projectId: "moonlit-pages",
  storageBucket: "moonlit-pages.appspot.com",
  messagingSenderId: "558320098353",
  appId: "1:558320098353:web:d5799a2c41fccca5dbc910"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth state observer
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// Create new user
export async function createUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

// Sign in existing user
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

// Sign out
export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}
// config/firebase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// @ts-ignore
import { Auth, getReactNativePersistence, initializeAuth } from "firebase/auth";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuH84e5Z_anTshbZixLXBQgVnZROXtRXI",
  authDomain: "pawlink-android-app.firebaseapp.com",
  projectId: "pawlink-android-app",
  storageBucket: "pawlink-android-app.firebasestorage.app",
  messagingSenderId: "371560559153",
  appId: "1:371560559153:web:3e4808d7eadc5a4f569b10",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with native device persistence and cast it cleanly as Auth type
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
}) as Auth;

// Initialize Firestore Database
const db = getFirestore(app);

export { app, auth, db };

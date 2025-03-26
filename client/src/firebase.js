// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-ea3d7.firebaseapp.com",
  projectId: "mern-estate-ea3d7",
  storageBucket: "mern-estate-ea3d7.firebasestorage.app",
  messagingSenderId: "557028921864",
  appId: "1:557028921864:web:70bd0734f0cf1bedd2b7bd",
  measurementId: "G-98LFW7S3MT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional



export const firebaseConfig = {
  apiKey: "AIzaSyD95TQVq-F1pOYL9Zd-cuMWc7AteLwVOP8",
  authDomain: "housebazaar-59524.firebaseapp.com",
  projectId: "housebazaar-59524",
  storageBucket: "housebazaar-59524.appspot.com",
  messagingSenderId: "698484476853",
  appId: "1:698484476853:web:66492e4a1e484dcf6367fc",
  measurementId: "G-7PMTMQ8ZXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();
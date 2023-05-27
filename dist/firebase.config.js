"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// Import the functions you need from the SDKs you need
const app_1 = require("firebase/app");
const analytics_1 = require("firebase/analytics");
const firestore_1 = require("firebase/firestore");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD95TQVq-F1pOYL9Zd-cuMWc7AteLwVOP8",
    authDomain: "housebazaar-59524.firebaseapp.com",
    projectId: "housebazaar-59524",
    storageBucket: "housebazaar-59524.appspot.com",
    messagingSenderId: "698484476853",
    appId: "1:698484476853:web:66492e4a1e484dcf6367fc",
    measurementId: "G-7PMTMQ8ZXX"
};
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
const analytics = (0, analytics_1.getAnalytics)(app);
exports.db = (0, firestore_1.getFirestore)();

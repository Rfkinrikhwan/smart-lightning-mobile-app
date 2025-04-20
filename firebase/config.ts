// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBDajKmo4JpXoYS7Xu0c3QBIImlanvOFFY",
    authDomain: "smartlightingproject-d599e.firebaseapp.com",
    databaseURL: "https://smartlightingproject-d599e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smartlightingproject-d599e",
    storageBucket: "smartlightingproject-d599e.firebasestorage.app",
    messagingSenderId: "734122093067",
    appId: "1:734122093067:web:0b28135e8fd72ac35af50e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
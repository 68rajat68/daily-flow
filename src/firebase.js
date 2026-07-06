import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  "apiKey": "AIzaSyDeSpVb3SE_DWBnTt6b3pP-YJtW3fNWy00",
  "authDomain": "daily-flow-40347.firebaseapp.com",
  "projectId": "daily-flow-40347",
  "storageBucket": "daily-flow-40347.firebasestorage.app",
  "messagingSenderId": "548171154329",
  "appId": "1:548171154329:web:7710db9596957afa3c8908",
  "measurementId": "G-BCTCNBHF0Z"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);